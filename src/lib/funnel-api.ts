/**
 * Supabase persistence for the funnel. Kept separate from scoring + UI.
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
    return { leadId: null, assessmentId: null, persisted: false, error: "Supabase is not configured." };
  }

  const email = normalizeEmail(params.lead.email);

  try {
    // Upsert on normalized email: one lead, many assessments. No public read access needed.
    const { data: lead, error: leadErr } = await supabase
      .from("leads")
      .upsert(
        {
          first_name: params.lead.first_name.trim(),
          email,
          phone: params.lead.phone.trim(),
          current_job: params.lead.current_job.trim(),
          ...params.attribution,
        },
        { onConflict: "email" },
      )
      .select("id")
      .single();
    if (leadErr) throw leadErr;
    const leadId = lead.id as string;

    const { data: assessment, error: aErr } = await supabase
      .from("income_assessments")
      .insert({
        lead_id: leadId,
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
      })
      .select("id")
      .single();
    if (aErr) throw aErr;

    return { leadId, assessmentId: assessment.id as string, persisted: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not save your answers.";
    return { leadId: null, assessmentId: null, persisted: false, error: message };
  }
}

export async function joinWaitlist(leadId: string | null, assessmentId: string | null) {
  if (!supabaseConfigured || !leadId) return { ok: false, error: "Not saved." };
  const { error } = await supabase
    .from("webinar_waitlist")
    .insert({ lead_id: leadId, assessment_id: assessmentId, status: "waiting" });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
