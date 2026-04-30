import { Goal, GoalProgressSummary, JournalEntry, ProgressLog, Task } from "../types/planner";

interface TaskState {
  tasks: Task[];
}

interface JournalState {
  journalEntries: JournalEntry[];
}

interface GoalProgressState {
  goals: Goal[];
  tasks: Task[];
  progressLogs: ProgressLog[];
}

export function getTasksByDate(state: TaskState, date: string) {
  return state.tasks.filter((task) => task.date === date);
}

export function getTasksByGoal(state: TaskState, goalId: string) {
  return state.tasks.filter((task) => task.goalId === goalId);
}

export function getJournalEntriesByDate(state: JournalState, date: string) {
  return state.journalEntries.filter((entry) => entry.date === date);
}

export function getGoalProgressSummary(
  state: GoalProgressState,
  goalId: string,
): GoalProgressSummary | undefined {
  const goal = state.goals.find((candidate) => candidate.id === goalId);

  if (!goal) {
    return undefined;
  }

  const tasks = state.tasks.filter((task) => task.goalId === goalId);
  const logs = state.progressLogs.filter((log) => log.goalId === goalId);
  const latestTimestamp = Math.max(...logs.map((log) => new Date(log.date).getTime()));
  const latestProgressLogDate = Number.isFinite(latestTimestamp)
    ? logs.find((log) => new Date(log.date).getTime() === latestTimestamp)?.date
    : undefined;

  return {
    goalId: goal.id,
    title: goal.title,
    status: goal.status,
    progressPercentage: goal.progressPercentage,
    totalTasks: tasks.length,
    completedTasks: tasks.filter((task) => task.status === "DONE").length,
    skippedTasks: tasks.filter((task) => task.status === "SKIPPED").length,
    totalProgressLogs: logs.length,
    latestProgressLogDate,
  };
}
