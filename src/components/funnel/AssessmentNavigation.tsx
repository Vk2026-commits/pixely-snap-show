import { ArrowLeft, ArrowRight } from "lucide-react";

export function AssessmentNavigation({
  onBack,
  onNext,
  canGoBack,
  canGoNext,
  nextLabel = "Continue",
  optionalSkip,
}: {
  onBack: () => void;
  onNext: () => void;
  canGoBack: boolean;
  canGoNext: boolean;
  nextLabel?: string | undefined;
  optionalSkip?: boolean | undefined;
}) {
  return (
    <div className="mt-8 flex items-center gap-3">
      <button
        type="button"
        onClick={onBack}
        disabled={!canGoBack}
        className="flex h-13 items-center gap-2 rounded-xl border border-border bg-card px-4 py-3.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-30"
      >
        <ArrowLeft className="size-4" />
        Back
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={!canGoNext && !optionalSkip}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-base font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:pointer-events-none disabled:opacity-30"
        style={{ boxShadow: "0 16px 40px -18px color-mix(in oklab, var(--primary) 90%, transparent)" }}
      >
        {!canGoNext && optionalSkip ? "Skip" : nextLabel}
        <ArrowRight className="size-4" />
      </button>
    </div>
  );
}
