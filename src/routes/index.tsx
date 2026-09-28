import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";

import { brandCopy, questions, stages, type Question } from "@/content/assessment";
import { buildSummary, scoreAssessment, type Answers } from "@/lib/scoring";
import { captureAttribution, type Attribution } from "@/lib/attribution";
import { joinWaitlist, submitAssessment, type LeadInput } from "@/lib/funnel-api";
import { SiteHeader } from "@/components/funnel/SiteHeader";
import { ProgressIndicator } from "@/components/funnel/ProgressIndicator";
import { AssessmentQuestion } from "@/components/funnel/AssessmentQuestion";
import { AssessmentNavigation } from "@/components/funnel/AssessmentNavigation";
import { AnalysisLoading } from "@/components/funnel/AnalysisLoading";
import { LeadCapture } from "@/components/funnel/LeadCapture";
import {
  AvoidSection,
  NextSteps,
  OpportunityFitChart,
  PathProgression,
  ResultDashboard,
  ResultHeader,
  WaitlistCTA,
  WhyThisFits,
  useWaitlist,
} from "@/components/funnel/ResultReport";

const TITLE = "AI Income Path Finder — Find Your Best AI Income Path";
const DESCRIPTION =
  "A 3-minute personalized assessment that shows which AI income path fits your goal, skills and available time — and exactly what to do first.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PathFinder,
});

type Stage = "hero" | "intro" | "questions" | "analysis" | "lead" | "result";

const STORAGE_KEY = "aipf_answers";

function PathFinder() {
  const [stage, setStage] = useState<Stage>("hero");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [attribution, setAttribution] = useState<Attribution | null>(null);
  const [lead, setLead] = useState<LeadInput | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [ids, setIds] = useState<{ leadId: string | null; assessmentId: string | null }>({
    leadId: null,
    assessmentId: null,
  });
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAttribution(captureAttribution());
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setAnswers(JSON.parse(saved) as Answers);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    } catch {
      /* ignore */
    }
  }, [answers]);

  const current: Question = questions[step]!;
  const value = answers[current.id];
  const answered =
    current.type === "multi"
      ? Array.isArray(value) && value.length > 0
      : value !== undefined && value !== "";

  const result = useMemo(() => scoreAssessment(answers), [answers]);

  const labelOf = useCallback(
    (questionId: string) => {
      const q = questions.find((x) => x.id === questionId);
      const v = answers[questionId];
      return q?.options?.find((o) => o.value === v)?.label ?? String(v ?? "");
    },
    [answers],
  );

  const summary = useMemo(
    () => buildSummary(answers, result.path, labelOf),
    [answers, result.path, labelOf],
  );

  const scrollTop = () =>
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const handleNext = () => {
    if (step === questions.length - 1) {
      setStage("analysis");
    } else {
      setStep((s) => s + 1);
    }
    scrollTop();
  };

  const handleBack = () => {
    if (step === 0) setStage("intro");
    else setStep((s) => s - 1);
    scrollTop();
  };

  const handleLeadSubmit = async (input: LeadInput) => {
    setSubmitting(true);
    setServerError(null);
    setLead(input);
    const res = await submitAssessment({
      lead: input,
      attribution: attribution ?? captureAttribution(),
      answers,
      scores: result.scores,
      path: result.path,
      summary,
    });
    setSubmitting(false);
    setIds({ leadId: res.leadId, assessmentId: res.assessmentId });
    if (!res.persisted) {
      setServerError(
        "We couldn't save your details right now, but your plan is ready below.",
      );
    }
    setStage("result");
    scrollTop();
  };

  const waitlist = useWaitlist(() => joinWaitlist(ids.leadId, ids.assessmentId));

  const stageIndex = stages.indexOf(current.stage);
  const progress =
    stage === "questions" ? (step + 1) / (questions.length + 1) : stage === "analysis" ? 0.95 : 1;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div ref={topRef} />

      {stage === "hero" && <Hero onStart={() => setStage("intro")} />}

      {stage === "intro" && (
        <section className="mx-auto max-w-3xl px-5 py-14 sm:py-24">
          <div className="animate-rise">
            <h2 className="text-[28px] font-bold leading-[1.12] sm:text-5xl">
              {brandCopy.intro.heading}
            </h2>
            <div className="mt-6 space-y-4">
              {brandCopy.intro.body.map((p) => (
                <p key={p} className="text-[15px] leading-relaxed text-muted-foreground sm:text-lg">
                  {p}
                </p>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setStage("questions");
                scrollTop();
              }}
              className="mt-9 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 text-base font-semibold text-primary-foreground transition-all hover:brightness-110 sm:w-auto"
              style={{
                boxShadow: "0 16px 40px -18px color-mix(in oklab, var(--primary) 90%, transparent)",
              }}
            >
              {brandCopy.intro.cta}
              <ArrowRight className="size-4" />
            </button>
          </div>
        </section>
      )}

      {stage === "questions" && (
        <section className="mx-auto max-w-3xl px-5 py-8 sm:py-14">
          <ProgressIndicator
            currentStage={stages[stageIndex >= 0 ? stageIndex : 0]!}
            progress={progress}
          />
          <div className="mt-8">
            <AssessmentQuestion
              question={current}
              value={value}
              onChange={(v) => setAnswers((a) => ({ ...a, [current.id]: v }))}
              index={step}
              total={questions.length}
            />
            <AssessmentNavigation
              onBack={handleBack}
              onNext={handleNext}
              canGoBack
              canGoNext={answered}
              optionalSkip={current.optional}
              nextLabel={step === questions.length - 1 ? "See My Plan" : "Continue"}
            />
          </div>
        </section>
      )}

      {stage === "analysis" && (
        <section className="mx-auto max-w-3xl px-5 py-8 sm:py-14">
          <ProgressIndicator currentStage="Your Plan" progress={progress} />
          <AnalysisLoading onDone={() => setStage("lead")} />
        </section>
      )}

      {stage === "lead" && (
        <section className="mx-auto max-w-2xl px-5 py-10 sm:py-16">
          <LeadCapture onSubmit={handleLeadSubmit} submitting={submitting} serverError={null} />
        </section>
      )}

      {stage === "result" && (
        <section className="mx-auto max-w-5xl space-y-8 px-5 py-10 sm:space-y-12 sm:py-16">
          <div className="animate-rise space-y-8">
            <ResultHeader path={result.path} firstName={lead?.first_name.trim() ?? ""} />
            <PathProgression current={result.path} />
          </div>
          <WhyThisFits summary={summary} />
          <ResultDashboard path={result.path} incomeGoal={labelOf("income_goal")} />
          <div className="panel rounded-2xl p-6 sm:p-8">
            <OpportunityFitChart percentages={result.percentages} current={result.path} />
          </div>
          <NextSteps path={result.path} />
          <AvoidSection path={result.path} />
          <WaitlistCTA
            onJoin={waitlist.onJoin}
            joined={waitlist.joined}
            pending={waitlist.pending}
            error={waitlist.error}
          />
          {serverError && <p className="text-center text-xs text-muted-foreground">{serverError}</p>}
        </section>
      )}

      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} AI Income Path Finder
      </footer>
    </div>
  );
}

