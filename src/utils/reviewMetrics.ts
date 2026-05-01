import { AREA_META } from "../constants/app";
import { Goal, JournalEntry, ProgressLog, TargetAreaId, Task } from "../types/planner";
import { getRecentDateKeys } from "./dateKeys";
import { averageProgress, getDateKey, goalsByArea, isActiveGoal, priorityRank } from "./planning";

const WIN_SIGNAL = /\bwin\b/i;
const PROBLEM_SIGNAL = /\b(problem|stuck|avoid|delay|hard)\b/i;
const STOP_SIGNAL = /\b(stop|avoid|delay)\b/i;

interface ReviewInput {
  goals: Goal[];
  journalEntries: JournalEntry[];
  progressLogs: ProgressLog[];
  tasks: Task[];
}

export interface ReviewRow {
  label: string;
  value: string | string[];
}

export function buildWeeklyReview({ goals, journalEntries, progressLogs, tasks }: ReviewInput) {
  const weekDates = getRecentDateKeys(7);
  const weekTasks = tasks.filter((task) => weekDates.includes(task.date));
  const completedTasks = weekTasks.filter((task) => task.status === "DONE");
  const skippedTasks = weekTasks.filter((task) => task.status === "SKIPPED");
  const weekLogs = progressLogs.filter((log) => weekDates.includes(log.date));
  const movedGoalIds = new Set(weekLogs.map((log) => log.goalId));
  const completedGoalIds = new Set(
    completedTasks.map((task) => task.goalId).filter((goalId): goalId is string => Boolean(goalId)),
  );
  const movedGoals = goals.filter(
    (goal) => movedGoalIds.has(goal.id) || completedGoalIds.has(goal.id),
  );
  const stuckGoals = goals
    .filter(isActiveGoal)
    .filter((goal) => !movedGoalIds.has(goal.id) && !completedGoalIds.has(goal.id));
  const weekJournals = journalEntries.filter((entry) => weekDates.includes(entry.date));

  return [
    { label: "What did I complete?", value: titles(completedTasks) },
    { label: "What did I skip?", value: titles(skippedTasks) },
    { label: "Which goals moved forward?", value: movedGoals.map((goal) => goal.title) },
    { label: "Which goals are stuck?", value: stuckGoals.map((goal) => goal.title) },
    { label: "Focus next week", value: nextFocus(stuckGoals, goals) },
    { label: "Stop doing", value: stopSignal(skippedTasks, weekJournals) },
    { label: "Double down", value: doubleDownSignal(movedGoals, completedTasks) },
  ];
}

export function buildMonthlyReview({ goals, journalEntries, progressLogs, tasks }: ReviewInput) {
  const monthKey = getDateKey().slice(0, 7);
  const monthTasks = tasks.filter((task) => task.date.startsWith(monthKey));
  const monthLogs = progressLogs.filter((log) => log.date.startsWith(monthKey));
  const monthJournals = journalEntries.filter((entry) => entry.date.startsWith(monthKey));

  return [
    { label: "Financial summary", value: areaSummary("financial", goals, monthTasks, monthLogs) },
    {
      label: "Career/business summary",
      value: areaSummary("career-business", goals, monthTasks, monthLogs),
    },
    { label: "Skills summary", value: areaSummary("skills", goals, monthTasks, monthLogs) },
    {
      label: "Personal/relationship summary",
      value: areaSummary("personal-relationship", goals, monthTasks, monthLogs),
    },
    { label: "Biggest win", value: biggestWin(monthJournals, monthTasks, monthLogs, goals) },
    { label: "Biggest problem", value: biggestProblem(monthJournals, monthTasks) },
    { label: "Next month focus", value: nextFocus(goals.filter(isActiveGoal), goals) },
  ];
}

