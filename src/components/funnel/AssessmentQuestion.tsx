import type { Question } from "@/content/assessment";
import { MultiSelectCard, ScaleSelect, SingleSelectCard } from "./SelectCards";

export function AssessmentQuestion({
  question,
  value,
  onChange,
  index,
  total,
}: {
  question: Question;
  value: string | string[] | number | undefined;
  onChange: (v: string | string[] | number) => void;
  index: number;
  total: number;
}) {
  const selected = Array.isArray(value) ? value : [];

  return (
    <div key={question.id} className="animate-rise">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
        Question {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </p>
      <h2 className="mt-3 text-[26px] font-bold leading-[1.15] sm:text-4xl">{question.heading}</h2>
      {question.support && (
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
          {question.support}
        </p>
      )}

      <p className="mt-7 text-base font-semibold sm:text-lg">
        {question.question}
        {question.type === "multi" && (
          <span className="ml-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Select all that apply
          </span>
        )}
      </p>

      <div className="mt-4">
        {question.type === "scale" && question.scale ? (
          <ScaleSelect
            {...question.scale}
            value={typeof value === "number" ? value : undefined}
            onSelect={onChange}
          />
        ) : (
          <div
            className={
              question.type === "multi"
                ? "grid gap-2.5 sm:grid-cols-2"
                : "grid gap-2.5"
            }
          >
            {question.options?.map((opt) =>
              question.type === "multi" ? (
                <MultiSelectCard
                  key={opt.value}
                  option={opt}
                  selected={selected.includes(opt.value)}
                  onToggle={() =>
                    onChange(
                      selected.includes(opt.value)
                        ? selected.filter((v) => v !== opt.value)
                        : [...selected, opt.value],
                    )
                  }
                />
              ) : (
                <SingleSelectCard
                  key={opt.value}
                  option={opt}
                  selected={value === opt.value}
                  onSelect={() => onChange(opt.value)}
                />
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}
