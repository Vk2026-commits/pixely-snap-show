import { createClient } from "npm:@supabase/supabase-js@2";

type AssessmentEmailRequest = {
  leadId?: unknown;
  assessmentId?: unknown;
};

type AssessmentRecord = {
  id: string;
  lead_id: string;
  income_goal: string | null;
  calculated_path: string | null;
  result_summary: string | null;
  leads:
    | { first_name: string | null; email: string | null }
    | { first_name: string | null; email: string | null }[]
    | null;
};

const defaultOrigin = "https://income.vektiss.com";
const defaultOrigins = [defaultOrigin, "https://pixely-snap-show.lovable.app"];
const trustedOrigins = (Deno.env.get("ALLOWED_ORIGINS") ?? defaultOrigins.join(","))
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function corsHeaders(origin: string | null) {
  const allowOrigin =
    origin && trustedOrigins.includes(origin) ? origin : (trustedOrigins[0] ?? defaultOrigin);
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(origin: string | null, body: unknown, status = 200) {
  return Response.json(body, { status, headers: corsHeaders(origin) });
}

function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  );
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };
    return entities[character] ?? character;
  });
}

function pathName(path: string | null) {
  const names: Record<string, string> = {
    freelancer: "AI Freelancer",
    service_provider: "AI Service Provider",
    implementation: "AI Implementation Specialist",
    product_builder: "AI Product Builder",
  };
  return names[path ?? ""] ?? "AI Income Path";
}

function buildWebinarRegistrationUrl(
  baseUrl: string | undefined,
  leadId: string,
  assessmentId: string,
) {
  if (!baseUrl) return null;
  try {
    const url = new URL(baseUrl);
    if (url.protocol !== "https:") return null;
    url.searchParams.set("lead_id", leadId);
    url.searchParams.set("assessment_id", assessmentId);
    return url.toString();
  } catch {
    return null;
  }
}

function emailBody(params: {
  firstName: string;
  path: string;
  incomeGoal: string | null;
  summary: string | null;
  webinarRegistrationUrl: string | null;
}) {
  const firstName = escapeHtml(params.firstName.trim() || "there");
  const path = escapeHtml(params.path);
  const incomeGoal = params.incomeGoal ? escapeHtml(params.incomeGoal) : null;
  const summary = escapeHtml(
    params.summary?.trim() ||
      "Your answers point to a practical path that matches your goals and current strengths.",
  );
  const goalLine = incomeGoal
    ? `<p style="margin:0 0 20px;color:#5d6472;font-size:15px;line-height:1.6">Your income goal: <strong style="color:#182033">${incomeGoal}</strong></p>`
    : "";
  const webinarSection = params.webinarRegistrationUrl
    ? `<div style="margin:28px 0 0;padding:22px;border-radius:12px;background:#0f1f3d">
                <p style="margin:0;color:#9fd4ff;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase">Live online training</p>
                <p style="margin:10px 0 0;color:#ffffff;font-size:19px;font-weight:700;line-height:1.35">Build Your First AI Income Stream</p>
                <p style="margin:10px 0 18px;color:#dbeafe;font-size:14px;line-height:1.6">Join Ricky Rose live every Sunday at 7:00 PM Central to turn your personalized path into practical next steps.</p>
                <table role="presentation" cellspacing="0" cellpadding="0"><tr><td style="border-radius:8px;background:#1674c4"><a href="${escapeHtml(params.webinarRegistrationUrl)}" style="display:inline-block;padding:13px 18px;color:#ffffff;font-size:14px;font-weight:700;line-height:1;text-decoration:none">Reserve your free seat</a></td></tr></table>
              </div>`
    : "";
  const webinarText = params.webinarRegistrationUrl
    ? [
        "",
        "Join Ricky Rose live every Sunday at 7:00 PM Central: Build Your First AI Income Stream.",
        `Reserve your free seat: ${params.webinarRegistrationUrl}`,
      ]
    : [];

  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f4f6f8;color:#182033;font-family:Arial,Helvetica,sans-serif">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f6f8;padding:32px 16px">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border-radius:16px;overflow:hidden">
          <tr><td style="background:#0f1f3d;padding:28px 32px"><p style="margin:0;color:#9fd4ff;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">AI Income Path Finder</p></td></tr>
          <tr><td style="padding:36px 32px">
            <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;color:#182033">${firstName}, your plan is ready.</h1>
            <p style="margin:0 0 24px;color:#5d6472;font-size:16px;line-height:1.6">Based on your assessment, your recommended path is:</p>
            <div style="margin:0 0 24px;padding:20px;border:1px solid #cde2f7;border-radius:12px;background:#f3f9ff">
              <p style="margin:0;color:#0f5f9e;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase">Recommended AI income path</p>
              <p style="margin:8px 0 0;color:#182033;font-size:22px;font-weight:700">${path}</p>
            </div>
            ${goalLine}
            <p style="margin:0;color:#343b4a;font-size:16px;line-height:1.7">${summary}</p>
            ${webinarSection}
            <p style="margin:28px 0 0;color:#5d6472;font-size:14px;line-height:1.6">Keep this email handy as you work through the personalized plan displayed after your assessment.</p>
          </td></tr>
          <tr><td style="padding:20px 32px;background:#f4f6f8"><p style="margin:0;color:#6b7280;font-size:12px;line-height:1.5">You received this email because you requested an AI Income Path Finder plan.</p></td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

  const text = [
    `Hi ${params.firstName.trim() || "there"},`,
    "",
    "Your AI Income Path Finder plan is ready.",
    "",
    `Recommended AI income path: ${params.path}`,
    ...(params.incomeGoal ? [`Income goal: ${params.incomeGoal}`] : []),
    "",
    params.summary?.trim() ||
      "Your answers point to a practical path that matches your goals and current strengths.",
    ...webinarText,
    "",
    "Keep this email handy as you work through the personalized plan displayed after your assessment.",
  ].join("\n");

  return { html, text };
}