function areaSummary(
  areaId: TargetAreaId,
  goals: Goal[],
  tasks: Task[],
  logs: ProgressLog[],
) {
  const areaGoals = goalsByArea(goals, areaId);
  const areaGoalIds = new Set(areaGoals.map((goal) => goal.id));
  const completedTasks = tasks.filter(
    (task) => task.status === "DONE" && task.goalId && areaGoalIds.has(task.goalId),
  ).length;
  const logCount = logs.filter((log) => areaGoalIds.has(log.goalId)).length;

  return `${AREA_META[areaId].label}: ${averageProgress(areaGoals)}% avg, ${completedTasks} done, ${logCount} logs`;
}

function biggestWin(
  journals: JournalEntry[],
  tasks: Task[],
  logs: ProgressLog[],
  goals: Goal[],
) {
  const winJournal = bestJournalSignal(journals, WIN_SIGNAL);

  if (winJournal) {
    return journalSignalSnippet(winJournal, WIN_SIGNAL);
  }

  const latestLog = [...logs].sort((a, b) => b.date.localeCompare(a.date))[0];
  if (latestLog) {
    return latestLog.note || goals.find((goal) => goal.id === latestLog.goalId)?.title || "Progress logged";
  }

  return tasks.find((task) => task.status === "DONE")?.title ?? "No clear win logged yet";
}

function biggestProblem(journals: JournalEntry[], tasks: Task[]) {
  const problemJournal = bestJournalSignal(journals, PROBLEM_SIGNAL);

  if (problemJournal) {
    return journalSignalSnippet(problemJournal, PROBLEM_SIGNAL);
  }

  return tasks.find((task) => task.status === "SKIPPED")?.title ?? "No clear problem logged yet";
}

function nextFocus(candidateGoals: Goal[], fallbackGoals: Goal[]) {
  const pool = candidateGoals.length > 0 ? candidateGoals : fallbackGoals;
  const goal = [...pool].sort((a, b) => {
    const priorityDelta = priorityRank(b.priority) - priorityRank(a.priority);

    if (priorityDelta !== 0) {
      return priorityDelta;
    }

    return a.progressPercentage - b.progressPercentage;
  })[0];

  return goal?.title ?? "Pick one goal to move first";
}

function stopSignal(skippedTasks: Task[], journals: JournalEntry[]) {
  const journalSignal = bestJournalSignal(journals, STOP_SIGNAL);

  if (journalSignal) {
    return journalSignalSnippet(journalSignal, STOP_SIGNAL);
  }

  return skippedTasks[0]?.title ?? "No stop pattern found yet";
}

function doubleDownSignal(movedGoals: Goal[], completedTasks: Task[]) {
  return movedGoals[0]?.title ?? completedTasks[0]?.title ?? "Repeat the action that created progress";
}

function titles(tasks: Task[]) {
  return tasks.slice(0, 5).map((task) => task.title);
}

function journalText(entry: JournalEntry) {
  return `${entry.title} ${entry.content} ${entry.progressReflection ?? ""}`;
}

function journalSignalSnippet(entry: JournalEntry, pattern: RegExp) {
  const matchedField = [entry.progressReflection, entry.content, entry.title].find(
    (field) => field?.match(pattern),
  );

  return snippet(matchedField ?? entry.progressReflection ?? entry.content ?? entry.title);
}

function bestJournalSignal(entries: JournalEntry[], pattern: RegExp) {
  return entries
    .map((entry) => ({
      entry,
      score: signalScore(entry, pattern),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || b.entry.date.localeCompare(a.entry.date))[0]
    ?.entry;
}

function signalScore(entry: JournalEntry, pattern: RegExp) {
  const matcher = new RegExp(pattern.source, pattern.flags.includes("i") ? "gi" : "g");

  return [entry.progressReflection, entry.content, entry.title].reduce(
    (score, field, index) => score + ((field?.match(matcher)?.length ?? 0) * (index === 2 ? 1 : 2)),
    0,
  );
}

function snippet(value: string) {
  const normalized = value.trim().replace(/\s+/g, " ");

  if (normalized.length <= 90) {
    return normalized;
  }

  return `${normalized.slice(0, 87)}...`;
}
