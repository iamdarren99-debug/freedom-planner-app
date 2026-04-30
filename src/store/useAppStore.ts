import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { seedGoals, seedJournalEntries, seedPlannerBlocks } from "../data/seed";
import { createId, getDateKey, isFocusItemComplete } from "../utils/planning";
import {
  DailyCompletionsByDate,
  Goal,
  JournalEntry,
  PlannerBlock,
} from "../types/planner";

const PERSIST_KEY = "freedom-planner";

interface AppState {
  goals: Goal[];
  plannerBlocks: PlannerBlock[];
  journalEntries: JournalEntry[];
  dailyCompletions: DailyCompletionsByDate;
  themeMode: "dark";
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
  goals: seedGoals,
  plannerBlocks: seedPlannerBlocks,
  journalEntries: seedJournalEntries,
  dailyCompletions: {},
  themeMode: "dark",
  hasHydrated: false,
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      ...initialState,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      addJournalEntry: ({ title, content }) =>
        set((state) => ({
          journalEntries: [
            {
              id: createId("journal"),
              title,
              content,
              createdAt: new Date().toISOString(),
            },
            ...state.journalEntries,
          ],
        })),
      toggleFocusItem: (goalId, item) =>
        set((state) => {
          const todayKey = getDateKey();
          const todayCompletions = state.dailyCompletions[todayKey] ?? [];
          const alreadyComplete = isFocusItemComplete(todayCompletions, goalId, item);

          return {
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
                      completedAt: new Date().toISOString(),
                    },
                  ],
            },
          };
        }),
      resetDemoData: () => set({ ...initialState, hasHydrated: true }),
    }),
    {
      name: PERSIST_KEY,
      version: 0,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        goals: state.goals,
        plannerBlocks: state.plannerBlocks,
        journalEntries: state.journalEntries,
        dailyCompletions: state.dailyCompletions,
        themeMode: state.themeMode,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn("Failed to rehydrate planner storage", error);
          AsyncStorage.removeItem(PERSIST_KEY).catch(() => undefined);
        }

        if (state) {
          state.setHasHydrated(true);
          return;
        }

        useAppStore.setState({ hasHydrated: true });
      },
    },
  ),
);
