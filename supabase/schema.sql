-- AI Income Path Finder — run this in your own Supabase project's SQL editor.
-- Designed so multiple funnels can share one `leads` table.
-- Safe to re-run: every step is idempotent, and it heals a pre-existing
-- `leads` table left over from an earlier attempt (drops stale NOT NULL
-- requirements on columns this funnel does not use).

create extension if not exists "pgcrypto";

-- LEADS -----------------------------------------------------------------
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  email text not null,
  phone text,
  current_job text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  referral_url text,
  landing_page_url text,
  comment_keyword text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Idempotent column adds (safe if a `leads` table already exists from another funnel).
alter table public.leads
  add column if not exists first_name text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists current_job text,
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_content text,
  add column if not exists utm_term text,
  add column if not exists referral_url text,
  add column if not exists landing_page_url text,
  add column if not exists comment_keyword text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

-- HEAL legacy `leads` tables: drop NOT NULL on any extra column that has no
-- default (e.g. a leftover required `name` column) so our inserts succeed.
do $$
declare c record;
begin
  if exists (select 1 from information_schema.tables
             where table_schema = 'public' and table_name = 'leads') then
    for c in
      select column_name from information_schema.columns
      where table_schema = 'public' and table_name = 'leads'
        and is_nullable = 'NO'
        and column_default is null
        and column_name not in ('id', 'first_name', 'email')
    loop
      execute format('alter table public.leads alter column %I drop not null', c.column_name);
    end loop;
  end if;
end $$;

create unique index if not exists leads_email_key on public.leads (email);

-- ASSESSMENTS -----------------------------------------------------------
create table if not exists public.income_assessments (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  funnel text not null default 'ai_income_path_finder',
  income_goal text,
  weekly_time_available text,
  selected_skills text[] default '{}',
  income_timeline text,
  sales_comfort int,
  technical_comfort text,
  business_model_preference text,
  existing_access text[] default '{}',
  freelancer_score int,
  service_provider_score int,
  implementation_score int,
  product_builder_score int,
  calculated_path text,
  result_summary text,
  created_at timestamptz not null default now()
);

-- Idempotent column adds for pre-existing assessment tables.
alter table public.income_assessments
  add column if not exists lead_id uuid references public.leads(id) on delete cascade,
  add column if not exists funnel text default 'ai_income_path_finder',
  add column if not exists income_goal text,
  add column if not exists weekly_time_available text,
  add column if not exists selected_skills text[] default '{}',
  add column if not exists income_timeline text,
  add column if not exists sales_comfort int,
  add column if not exists technical_comfort text,
  add column if not exists business_model_preference text,
  add column if not exists existing_access text[] default '{}',
  add column if not exists freelancer_score int,
  add column if not exists service_provider_score int,
  add column if not exists implementation_score int,
  add column if not exists product_builder_score int,
  add column if not exists calculated_path text,
  add column if not exists result_summary text,
  add column if not exists created_at timestamptz not null default now();

create index if not exists income_assessments_lead_id_idx
  on public.income_assessments (lead_id);

-- WEBINAR WAITLIST ------------------------------------------------------
create table if not exists public.webinar_waitlist (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  assessment_id uuid references public.income_assessments(id) on delete set null,
  status text not null default 'waiting',
  created_at timestamptz not null default now()
);

alter table public.webinar_waitlist
  add column if not exists lead_id uuid references public.leads(id) on delete cascade,
  add column if not exists assessment_id uuid references public.income_assessments(id) on delete set null,
  add column if not exists status text default 'waiting',
  add column if not exists created_at timestamptz not null default now();

-- One waitlist row per lead.
create unique index if not exists webinar_waitlist_lead_id_key
  on public.webinar_waitlist (lead_id);

-- ROW LEVEL SECURITY ----------------------------------------------------
-- Deliberately NO select policies anywhere: visitors can write, never read
-- anyone's data back through the tables. Reads of new rows are provided by
-- the SECURITY DEFINER helper functions below instead.

alter table public.leads enable row level security;
alter table public.income_assessments enable row level security;
alter table public.webinar_waitlist enable row level security;

drop policy if exists "public can insert leads" on public.leads;
create policy "public can insert leads"
  on public.leads for insert
  to anon, authenticated
  with check (true);

drop policy if exists "public can update own lead" on public.leads;
create policy "public can update own lead"
  on public.leads for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "public can insert assessments" on public.income_assessments;
