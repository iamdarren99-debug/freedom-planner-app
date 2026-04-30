export function normalizeTitle(value: string) {
  return value.trim().toLowerCase();
}

export function toOptionalNumber(value: string) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }

  return Math.round(parsed);
}
