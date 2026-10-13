import { describe, expect, it } from "vitest";
import type { SrsCard } from "@/types";
import {
  buildDailyPlan,
  mainFrontier,
  monthlyMilestones,
  nextGrammar,
  pickNewItems,
  proFrontier,
  RATIOS,
  recentRetention,
  stageGates,
  stagePassed,
  weeklyTasks,
  type EngineInput,
} from "@/lib/engine";
import { STAGE_BY_ID } from "@/data/stages";
import { HIRAGANA, KATAKANA } from "@/data/kana";
import { VOCABULARY } from "@/data/vocab";
import { KANJI } from "@/data/kanji";
import { GRAMMAR } from "@/data/grammar";
import { ARTICLES } from "@/data/reading";
import { stripRuby } from "@/lib/ruby";
import { addDays, dateKey, DAY_MS } from "@/lib/date";
import { cardId } from "@/lib/srs";

// 2026-10-12 is a Monday.
const MONDAY = new Date(2026, 9, 12, 9);
const day = (offset: number) => addDays(MONDAY, offset);

function input(over: Partial<EngineInput> = {}, profile: Partial<EngineInput["profile"]> = {}): EngineInput {
  return {
    cards: {},
    completed: {},
    scores: {},
    activity: {},
    examResults: [],
    itemStats: {},
    ...over,
    profile: { dailyMinutes: 30, newCardsPerDay: 15, track: "jlpt", createdAt: MONDAY.getTime() - 10 * DAY_MS, ...profile },
  };
}

/** A card that has survived the 7-day interval (state "review"), not due until next month. */
function retained(kind: SrsCard["kind"], itemId: string, due = MONDAY.getTime() + 20 * DAY_MS): SrsCard {
  return { id: cardId(kind, itemId), kind, itemId, state: "review", step: 3, due, reps: 4, lapses: 0, createdAt: 0, lastReviewed: 0 };
}

/** Learner who finished orientation and both kana scripts → frontier is N5. */
function n5Learner(extra: Partial<EngineInput> = {}): EngineInput {
  const cards: Record<string, SrsCard> = {};
  for (const k of [...HIRAGANA, ...KATAKANA]) cards[cardId("kana", k.id)] = retained("kana", k.id);
  for (const v of VOCABULARY.filter((x) => x.level === "intro").slice(0, 20)) cards[cardId("vocab", v.id)] = retained("vocab", v.id);
  const itemStats = { "kana:h:あ": { ok: 50, bad: 2, last: 0 }, "kana:k:ア": { ok: 50, bad: 2, last: 0 } };
  return input({ cards, completed: { "intro:orientation": 1 }, itemStats, ...extra });
}

describe("level-up gates & frontier", () => {
  it("starts an empty learner at the beginner stage", () => {
    expect(mainFrontier(input(), MONDAY).id).toBe("beginner");
  });

  it("does not let exposure alone pass a kana stage", () => {
    const cards: Record<string, SrsCard> = {};
    // All hiragana seen once (learning state) — not retained yet.
    for (const k of HIRAGANA) cards[cardId("kana", k.id)] = { ...retained("kana", k.id), state: "learning", step: 0 };
    const gates = stageGates(STAGE_BY_ID.get("hiragana")!, input({ cards }), MONDAY);
    expect(gates.find((g) => g.id === "kana-basic")!.met).toBe(false);
  });

  it("advances to N5 when kana is retained and read accurately", () => {
    const l = n5Learner();
    expect(stagePassed(STAGE_BY_ID.get("hiragana")!, l, MONDAY)).toBe(true);
    expect(mainFrontier(l, MONDAY).id).toBe("n5");
  });

  it("requires a passed mock exam for JLPT stages", () => {
    const gates = stageGates(STAGE_BY_ID.get("n5")!, n5Learner(), MONDAY);
    const mock = gates.find((g) => g.id === "mock")!;
    expect(mock.met).toBe(false);
    expect(mock.target).toBe(60);
  });

  it("unlocks the professional track only after N5", () => {
    expect(proFrontier(input({}, { track: "brse" }), MONDAY)).toBeNull();
    const base = n5Learner();
    const retainedAll = <T,>(list: T[], kind: SrsCard["kind"], id: (x: T) => string) =>
      Object.fromEntries(list.map((x) => [cardId(kind, id(x)), retained(kind, id(x))]));
    const passedN5: EngineInput = {
      ...base,
      profile: { ...base.profile, track: "brse" },
      cards: {
        ...base.cards,
        ...retainedAll(VOCABULARY.filter((v) => v.level === "N5"), "vocab", (v) => v.id),
        ...retainedAll(KANJI.filter((k) => k.level === "N5"), "kanji", (k) => k.char),
        ...retainedAll(GRAMMAR.filter((g) => g.level === "N5"), "grammar", (g) => g.id),
      },
      scores: { "reading:n5-my-day": 100, "reading:n5-weekend": 100, "listening:l-n5-shop": 100, "listening:l-n5-weekend": 100 },
      examResults: [{ id: "x", level: "N5", date: MONDAY.getTime() - DAY_MS, score: 80, passed: true, seconds: 1, sections: {} as never, wrongRefs: [] }],
    };
    expect(mainFrontier(passedN5, MONDAY).id).toBe("n4");
    expect(proFrontier(passedN5, MONDAY)?.id).toBe("business");
    expect(buildDailyPlan(passedN5, MONDAY).blocks.some((b) => b.kind === "pro-topic")).toBe(true);
  });
});

