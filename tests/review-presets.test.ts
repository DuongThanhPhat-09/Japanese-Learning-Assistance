import { describe, expect, it } from "vitest";
import type { SrsCard } from "@/types";
import { minutesFor, reviewPool, reviewPresets } from "@/lib/review-presets";
import { DAY_MS } from "@/lib/date";

const NOW = new Date(2026, 9, 12, 9).getTime();

function card(i: number, over: Partial<SrsCard> = {}): SrsCard {
  return { id: `vocab:N5:w${i}`, kind: "vocab", itemId: `N5:w${i}`, state: "review", step: 2, due: NOW - DAY_MS, reps: 3, lapses: 0, createdAt: NOW - 30 * DAY_MS, ...over };
}

describe("review presets", () => {
  it("offers every time box only when it is smaller than the pool", () => {
    const pool = Array.from({ length: 200 }, (_, i) => card(i));
    expect(reviewPresets(pool, 8).map((p) => [p.id, p.cards.length])).toEqual([
      ["quick", 10],
      ["5min", 37],
      ["15min", 112],
      ["full", 200],
    ]);
    expect(reviewPresets(pool.slice(0, 20), 8).map((p) => p.id)).toEqual(["quick", "full"]);
    expect(reviewPresets(pool.slice(0, 8), 8).map((p) => p.id)).toEqual(["full"]);
    expect(reviewPresets([], 8)).toEqual([]);
  });

  it("estimates at least one minute", () => {
    expect(minutesFor(1, 8)).toBe(1);
    expect(minutesFor(37, 8)).toBe(5);
  });

  it("draws due cards first, then new cards, and falls back to practice", () => {
    const due = card(1, { due: NOW - 2 * DAY_MS });
    const later = card(2, { due: NOW + DAY_MS });
    const fresh = card(3, { state: "new", step: -1, reps: 0 });
    expect(reviewPool([later, fresh, due], 5, NOW)).toEqual({ cards: [due, fresh], practice: false });

    const weak = card(4, { due: NOW + DAY_MS, lapses: 2 });
    const practice = reviewPool([later, weak], 5, NOW);
    expect(practice.practice).toBe(true);
    expect(practice.cards.map((c) => c.id)).toEqual([weak.id, later.id]);
  });
});
