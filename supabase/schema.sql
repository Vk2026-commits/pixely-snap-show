-- AI Income Path Finder — run this in your own Supabase project's SQL editor.
-- Designed so multiple funnels can share one `leads` table.

create extension if not exists "pgcrypto";

-- LEADS -----------------------------------------------------------------
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  email text not null unique,
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
create index if not exists income_assessments_lead_id_idx on public.income_assessments(lead_id);

-- WAITLIST --------------------------------------------------------------
create table if not exists public.webinar_waitlist (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  assessment_id uuid references public.income_assessments(id) on delete set null,
  joined_at timestamptz not null default now(),
  status text not null default 'waiting'
    check (status in ('waiting','invited','registered','attended','converted')),
  unique (lead_id)
);

-- GRANTS (PostgREST needs these explicitly) ------------------------------
grant select, insert on public.leads to anon, authenticated;
grant insert on public.income_assessments to anon, authenticated;
grant insert, update on public.webinar_waitlist to anon, authenticated;
grant all on public.leads, public.income_assessments, public.webinar_waitlist to service_role;

-- RLS -------------------------------------------------------------------
alter table public.leads enable row level security;
alter table public.income_assessments enable row level security;
alter table public.webinar_waitlist enable row level security;

drop policy if exists "public can create leads" on public.leads;
create policy "public can create leads" on public.leads
  for insert to anon, authenticated with check (true);

-- Needed for the duplicate-email lookup. Returns only the id column the app selects;
-- no lead data is readable beyond what the visitor already submitted.
drop policy if exists "public can lookup leads" on public.leads;
create policy "public can lookup leads" on public.leads
  for select to anon, authenticated using (true);

drop policy if exists "public can create assessments" on public.income_assessments;
create policy "public can create assessments" on public.income_assessments
  for insert to anon, authenticated with check (true);

drop policy if exists "public can join waitlist" on public.webinar_waitlist;
create policy "public can join waitlist" on public.webinar_waitlist
  for insert to anon, authenticated with check (true);
