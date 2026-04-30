export type TargetAreaId = "financial" | "career-business" | "skills" | "personal-relationship";
export type GoalPriority = "LOW" | "MEDIUM" | "HIGH";
export type GoalStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "PAUSED";
export type TaskStatus = "TODO" | "DONE" | "SKIPPED";
export type MindsetReminderCategory = "STOP" | "TRUTH" | "LONG_TERM_VISION";
export interface TargetArea {
  id: TargetAreaId;
}

export interface Goal {
  id: string;
  targetAreaId: TargetAreaId;
  title: string;
  description: string;
  timeline: string;
  executionMethod: string[];
  weeklyActions: string[];
  successMetric: string;
  priority: GoalPriority;
  status: GoalStatus;
  progressPercentage: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  goalId?: string;
  title: string;
  description?: string;
  date: string;
  timeBlock?: string;
  durationMinutes?: number;
  priority: GoalPriority;
  status: TaskStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood?: string;
  linkedGoalIds: string[];
  linkedTaskIds: string[];
  progressReflection?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProgressLog {
  id: string;
  goalId: string;
  date: string;
  value: number;
  note?: string;
}

export interface WeeklySystem {
  weekdayMorning: string[];
  weekdayNight: string[];
  offDayPlan: string[];
  dailyHabits: string[];
  focusFlow: string[];
}

export interface ThirtyDayPlan {
  week1To2: string[];
  week3: string[];
  week4: string[];
  finalGoal: string[];
}

export interface MindsetReminder {
  id: string;
  category: MindsetReminderCategory;
  title: string;
  description: string;
}

export interface DailyCompletion {
  goalId: string;
  item: string;
  completedAt: string;
}

export type DailyCompletionsByDate = Record<string, DailyCompletion[]>;

export interface AppSettings {
  dailyFocusLimit: number;
  lastResetAt?: string;
}

export interface GoalProgressSummary {
  goalId: string;
  title: string;
  status: GoalStatus;
  progressPercentage: number;
  totalTasks: number;
  completedTasks: number;
  skippedTasks: number;
  totalProgressLogs: number;
  latestProgressLogDate?: string;
}
