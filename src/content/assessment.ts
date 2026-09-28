/**
 * All editable copy + question content for the AI Income Path Finder.
 * UI logic lives elsewhere — change wording, options and order here.
 */

export type PathId = "freelancer" | "service_provider" | "implementation" | "product_builder";

export type QuestionType = "single" | "multi" | "scale";

export interface QuestionOption {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  stage: string;
  heading: string;
  support?: string;
  question: string;
  options?: QuestionOption[];
  scale?: { min: number; max: number; minLabel: string; maxLabel: string };
  optional?: boolean;
}

export const brandCopy = {
  productName: "AI Income Path Finder",
  hero: {
    eyebrow: "Personalized AI Income Assessment",
    headline: "Find Your Best AI Income Path",
    subheadline:
      "Answer a few questions about your income goal, skills, experience, and available time. We'll help you identify the AI opportunity that makes the most sense for where you are right now.",
    support:
      "You do not need to quit your job, become a developer, or start from zero.",
    cta: "Find My AI Income Path",
    underCta: "Takes about 3 minutes",
    flow: ["Your Skills", "AI Leverage", "Opportunity", "Income"],
  },
  intro: {
    heading: "You Don't Need Every AI Opportunity.",
    body: [
      "You need the one that fits your current situation.",
      "Someone trying to make an additional $500 per month should probably not follow the same strategy as someone trying to build a $50,000-per-month company.",
      "Your available time, current skills, comfort with sales, technical ability, and income goal all change the answer.",
      "Let's find your path.",
    ],
    cta: "Start My Assessment",
  },
  analysis: {
    heading: "Analyzing your answers...",
    items: [
      "Income Goal",
      "Skills",
      "Available Time",
      "Business Model",
      "Technical Comfort",
      "Speed to Income",
    ],
    done: "Your AI Income Plan Is Ready.",
  },
  leadForm: {
    heading: "Your AI Income Plan Is Ready.",
    support: "Tell us where to send it and we'll unlock your personalized plan.",
    cta: "Show Me My Plan",
  },
  waitlist: {
    heading: "You Know Which Path Fits You. Now Learn How to Build It.",
    body: "I'm preparing a live training that will walk you through how to take your AI opportunity from an idea to an actual offer, identify what people will pay for, use AI to build faster, and begin creating additional income. The training is currently being developed. Join the waitlist and we'll let you know when registration opens.",
    cta: "Join the Training Waitlist",
    confirmHeading: "You're On the List.",
    confirmBody: "We'll let you know when registration opens.",
  },
};

export const stages = ["Goal", "Time", "Skills", "Preferences", "Your Plan"];

