import { describe, expect, it } from "vitest";
import { levelFromXp, levelProgress, scoreQuiz, speedBonus, xpForLevel } from "@/lib/xp";

describe("XP & levels", () => {
  it("uses a growing level curve", () => {
    expect(xpForLevel(1)).toBe(0);
    expect(xpForLevel(2)).toBe(100);
    expect(xpForLevel(3)).toBe(300);
    expect(levelFromXp(0)).toBe(1);
    expect(levelFromXp(99)).toBe(1);
    expect(levelFromXp(100)).toBe(2);
    expect(levelFromXp(650)).toBe(4);
  });

  it("reports progress within a level", () => {
    expect(levelProgress(200)).toEqual({ level: 2, current: 100, needed: 200, percent: 50 });
  });

  it("scores quizzes with speed and perfect bonuses", () => {
    expect(speedBonus(2000)).toBe(5);
    expect(speedBonus(20000)).toBe(0);
    const r = scoreQuiz([
      { correct: true, ms: 2000 },
      { correct: true, ms: 12000 },
    ]);
    expect(r.accuracy).toBe(100);
    expect(r.xp).toBe(10 + 10 + 5 + 0 + 20);
    const r2 = scoreQuiz([
      { correct: true, ms: 5000 },
      { correct: false, ms: 1000 },
    ]);
    expect(r2.accuracy).toBe(50);
    expect(r2.perfectBonus).toBe(0);
    expect(r2.xp).toBe(13);
  });
});
