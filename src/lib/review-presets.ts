import type { SrsCard } from "@/types";
import { buildSession } from "./srs";
import { REVIEW_SECONDS } from "./engine";

export type PresetId = "quick" | "5min" | "15min" | "full";

export interface ReviewPreset {
  id: PresetId;
  label: string;
  cards: SrsCard[];
  minutes: number;
}

const QUICK_CARDS = 10;

export const minutesFor = (cards: number, secondsPerCard = REVIEW_SECONDS) => Math.max(1, Math.round((cards * secondsPerCard) / 60));

/**
 * What a review session draws from: due cards (oldest first) plus today's new
 * cards. When nothing is due the learner can still practise: weak cards first,
 * then the rest of what they have learned, shuffled.
 */
export function reviewPool(cards: SrsCard[], newPerDay: number, now = Date.now()): { cards: SrsCard[]; practice: boolean } {
  const due = buildSession(cards, { mode: "due", limit: Infinity }, now);
  const fresh = buildSession(cards, { mode: "new", limit: newPerDay }, now);
  if (due.length + fresh.length) return { cards: [...due, ...fresh], practice: false };
  const weak = buildSession(cards, { mode: "weak", limit: Infinity }, now);
  const seen = new Set(weak.map((c) => c.id));
  const rest = buildSession(cards, { mode: "random", limit: Infinity }, now).filter((c) => !seen.has(c.id));
  return { cards: [...weak, ...rest], practice: true };
}

/**
 * Time-boxed, one-click sessions. A preset is offered only when it is smaller
 * than the whole pool, so the learner never sees two buttons that do the same thing.
 */
export function reviewPresets(pool: SrsCard[], secondsPerCard = REVIEW_SECONDS): ReviewPreset[] {
  if (!pool.length) return [];
  const sized: { id: PresetId; label: string; n: number }[] = [
    { id: "quick", label: "Ôn nhanh", n: QUICK_CARDS },
    { id: "5min", label: "5 phút", n: Math.floor(300 / secondsPerCard) },
    { id: "15min", label: "15 phút", n: Math.floor(900 / secondsPerCard) },
  ];
  const presets: ReviewPreset[] = sized
    .filter((p) => p.n < pool.length)
    .map((p) => ({ id: p.id, label: p.label, cards: pool.slice(0, p.n), minutes: minutesFor(p.n, secondsPerCard) }));
  presets.push({ id: "full", label: "Ôn hết", cards: pool, minutes: minutesFor(pool.length, secondsPerCard) });
  return presets;
}