export const questions: Question[] = [
  {
    id: "income_goal",
    type: "single",
    stage: "Goal",
    heading: "Start With the Number.",
    support:
      "The opportunity that makes sense for someone trying to create an extra $500 per month is very different from the opportunity required to build $10,000+ per month.",
    question: "How much additional monthly income would you like to create?",
    options: [
      { value: "500_1000", label: "$500–$1,000" },
      { value: "1000_3000", label: "$1,000–$3,000" },
      { value: "3000_5000", label: "$3,000–$5,000" },
      { value: "5000_10000", label: "$5,000–$10,000" },
      { value: "10000_plus", label: "$10,000+" },
    ],
  },
  {
    id: "weekly_time_available",
    type: "single",
    stage: "Time",
    heading: "How Much Time Do You Actually Have?",
    support:
      "Your available time should influence the opportunity you pursue. Someone with five hours per week should not build the same thing as someone preparing to go full-time.",
    question: "How much time can you realistically commit each week?",
    options: [
      { value: "under_5", label: "Less than 5 hours" },
      { value: "5_10", label: "5–10 hours" },
      { value: "10_20", label: "10–20 hours" },
      { value: "20_plus", label: "20+ hours" },
      { value: "full_time", label: "I eventually want to make this full-time" },
    ],
  },
  {
    id: "selected_skills",
    type: "multi",
    stage: "Skills",
    heading: "You Probably Have More to Work With Than You Think.",
    support:
      "AI does not mean starting over. In many cases, the fastest opportunity is using AI to increase the value of something you already know how to do.",
    question: "Which skills or experience do you already have?",
    options: [
      { value: "video_editing", label: "Video Editing" },
      { value: "graphic_design", label: "Graphic Design" },
      { value: "writing", label: "Writing / Content" },
      { value: "research", label: "Research" },
      { value: "admin", label: "Administrative Work" },
      { value: "sales", label: "Sales" },
      { value: "marketing", label: "Marketing" },
      { value: "customer_service", label: "Customer Service" },
      { value: "operations", label: "Operations" },
      { value: "technology", label: "Technology / Building" },
      { value: "industry_knowledge", label: "Industry-Specific Knowledge" },
      { value: "management", label: "Management / Leadership" },
      { value: "consulting", label: "Consulting" },
      { value: "other", label: "Other" },
    ],
  },
  {
    id: "income_timeline",
    type: "single",
    stage: "Preferences",
    heading: "How Fast Do You Need Results?",
    support:
      "Some opportunities can produce income quickly. Others require more time but can become significantly more scalable.",
    question: "How quickly do you want this to begin producing income?",
    options: [
      { value: "30_days", label: "Within 30 days" },
      { value: "1_3_months", label: "Within 1–3 months" },
      { value: "3_6_months", label: "Within 3–6 months" },
      { value: "long_term", label: "I am willing to build something long-term" },
    ],
  },
  {
    id: "sales_comfort",
    type: "scale",
    stage: "Preferences",
    heading: "How Comfortable Are You Selling?",
    support:
      "Most income opportunities require some level of customer acquisition. Your comfort with selling should influence the model you choose.",
    question: "How comfortable are you finding and talking to potential customers?",
    scale: {
      min: 1,
      max: 5,
      minLabel: "I would rather avoid selling",
      maxLabel: "I am very comfortable selling",
    },
  },
  {
    id: "technical_comfort",
    type: "single",
    stage: "Preferences",
    heading: "How Technical Do You Want to Get?",
    support:
      "You do not have to become a developer to make money with AI. But your willingness to learn more advanced tools opens different opportunities.",
    question: "Which statement fits you best?",
    options: [
      { value: "tools_only", label: "I mainly want to use existing AI tools" },
      { value: "automations", label: "I am willing to learn simple automations" },
      { value: "agents", label: "I am willing to learn AI agents and business implementations" },
      { value: "software", label: "I am interested in eventually building software or products" },
    ],
  },
  {
    id: "business_model_preference",
    type: "single",
    stage: "Preferences",
    heading: "What Sounds Most Like You?",
    question: "Which opportunity sounds the most appealing?",
    options: [
      { value: "use_existing_skill", label: "Make extra money using a skill I already have" },
      { value: "service_to_business", label: "Provide a service to businesses" },
      { value: "build_systems", label: "Build AI systems and automations for businesses" },
      { value: "manage_systems", label: "Manage AI systems for recurring revenue" },
      { value: "build_product", label: "Build something multiple customers can pay to use" },
      { value: "unsure", label: "I honestly do not know yet" },
    ],
  },
  {
    id: "existing_access",
    type: "multi",
    stage: "Preferences",
    heading: "Who Can You Already Reach?",
    support: "Access to customers can change which opportunity makes sense.",
    question: "Which of these do you already have?",
    optional: true,
    options: [
      { value: "business_owners", label: "Business owners in my network" },
      { value: "online_audience", label: "An online audience" },
      { value: "industry_experience", label: "Experience in a specific industry" },
      { value: "past_clients", label: "Past clients" },
      { value: "professional_relationships", label: "Professional relationships" },
      { value: "coworkers", label: "Coworkers or industry contacts" },
      { value: "none", label: "None yet" },
    ],
  },
];

