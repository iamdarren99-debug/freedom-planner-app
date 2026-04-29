export type GoalArea = "financial" | "career" | "skills" | "personal";
export type GoalPriority = "low" | "medium" | "high";
export type GoalStatus = "planned" | "active" | "ongoing";

export interface Goal {
  id: string;
  area: GoalArea;
  title: string;
  description: string;
  timeline: string;
  priority: GoalPriority;
  status: GoalStatus;
  progress: number;
  weeklyFocus: string[];
}

export interface PlannerBlock {
  id: string;
  title: string;
  timeWindow: string;
  focus: string;
  items: string[];
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}
