import type { DailyActivity, SrsCard } from "@/types";
import type { AppData } from "@/store/useAppStore";
import { initialData } from "@/store/useAppStore";
import { VOCABULARY } from "@/data/vocab";
import { KANJI } from "@/data/kanji";
import { GRAMMAR } from "@/data/grammar";
import { HIRAGANA, KATAKANA } from "@/data/kana";
import { addDays, dateKey } from "./date";
import { newCard, reviewCard } from "./srs";
import { seededRandom, uid } from "./utils";

/**
 * Builds a realistic demo profile: ~6 weeks of activity, kana learned,
 * N5 vocabulary/kanji in various SRS states, some exams, notes and goals.
 * Deterministic (seeded) so screenshots and tests are reproducible.
 */
export function buildDemoData(now = new Date()): AppData {
  const rand = seededRandom(20260101);
  const data = initialData();
  data.profile = { ...data.profile, name: "Minh Anh", createdAt: addDays(now, -45).getTime() };

  // Activity: most days active, with a current streak of ~12 days.
  const activity: Record<string, DailyActivity> = {};
  let xp = 0;
  for (let i = 44; i >= 0; i--) {
    const skip = i > 12 && rand() < 0.2;
    if (skip) continue;
    const key = dateKey(addDays(now, -i));
    const answered = Math.round(20 + rand() * 60);
    const correct = Math.round(answered * (0.65 + rand() * 0.3));
    const dayXp = Math.round(60 + rand() * 120);
    xp += dayXp;
    const reviews = Math.round(answered * 0.6);
    const srsPass = Math.round(reviews * (0.8 + rand() * 0.12));
    activity[key] = {
      date: key,
      xp: dayXp,
      minutes: Math.round(15 + rand() * 45),
      reviews,
      correct,
      answered,
      lessons: Math.round(rand() * 3),
      counters: { srsPass, srsFail: reviews - srsPass, learned: Math.round(rand() * 10), shadow: rand() < 0.4 ? 1 : 0, recall: rand() < 0.4 ? 1 : 0, planDone: rand() < 0.5 ? 1 : 0 },
    };
  }

  // SRS cards with different histories.
  const cards: Record<string, SrsCard> = {};
  const t0 = addDays(now, -40).getTime();
  const study = (c: SrsCard, goods: number) => {
    let card = c;
    let t = t0 + rand() * 10 * 864e5;
    for (let i = 0; i < goods; i++) {
      card = reviewCard(card, rand() < 0.12 ? "again" : rand() < 0.2 ? "easy" : "good", t);
      t = Math.min(card.due, now.getTime() - 3600e3);
    }
    return card;
  };
  [...HIRAGANA, ...KATAKANA.slice(0, 60)].forEach((k) => (cards[`kana:${k.id}`] = study(newCard("kana", k.id, t0), 3 + Math.floor(rand() * 4))));
  VOCABULARY.filter((v) => v.level === "intro" || v.level === "N5").slice(0, 160).forEach((v, i) => {
    cards[`vocab:${v.id}`] = i > 140 ? newCard("vocab", v.id, t0) : study(newCard("vocab", v.id, t0), 1 + Math.floor(rand() * 5));
  });
  KANJI.filter((k) => k.level === "N5").slice(0, 60).forEach((k) => (cards[`kanji:${k.char}`] = study(newCard("kanji", k.char, t0), 1 + Math.floor(rand() * 4))));

  const completed: Record<string, number> = {};
  GRAMMAR.filter((g) => g.level === "N5").slice(0, 16).forEach((g) => (completed[`grammar:${g.id}`] = t0));
  ["hiragana-basic-1", "hiragana-basic-2", "hiragana-basic-3", "hiragana-basic-4", "hiragana-basic-5", "hiragana-basic-6", "hiragana-basic-7", "hiragana-basic-8", "hiragana-basic-9", "hiragana-dakuten", "hiragana-yoon", "katakana-basic-1", "katakana-basic-2", "katakana-basic-3"].forEach((l) => (completed[`kana-lesson:${l}`] = t0));
  ["n5-my-day", "n5-weekend"].forEach((a) => (completed[`reading:${a}`] = t0));
  ["l-n5-shop", "l-n5-weekend"].forEach((l) => (completed[`listening:${l}`] = t0));
  completed["intro:orientation"] = t0;

  const today = dateKey(now);
  return {
    ...data,
    xp,
    activity,
    cards,
    completed,
    favorites: VOCABULARY.filter((v) => v.level === "N5").slice(0, 8).map((v) => v.id),
    // Newest first, matching recordExam().
    examResults: [
      { id: uid("exam-"), level: "N5", date: addDays(now, -5).getTime(), score: 73, passed: true, seconds: 1185, sections: { vocabulary: { correct: 7, total: 8 }, kanji: { correct: 4, total: 6 }, grammar: { correct: 5, total: 8 }, reading: { correct: 3, total: 4 }, listening: { correct: 3, total: 4 } }, wrongRefs: ["grammar:n5-14"] },
      { id: uid("exam-"), level: "N5", date: addDays(now, -20).getTime(), score: 54, passed: false, seconds: 1320, sections: { vocabulary: { correct: 5, total: 8 }, kanji: { correct: 3, total: 6 }, grammar: { correct: 4, total: 8 }, reading: { correct: 2, total: 4 }, listening: { correct: 2, total: 4 } }, wrongRefs: ["grammar:n5-07", "kanji:曜"] },
    ],
    quizHistory: [{ date: addDays(now, -1).getTime(), mode: "custom:N5", correct: 8, total: 10, xp: 102 }],
    challengeBest: 17,
    tasks: [
      { id: uid("task-"), date: today, title: "Ôn tập SRS", category: "review", minutes: 15, done: true },
      { id: uid("task-"), date: today, title: "Học 10 từ N5 chủ đề thời gian", category: "vocabulary", minutes: 15, done: false },
      { id: uid("task-"), date: dateKey(addDays(now, 1)), title: "Ngữ pháp: ～たことがあります", category: "grammar", minutes: 20, done: false },
      { id: uid("task-"), date: dateKey(addDays(now, 2)), title: "Thi thử N5", category: "exam", minutes: 30, done: false },
    ],
    goals: [
      { id: uid("goal-"), title: "Đỗ JLPT N4 tháng 12", target: 300, current: 168, unit: "từ vựng", deadline: dateKey(addDays(now, 60)), createdAt: t0 },
      { id: uid("goal-"), title: "Học 100 chữ Hán", target: 100, current: 60, unit: "chữ", createdAt: t0 },
    ],
    notes: [
      { id: uid("note-"), title: "Phân biệt は và が", body: "は: chủ đề (thông tin đã biết)\nが: chủ ngữ / thông tin mới\n\n例：私は学生です。\n誰が来ましたか。— 田中さんが来ました。", tags: ["n5", "ngữ pháp"], createdAt: t0, updatedAt: t0 },
      { id: uid("note-"), title: "Mẹo nhớ Katakana dễ nhầm", body: "シ (shi): nét chấm nằm ngang, nét cuối hất từ dưới lên\nツ (tsu): nét chấm dọc, nét cuối từ trên xuống\nソ (so) vs ン (n): tương tự", tags: ["katakana"], createdAt: t0, updatedAt: t0 },
    ],
    dictionary: [
      { id: uid("dict-"), word: "締め切り", reading: "しめきり", meaning: "hạn chót", example: "締め切りは金曜日です。", tags: ["công việc"], createdAt: t0 },
      { id: uid("dict-"), word: "お疲れ様です", reading: "おつかれさまです", meaning: "anh/chị vất vả rồi (chào đồng nghiệp)", tags: ["công việc"], createdAt: t0 },
    ],
    achievements: {},
    profile: { ...data.profile, name: "Minh Anh", createdAt: addDays(now, -45).getTime(), track: "brse", dailyMinutes: 30 },
    scores: { "reading:n5-my-day": 100, "reading:n5-weekend": 50, "listening:l-n5-shop": 100, "listening:l-n5-weekend": 100 },
    itemStats: Object.fromEntries(HIRAGANA.slice(0, 46).map((k, i) => [`kana:${k.id}`, { ok: 1 + (i % 3), bad: i % 7 === 0 ? 1 : 0, last: t0 }])),
    plan: null,
    planDone: {},
  };
}