export interface PathContent {
  id: PathId;
  name: string;
  tagline: string;
  examples: string[];
  dashboard: {
    timeCommitment: string;
    speedToMarket: string;
    technicalComplexity: string;
    scalability: string;
    customerAcquisition: string;
  };
  firstTarget: string;
  nextMoves: string[];
  avoid: string;
}

export const pathOrder: PathId[] = [
  "freelancer",
  "service_provider",
  "implementation",
  "product_builder",
];

export const paths: Record<PathId, PathContent> = {
  freelancer: {
    id: "freelancer",
    name: "AI-Assisted Freelancer",
    tagline:
      "Use AI to make a skill you already have faster, better and more valuable — and get paid for it quickly.",
    examples: ["Editing", "Content", "Design", "Research", "Admin support", "AI-assisted freelance work"],
    dashboard: {
      timeCommitment: "Low",
      speedToMarket: "Fast",
      technicalComplexity: "Low",
      scalability: "Low",
      customerAcquisition: "Moderate",
    },
    firstTarget: "Get your first paying client.",
    nextMoves: [
      "Pick the one skill you can deliver best today.",
      "Use AI to cut your delivery time in half.",
      "Make a simple offer and reach out to ten potential clients.",
    ],
    avoid: "Do not spend six months building an AI SaaS company before earning your first dollar.",
  },
  service_provider: {
    id: "service_provider",
    name: "AI Service Provider",
    tagline:
      "Package a repeatable, AI-enabled service that solves a recurring business problem for paying clients.",
    examples: [
      "Content systems",
      "AI-enabled marketing services",
      "Lead generation systems",
      "AI-enhanced service delivery",
    ],
    dashboard: {
      timeCommitment: "Moderate",
      speedToMarket: "Moderate",
      technicalComplexity: "Moderate",
      scalability: "Moderate",
      customerAcquisition: "High",
    },
    firstTarget: "Get 1–3 recurring business clients.",
    nextMoves: [
      "Choose one business problem to solve.",
      "Choose one type of customer.",
      "Build a simple offer and begin customer conversations.",
    ],
    avoid: "Do not try to offer ten different AI services at once.",
  },
  implementation: {
    id: "implementation",
    name: "AI Implementation Specialist",
    tagline:
      "Install AI systems, automations and agents inside businesses that are paying for expensive operational problems.",
    examples: [
      "AI automations",
      "AI phone agents",
      "Lead follow-up systems",
      "Workflow automation",
      "Business AI implementation",
      "Internal AI agents",
    ],
    dashboard: {
      timeCommitment: "Moderate",
      speedToMarket: "Moderate",
      technicalComplexity: "Advanced",
      scalability: "High",
      customerAcquisition: "Moderate",
    },
    firstTarget:
      "Identify one expensive business problem and package one repeatable AI solution.",
    nextMoves: [
      "Pick one industry whose operations you understand.",
      "Learn one automation or agent stack end to end.",
      "Build one demo system and show it to three business owners.",
    ],
    avoid:
      "Do not stay stuck selling low-ticket generic AI tasks if you can solve larger operational problems.",
  },
  product_builder: {
    id: "product_builder",
    name: "AI Product Builder",
    tagline:
      "Turn deep knowledge of a problem into software multiple customers pay to use every month.",
    examples: [
      "AI software",
      "Industry-specific SaaS",
      "Proprietary AI tools",
      "Productized systems",
      "AI platforms",
    ],
    dashboard: {
      timeCommitment: "High",
      speedToMarket: "Long-Term",
      technicalComplexity: "Advanced",
      scalability: "High",
      customerAcquisition: "High",
    },
    firstTarget:
      "Validate one problem with at least five potential customers before building software.",
    nextMoves: [
      "Write down the one problem you understand better than most.",
      "Interview five people who live with that problem.",
      "Build the smallest working version someone would pay for.",
    ],
    avoid: "Do not build the full product before validating whether customers actually want it.",
  },
};
