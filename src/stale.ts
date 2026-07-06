const DAY_MS = 24 * 60 * 60 * 1000;
const STALE_AFTER_DAYS = 30;

/** Returns a warning for an old snapshot. An unreadable date is left alone. */
export function staleWarning(createdAt: string, now = new Date()): string | null {
  const created = Date.parse(createdAt);
  if (Number.isNaN(created)) return null;
  const days = Math.floor((now.getTime() - created) / DAY_MS);
  if (days < STALE_AFTER_DAYS) return null;
  return `Note: this snapshot is ${days} days old, so that machine may have changed.`;
}
