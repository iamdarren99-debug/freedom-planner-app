import { useAppStore } from "../store/useAppStore";

export function useHydrated() {
  return useAppStore((state) => state.hasHydrated);
}