Deno.serve(async (request) => {
  const origin = request.headers.get("origin");

  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(origin) });
  }

  if (request.method !== "POST") {
    return json(origin, { ok: false, error: "Method not allowed." }, 405);
  }

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const resendFromEmail = Deno.env.get("RESEND_FROM_EMAIL");
  const webinarRegistrationBaseUrl = Deno.env.get("WEBINAR_REGISTRATION_URL");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!resendApiKey || !resendFromEmail || !supabaseUrl || !serviceRoleKey) {
    console.error("Assessment email function is missing required configuration.");
    return json(origin, { ok: false, error: "Email delivery is not configured." }, 500);
  }

  try {
    const payload = (await request.json()) as AssessmentEmailRequest;
    if (!isUuid(payload.leadId) || !isUuid(payload.assessmentId)) {
      return json(origin, { ok: false, error: "Invalid assessment reference." }, 400);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: assessment, error: assessmentError } = await supabase
      .from("income_assessments")
      .select(
        "id, lead_id, income_goal, calculated_path, result_summary, leads!inner(first_name, email)",
      )
      .eq("id", payload.assessmentId)
      .eq("lead_id", payload.leadId)
      .maybeSingle<AssessmentRecord>();

    if (assessmentError) {
      console.error("Could not load assessment for email delivery.", assessmentError);
      return json(origin, { ok: false, error: "Assessment lookup failed." }, 500);
    }

    if (!assessment) {
      return json(origin, { ok: false, error: "Assessment was not found." }, 404);
    }

    const lead = Array.isArray(assessment.leads) ? assessment.leads[0] : assessment.leads;
    if (!lead?.email) {
      return json(origin, { ok: false, error: "Lead email was not found." }, 404);
    }

    const { data: claimStatus, error: claimError } = await supabase.rpc("claim_assessment_email", {
      p_lead_id: payload.leadId,
      p_assessment_id: payload.assessmentId,
    });

    if (claimError || !claimStatus) {
      console.error("Could not claim assessment email delivery.", claimError);
      return json(origin, { ok: false, error: "Email delivery could not be started." }, 500);
    }

    if (claimStatus === "sent") {
      return json(origin, { ok: true, status: "already_sent" });
    }

    if (claimStatus === "processing") {
      return json(origin, { ok: true, status: "already_processing" }, 202);
    }

    const message = emailBody({
      firstName: lead.first_name ?? "",
      path: pathName(assessment.calculated_path),
      incomeGoal: assessment.income_goal,
      summary: assessment.result_summary,
      webinarRegistrationUrl: buildWebinarRegistrationUrl(
        webinarRegistrationBaseUrl,
        assessment.lead_id,
        assessment.id,
      ),
    });

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `income-path-plan-${assessment.id}`,
      },
      body: JSON.stringify({
        from: resendFromEmail,
        to: [lead.email.trim().toLowerCase()],
        subject: `Your AI Income Path: ${pathName(assessment.calculated_path)}`,
        html: message.html,
        text: message.text,
        tags: [
          { name: "funnel", value: "ai_income_path_finder" },
          { name: "assessment_id", value: assessment.id },
        ],
      }),
    });

    const resendPayload = (await resendResponse.json().catch(() => null)) as {
      id?: unknown;
    } | null;

    if (!resendResponse.ok || typeof resendPayload?.id !== "string") {
      console.error("Resend rejected the assessment email.", { status: resendResponse.status });
      await supabase
        .from("assessment_email_deliveries")
        .update({
          status: "failed",
          failure_reason: `Resend returned HTTP ${resendResponse.status}`,
          updated_at: new Date().toISOString(),
        })
        .eq("assessment_id", assessment.id);
      return json(origin, { ok: false, error: "Email delivery failed." }, 502);
    }

    const { error: deliveryUpdateError } = await supabase
      .from("assessment_email_deliveries")
      .update({
        status: "sent",
        resend_email_id: resendPayload.id,
        failure_reason: null,
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("assessment_id", assessment.id);

    if (deliveryUpdateError) {
      console.error(
        "Resend accepted the email but delivery tracking could not be updated.",
        deliveryUpdateError,
      );
    }

    return json(origin, { ok: true, status: "sent" });
  } catch (error) {
    console.error("Unexpected assessment email error.", error);
    return json(origin, { ok: false, error: "Unexpected email delivery error." }, 500);
  }
});
