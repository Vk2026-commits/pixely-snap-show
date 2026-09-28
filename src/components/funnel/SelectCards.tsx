import { Check } from "lucide-react";
import type { QuestionOption } from "@/content/assessment";

const base =
  "group relative flex w-full items-center gap-3 rounded-xl border px-4 py-4 text-left transition-all duration-200 sm:px-5 sm:py-5 min-h-[60px]";

export function SingleSelectCard({
  option,
  selected,
  onSelect,
}: {
  option: QuestionOption;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={[
        base,
        selected
          ? "border-primary bg-primary/10 glow-ring"
          : "border-border bg-card hover:border-primary/40 hover:bg-accent",
      ].join(" ")}
    >
      <span
        className={[
          "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
          selected ? "border-primary bg-primary" : "border-muted-foreground/40",
        ].join(" ")}
      >
        {selected && <span className="size-2 rounded-full bg-primary-foreground" />}
      </span>
      <span className="text-base font-medium sm:text-[17px]">{option.label}</span>
    </button>
  );
}

export function MultiSelectCard({
  option,
  selected,
  onToggle,
}: {
  option: QuestionOption;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={[
        base,
        selected
          ? "border-primary bg-primary/10 glow-ring"
          : "border-border bg-card hover:border-primary/40 hover:bg-accent",
      ].join(" ")}
    >
      <span
        className={[
          "flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors",
          selected ? "border-primary bg-primary" : "border-muted-foreground/40",
        ].join(" ")}
      >
        {selected && <Check className="size-3.5 text-primary-foreground" strokeWidth={3} />}
      </span>
      <span className="text-base font-medium sm:text-[17px]">{option.label}</span>
    </button>
  );
}

export function ScaleSelect({
  min,
  max,
  minLabel,
  maxLabel,
  value,
  onSelect,
}: {
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
  value?: number;
  onSelect: (v: number) => void;
}) {
  const values = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <div>
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {values.map((v) => {
          const selected = value === v;
          return (
            <button
              key={v}
              type="button"
              onClick={() => onSelect(v)}
              aria-pressed={selected}
              className={[
                "flex h-16 items-center justify-center rounded-xl border font-display text-xl font-semibold transition-all sm:h-20 sm:text-2xl",
                selected
                  ? "border-primary bg-primary/10 text-primary glow-ring"
                  : "border-border bg-card text-foreground/70 hover:border-primary/40 hover:bg-accent",
              ].join(" ")}
            >
              {v}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex justify-between gap-4 text-xs text-muted-foreground sm:text-sm">
        <span>{minLabel}</span>
        <span className="text-right">{maxLabel}</span>
      </div>
    </div>
  );
}
