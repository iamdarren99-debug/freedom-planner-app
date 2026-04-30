import {
  AppSettings,
  Goal,
  JournalEntry,
  MindsetReminder,
  ProgressLog,
  TargetArea,
  Task,
  ThirtyDayPlan,
  WeeklySystem,
} from "../types/planner";

const seedTimestamp = "2026-04-30T00:00:00.000Z";
const seedDate = "2026-04-30";

export const seedAppSettings: AppSettings = {
  dailyFocusLimit: 5,
};

type GoalSeedInput = Omit<Goal, "createdAt" | "updatedAt" | "status" | "progressPercentage"> &
  Partial<Pick<Goal, "status" | "progressPercentage">>;

function goal(input: GoalSeedInput): Goal {
  return {
    ...input,
    status: input.status ?? "NOT_STARTED",
    progressPercentage: input.progressPercentage ?? 0,
    createdAt: seedTimestamp,
    updatedAt: seedTimestamp,
  };
}

export const seedTargetAreas: TargetArea[] = [
  { id: "financial" },
  { id: "career-business" },
  { id: "skills" },
  { id: "personal-relationship" },
];

export const seedGoals: Goal[] = [
  goal({
    id: "cash-stability",
    targetAreaId: "financial",
    title: "Cash Stability",
    description: "Remove financial pressure.",
    timeline: "1-3 months",
    executionMethod: ["Tight expense control", "Cash flow tracking"],
    weeklyActions: ["Track daily spending for 5 min", "Reduce BNPL"],
    successMetric: "RM500 monthly surplus",
    priority: "HIGH",
    status: "IN_PROGRESS",
  }),
  goal({
    id: "savings-growth",
    targetAreaId: "financial",
    title: "Savings Growth",
    description: "Reach RM10,000.",
    timeline: "6 months",
    executionMethod: ["Increase income", "Build 1 income stream"],
    weeklyActions: ["Build 1 income stream", "Improve monetizable skills"],
    successMetric: "RM1.5k-2k extra/month",
    priority: "HIGH",
  }),
  goal({
    id: "debt-freedom",
    targetAreaId: "financial",
    title: "Debt Freedom",
    description: "Clear BNPL and loan.",
    timeline: "6-12 months",
    executionMethod: ["Snowball repayment", "Pay smallest debt first aggressively"],
    weeklyActions: ["List all debts", "Pay smallest first", "No new debt"],
    successMetric: "0 consumer debt",
    priority: "HIGH",
  }),
  goal({
    id: "skill-leverage",
    targetAreaId: "career-business",
    title: "Skill Leverage",
    description: "Monetize AI and systems thinking.",
    timeline: "1-3 months",
    executionMethod: ["Turn AI into service", "Build real tools and systems"],
    weeklyActions: ["Build 1 useful tool weekly", "Solve real problems"],
    successMetric: "3-5 working demos",
    priority: "HIGH",
    status: "IN_PROGRESS",
  }),
  goal({
    id: "side-income",
    targetAreaId: "career-business",
    title: "Side Income",
    description: "First RM1k/month.",
    timeline: "3 months",
    executionMethod: ["Offer service to SMEs", "Outreach and deliver value"],
    weeklyActions: ["Outreach 10 people per week", "Deliver value"],
    successMetric: "First paying client",
    priority: "HIGH",
    status: "IN_PROGRESS",
  }),
  goal({
    id: "business-validation",
    targetAreaId: "career-business",
    title: "Business Validation",
    description: "Test import/distribution or service.",
    timeline: "6-12 months",
    executionMethod: ["Small experiments", "Low-risk testing", "Review and improve"],
    weeklyActions: ["Launch 1 test per month", "Review and improve"],
    successMetric: "1 profitable idea",
    priority: "MEDIUM",
  }),
  goal({
    id: "ownership",
    targetAreaId: "career-business",
    title: "Ownership",
    description: "Run your own business.",
    timeline: "1-3 years",
    executionMethod: ["Scale proven model", "Reinvest profits", "Build systems"],
    weeklyActions: ["Improve systems", "Reinvest", "Build team or partners"],
    successMetric: "RM5k+/month profit",
    priority: "HIGH",
  }),
  goal({
    id: "ai-utilization",
    targetAreaId: "skills",
    title: "AI Utilization",
    description: "Become problem solver with AI.",
    timeline: "3 months",
    executionMethod: ["Build real use cases", "Use AI daily", "Solve problems"],
    weeklyActions: ["3 builds/week", "Learn by doing"],
    successMetric: "Portfolio of AI tools",
    priority: "HIGH",
    status: "IN_PROGRESS",
  }),
  goal({
    id: "business-knowledge",
    targetAreaId: "skills",
    title: "Business Knowledge",
    description: "Operations and legal basics.",
    timeline: "6 months",
    executionMethod: ["Learn while building", "Apply directly"],
    weeklyActions: ["Study 2 hours/week", "Implement what you learn"],
    successMetric: "Can run small business",
    priority: "MEDIUM",
  }),
  goal({
    id: "execution-speed",
    targetAreaId: "skills",
    title: "Execution Speed",
    description: "Ship fast.",
    timeline: "Ongoing",
    executionMethod: ["Build over perfect", "Focus on done"],
    weeklyActions: ["Finish 1 thing/week", "Improve and ship"],
    successMetric: "Consistency over perfection",
    priority: "HIGH",
    status: "IN_PROGRESS",
  }),
  goal({
    id: "relationship",
    targetAreaId: "personal-relationship",
    title: "Relationship",
    description: "Strengthen current relationship.",
    timeline: "Ongoing",
    executionMethod: ["Intentional time", "Better communication", "Show up"],
    weeklyActions: ["1 quality session per week", "Communicate openly"],
    successMetric: "Better connection",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
  }),
  goal({
    id: "lifestyle",
    targetAreaId: "personal-relationship",
    title: "Lifestyle",
    description: "Travel 1-2x/year.",
    timeline: "1-2 years",
    executionMethod: ["Budget ahead", "Plan ahead", "Create travel fund"],
    weeklyActions: ["Save consistently", "Plan trips early"],
    successMetric: "1-2 trips per year",
    priority: "LOW",
  }),
];

