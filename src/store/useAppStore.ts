import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  seedAppSettings,
  seedGoals,
  seedJournalEntries,
  seedMindsetReminders,
  seedProgressLogs,
  seedTargetAreas,
  seedTasks,
  seedThirtyDayPlan,
  seedWeeklySystem,
} from "../data/seed";
import { createId, getDateKey, isFocusItemComplete } from "../utils/planning";
import {
  AppSettings,
  DailyCompletionsByDate,
  Goal,
  GoalProgressSummary,
  JournalEntry,
  MindsetReminder,
  ProgressLog,
  TargetArea,
  Task,
  ThirtyDayPlan,
  WeeklySystem,
} from "../types/planner";

const PERSIST_KEY = "freedom-planner";

type AddGoalPayload = Omit<
  Goal,
  "id" | "createdAt" | "updatedAt" | "status" | "progressPercentage"
> &
  Partial<Pick<Goal, "id" | "status" | "progressPercentage">>;
type UpdateGoalPayload = Partial<Omit<Goal, "id" | "createdAt" | "updatedAt">>;
type AddTaskPayload = Omit<Task, "id" | "createdAt" | "updatedAt" | "status"> &
  Partial<Pick<Task, "id" | "status">>;
type UpdateTaskPayload = Partial<Omit<Task, "id" | "createdAt" | "updatedAt">>;
type AddJournalEntryPayload = Pick<JournalEntry, "title" | "content"> &
  Partial<Omit<JournalEntry, "id" | "title" | "content" | "createdAt" | "updatedAt">>;
type UpdateJournalEntryPayload = Partial<
  Omit<JournalEntry, "id" | "createdAt" | "updatedAt">
>;
type AddProgressLogPayload = Omit<ProgressLog, "id"> & Partial<Pick<ProgressLog, "id">>;
type PersistedAppState = Omit<AppState, "hasHydrated">;

interface AppState {
  targetAreas: TargetArea[];
  goals: Goal[];
  tasks: Task[];
  journalEntries: JournalEntry[];
  progressLogs: ProgressLog[];
  weeklySystem: WeeklySystem;
  thirtyDayPlan: ThirtyDayPlan;
  mindsetReminders: MindsetReminder[];
  appSettings: AppSettings;
  dailyCompletions: DailyCompletionsByDate;
  hasHydrated: boolean;
}

interface AppActions {
  setHasHydrated: (value: boolean) => void;
  addGoal: (payload: AddGoalPayload) => Goal;
  updateGoal: (id: string, updates: UpdateGoalPayload) => void;
  deleteGoal: (id: string) => void;
  updateGoalProgress: (id: string, progressPercentage: number, note?: string) => void;
  addTask: (payload: AddTaskPayload) => Task;
  updateTask: (id: string, updates: UpdateTaskPayload) => void;
  completeTask: (id: string, notes?: string) => void;
  skipTask: (id: string, notes?: string) => void;
  deleteTask: (id: string) => void;
  addJournalEntry: (payload: AddJournalEntryPayload) => JournalEntry;
  updateJournalEntry: (id: string, updates: UpdateJournalEntryPayload) => void;
  deleteJournalEntry: (id: string) => void;
  addProgressLog: (payload: AddProgressLogPayload) => ProgressLog;
  getTasksByDate: (date: string) => Task[];
  getTasksByGoal: (goalId: string) => Task[];
  getJournalEntriesByDate: (date: string) => JournalEntry[];
  getGoalProgressSummary: (goalId: string) => GoalProgressSummary | undefined;
  updateAppSettings: (updates: Partial<AppSettings>) => void;
  resetToSeedData: () => void;
  resetDemoData: () => void;
  toggleFocusItem: (goalId: string, item: string) => void;
}

type AppStore = AppState & AppActions;

function cloneData<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function createSeedState(): AppState {
  return {
    targetAreas: cloneData(seedTargetAreas),
    goals: cloneData(seedGoals),
    tasks: cloneData(seedTasks),
    journalEntries: cloneData(seedJournalEntries),
    progressLogs: cloneData(seedProgressLogs),
    weeklySystem: cloneData(seedWeeklySystem),
    thirtyDayPlan: cloneData(seedThirtyDayPlan),
    mindsetReminders: cloneData(seedMindsetReminders),
    appSettings: cloneData(seedAppSettings),
    dailyCompletions: {},
    hasHydrated: false,
  };
}

