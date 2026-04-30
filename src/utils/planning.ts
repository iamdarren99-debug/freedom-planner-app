import { DailyCompletion, Goal, GoalPriority, TargetAreaId } from "../types/planner";

export function createId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function getDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function averageProgress(goals: Goal[]) {
  if (goals.length === 0) {
    return 0;
  }

  const total = goals.reduce((sum, goal) => sum + goal.progressPercentage, 0);
  return Math.round(total / goals.length);
}

export function goalsByArea(goals: Goal[], targetAreaId: TargetAreaId) {
  return goals.filter((goal) => goal.targetAreaId === targetAreaId);
}

export function priorityRank(priority: GoalPriority) {
  if (priority === "HIGH") {
    return 3;
  }
  if (priority === "MEDIUM") {
    return 2;
  }
  return 1;
}

export function goalStatusLabel(status: Goal["status"]) {
  return status.replace("_", " ").toLowerCase();
}

export function isActiveGoal(goal: Goal) {
  return goal.status === "IN_PROGRESS" || goal.status === "NOT_STARTED";
}

export function isFocusItemComplete(
  completions: DailyCompletion[],
  goalId: string,
  item: string,
) {
  return completions.some(
    (completion) => completion.goalId === goalId && completion.item === item,
  );
}
