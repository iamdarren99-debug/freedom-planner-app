import { getDateKey } from "./planning";

export function addDays(dateKey: string, days: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);

  return getDateKey(date);
}

export function isWeekend(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay();

  return dayOfWeek === 0 || dayOfWeek === 6;
}

export function getRecentDateKeys(days: number) {
  return Array.from({ length: days }, (_, index) => addDays(getDateKey(), -index));
}
