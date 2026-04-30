import { Goal, JournalEntry, ProgressLog, Task } from "../types/planner";
import { getDateKey } from "./planning";

export function buildWeeklyStats(tasks: Task[]) {
  const lastSevenDays = getRecentDateKeys(7);
  const doneThisWeek = tasks.filter(
    (task) => lastSevenDays.includes(task.date) && task.status === "DONE",
  );
  const activeDays = new Set(doneThisWeek.map((task) => task.date));
  let currentStreak = 0;

  for (const date of lastSevenDays) {
    if (!activeDays.has(date)) {
      break;
    }
    currentStreak += 1;
  }

  return {
    completedTasks: doneThisWeek.length,
    consistencyScore: Math.round((activeDays.size / 7) * 100),
    currentStreak,
  };
}

export function buildBusinessStats(tasks: Task[], goals: Goal[]) {
  const doneTasks = tasks.filter((task) => task.status === "DONE");
  const sideIncomeGoal = goals.find((goal) => goal.title === "Side Income");

  return {
    toolsBuilt: countMatches(doneTasks, ["build", "tool", "demo", "system"]),
    outreachCount: countMatches(doneTasks, ["outreach", "client", "sme"]),
    payingClients: countMatches(doneTasks, ["paying", "paid", "client"]),
    sideIncomeProgress: sideIncomeGoal?.progressPercentage ?? 0,
  };
}

export function buildSkillsStats(tasks: Task[], goals: Goal[]) {
  const doneTasks = tasks.filter((task) => task.status === "DONE");
  const studyMinutes = doneTasks
    .filter((task) => matchesTask(task, ["study", "learn", "research", "knowledge"]))
    .reduce((total, task) => total + (task.durationMinutes ?? 0), 0);

  return {
    aiBuilds: countMatches(doneTasks, ["ai", "build", "tool"]),
    studyHours: Math.round((studyMinutes / 60) * 10) / 10,
    businessKnowledge: goals.find((goal) => goal.title === "Business Knowledge")
      ?.progressPercentage ?? 0,
    executionSpeed: goals.find((goal) => goal.title === "Execution Speed")?.progressPercentage ?? 0,
  };
}

export function buildPersonalStats(tasks: Task[], goals: Goal[], journalEntries: JournalEntry[]) {
  const doneTasks = tasks.filter((task) => task.status === "DONE");
  const relationshipProgress =
    goals.find((goal) => goal.title === "Relationship")?.progressPercentage ?? 0;

  return {
    qualitySessions: countMatches(doneTasks, ["quality", "relationship", "session"]),
    travelPlanning: countMatches(doneTasks, ["travel", "trip", "fund", "lifestyle"]),
    reflectionScore: Math.max(
      relationshipProgress,
      Math.min(100, journalEntries.filter((entry) => entry.progressReflection).length * 10),
    ),
  };
}

export function latestLogForGoal(logs: ProgressLog[], goalId: string) {
  return logs
    .filter((log) => log.goalId === goalId)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
}

export function clampPercent(value: number) {
  if (Number.isNaN(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}

function countMatches(tasks: Task[], keywords: string[]) {
  return tasks.filter((task) => matchesTask(task, keywords)).length;
}

function matchesTask(task: Task, keywords: string[]) {
  const text = `${task.title} ${task.description ?? ""} ${task.notes ?? ""}`.toLowerCase();
  return keywords.some((keyword) => text.includes(keyword));
}

function getRecentDateKeys(days: number) {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - index);
    return getDateKey(date);
  });
}
