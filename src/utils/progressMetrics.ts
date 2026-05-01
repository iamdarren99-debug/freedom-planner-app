import { Goal, JournalEntry, Task, TargetAreaId } from "../types/planner";
import { getDateKey, isActiveGoal } from "./planning";
import { getRecentDateKeys } from "./dateKeys";

export function buildWeeklyStats(tasks: Task[]) {
  const lastSevenDays = getRecentDateKeys(7);
  const doneThisWeek = tasks.filter(
    (task) => lastSevenDays.includes(task.date) && task.status === "DONE",
  );
  const activeDaysThisWeek = new Set(doneThisWeek.map((task) => task.date));

  return {
    completedTasks: doneThisWeek.length,
    consistencyScore: Math.round((activeDaysThisWeek.size / 7) * 100),
    currentStreak: currentStreak(tasks),
  };
}

export function buildBusinessStats(tasks: Task[], goals: Goal[]) {
  const areaGoals = goalsForArea(goals, "career-business");

  return {
    activeGoals: areaGoals.filter(isActiveGoal).length,
    areaProgress: averageGoalProgress(areaGoals),
    completedTasks: completedTasksForGoals(tasks, areaGoals),
    sideIncomeProgress: progressForGoal(goals, "side-income"),
  };
}

export function buildSkillsStats(tasks: Task[], goals: Goal[]) {
  const areaGoals = goalsForArea(goals, "skills");

  return {
    areaProgress: averageGoalProgress(areaGoals),
    businessKnowledge: progressForGoal(goals, "business-knowledge"),
    completedTasks: completedTasksForGoals(tasks, areaGoals),
    executionSpeed: progressForGoal(goals, "execution-speed"),
  };
}

export function buildPersonalStats(tasks: Task[], goals: Goal[], journalEntries: JournalEntry[]) {
  const areaGoals = goalsForArea(goals, "personal-relationship");

  return {
    areaProgress: averageGoalProgress(areaGoals),
    completedTasks: completedTasksForGoals(tasks, areaGoals),
    reflectionScore: Math.min(
      100,
      journalEntries.filter((entry) => entry.progressReflection?.trim()).length * 10,
    ),
    relationshipProgress: progressForGoal(goals, "relationship"),
  };
}

export function clampPercent(value: number) {
  if (Number.isNaN(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}

export function isValidDateKey(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function averageGoalProgress(goals: Goal[]) {
  if (goals.length === 0) {
    return 0;
  }

  const total = goals.reduce((sum, goal) => sum + goal.progressPercentage, 0);
  return Math.round(total / goals.length);
}

function completedTasksForGoals(tasks: Task[], goals: Goal[]) {
  const goalIds = new Set(goals.map((goal) => goal.id));

  return tasks.filter(
    (task) => task.status === "DONE" && task.goalId && goalIds.has(task.goalId),
  ).length;
}

function currentStreak(tasks: Task[]) {
  const todayKey = getDateKey();
  const activeDays = new Set(
    tasks
      .filter((task) => task.status === "DONE" && task.date <= todayKey)
      .map((task) => task.date),
  );
  const latestActiveDate = [...activeDays].sort((a, b) => b.localeCompare(a))[0];

  if (!latestActiveDate) {
    return 0;
  }

  const [year, month, day] = latestActiveDate.split("-").map(Number);
  const cursor = new Date(year, month - 1, day);
  let streak = 0;

  while (activeDays.has(getDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function goalsForArea(goals: Goal[], areaId: TargetAreaId) {
  return goals.filter((goal) => goal.targetAreaId === areaId);
}

function progressForGoal(goals: Goal[], goalId: string) {
  return goals.find((goal) => goal.id === goalId)?.progressPercentage ?? 0;
}