export const seedTasks: Task[] = seedGoals.flatMap((seedGoal) =>
  seedGoal.weeklyActions.map((action, index) => ({
    id: `task-${seedGoal.id}-${index + 1}`,
    goalId: seedGoal.id,
    title: action,
    description: `Weekly action for ${seedGoal.title}.`,
    date: seedDate,
    priority: seedGoal.priority,
    status: "TODO",
    createdAt: seedTimestamp,
    updatedAt: seedTimestamp,
  })),
);

const cashStabilityTrackingTask = seedTasks.find(
  (task) => task.goalId === "cash-stability" && task.title === "Track daily spending for 5 min",
);

export const seedJournalEntries: JournalEntry[] = [
  {
    id: "journal-build-over-perfect",
    date: seedDate,
    title: "Build over perfect",
    content: "The system only works if learning turns into shipped work.",
    mood: "focused",
    linkedGoalIds: ["execution-speed", "ai-utilization"],
    linkedTaskIds: [],
    progressReflection: "Momentum comes from finishing one useful thing at a time.",
    createdAt: seedTimestamp,
    updatedAt: seedTimestamp,
  },
  {
    id: "journal-cash-clarity",
    date: seedDate,
    title: "Cash clarity",
    content: "Tracking daily spending creates control before bigger income moves land.",
    mood: "clear",
    linkedGoalIds: ["cash-stability"],
    linkedTaskIds: cashStabilityTrackingTask ? [cashStabilityTrackingTask.id] : [],
    progressReflection: "Five minutes of tracking keeps financial pressure visible.",
    createdAt: seedTimestamp,
    updatedAt: seedTimestamp,
  },
];

export const seedProgressLogs: ProgressLog[] = [
  {
    id: "progress-cash-stability-start",
    goalId: "cash-stability",
    date: seedDate,
    value: 0,
    note: "Starting baseline for cash stability.",
  },
  {
    id: "progress-ai-utilization-start",
    goalId: "ai-utilization",
    date: seedDate,
    value: 0,
    note: "Starting baseline for AI tool portfolio.",
  },
];

export const seedWeeklySystem: WeeklySystem = {
  weekdayMorning: ["Morning 1 hr: learn or research AI/business."],
  weekdayNight: [
    "Night 2-3 hrs: build something.",
    "Improve something.",
    "Examples: automate reporting, simple POS tool, inventory tracker, business dashboard.",
  ],
  offDayPlan: [
    "2 hrs build.",
    "2 hrs monetization: outreach, sales, clients.",
    "1 hr review and plan.",
  ],
  dailyHabits: [
    "Track expenses daily (5 min).",
    "No unnecessary spending.",
    "Learn something new.",
    "Build or improve.",
    "Move your body.",
    "7+ hours of sleep.",
    "Stay consistent.",
  ],
  focusFlow: ["Build", "Deliver value", "Get paid", "Reinvest", "Scale"],
};

export const seedThirtyDayPlan: ThirtyDayPlan = {
  week1To2: ["Build 2 simple tools.", "Sales tracker.", "Expense dashboard."],
  week3: ["Package it as a simple system to track cafe performance."],
  week4: [
    "Reach out to 10-20 cafes or small businesses.",
    "Offer free setup.",
    "Convert to paid.",
  ],
  finalGoal: ["First paying clients.", "First RM1k+/month extra income."],
};

export const seedMindsetReminders: MindsetReminder[] = [
  {
    id: "stop-overthinking",
    category: "STOP",
    title: "Overthinking the perfect business idea",
    description: "Do not let planning replace testing.",
  },
  {
    id: "stop-inventory-heavy-too-early",
    category: "STOP",
    title: "Jumping into inventory-heavy business too early",
    description: "Validate demand and cash flow before taking inventory risk.",
  },
  {
    id: "stop-learning-without-building",
    category: "STOP",
    title: "Only learning without building",
    description: "Learning should turn into shipped tools, outreach, or better systems.",
  },
  {
    id: "stop-saving-only",
    category: "STOP",
    title: "Relying on saving instead of earning",
    description: "Expense control matters, but income growth creates real speed.",
  },
  {
    id: "truth-not-lacking",
    category: "TRUTH",
    title: "You are not lacking intelligence",
    description: "The missing pieces are discipline, direction, leverage, and execution consistency.",
  },
  {
    id: "truth-rm10k",
    category: "TRUTH",
    title: "RM10k is practical",
    description: "Fix leverage and execution, then RM10k becomes a near-term target.",
  },
  {
    id: "vision-one-year",
    category: "LONG_TERM_VISION",
    title: "1 year",
    description: "Own a business.",
  },
  {
    id: "vision-three-years",
    category: "LONG_TERM_VISION",
    title: "3 years",
    description: "RM5k+/month profit.",
  },
  {
    id: "vision-long-term-assets",
    category: "LONG_TERM_VISION",
    title: "Long term",
    description: "RM1,000,000+ in assets.",
  },
  {
    id: "vision-freedom",
    category: "LONG_TERM_VISION",
    title: "Freedom",
    description: "No debts. Time. Choices. Impact.",
  },
];
