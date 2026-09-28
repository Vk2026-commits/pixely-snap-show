import { useState } from "react";
import { ArrowRight, Ban, Check, Loader2, Target } from "lucide-react";
import { brandCopy, paths, pathOrder, type PathId } from "@/content/assessment";
import type { Scores } from "@/lib/scoring";

export function PathProgression({ current }: { current: PathId }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
      {pathOrder.map((id, i) => {
        const active = id === current;
        return (
          <div key={id} className="flex flex-1 items-center gap-2">
            <div
              className={[
                "flex-1 rounded-xl border px-4 py-3 transition-all",
                active
                  ? "border-primary bg-primary/10 glow-ring"
                  : "border-border bg-card/50",
              ].join(" ")}
            >
              <p
                className={[
                  "text-[10px] font-semibold uppercase tracking-[0.18em]",
                  active ? "text-primary" : "text-muted-foreground/60",
                ].join(" ")}
              >
                Stage {String(i + 1).padStart(2, "0")}
              </p>
              <p
                className={[
                  "mt-1 text-sm font-semibold",
                  active ? "text-foreground" : "text-muted-foreground",
                ].join(" ")}
              >
                {paths[id].name}
              </p>
            </div>
            {i < pathOrder.length - 1 && (
              <span className="hidden text-muted-foreground/40 sm:block">→</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function ResultHeader({ path, firstName }: { path: PathId; firstName: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
        {firstName ? `${firstName}, your` : "Your"} recommended AI income path
      </p>
      <h1 className="mt-3 text-[34px] font-bold leading-[1.08] sm:text-6xl">{paths[path].name}</h1>
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground sm:text-lg">
        {paths[path].tagline}
      </p>
    </div>
  );
}

export function ResultDashboard({ path, incomeGoal }: { path: PathId; incomeGoal: string }) {
  const d = paths[path].dashboard;
  const rows = [
    { label: "Income Goal", value: incomeGoal },
    { label: "Recommended Model", value: paths[path].name },
    { label: "Time Commitment", value: d.timeCommitment },
    { label: "Speed to Market", value: d.speedToMarket },
    { label: "Technical Complexity", value: d.technicalComplexity },
    { label: "Scalability", value: d.scalability },
    { label: "Customer Acquisition", value: d.customerAcquisition },
  ];
  return (
    <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
      {rows.map((r) => (
        <div key={r.label} className="bg-navy-deep px-5 py-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {r.label}
          </p>
          <p className="mt-2 font-display text-lg font-semibold leading-snug">{r.value}</p>
        </div>
      ))}
    </div>
  );
}

export function OpportunityFitChart({
  percentages,
  current,
}: {
  percentages: Scores;
  current: PathId;
}) {
  return (
    <div>
      <h3 className="text-xl font-bold sm:text-2xl">Your Opportunity Fit</h3>
      <div className="mt-5 space-y-4">
        {pathOrder.map((id) => {
          const active = id === current;
          return (
            <div key={id}>
              <div className="mb-1.5 flex items-baseline justify-between gap-4">
                <span
                  className={[
                    "text-sm font-medium",
                    active ? "text-foreground" : "text-muted-foreground",
                  ].join(" ")}
                >
                  {paths[id].name}
                </span>
                <span
                  className={[
                    "font-display text-sm font-semibold",
                    active ? "text-primary" : "text-muted-foreground",
                  ].join(" ")}
                >
                  {percentages[id]}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className={[
                    "h-full rounded-full transition-[width] duration-700 ease-out",
                    active ? "bg-primary" : "bg-muted-foreground/35",
                  ].join(" ")}
                  style={{
                    width: `${percentages[id]}%`,
                    boxShadow: active
                      ? "0 0 18px color-mix(in oklab, var(--primary) 70%, transparent)"
                      : undefined,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        These are assessment-fit indicators, not precise predictions.
      </p>
    </div>
  );
}

export function NextSteps({ path }: { path: PathId }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="panel rounded-2xl p-6">
        <div className="flex items-center gap-2 text-primary">
          <Target className="size-4" />
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em]">Your First Target</h3>
        </div>
        <p className="mt-3 font-display text-xl font-semibold leading-snug sm:text-2xl">
          {paths[path].firstTarget}
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {paths[path].examples.map((ex) => (
            <span
              key={ex}
              className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground"
            >
              {ex}
            </span>
          ))}
        </div>
      </div>

      <div className="panel rounded-2xl p-6">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
          Your Next 3 Moves
        </h3>
        <ol className="mt-4 space-y-3">
          {paths[path].nextMoves.map((move, i) => (
            <li key={move} className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-primary/50 bg-primary/10 font-display text-xs font-semibold text-primary">
                {i + 1}
              </span>
              <span className="text-[15px] leading-relaxed">{move}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export function AvoidSection({ path }: { path: PathId }) {
  return (
    <div className="rounded-2xl border border-border bg-navy-deep p-6">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Ban className="size-4" />
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em]">
          What NOT to Focus On Yet
        </h3>
      </div>
      <p className="mt-3 text-[17px] leading-relaxed sm:text-xl">{paths[path].avoid}</p>
    </div>
  );
}

export function WaitlistCTA({
  onJoin,
  joined,
  pending,
  error,
}: {
  onJoin: () => void;
  joined: boolean;
  pending: boolean;
  error?: string | null;
}) {
  return (
    <div className="panel relative overflow-hidden rounded-2xl p-7 sm:p-10">
      <div
        className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full opacity-40 blur-3xl"
        style={{ background: "color-mix(in oklab, var(--primary) 45%, transparent)" }}
      />
      {joined ? (
        <div className="relative animate-rise">
          <div className="flex size-11 items-center justify-center rounded-full bg-primary">
            <Check className="size-5 text-primary-foreground" strokeWidth={3} />
          </div>
          <h3 className="mt-5 text-2xl font-bold sm:text-3xl">
            {brandCopy.waitlist.confirmHeading}
          </h3>
          <p className="mt-2 text-muted-foreground">{brandCopy.waitlist.confirmBody}</p>
        </div>
      ) : (
        <div className="relative">
          <h3 className="max-w-2xl text-[26px] font-bold leading-tight sm:text-4xl">
            {brandCopy.waitlist.heading}
          </h3>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            {brandCopy.waitlist.body}
          </p>
          <button
            type="button"
            onClick={onJoin}
            disabled={pending}
            className="mt-7 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 text-base font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:opacity-60 sm:w-auto"
            style={{ boxShadow: "0 16px 40px -18px color-mix(in oklab, var(--primary) 90%, transparent)" }}
          >
            {pending && <Loader2 className="size-5 animate-spin" />}
            {brandCopy.waitlist.cta}
            {!pending && <ArrowRight className="size-4" />}
          </button>
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        </div>
      )}
    </div>
  );
}

export function WhyThisFits({ summary }: { summary: string }) {
  return (
    <div className="panel rounded-2xl p-6 sm:p-8">
      <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
        Why This Fits You
      </h3>
      <p className="mt-4 text-[17px] leading-relaxed sm:text-xl">{summary}</p>
    </div>
  );
}

export function useWaitlist(join: () => Promise<{ ok: boolean; error?: string }>) {
  const [joined, setJoined] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onJoin = async () => {
    setPending(true);
    setError(null);
    const res = await join();
    setPending(false);
    if (res.ok) setJoined(true);
    else setError(res.error ?? "Something went wrong. Please try again.");
  };

  return { joined, pending, error, onJoin };
}
