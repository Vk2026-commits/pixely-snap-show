/**
 * Supabase persistence for the funnel. Kept separate from scoring + UI.
 *
 * All writes go through SECURITY DEFINER helpers (see supabase/schema.sql):
 * upsert_lead, create_income_assessment, join_waitlist. The tables have no
 * SELECT policy, so the app must not use .select()/returning on them.
 */
import { supabase, supabaseConfigured } from "@/lib/supabase";
import type { Attribution } from "@/lib/attribution";
import type { Answers, Scores } from "@/lib/scoring";
import type { PathId } from "@/content/assessment";

export interface LeadInput {
  first_name: string;
  email: string;
  phone: string;
  current_job: string;
}

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export interface SubmitResult {
  leadId: string | null;
  assessmentId: string | null;
  persisted: boolean;
  error?: string;
}

export async function submitAssessment(params: {
  lead: LeadInput;
  attribution: Attribution;
  answers: Answers;
  scores: Scores;
  path: PathId;
  summary: string;
}): Promise<SubmitResult> {
  if (!supabaseConfigured) {
    return {
      leadId: null,
      assessmentId: null,
      persisted: false,
      error: "Supabase is not configured.",
    };
  }

  const email = normalizeEmail(params.lead.email);

  try {
    // Upsert on normalized email: one lead, many assessments. No public read access needed.
    const { data: leadId, error: leadErr } = await supabase.rpc("upsert_lead", {
      p_lead: {
        first_name: params.lead.first_name.trim(),
        email,
        phone: params.lead.phone.trim(),
        current_job: params.lead.current_job.trim(),
        ...params.attribution,
      },
    });
    if (leadErr) throw leadErr;
    if (!leadId) throw new Error("Lead save returned no id.");

    const { data: assessmentId, error: aErr } = await supabase.rpc("create_income_assessment", {
      p_assessment: {
        lead_id: leadId,
        funnel: "ai_income_path_finder",
        income_goal: params.answers["income_goal"] ?? null,
        weekly_time_available: params.answers["weekly_time_available"] ?? null,
        selected_skills: params.answers["selected_skills"] ?? [],
        income_timeline: params.answers["income_timeline"] ?? null,
        sales_comfort: params.answers["sales_comfort"] ?? null,
        technical_comfort: params.answers["technical_comfort"] ?? null,
        business_model_preference: params.answers["business_model_preference"] ?? null,
        existing_access: params.answers["existing_access"] ?? [],
        freelancer_score: Math.round(params.scores.freelancer),
        service_provider_score: Math.round(params.scores.service_provider),
        implementation_score: Math.round(params.scores.implementation),
        product_builder_score: Math.round(params.scores.product_builder),
        calculated_path: params.path,
        result_summary: params.summary,
      },
    });
    if (aErr) throw aErr;
    if (!assessmentId) throw new Error("Assessment save returned no id.");

    return { leadId, assessmentId, persisted: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not save your answers.";
    return { leadId: null, assessmentId: null, persisted: false, error: message };
  }
}

export async function joinWaitlist(leadId: string | null, assessmentId: string | null) {
  if (!supabaseConfigured || !leadId) return { ok: false, error: "Not saved." };
  const { error } = await supabase.rpc("join_waitlist", {
    p_lead_id: leadId,
    p_assessment_id: assessmentId,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * Sends the plan through the protected Edge Function after its data is saved.
 * The function receives IDs only and looks up the recipient server-side.
 */
export async function sendAssessmentEmail(leadId: string | null, assessmentId: string | null) {
  if (!supabaseConfigured || !leadId || !assessmentId) {
    return { ok: false, error: "Your plan was not saved yet." };
  }

  const { data, error } = await supabase.functions.invoke<{
    ok?: boolean;
    error?: string;
  }>("send-assessment-email", {
    body: { leadId, assessmentId },
  });

  if (error || !data?.ok) {
    return { ok: false, error: data?.error ?? error?.message ?? "Email delivery failed." };
  }

  return { ok: true };
}
