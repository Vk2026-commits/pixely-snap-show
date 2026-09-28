import { useState } from "react";
import { ArrowRight, Loader2, Lock } from "lucide-react";
import { brandCopy } from "@/content/assessment";
import type { LeadInput } from "@/lib/funnel-api";

const field =
  "h-13 w-full rounded-xl border border-border bg-navy-deep px-4 text-base text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-primary";

const emailRe = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const phoneRe = /^[+]?[\d\s().-]{7,20}$/;

export function LeadCapture({
  onSubmit,
  submitting,
  serverError,
}: {
  onSubmit: (lead: LeadInput) => void;
  submitting: boolean;
  serverError?: string | null | undefined;
}) {
  const [values, setValues] = useState<LeadInput>({
    first_name: "",
    email: "",
    phone: "",
    current_job: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LeadInput, string>>>({});

  const set = (k: keyof LeadInput, v: string) => setValues((s) => ({ ...s, [k]: v }));

  const validate = () => {
    const e: Partial<Record<keyof LeadInput, string>> = {};
    if (values.first_name.trim().length < 2) e.first_name = "Please enter your first name.";
    if (!emailRe.test(values.email.trim())) e.email = "Please enter a valid email address.";
    if (!phoneRe.test(values.phone.trim())) e.phone = "Please enter a valid phone number.";
    if (values.current_job.trim().length < 2) e.current_job = "Please tell us what you currently do.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div className="animate-rise">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
        Analysis complete
      </p>
      <h2 className="mt-3 text-[28px] font-bold leading-tight sm:text-4xl">
        {brandCopy.leadForm.heading}
      </h2>
      <p className="mt-3 text-[15px] text-muted-foreground sm:text-base">
        {brandCopy.leadForm.support}
      </p>

      <form
        className="mt-7 space-y-4"
        onSubmit={(ev) => {
          ev.preventDefault();
          if (validate()) onSubmit(values);
        }}
      >
        {(
          [
            { k: "first_name", label: "First Name", type: "text", ph: "Jordan" },
            { k: "email", label: "Email", type: "email", ph: "you@company.com" },
            { k: "phone", label: "Mobile Phone Number", type: "tel", ph: "(555) 123-4567" },
            { k: "current_job", label: "Current Job / Profession", type: "text", ph: "Operations manager" },
          ] as const
        ).map((f) => (
          <div key={f.k}>
            <label
              htmlFor={f.k}
              className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
            >
              {f.label}
            </label>
            <input
              id={f.k}
              type={f.type}
              inputMode={f.k === "phone" ? "tel" : undefined}
              autoComplete={
                f.k === "first_name" ? "given-name" : f.k === "current_job" ? "organization-title" : f.k
              }
              placeholder={f.ph}
              value={values[f.k]}
              onChange={(e) => set(f.k, e.target.value)}
              className={field}
            />
            {errors[f.k] && <p className="mt-1.5 text-xs text-destructive">{errors[f.k]}</p>}
          </div>
        ))}

        {serverError && (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary text-base font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:opacity-60"
          style={{ boxShadow: "0 16px 40px -18px color-mix(in oklab, var(--primary) 90%, transparent)" }}
        >
          {submitting ? <Loader2 className="size-5 animate-spin" /> : null}
          {brandCopy.leadForm.cta}
          {!submitting && <ArrowRight className="size-4" />}
        </button>

        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="size-3" />
          Your information is used only to deliver your plan and training updates.
        </p>
      </form>
    </div>
  );
}
