import { describe, expect, it } from "vitest";
import { buildDemoData } from "@/lib/demo";
import { computeStats, stageProgress } from "@/lib/stats";
import { mainFrontier } from "@/lib/engine";
import { STAGES } from "@/data/stages";
import { ACHIEVEMENTS } from "@/data/achievements";
import { levelFromXp } from "@/lib/xp";

describe("demo data & stats", () => {
  const now = new Date(2026, 9, 13, 12);
  const demo = buildDemoData(now);
  const stats = computeStats(demo.cards, demo.completed, demo.activity, now);

  it("is deterministic", () => {
    const again = buildDemoData(now);
    expect(Object.keys(again.cards)).toEqual(Object.keys(demo.cards));
    expect(again.xp).toBe(demo.xp);
  });

  it("produces a believable learner profile", () => {
    expect(stats.streak).toBeGreaterThanOrEqual(12);
    expect(stats.vocabLearned).toBeGreaterThan(100);
    expect(stats.kanjiLearned).toBe(60);
    expect(stats.grammarCompleted).toBe(16);
    expect(stats.accuracy).toBeGreaterThan(50);
    expect(demo.examResults[0].date).toBeGreaterThan(demo.examResults[1].date);
  });

  it("computes stage progress and the current stage", () => {
    const input = { cards: demo.cards, completed: demo.completed };
    expect(stageProgress(STAGES[1], input).kana.done).toBe(104);
    expect(stageProgress(STAGES[7], input).percent).toBe(0);
    const engineInput = { ...input, scores: demo.scores, activity: demo.activity, examResults: demo.examResults, itemStats: demo.itemStats, profile: demo.profile };
    expect(mainFrontier(engineInput, now).order).toBeLessThanOrEqual(3);
  });

  it("unlocks some (not all) achievements", () => {
    const ctx = { stats, xp: demo.xp, level: levelFromXp(demo.xp), examsPassed: 1, examsTaken: 2, challengeBest: demo.challengeBest, notes: demo.notes.length, dictionary: demo.dictionary.length };
    const unlocked = ACHIEVEMENTS.filter((a) => a.check(ctx));
    expect(unlocked.length).toBeGreaterThan(5);
    expect(unlocked.length).toBeLessThan(ACHIEVEMENTS.length);
  });
});
