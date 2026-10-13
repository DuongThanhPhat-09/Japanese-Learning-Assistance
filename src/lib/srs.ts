import type { CardKind, CardState, Grade, SrsCard } from "@/types";
import { DAY_MS } from "./date";

/** Review intervals in days. Index = card step. */
export const REVIEW_INTERVALS = [1, 3, 7, 14, 30, 60, 120] as const;
export const MAX_STEP = REVIEW_INTERVALS.length - 1;
/** A card that is failed ("again") comes back after this delay, within the same session. */
export const RELEARN_DELAY_MS = 10 * 60 * 1000;

export function cardId(kind: CardKind, itemId: string) {
  return `${kind}:${itemId}`;
}

export function newCard(kind: CardKind, itemId: string, now = Date.now()): SrsCard {
  return {
    id: cardId(kind, itemId),
    kind,
    itemId,
    state: "new",
    step: -1,
    due: now,
    reps: 0,
    lapses: 0,
    createdAt: now,
  };
}

export function stateForStep(step: number, reps: number): CardState {
  if (reps === 0) return "new";
  if (step <= 1) return "learning";
  if (step < MAX_STEP) return "review";
  return "mastered";
}

export function nextStep(step: number, grade: Grade): number {
  switch (grade) {
    case "again":
      return -1;
    case "hard":
      return Math.max(step, 0);
    case "good":
      return Math.min(step + 1, MAX_STEP);
    case "easy":
      return Math.min(step + 2, MAX_STEP);
  }
}

/** Pure scheduling function: returns the updated card after a review. */
export function reviewCard(card: SrsCard, grade: Grade, now = Date.now()): SrsCard {
  const step = nextStep(card.step, grade);
  const due = step < 0 ? now + RELEARN_DELAY_MS : now + REVIEW_INTERVALS[step] * DAY_MS;
  const reps = card.reps + 1;
  const lapses = grade === "again" && card.reps > 0 ? card.lapses + 1 : card.lapses;
  return { ...card, step, due, reps, lapses, lastReviewed: now, state: stateForStep(step, reps) };
}

/** Human-readable preview of the interval a grade would produce. */
export function previewInterval(card: SrsCard, grade: Grade): string {
  const step = nextStep(card.step, grade);
  if (step < 0) return "10 phút";
  const days = REVIEW_INTERVALS[step];
  return `${days} ngày`;
}

export function isDue(card: SrsCard, now = Date.now()): boolean {
  return card.state !== "new" && card.due <= now;
}

export interface SessionOptions {
  mode: "due" | "all" | "new" | "weak" | "random";
  kinds?: CardKind[];
  itemFilter?: (card: SrsCard) => boolean;
  limit?: number;
  rand?: () => number;
}

/** Builds a review queue from the card collection according to the session mode. */
export function buildSession(cards: SrsCard[], opts: SessionOptions, now = Date.now()): SrsCard[] {
  const { mode, kinds, itemFilter, limit = 20, rand = Math.random } = opts;
  let pool = cards.filter((c) => (!kinds || kinds.includes(c.kind)) && (!itemFilter || itemFilter(c)));
  switch (mode) {
    case "due":
      pool = pool.filter((c) => isDue(c, now)).sort((a, b) => a.due - b.due);
      break;
    case "new":
      pool = pool.filter((c) => c.state === "new");
      break;
    case "weak":
      pool = pool.filter((c) => c.lapses > 0).sort((a, b) => b.lapses - a.lapses);
      break;
    case "all":
      pool = pool.filter((c) => c.state !== "new");
      break;
    case "random":
      pool = pool.filter((c) => c.state !== "new");
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      break;
  }
  return pool.slice(0, limit);
}

export function countByState(cards: SrsCard[]): Record<CardState, number> {
  const out: Record<CardState, number> = { new: 0, learning: 0, review: 0, mastered: 0 };
  for (const c of cards) out[c.state]++;
  return out;
}

/** Number of cards that will become due on each of the next `days` days (index 0 = today, incl. overdue). */
export function forecast(cards: SrsCard[], days: number, now = Date.now()): number[] {
  const out = new Array(days).fill(0);
  const today = new Date(now);
  today.setHours(23, 59, 59, 999);
  const endOfToday = today.getTime();
  for (const c of cards) {
    if (c.state === "new") continue;
    const idx = c.due <= endOfToday ? 0 : Math.ceil((c.due - endOfToday) / DAY_MS);
    if (idx < days) out[idx]++;
  }
  return out;
}
