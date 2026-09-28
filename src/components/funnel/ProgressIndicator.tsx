import { stages } from "@/content/assessment";

export function ProgressIndicator({
  currentStage,
  progress,
}: {
  currentStage: string;
  progress: number;
}) {
  return (
    <div className="w-full">
      <div className="mb-3 hidden items-center gap-2 sm:flex">
        {stages.map((stage, i) => {
          const active = stage === currentStage;
          const done = stages.indexOf(currentStage) > i;
          return (
            <div key={stage} className="flex items-center gap-2">
              <span
                className={[
                  "text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors",
                  active
                    ? "text-primary"
                    : done
                      ? "text-foreground/70"
                      : "text-muted-foreground/50",
                ].join(" ")}
              >
                {String(i + 1).padStart(2, "0")} {stage}
              </span>
              {i < stages.length - 1 && (
                <span className="text-muted-foreground/30">→</span>
              )}
            </div>
          );
        })}
      </div>
      <div className="h-[3px] w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
          style={{
            width: `${Math.round(progress * 100)}%`,
            boxShadow: "0 0 18px color-mix(in oklab, var(--primary) 70%, transparent)",
          }}
        />
      </div>
      <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground sm:hidden">
        {currentStage} · {Math.round(progress * 100)}%
      </p>
    </div>
  );
}
