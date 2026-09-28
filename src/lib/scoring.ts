/**
 * Scoring logic — editable weights. Combines every answer into four path scores.
 */
import { paths, type PathId } from "@/content/assessment";

export type Answers = Record<string, string | string[] | number | undefined>;

export type Scores = Record<PathId, number>;

type Weight = Partial<Scores>;

const zero = (): Scores => ({
  freelancer: 0,
  service_provider: 0,
  implementation: 0,
  product_builder: 0,
});

const incomeGoal: Record<string, Weight> = {
  "500_1000": { freelancer: 10, service_provider: 3 },
  "1000_3000": { freelancer: 8, service_provider: 6, implementation: 2 },
  "3000_5000": { freelancer: 4, service_provider: 9, implementation: 6, product_builder: 3 },
  "5000_10000": { freelancer: 1, service_provider: 8, implementation: 9, product_builder: 6 },
  "10000_plus": { service_provider: 5, implementation: 9, product_builder: 10 },
};

const weeklyTime: Record<string, Weight> = {
  under_5: { freelancer: 10, service_provider: 3 },
  "5_10": { freelancer: 8, service_provider: 7, implementation: 4 },
  "10_20": { freelancer: 4, service_provider: 9, implementation: 8, product_builder: 5 },
  "20_plus": { freelancer: 2, service_provider: 7, implementation: 9, product_builder: 8 },
  full_time: { freelancer: 1, service_provider: 7, implementation: 9, product_builder: 10 },
};

const timeline: Record<string, Weight> = {
  "30_days": { freelancer: 10, service_provider: 5 },
  "1_3_months": { freelancer: 7, service_provider: 9, implementation: 4 },
  "3_6_months": { freelancer: 2, service_provider: 7, implementation: 9, product_builder: 6 },
  long_term: { freelancer: 0, service_provider: 4, implementation: 8, product_builder: 10 },
};

const technical: Record<string, Weight> = {
  tools_only: { freelancer: 10, service_provider: 6 },
  automations: { freelancer: 5, service_provider: 9, implementation: 6 },
  agents: { freelancer: 1, service_provider: 6, implementation: 10, product_builder: 5 },
  software: { implementation: 7, product_builder: 10 },
};

const modelPreference: Record<string, Weight> = {
  use_existing_skill: { freelancer: 12, service_provider: 3 },
  service_to_business: { freelancer: 4, service_provider: 12 },
  build_systems: { service_provider: 5, implementation: 12 },
  manage_systems: { service_provider: 6, implementation: 11, product_builder: 3 },
  build_product: { implementation: 4, product_builder: 12 },
  unsure: { freelancer: 5, service_provider: 5, implementation: 3, product_builder: 2 },
};

const skillWeights: Record<string, Weight> = {
  video_editing: { freelancer: 4 },
  graphic_design: { freelancer: 4 },
  writing: { freelancer: 4, service_provider: 2 },
  research: { freelancer: 3, service_provider: 1 },
  admin: { freelancer: 3 },
  sales: { service_provider: 4, implementation: 2 },
  marketing: { service_provider: 4, implementation: 1 },
  customer_service: { freelancer: 2, service_provider: 2 },
  operations: { implementation: 4, service_provider: 2 },
  technology: { implementation: 4, product_builder: 5 },
  industry_knowledge: { implementation: 3, product_builder: 4 },
  management: { implementation: 3, product_builder: 2 },
  consulting: { service_provider: 3, implementation: 3 },
  other: {},
};

const accessWeights: Record<string, Weight> = {
  business_owners: { service_provider: 4, implementation: 4 },
  online_audience: { freelancer: 3, service_provider: 3, product_builder: 2 },
  industry_experience: { implementation: 3, product_builder: 4 },
  past_clients: { freelancer: 3, service_provider: 4 },
  professional_relationships: { service_provider: 2, implementation: 2 },
  coworkers: { service_provider: 1, implementation: 2 },
  none: { freelancer: 2 },
};

function add(total: Scores, weight: Weight | undefined, factor = 1) {
  if (!weight) return;
  (Object.keys(total) as PathId[]).forEach((k) => {
    total[k] += (weight[k] ?? 0) * factor;
  });
}

const MAX_RAW = 62;

export interface ScoreResult {
  scores: Scores;
  percentages: Scores;
  path: PathId;
}

export function scoreAssessment(answers: Answers): ScoreResult {
  const total = zero();

  add(total, incomeGoal[answers["income_goal"] as string]);
  add(total, weeklyTime[answers["weekly_time_available"] as string]);
  add(total, timeline[answers["income_timeline"] as string]);
  add(total, technical[answers["technical_comfort"] as string]);
  add(total, modelPreference[answers["business_model_preference"] as string]);

  const skills = (answers["selected_skills"] as string[] | undefined) ?? [];
  skills.forEach((s) => add(total, skillWeights[s]));

  const access = (answers["existing_access"] as string[] | undefined) ?? [];
  access.forEach((a) => add(total, accessWeights[a]));

  // Sales comfort (1-5): low comfort favors freelancing, high comfort favors client work.
  const comfort = Number(answers["sales_comfort"] ?? 3);
  add(total, {
    freelancer: (6 - comfort) * 1.5,
    service_provider: comfort * 1.6,
    implementation: comfort * 1.2,
    product_builder: comfort * 0.6,
  });

  const percentages = zero();
  (Object.keys(total) as PathId[]).forEach((k) => {
    const pct = Math.round((total[k] / MAX_RAW) * 100);
    percentages[k] = Math.max(28, Math.min(96, pct));
  });

  const path = (Object.keys(total) as PathId[]).reduce((best, k) =>
    total[k] > total[best] ? k : best,
  );

  return { scores: total, percentages, path };
}

/** Human summary referencing their actual answers. */
export function buildSummary(answers: Answers, path: PathId, labelOf: (q: string) => string) {
  const goal = labelOf("income_goal");
  const time = labelOf("weekly_time_available");
  const skills = (answers["selected_skills"] as string[] | undefined) ?? [];
  const p = paths[path];

  const skillPhrase =
    skills.length > 0
      ? "already have marketable skills to build on"
      : "are starting without a defined skill to package yet";

  return `You want to create an additional ${goal} per month, have ${time.toLowerCase()} available each week, and ${skillPhrase}. Based on your answers, your strongest starting opportunity is the ${p.name} path: ${p.tagline}`;
}