function Hero({ onStart }: { onStart: () => void }) {
  return (
    <section className="relative overflow-hidden">
      <div className="grid-canvas pointer-events-none absolute inset-0" />
      <div
        className="pointer-events-none absolute left-1/2 top-0 size-[520px] -translate-x-1/2 -translate-y-1/3 rounded-full opacity-25 blur-3xl"
        style={{ background: "color-mix(in oklab, var(--primary) 60%, transparent)" }}
      />
      <div className="relative mx-auto max-w-3xl px-5 py-16 sm:py-28">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
          {brandCopy.hero.eyebrow}
        </p>
        <h1 className="mt-4 text-[38px] font-bold leading-[1.05] sm:text-7xl">
          {brandCopy.hero.headline}
        </h1>
        <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-muted-foreground sm:text-xl">
          {brandCopy.hero.subheadline}
        </p>
        <p className="mt-4 text-[15px] font-medium sm:text-lg">{brandCopy.hero.support}</p>

        <button
          type="button"
          onClick={onStart}
          className="mt-9 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 text-base font-semibold text-primary-foreground transition-all hover:brightness-110 sm:w-auto"
          style={{
            boxShadow: "0 16px 40px -18px color-mix(in oklab, var(--primary) 90%, transparent)",
          }}
        >
          {brandCopy.hero.cta}
          <ArrowRight className="size-4" />
        </button>
        <p className="mt-3 text-xs text-muted-foreground">{brandCopy.hero.underCta}</p>

        <div className="mt-14 flex flex-wrap items-center gap-2 sm:gap-3">
          {brandCopy.hero.flow.map((item, i) => (
            <div key={item} className="flex items-center gap-2 sm:gap-3">
              <span
                className={[
                  "rounded-full border px-4 py-2 text-xs font-medium sm:text-sm",
                  i === brandCopy.hero.flow.length - 1
                    ? "border-primary/60 bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground",
                ].join(" ")}
              >
                {item}
              </span>
              {i < brandCopy.hero.flow.length - 1 && (
                <span className="text-muted-foreground/40">→</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
