# Assessment Email Function

`send-assessment-email` delivers the assessment result to the lead through Resend after the browser successfully saves the lead and assessment via Supabase RPC.

## Required Supabase secrets

Set these **in Supabase**, not in the frontend `.env` file:

| Secret              | Purpose                                                                        |
| ------------------- | ------------------------------------------------------------------------------ |
| `RESEND_API_KEY`    | Active Resend API key with permission to send email.                           |
| `RESEND_FROM_EMAIL` | A Resend-verified sender, such as `AI Income Path Finder <hello@example.com>`. |

Optional:

| Secret            | Purpose                                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------------ |
| `ALLOWED_ORIGINS` | Comma-separated browser origins permitted by CORS. Defaults to `https://pixely-snap-show.lovable.app`. |

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are supplied to hosted Supabase Edge Functions automatically. The service role is used only inside the function to load the lead/assessment and write private delivery logs; it is never sent to the browser.

## Deploy

After authenticating the Supabase CLI to project `bkmbgyhrldolybyuebwj`:

```bash
supabase secrets set \
  RESEND_API_KEY="<active Resend API key>" \
  RESEND_FROM_EMAIL="AI Income Path Finder <hello@your-verified-domain.com>"

supabase functions deploy send-assessment-email --use-api
```

Apply `supabase/schema.sql` in the project's SQL editor before deploying the function. The schema creates the private `assessment_email_deliveries` log and `claim_assessment_email` RPC, which prevent duplicate sends. Resend receives a stable `Idempotency-Key` as a second safeguard.

## Behavior

- The function accepts only the saved `leadId` and `assessmentId`; it loads the recipient from Supabase rather than trusting an email address supplied by the browser.
- It sends one transactional plan email per assessment and records Resend's message ID privately.
- A failed delivery can be retried by the browser. Concurrent requests report as already processing rather than sending duplicates.