describe("daily plan", () => {
  it("always puts due reviews first", () => {
    const l = n5Learner();
    for (const v of VOCABULARY.filter((x) => x.level === "N5").slice(0, 20)) l.cards[cardId("vocab", v.id)] = retained("vocab", v.id, MONDAY.getTime() - 1000);
    const plan = buildDailyPlan(l, MONDAY);
    expect(plan.blocks[0].kind).toBe("review");
    expect(plan.due).toBe(20);
  });

  it("caps new items by sustainable review load", () => {
    // basic phase, 30 min: review budget 10.5 min → 78 reviews → 13 new/day.
    const plan = buildDailyPlan(n5Learner(), MONDAY);
    expect(plan.phase).toBe("basic");
    expect(plan.newBudget).toBe(13);
    expect(plan.blocks.find((b) => b.kind === "learn")!.items).toHaveLength(13);
  });

  it("switches to review-debt mode: no new items, no new grammar", () => {
    const l = n5Learner();
    for (const v of VOCABULARY.slice(0, 300)) l.cards[cardId("vocab", v.id)] = retained("vocab", v.id, MONDAY.getTime() - 1000);
    const plan = buildDailyPlan(l, MONDAY);
    expect(plan.mode).toBe("review-debt");
    expect(plan.newBudget).toBe(0);
    expect(plan.blocks.some((b) => b.kind === "learn" || b.kind === "grammar")).toBe(false);
    expect(plan.blocks[0].minutes).toBeGreaterThan(15);
  });

  it("slows down when retention falls below the floor", () => {
    const activity = Object.fromEntries(
      [0, 1, 2, 3, 4].map((i) => {
        const key = dateKey(day(-i));
        return [key, { date: key, xp: 50, minutes: 20, reviews: 20, correct: 12, answered: 20, lessons: 0, counters: { srsPass: 12, srsFail: 8 } }];
      }),
    );
    const l = n5Learner({ activity });
    expect(recentRetention(activity, MONDAY)).toBeCloseTo(0.6);
    const plan = buildDailyPlan(l, MONDAY);
    expect(plan.mode).toBe("consolidation");
    expect(plan.newBudget).toBeLessThan(13);
  });

  it("follows the weekly rhythm", () => {
    const l = n5Learner();
    const sunday = buildDailyPlan(l, day(6));
    expect(sunday.mode).toBe("light");
    expect(sunday.newBudget).toBe(0);
    expect(sunday.blocks.some((b) => b.kind === "reflection")).toBe(true);
    expect(buildDailyPlan(l, day(2)).blocks.some((b) => b.kind === "checkpoint")).toBe(true);
    expect(buildDailyPlan(l, day(5)).mode).toBe("immersion");
  });

  it("includes output and input blocks and stays close to the time budget", () => {
    const l = n5Learner();
    for (const v of VOCABULARY.filter((x) => x.level === "N5").slice(0, 30)) l.cards[cardId("vocab", v.id)] = retained("vocab", v.id);
    for (const g of GRAMMAR.filter((x) => x.level === "N5").slice(0, 4)) l.completed[`grammar:${g.id}`] = 1;
    const plan = buildDailyPlan(l, MONDAY);
    const kinds = plan.blocks.map((b) => b.kind);
    expect(kinds).toContain("recall");
    expect(kinds).toContain("grammar-drill");
    expect(kinds.some((k) => k === "reading" || k === "listening")).toBe(true);
    expect(plan.minutes).toBeGreaterThanOrEqual(22);
    expect(plan.minutes).toBeLessThanOrEqual(38);
  });

  it("targets the weakest section of a recent mock exam", () => {
    const l = n5Learner({
      examResults: [
        { id: "e", level: "N5", date: MONDAY.getTime() - 2 * DAY_MS, score: 50, passed: false, seconds: 1, wrongRefs: [], sections: { vocabulary: { correct: 6, total: 8 }, kanji: { correct: 1, total: 6 }, grammar: { correct: 6, total: 8 }, reading: { correct: 3, total: 4 }, listening: { correct: 3, total: 4 } } },
      ],
    });
    const weak = buildDailyPlan(l, MONDAY).blocks.find((b) => b.kind === "weakness");
    expect(weak?.quizTypes).toEqual(["kanji"]);
  });

  it("starts an absolute beginner with orientation and hiragana — no grammar or comprehension input", () => {
    const plan = buildDailyPlan(input(), day(1));
    const kinds = plan.blocks.map((b) => b.kind);
    expect(kinds[0]).toBe("orientation");
    expect(kinds).not.toContain("grammar");
    expect(kinds).not.toContain("reading");
    expect(kinds).not.toContain("listening");
    const learn = plan.blocks.find((b) => b.kind === "learn")!.items!;
    expect(learn.filter((id) => id.startsWith("kana:h:")).length).toBeGreaterThanOrEqual(learn.length - 3);
  });

  it("never schedules blocks shorter than 3 minutes", () => {
    const l = n5Learner();
    for (const v of VOCABULARY.slice(0, 300)) l.cards[cardId("vocab", v.id)] = retained("vocab", v.id, MONDAY.getTime() - 1000);
    for (const b of buildDailyPlan(l, MONDAY).blocks) expect(b.minutes, b.kind).toBeGreaterThanOrEqual(3);
  });

  it("recommended ratios sum to 100% for every phase", () => {
    for (const r of Object.values(RATIOS)) expect(Object.values(r).reduce((a, b) => a + b, 0)).toBeCloseTo(1);
  });
});

