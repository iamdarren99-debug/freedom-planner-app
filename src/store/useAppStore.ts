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

  if (progressPercentage < 100 && goal.status === "COMPLETED") {
    return "IN_PROGRESS";
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

function hasValidFirstId(value: unknown) {
  if (!Array.isArray(value) || value.length === 0) {
    return true;
  }

  return isRecord(value[0]) && typeof value[0].id === "string";
}

function isPersistedAppState(value: unknown): value is Partial<PersistedAppState> {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isOptionalArray(value.targetAreas) &&
    hasValidFirstId(value.targetAreas) &&
    isOptionalArray(value.goals) &&
    hasValidFirstId(value.goals) &&
    isOptionalArray(value.tasks) &&
    hasValidFirstId(value.tasks) &&
    isOptionalArray(value.journalEntries) &&
    hasValidFirstId(value.journalEntries) &&
    isOptionalArray(value.progressLogs) &&
    hasValidFirstId(value.progressLogs) &&
    isOptionalArray(value.mindsetReminders) &&
    hasValidFirstId(value.mindsetReminders) &&
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

function upsertProgressLog(progressLogs: ProgressLog[], log: ProgressLog) {
  const existingIndex = progressLogs.findIndex(
    (item) => item.goalId === log.goalId && item.date === log.date,
  );

  if (existingIndex >= 0) {
    const nextLogs = [...progressLogs];
    nextLogs[existingIndex] = {
      ...nextLogs[existingIndex],
      value: log.value,
      note: log.note,
    };

    return nextLogs.slice(0, 200);
  }

  return [log, ...progressLogs].slice(0, 200);
}

function isWeeklyActionTask(goal: Goal | undefined, task: Task) {
  return Boolean(goal?.weeklyActions.some((action) => action === task.title));
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
          const goal = state.goals.find((candidate) => candidate.id === id);
          const nextProgress = clampProgress(progressPercentage);

          if (!goal) {
            return {};
          }

          if (nextProgress === goal.progressPercentage) {
            return {
              goals: updateGoalProgressInList(state.goals, id, nextProgress, now.toISOString()),
            };
          }

          return {
            goals: updateGoalProgressInList(state.goals, id, nextProgress, now.toISOString()),
            progressLogs: upsertProgressLog(state.progressLogs, {
              id: createId("progress"),
              goalId: id,
              date: getDateKey(now),
              value: nextProgress,
              note,
            }),
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
      // Weekly-action tasks use the same daily completion path as the Dashboard focus checkbox.
      completeTask: (id, notes) => {
        const state = get();
        const task = state.tasks.find((candidate) => candidate.id === id);

        if (!task) {
          return;
        }

        const now = new Date();
        const goal = task.goalId
          ? state.goals.find((candidate) => candidate.id === task.goalId)
          : undefined;
        const nextStatus = task.status === "DONE" ? "TODO" : "DONE";

        set((current) => ({
          tasks: current.tasks.map((candidate) =>
            candidate.id === id
              ? {
                  ...candidate,
                  status: nextStatus,
                  notes: notes ?? candidate.notes,
                  updatedAt: now.toISOString(),
                }
              : candidate,
          ),
        }));

        if (task.goalId && isWeeklyActionTask(goal, task)) {
          const completionDate = getDateKey();
          const completions = get().dailyCompletions[completionDate] ?? [];
          const alreadyComplete = isFocusItemComplete(completions, task.goalId, task.title);

          if (
            (nextStatus === "DONE" && !alreadyComplete) ||
            (nextStatus === "TODO" && alreadyComplete)
          ) {
            get().toggleFocusItem(task.goalId, task.title);
          }

          return;
        }

        if (!task.goalId || !goal) {
          return;
        }

        const nextProgress = clampProgress(
          goal.progressPercentage + (nextStatus === "DONE" ? 1 : -1),
        );

        set((current) => ({
          goals: updateGoalProgressInList(
            current.goals,
            task.goalId as string,
            nextProgress,
            now.toISOString(),
          ),
          progressLogs:
            nextProgress !== goal.progressPercentage
              ? upsertProgressLog(current.progressLogs, {
                  id: createId("progress"),
                  goalId: task.goalId as string,
                  date: getDateKey(now),
                  value: nextProgress,
                  note:
                    nextStatus === "DONE"
                      ? `Completed task: ${task.title}`
                      : `Undid task: ${task.title}`,
                })
              : current.progressLogs,
        }));
      },
      skipTask: (id, notes) => {
        const state = get();
        const task = state.tasks.find((candidate) => candidate.id === id);

        if (!task) {
          return;
        }

        const now = new Date();
        const goal = task.goalId
          ? state.goals.find((candidate) => candidate.id === task.goalId)
          : undefined;
        const nextStatus = task.status === "SKIPPED" ? "TODO" : "SKIPPED";
        const wasDone = task.status === "DONE";

        if (wasDone && task.goalId && goal && isWeeklyActionTask(goal, task)) {
          const alreadyComplete = isFocusItemComplete(
            state.dailyCompletions[getDateKey(now)] ?? [],
            task.goalId,
            task.title,
          );

          if (alreadyComplete) {
            get().toggleFocusItem(task.goalId, task.title);
          }

          set((current) => ({
            tasks: current.tasks.map((task) =>
              task.id === id
                ? {
                    ...task,
                    status: "SKIPPED",
                    notes: notes ?? task.notes,
                    updatedAt: now.toISOString(),
                  }
                : task,
            ),
          }));
          return;
        }

        set((current) => {
          const nextState: Partial<AppStore> = {
            tasks: current.tasks.map((task) =>
              task.id === id
                ? {
                    ...task,
                    status: nextStatus,
                    notes: notes ?? task.notes,
                    updatedAt: now.toISOString(),
                  }
                : task,
            ),
          };

          if (wasDone && task.goalId && goal && !isWeeklyActionTask(goal, task)) {
            nextState.goals = updateGoalProgressInList(
              current.goals,
              task.goalId,
              clampProgress(goal.progressPercentage - 1),
              now.toISOString(),
            );
          }

          return nextState;
        });
      },
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
        const log = createProgressLog(payload);

        set((state) => ({
          progressLogs: upsertProgressLog(state.progressLogs, log),
        }));
        return log;
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
            progressLogs:
              goal && nextProgress !== goal.progressPercentage
                ? upsertProgressLog(state.progressLogs, {
                    id: createId("progress"),
                    goalId,
                    date: todayKey,
                    value: nextProgress,
                    note: alreadyComplete
                      ? `Unchecked daily focus: ${item}`
                      : `Completed daily focus: ${item}`,
                  })
                : state.progressLogs,
            tasks: state.tasks.map((task) =>
              task.goalId === goalId && task.date === todayKey && task.title === item
                ? {
                    ...task,
                    status: alreadyComplete ? "TODO" : "DONE",
                    updatedAt: now.toISOString(),
                  }
                : task,
            ),
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
      // Version 2 introduced appSettings; older payloads receive the seeded defaults.
      migrate: (persisted, fromVersion) =>
        fromVersion < 2
          ? {
              ...(isRecord(persisted) ? persisted : {}),
              appSettings: cloneData(seedAppSettings),
            }
          : (persisted as PersistedAppState),
      merge: (persisted, current) => {
        try {
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
        } catch (error) {
          console.warn("Ignored corrupted planner storage", error);
          return current;
        }
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