create policy "public can insert assessments"
  on public.income_assessments for insert
  to anon, authenticated
  with check (true);

drop policy if exists "public can insert waitlist entries" on public.webinar_waitlist;
create policy "public can insert waitlist entries"
  on public.webinar_waitlist for insert
  to anon, authenticated
  with check (true);

drop policy if exists "public can update waitlist entries" on public.webinar_waitlist;
create policy "public can update waitlist entries"
  on public.webinar_waitlist for update
  to anon, authenticated
  using (true)
  with check (true);

-- Grants so the Data API can reach the tables.
grant insert, update on public.leads to anon, authenticated;
grant insert, update on public.income_assessments to anon, authenticated;
grant insert, update on public.webinar_waitlist to anon, authenticated;
grant all on public.leads to service_role;
grant all on public.income_assessments to service_role;
grant all on public.webinar_waitlist to service_role;

-- WRITE HELPERS ---------------------------------------------------------
-- The app saves through these SECURITY DEFINER functions. This is what lets
-- the app get the new row's id back (insert ... returning needs a SELECT
-- policy, which we deliberately do not grant on the tables).

create or replace function public.upsert_lead(p_lead jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into public.leads (
    first_name, email, phone, current_job,
    utm_source, utm_medium, utm_campaign, utm_content, utm_term,
    referral_url, landing_page_url, comment_keyword
  )
  values (
    p_lead->>'first_name',
    lower(trim(p_lead->>'email')),
    nullif(trim(p_lead->>'phone'), ''),
    nullif(trim(p_lead->>'current_job'), ''),
    p_lead->>'utm_source',
    p_lead->>'utm_medium',
    p_lead->>'utm_campaign',
    p_lead->>'utm_content',
    p_lead->>'utm_term',
    p_lead->>'referral_url',
    p_lead->>'landing_page_url',
    p_lead->>'comment_keyword'
  )
  on conflict (email) do update set
    first_name = excluded.first_name,
    phone = excluded.phone,
    current_job = excluded.current_job,
    utm_source = excluded.utm_source,
    utm_medium = excluded.utm_medium,
    utm_campaign = excluded.utm_campaign,
    utm_content = excluded.utm_content,
    utm_term = excluded.utm_term,
    referral_url = excluded.referral_url,
    landing_page_url = excluded.landing_page_url,
    comment_keyword = excluded.comment_keyword,
    updated_at = now()
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.create_income_assessment(p_assessment jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into public.income_assessments (
    lead_id, funnel, income_goal, weekly_time_available, selected_skills,
    income_timeline, sales_comfort, technical_comfort,
    business_model_preference, existing_access,
    freelancer_score, service_provider_score, implementation_score,
    product_builder_score, calculated_path, result_summary
  )
  values (
    (p_assessment->>'lead_id')::uuid,
    coalesce(p_assessment->>'funnel', 'ai_income_path_finder'),
    p_assessment->>'income_goal',
    p_assessment->>'weekly_time_available',
    coalesce(
      (select array_agg(value) from jsonb_array_elements_text(p_assessment->'selected_skills')),
      '{}'
    ),
    p_assessment->>'income_timeline',
    nullif(p_assessment->>'sales_comfort', '')::int,
    p_assessment->>'technical_comfort',
    p_assessment->>'business_model_preference',
    coalesce(
      (select array_agg(value) from jsonb_array_elements_text(p_assessment->'existing_access')),
      '{}'
    ),
    nullif(p_assessment->>'freelancer_score', '')::int,
    nullif(p_assessment->>'service_provider_score', '')::int,
    nullif(p_assessment->>'implementation_score', '')::int,
    nullif(p_assessment->>'product_builder_score', '')::int,
    p_assessment->>'calculated_path',
    p_assessment->>'result_summary'
  )
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.join_waitlist(p_lead_id uuid, p_assessment_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.webinar_waitlist (lead_id, assessment_id, status)
  values (p_lead_id, p_assessment_id, 'waiting')
  on conflict (lead_id) do update set
    assessment_id = excluded.assessment_id,
    status = 'waiting';
end;
$$;

grant execute on function public.upsert_lead(jsonb) to anon, authenticated;
grant execute on function public.create_income_assessment(jsonb) to anon, authenticated;
grant execute on function public.join_waitlist(uuid, uuid) to anon, authenticated;
