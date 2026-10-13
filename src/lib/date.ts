export const DAY_MS = 24 * 60 * 60 * 1000;

/** Local-time YYYY-MM-DD key. */
export function dateKey(d: Date | number = new Date()): string {
  const date = typeof d === "number" ? new Date(d) : d;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function startOfDay(d: Date | number = new Date()): number {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r.getTime();
}

/** The last `n` date keys ending today (oldest first). */
export function lastNDays(n: number, today: Date = new Date()): string[] {
  return Array.from({ length: n }, (_, i) => dateKey(addDays(today, i - (n - 1))));
}

/** Monday-based start of week. */
export function startOfWeek(d: Date = new Date()): Date {
  const r = new Date(d);
  const day = (r.getDay() + 6) % 7;
  r.setDate(r.getDate() - day);
  r.setHours(0, 0, 0, 0);
  return r;
}

export const VI_WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export function weekdayLabel(key: string): string {
  const d = parseDateKey(key);
  return VI_WEEKDAYS[(d.getDay() + 6) % 7];
}

/**
 * Current streak: consecutive days with activity ending today, or ending
 * yesterday if today has no activity yet (the streak is not broken until the day ends).
 */
export function computeStreak(activeDays: Set<string>, today: Date = new Date()): number {
  let cursor = today;
  if (!activeDays.has(dateKey(cursor))) cursor = addDays(cursor, -1);
  let streak = 0;
  while (activeDays.has(dateKey(cursor))) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function longestStreak(activeDays: Set<string>): number {
  const sorted = Array.from(activeDays).sort();
  let best = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const key of sorted) {
    const d = parseDateKey(key);
    run = prev && dateKey(addDays(prev, 1)) === key ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return best;
}
