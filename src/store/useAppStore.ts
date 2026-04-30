import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
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

interface AppState {
  targetAreas: TargetArea[];
  goals: Goal[];
  tasks: Task[];
  journalEntries: JournalEntry[];
  progressLogs: ProgressLog[];
  weeklySystem: WeeklySystem;
  thirtyDayPlan: ThirtyDayPlan;
  mindsetReminders: MindsetReminder[];
  dailyCompletions: DailyCompletionsByDate;
  hasHydrated: boolean;
}

interface AppActions {
  setHasHydrated: (value: boolean) => void;
  addJournalEntry: (payload: { title: string; content: string }) => void;
  toggleFocusItem: (goalId: string, item: string) => void;
  resetDemoData: () => void;
}

type AppStore = AppState & AppActions;

const initialState: AppState = {
  targetAreas: seedTargetAreas,
  goals: seedGoals,
  tasks: seedTasks,
  journalEntries: seedJournalEntries,
  progressLogs: seedProgressLogs,
  weeklySystem: seedWeeklySystem,
  thirtyDayPlan: seedThirtyDayPlan,
  mindsetReminders: seedMindsetReminders,
  dailyCompletions: {},
  hasHydrated: false,
};

function clampProgress(value: number) {
  return Math.min(100, Math.max(0, value));
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      ...initialState,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      addJournalEntry: ({ title, content }) =>
        set((state) => {
          const now = new Date();

          return {
            journalEntries: [
              {
                id: createId("journal"),
                date: getDateKey(now),
                title,
                content,
                linkedGoalIds: [],
                linkedTaskIds: [],
                createdAt: now.toISOString(),
                updatedAt: now.toISOString(),
              },
              ...state.journalEntries,
            ],
          };
        }),
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
            goals: state.goals.map((candidate) =>
              candidate.id === goalId
                ? {
                    ...candidate,
                    status:
                      !alreadyComplete && candidate.status === "NOT_STARTED"
                        ? "IN_PROGRESS"
                        : candidate.status,
                    progressPercentage: nextProgress,
                    updatedAt: now.toISOString(),
                  }
                : candidate,
            ),
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
      resetDemoData: () => set({ ...initialState, hasHydrated: true }),
    }),
    {
      name: PERSIST_KEY,
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        targetAreas: state.targetAreas,
        goals: state.goals,
        tasks: state.tasks,
        journalEntries: state.journalEntries,
        progressLogs: state.progressLogs,
        weeklySystem: state.weeklySystem,
        thirtyDayPlan: state.thirtyDayPlan,
        mindsetReminders: state.mindsetReminders,
        dailyCompletions: state.dailyCompletions,
      }),
      // TODO: Replace this with real per-version migrators before the next schema bump.
      migrate: (persisted) => persisted as AppState,
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn("Failed to rehydrate planner storage", error);
          AsyncStorage.removeItem(PERSIST_KEY).catch(() => undefined);
        }

        state?.setHasHydrated(true);
      },
    },
  ),
);
