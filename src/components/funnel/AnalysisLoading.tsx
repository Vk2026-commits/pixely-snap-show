import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { brandCopy } from "@/content/assessment";

export function AnalysisLoading({ onDone }: { onDone: () => void }) {
  const items = brandCopy.analysis.items;
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= items.length) {
      const t = setTimeout(onDone, 700);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => s + 1), 520);
    return () => clearTimeout(t);
  }, [step, items.length, onDone]);

  return (
    <div className="animate-rise py-10">
      <div className="flex items-center gap-3">
        <Loader2 className="size-5 animate-spin text-primary" />
        <h2 className="text-2xl font-bold sm:text-3xl">{brandCopy.analysis.heading}</h2>
      </div>
      <ul className="mt-8 space-y-3">
        {items.map((item, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <li
              key={item}
              className={[
                "flex items-center gap-3 rounded-xl border px-4 py-3.5 transition-all duration-300",
                done
                  ? "border-primary/40 bg-primary/5 text-foreground"
                  : active
                    ? "border-border bg-card text-foreground"
                    : "border-border/50 bg-card/40 text-muted-foreground/60",
              ].join(" ")}
            >
              <span
                className={[
                  "flex size-5 items-center justify-center rounded-full border",
                  done ? "border-primary bg-primary" : "border-muted-foreground/40",
                ].join(" ")}
              >
                {done && <Check className="size-3 text-primary-foreground" strokeWidth={3} />}
              </span>
              <span className="text-[15px] font-medium">{item}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