describe("item selection", () => {
  it("pre-teaches words from the next unread article", () => {
    const stage = STAGE_BY_ID.get("n5")!;
    const article = ARTICLES.find((a) => a.id === "n5-my-day")!;
    const text = article.paragraphs.map(stripRuby).join("");
    const picks = pickNewItems(stage, n5Learner(), 5).filter((p) => p.kind === "vocab");
    expect(picks.length).toBeGreaterThan(0);
    for (const p of picks) expect(text).toContain(p.itemId.split(":")[1]);
  });

  it("introduces grammar strictly one at a time", () => {
    const stage = STAGE_BY_ID.get("n5")!;
    const l = n5Learner();
    const first = nextGrammar(stage, l)!;
    expect(first).toBe("n5-01");
    l.completed["grammar:n5-01"] = 1;
    l.cards[cardId("grammar", "n5-01")] = { ...retained("grammar", "n5-01"), reps: 0, state: "new" };
    expect(nextGrammar(stage, l)).toBeNull(); // previous point not practised yet
    l.cards[cardId("grammar", "n5-01")] = retained("grammar", "n5-01");
    expect(nextGrammar(stage, l)).toBe("n5-02");
  });
});

describe("weekly path & milestones", () => {
  it("computes weekly tasks from activity counters", () => {
    const activity = Object.fromEntries(
      [0, 1, 2, 3, 4].map((i) => {
        const key = dateKey(day(i));
        return [key, { date: key, xp: 80, minutes: 30, reviews: 10, correct: 8, answered: 10, lessons: 1, counters: { planDone: 1, reading: 1, shadow: 1 } }];
      }),
    );
    const tasks = weeklyTasks(n5Learner({ activity }), day(5));
    expect(tasks.find((t) => t.id === "days")!.done).toBe(true);
    expect(tasks.find((t) => t.id === "plan")!.done).toBe(true);
    expect(tasks.find((t) => t.id === "speak")!.done).toBe(true);
    expect(tasks.find((t) => t.id === "listening")!.done).toBe(false);
  });

  it("flags milestones as behind when time has passed without reaching them", () => {
    const l = input({}, { createdAt: MONDAY.getTime() - 70 * DAY_MS });
    const ms = monthlyMilestones(l, MONDAY);
    expect(ms.find((m) => m.label === "Thuộc Hiragana")!.status).toBe("behind");
    expect(ms.find((m) => m.label.startsWith("Vượt cửa N1"))!.status).toBe("upcoming");
  });

  it("scales milestone months by daily study time", () => {
    const slow = monthlyMilestones(input({}, { dailyMinutes: 15 }), MONDAY);
    const fast = monthlyMilestones(input({}, { dailyMinutes: 60 }), MONDAY);
    const n3 = (list: typeof slow) => list.find((m) => m.label.startsWith("Vượt cửa N3"))!.month;
    expect(n3(slow)).toBeGreaterThan(n3(fast));
  });
});
