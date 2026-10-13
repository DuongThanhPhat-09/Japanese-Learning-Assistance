import { describe, expect, it } from "vitest";
import type { SrsCard } from "@/types";
import { missedCards, weakCards } from "@/lib/weak";
import { stageStatus, type EngineInput } from "@/lib/engine";
import { STAGE_BY_ID } from "@/data/stages";
import { DAY_MS } from "@/lib/date";

const NOW = new Date(2026, 9, 12, 9).getTime();

function card(id: string, over: Partial<SrsCard> = {}): SrsCard {
  const [kind, ...rest] = id.split(":");
  return { id, kind: kind as SrsCard["kind"], itemId: rest.join(":"), state: "review", step: 2, due: NOW + DAY_MS, reps: 3, lapses: 0, createdAt: NOW - 30 * DAY_MS, ...over };
}

describe("weak items", () => {
  const cards = Object.fromEntries(
    [
      card("vocab:N5:食べる", { lapses: 2 }),
      card("vocab:N5:飲む"),
      card("vocab:N5:見る"),
      card("vocab:N5:行く", { state: "new", lapses: 3 }),
      card("kanji:日", { lapses: 1 }),
    ].map((c) => [c.id, c]),
  );

  it("selects lapsed or frequently-wrong cards of one kind, worst first", () => {
    const stats = {
      "vocab:N5:飲む": { ok: 1, bad: 3, last: NOW },
      "vocab:N5:見る": { ok: 9, bad: 1, last: NOW },
    };
    expect(weakCards(cards, stats, "vocab").map((c) => c.id)).toEqual(["vocab:N5:食べる", "vocab:N5:飲む"]);
    expect(weakCards(cards, stats, "kanji").map((c) => c.id)).toEqual(["kanji:日"]);
    expect(weakCards(cards, stats, "grammar")).toEqual([]);
  });

  it("counts reverse-recall drills against the vocab card", () => {
    const stats = { "recall:vocab:N5:見る": { ok: 0, bad: 2, last: NOW } };
    expect(weakCards(cards, stats, "vocab").map((c) => c.id)).toContain("vocab:N5:見る");
  });

  it("lists recently missed cards, most recent first, ignoring old practice", () => {
    const stats = {
      "vocab:N5:飲む": { ok: 4, bad: 1, last: NOW - DAY_MS },
      "kanji:日": { ok: 1, bad: 1, last: NOW - 2 * 3600_000 },
      "vocab:N5:見る": { ok: 0, bad: 1, last: NOW - 20 * DAY_MS },
    };
    expect(missedCards(cards, stats, 14, NOW).map((c) => c.id)).toEqual(["kanji:日", "vocab:N5:飲む"]);
  });
});

describe("roadmap status", () => {
  const input = (track: EngineInput["profile"]["track"] = "jlpt"): EngineInput => ({
    cards: {},
    completed: {},
    scores: {},
    activity: {},
    examResults: [],
    itemStats: {},
    profile: { dailyMinutes: 30, newCardsPerDay: 15, track, createdAt: NOW },
  });

  it("marks the frontier current and everything beyond it locked", () => {
    const i = input();
    expect(stageStatus(STAGE_BY_ID.get("beginner")!, i)).toBe("current");
    expect(stageStatus(STAGE_BY_ID.get("hiragana")!, i)).toBe("locked");
    expect(stageStatus(STAGE_BY_ID.get("business")!, i)).toBe("locked");
    expect(stageStatus(STAGE_BY_ID.get("native")!, i)).toBe("locked");
  });

  it("keeps professional stages locked until the parallel track unlocks", () => {
    expect(stageStatus(STAGE_BY_ID.get("business")!, input("brse"))).toBe("locked");
  });
});
