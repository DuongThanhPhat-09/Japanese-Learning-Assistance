import type { Grade } from "@/types";

export const XP = {
  correctAnswer: 10,
  lessonComplete: 20,
  kanaLesson: 15,
  readingComplete: 25,
  listeningComplete: 25,
  examBase: 50,
  dailyGoalBonus: 30,
  /** Flat on purpose: paying more for "easy" rewards dishonest self-grading, which corrupts the schedule. */
  review: { again: 6, hard: 6, good: 6, easy: 6 } satisfies Record<Grade, number>,
} as const;

/** Speed bonus for a correct answer given within the response time (ms). */
export function speedBonus(ms: number): number {
  if (ms <= 3000) return 5;
  if (ms <= 6000) return 3;
  if (ms <= 10000) return 1;
  return 0;
}

/** Total XP needed to reach `level` (level 1 = 0 XP; L2 = 100; L3 = 300; L4 = 600 …). */
export function xpForLevel(level: number): number {
  return 50 * level * (level - 1);
}

export function levelFromXp(xp: number): number {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level++;
  return level;
}

export function levelProgress(xp: number) {
  const level = levelFromXp(xp);
  const base = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return { level, current: xp - base, needed: next - base, percent: Math.round(((xp - base) / (next - base)) * 100) };
}

/**
 * XP measures effort, not proficiency, so titles describe persistence.
 * Proficiency is only ever reported through stage gates (lib/engine.ts).
 */
const TITLES: [number, string][] = [
  [1, "見習い · Tập sự"],
  [3, "努力家 · Chăm chỉ"],
  [6, "継続 · Bền bỉ"],
  [10, "不屈 · Kiên định"],
  [15, "求道者 · Tận tâm"],
  [20, "鉄人 · Người thép"],
  [30, "達人 · Bậc thầy chuyên cần"],
  [45, "伝説 · Huyền thoại"],
];

export function levelTitle(level: number): string {
  let title = TITLES[0][1];
  for (const [min, t] of TITLES) if (level >= min) title = t;
  return title;
}

/** Quiz scoring: XP from correct answers + speed bonus, plus accuracy. */
export function scoreQuiz(answers: { correct: boolean; ms: number }[]) {
  let xp = 0;
  let correct = 0;
  let bonus = 0;
  for (const a of answers) {
    if (a.correct) {
      correct++;
      xp += XP.correctAnswer;
      bonus += speedBonus(a.ms);
    }
  }
  const accuracy = answers.length ? Math.round((correct / answers.length) * 100) : 0;
  const perfect = answers.length > 0 && correct === answers.length ? 20 : 0;
  return { correct, total: answers.length, accuracy, xp: xp + bonus + perfect, speedBonus: bonus, perfectBonus: perfect };
}