function clampProgress(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function nextGoalStatus(goal: Goal, progressPercentage: number): Goal["status"] {
  if (progressPercentage >= 100) {
    return "COMPLETED";
  }

  if (progressPercentage > 0 && goal.status === "NOT_STARTED") {
    return "IN_PROGRESS";
  }

  return goal.status;
}

function updateGoalProgressInList(goals: Goal[], goalId: string, value: number, now: string) {
  const progressPercentage = clampProgress(value);

  return goals.map((goal) =>
    goal.id === goalId
      ? {
          ...goal,
          status: nextGoalStatus(goal, progressPercentage),
          progressPercentage,
          updatedAt: now,
        }
      : goal,
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOptionalArray(value: unknown) {
  return value === undefined || Array.isArray(value);
}

function isPersistedAppState(value: unknown): value is Partial<PersistedAppState> {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isOptionalArray(value.targetAreas) &&
    isOptionalArray(value.goals) &&
    isOptionalArray(value.tasks) &&
    isOptionalArray(value.journalEntries) &&
    isOptionalArray(value.progressLogs) &&
    isOptionalArray(value.mindsetReminders) &&
    (value.weeklySystem === undefined || isRecord(value.weeklySystem)) &&
    (value.thirtyDayPlan === undefined || isRecord(value.thirtyDayPlan)) &&
    (value.appSettings === undefined || isRecord(value.appSettings)) &&
    (value.dailyCompletions === undefined || isRecord(value.dailyCompletions))
  );
}

function createProgressLog(payload: AddProgressLogPayload): ProgressLog {
  return {
    ...payload,
    id: payload.id ?? createId("progress"),
    value: clampProgress(payload.value),
  };
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...createSeedState(),
      setHasHydrated: (value) => set({ hasHydrated: value }),
      addGoal: (payload) => {
        const now = new Date().toISOString();
        const goal: Goal = {
          ...payload,
          id: payload.id ?? createId("goal"),
          status: payload.status ?? "NOT_STARTED",
          progressPercentage: clampProgress(payload.progressPercentage ?? 0),
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({ goals: [goal, ...state.goals] }));
        return goal;
      },
      updateGoal: (id, updates) =>
        set((state) => {
          const now = new Date().toISOString();

          return {
            goals: state.goals.map((goal) =>
              goal.id === id
                ? {
                    ...goal,
                    ...updates,
                    progressPercentage:
                      updates.progressPercentage === undefined
                        ? goal.progressPercentage
                        : clampProgress(updates.progressPercentage),
                    updatedAt: now,
                  }
                : goal,
            ),
          };
        }),
      deleteGoal: (id) =>
        set((state) => {
          const deletedTaskIds = state.tasks
            .filter((task) => task.goalId === id)
            .map((task) => task.id);

          return {
            goals: state.goals.filter((goal) => goal.id !== id),
            tasks: state.tasks.filter((task) => task.goalId !== id),
            progressLogs: state.progressLogs.filter((log) => log.goalId !== id),
            journalEntries: state.journalEntries.map((entry) => ({
              ...entry,
              linkedGoalIds: entry.linkedGoalIds.filter((goalId) => goalId !== id),
              linkedTaskIds: entry.linkedTaskIds.filter(
                (taskId) => !deletedTaskIds.includes(taskId),
              ),
            })),
            dailyCompletions: Object.fromEntries(
              Object.entries(state.dailyCompletions).map(([date, completions]) => [
                date,
                completions.filter((completion) => completion.goalId !== id),
              ]),
            ),
          };
        }),
      updateGoalProgress: (id, progressPercentage, note) =>
        set((state) => {
          const now = new Date();
          const goalExists = state.goals.some((goal) => goal.id === id);
          const nextProgress = clampProgress(progressPercentage);

          return {
            goals: updateGoalProgressInList(state.goals, id, nextProgress, now.toISOString()),
            progressLogs: goalExists
              ? [
                  {
                    id: createId("progress"),
                    goalId: id,
                    date: getDateKey(now),
                    value: nextProgress,
                    note,
                  },
                  ...state.progressLogs,
                ]
              : state.progressLogs,
          };
        }),
      addTask: (payload) => {
        const now = new Date().toISOString();
        const task: Task = {
          ...payload,
          id: payload.id ?? createId("task"),
          status: payload.status ?? "TODO",
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({ tasks: [task, ...state.tasks] }));
        return task;
      },
      updateTask: (id, updates) =>
        set((state) => {
          const now = new Date().toISOString();

          return {
            tasks: state.tasks.map((task) =>
              task.id === id
                ? {
                    ...task,
                    ...updates,
                    updatedAt: now,
                  }
                : task,
            ),
          };
        }),
      completeTask: (id, notes) =>
        set((state) => {
          const now = new Date();
          const task = state.tasks.find((candidate) => candidate.id === id);

          if (!task || task.status === "DONE") {
            return {};
          }

          const nextTasks = state.tasks.map((candidate) =>
            candidate.id === id
              ? {
                  ...candidate,
                  status: "DONE" as const,
                  notes: notes ?? candidate.notes,
                  updatedAt: now.toISOString(),
                }
              : candidate,
          );

          if (!task.goalId) {
            return { tasks: nextTasks };
          }

          const goal = state.goals.find((candidate) => candidate.id === task.goalId);
          const nextProgress = goal ? clampProgress(goal.progressPercentage + 1) : 0;

          return {
            tasks: nextTasks,
            goals: goal
              ? updateGoalProgressInList(
                  state.goals,
                  task.goalId,
                  nextProgress,
                  now.toISOString(),
                )
              : state.goals,
            progressLogs: goal
              ? [
                  {
                    id: createId("progress"),
                    goalId: task.goalId,
                    date: getDateKey(now),
                    value: nextProgress,
                    note: `Completed task: ${task.title}`,
                  },
                  ...state.progressLogs,
                ]
              : state.progressLogs,
          };
        }),
      skipTask: (id, notes) =>
        set((state) => {
          const now = new Date().toISOString();

          return {
            tasks: state.tasks.map((task) =>
              task.id === id
                ? {
                    ...task,
                    status: "SKIPPED",
                    notes: notes ?? task.notes,
                    updatedAt: now,
                  }
                : task,
            ),
          };
        }),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
          journalEntries: state.journalEntries.map((entry) => ({
            ...entry,
            linkedTaskIds: entry.linkedTaskIds.filter((taskId) => taskId !== id),
          })),
        })),
      addJournalEntry: (payload) => {
        const now = new Date();
        const entry: JournalEntry = {
          ...payload,
          id: createId("journal"),
          date: payload.date ?? getDateKey(now),
          linkedGoalIds: payload.linkedGoalIds ?? [],
          linkedTaskIds: payload.linkedTaskIds ?? [],
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        };

        set((state) => ({ journalEntries: [entry, ...state.journalEntries] }));
        return entry;
      },
      updateJournalEntry: (id, updates) =>
        set((state) => {
          const now = new Date().toISOString();

          return {
            journalEntries: state.journalEntries.map((entry) =>
              entry.id === id
                ? {
                    ...entry,
                    ...updates,
                    updatedAt: now,
                  }
                : entry,
            ),
          };
        }),
      deleteJournalEntry: (id) =>
        set((state) => ({
          journalEntries: state.journalEntries.filter((entry) => entry.id !== id),
        })),
      addProgressLog: (payload) => {
        const now = new Date().toISOString();
        const log = createProgressLog(payload);

        set((state) => ({
          progressLogs: [log, ...state.progressLogs],
          goals: updateGoalProgressInList(state.goals, log.goalId, log.value, now),
        }));
        return log;
      },
      getTasksByDate: (date) => get().tasks.filter((task) => task.date === date),
      getTasksByGoal: (goalId) => get().tasks.filter((task) => task.goalId === goalId),
      getJournalEntriesByDate: (date) =>
        get().journalEntries.filter((entry) => entry.date === date),
      getGoalProgressSummary: (goalId) => {
        const state = get();
        const goal = state.goals.find((candidate) => candidate.id === goalId);

        if (!goal) {
          return undefined;
        }

        const tasks = state.tasks.filter((task) => task.goalId === goalId);
        const logs = state.progressLogs.filter((log) => log.goalId === goalId);

        return {
          goalId: goal.id,
          title: goal.title,
          status: goal.status,
          progressPercentage: goal.progressPercentage,
          totalTasks: tasks.length,
          completedTasks: tasks.filter((task) => task.status === "DONE").length,
          skippedTasks: tasks.filter((task) => task.status === "SKIPPED").length,
          totalProgressLogs: logs.length,
          latestProgressLogDate: logs[0]?.date,
        };
      },
      updateAppSettings: (updates) =>
        set((state) => ({
          appSettings: {
            ...state.appSettings,
            ...updates,
          },
        })),
      resetToSeedData: () =>
        set({
          ...createSeedState(),
          appSettings: {
            ...cloneData(seedAppSettings),
            lastResetAt: new Date().toISOString(),
          },
          hasHydrated: true,
        }),
      resetDemoData: () => get().resetToSeedData(),
      toggleFocusItem: (goalId, item) =>
        set((state) => {
          const todayKey = getDateKey();
          const now = new Date();
          const todayCompletions = state.dailyCompletions[todayKey] ?? [];
          const alreadyComplete = isFocusItemComplete(todayCompletions, goalId, item);
          const goal = state.goals.find((candidate) => candidate.id === goalId);
          const nextProgress = goal
            ? clampProgress(goal.progressPercentage + (alreadyComplete ? -1 : 1))
            : 0;

          return {
            goals: goal
              ? updateGoalProgressInList(state.goals, goalId, nextProgress, now.toISOString())
              : state.goals,
            progressLogs: goal
              ? [
                  {
                    id: createId("progress"),
                    goalId,
                    date: todayKey,
                    value: nextProgress,
                    note: alreadyComplete
                      ? `Unchecked daily focus: ${item}`
                      : `Completed daily focus: ${item}`,
                  },
                  ...state.progressLogs,
                ]
              : state.progressLogs,
            dailyCompletions: {
              ...state.dailyCompletions,
              [todayKey]: alreadyComplete
                ? todayCompletions.filter(
                    (completion) =>
                      !(completion.goalId === goalId && completion.item === item),
                  )
                : [
                    ...todayCompletions,
                    {
                      goalId,
                      item,
                      completedAt: now.toISOString(),
                    },
                  ],
            },
          };
        }),
    }),
    {
      name: PERSIST_KEY,
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state): PersistedAppState => ({
        targetAreas: state.targetAreas,
        goals: state.goals,
        tasks: state.tasks,
        journalEntries: state.journalEntries,
        progressLogs: state.progressLogs,
        weeklySystem: state.weeklySystem,
        thirtyDayPlan: state.thirtyDayPlan,
        mindsetReminders: state.mindsetReminders,
        appSettings: state.appSettings,
        dailyCompletions: state.dailyCompletions,
      }),
      // TODO: Replace this with real per-version migrators before the next schema bump.
      migrate: (persisted) => persisted as PersistedAppState,
      merge: (persisted, current) => {
        if (!isPersistedAppState(persisted)) {
          return current;
        }

        return {
          ...current,
          targetAreas: persisted.targetAreas ?? current.targetAreas,
          goals: persisted.goals ?? current.goals,
          tasks: persisted.tasks ?? current.tasks,
          journalEntries: persisted.journalEntries ?? current.journalEntries,
          progressLogs: persisted.progressLogs ?? current.progressLogs,
          weeklySystem: persisted.weeklySystem ?? current.weeklySystem,
          thirtyDayPlan: persisted.thirtyDayPlan ?? current.thirtyDayPlan,
          mindsetReminders: persisted.mindsetReminders ?? current.mindsetReminders,
          dailyCompletions: persisted.dailyCompletions ?? current.dailyCompletions,
          appSettings: {
            ...current.appSettings,
            ...(isRecord(persisted.appSettings) ? persisted.appSettings : {}),
          },
          hasHydrated: false,
        } as AppStore;
      },
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn("Failed to rehydrate planner storage", error);
          AsyncStorage.removeItem(PERSIST_KEY).catch(() => undefined);

          if (state) {
            state.resetToSeedData();
            return;
          }

          queueMicrotask(() => {
            useAppStore.setState({ ...createSeedState(), hasHydrated: true });
          });
          return;
        }

        state?.setHasHydrated(true);
      },
    },
  ),
);
