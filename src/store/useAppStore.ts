import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { seedGoals, seedJournalEntries, seedPlannerBlocks } from "../data/seed";
import { createId } from "../utils/planning";
import { Goal, JournalEntry, PlannerBlock } from "../types/planner";

interface AppState {
  goals: Goal[];
  plannerBlocks: PlannerBlock[];
  journalEntries: JournalEntry[];
  themeMode: "dark";
  hasHydrated: boolean;
}

interface AppActions {
  setHasHydrated: (value: boolean) => void;
  addJournalEntry: (payload: { title: string; content: string }) => void;
  resetDemoData: () => void;
}

type AppStore = AppState & AppActions;

const initialState: AppState = {
  goals: seedGoals,
  plannerBlocks: seedPlannerBlocks,
  journalEntries: seedJournalEntries,
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
      resetDemoData: () => set({ ...initialState, hasHydrated: true }),
    }),
    {
      name: "freedom-planner-phase-0",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        goals: state.goals,
        plannerBlocks: state.plannerBlocks,
        journalEntries: state.journalEntries,
        themeMode: state.themeMode,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
