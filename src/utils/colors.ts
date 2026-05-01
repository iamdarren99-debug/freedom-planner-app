import { processColor } from "react-native";

export function isValidColor(value: string) {
  return value.trim().length > 0 && processColor(value.trim()) !== null;
}

export function safeColor(value: string | undefined, fallback: string) {
  const nextColor = value?.trim();

  return nextColor && isValidColor(nextColor) ? nextColor : fallback;
}
