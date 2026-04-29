import { Goal, GoalArea } from "../types/planner";

export function createId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-MY", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function averageProgress(goals: Goal[]) {
  if (goals.length === 0) {
    return 0;
  }

  const total = goals.reduce((sum, goal) => sum + goal.progress, 0);
  return Math.round(total / goals.length);
}

export function goalsByArea(goals: Goal[], area: GoalArea) {
  return goals.filter((goal) => goal.area === area);
}

export function priorityRank(priority: Goal["priority"]) {
  if (priority === "high") {
    return 3;
  }
  if (priority === "medium") {
    return 2;
  }
  return 1;
}
