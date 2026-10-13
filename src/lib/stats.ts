import type { DailyActivity, SrsCard, Stage } from "@/types";
import { VOCABULARY } from "@/data/vocab";
import { GRAMMAR } from "@/data/grammar";
import { KANJI, kanjiInWords } from "@/data/kanji";
import { HIRAGANA, KATAKANA } from "@/data/kana";
import { ARTICLES, ARTICLE_BY_ID } from "@/data/reading";
import { LISTENING, LISTENING_BY_ID } from "@/data/listening";
import { GRAMMAR_BY_ID } from "@/data/grammar";
import { computeStreak, lastNDays, longestStreak } from "./date";
import { cardId } from "./srs";
import { pct } from "./utils";

/** Item ids that belong to a stage, per category. */
export function stageContent(stage: Stage) {
  const pick = <T,>(ids: string[] | undefined, map: Map<string, T>) =>
    (ids ?? []).map((id) => map.get(id)).filter((x): x is T => !!x);
  const extraGrammar = pick(stage.extra?.grammar, GRAMMAR_BY_ID);
  const extraListening = pick(stage.extra?.listening, LISTENING_BY_ID);
  const extraArticles = pick(stage.extra?.articles, ARTICLE_BY_ID);
  if (stage.kana) {
    const chars = stage.kana === "hiragana" ? HIRAGANA : KATAKANA;
    const words = VOCABULARY.filter((v) => v.level === "kana" && v.tags.includes(stage.kana!));
    return {
      vocab: words,
      grammar: extraGrammar,
      kanji: [],
      kana: chars,
      articles: extraArticles,
      listening: extraListening,
    };
  }
  const vocab = VOCABULARY.filter((v) => stage.levels.includes(v.level));
  const jlpt = stage.levels.filter((l) => /^N\d$/.test(l));
  const kanji = jlpt.length ? KANJI.filter((k) => jlpt.includes(k.level)) : kanjiInWords(vocab.map((v) => v.kanji));
  return {
    vocab,
    grammar: [...extraGrammar, ...GRAMMAR.filter((g) => stage.levels.includes(g.level))],
    kanji,
    kana: [],
    articles: [...extraArticles, ...ARTICLES.filter((a) => stage.levels.includes(a.level))],
    listening: [...extraListening, ...LISTENING.filter((l) => stage.levels.includes(l.level))],
  };
}

export interface ProgressInput {
  cards: Record<string, SrsCard>;
  completed: Record<string, number>;
}

function started(cards: Record<string, SrsCard>, id: string) {
  const c = cards[id];
  return !!c && c.reps > 0;
}

/**
 * Exposure counts per category: items the learner has started (SRS) or completed.
 * This is "seen", not "learned" — level-up readiness lives in lib/engine.ts (stageGates).
 */
export function stageProgress(stage: Stage, { cards, completed }: ProgressInput) {
  const c = stageContent(stage);
  const vocab = c.vocab.filter((v) => started(cards, cardId("vocab", v.id))).length;
  const kanji = c.kanji.filter((k) => started(cards, cardId("kanji", k.char))).length;
  const grammar = c.grammar.filter((g) => completed[`grammar:${g.id}`] || started(cards, cardId("grammar", g.id))).length;
  const kana = c.kana.filter((k) => started(cards, cardId("kana", k.id))).length;
  const reading = c.articles.filter((a) => completed[`reading:${a.id}`]).length;
  const listening = c.listening.filter((l) => completed[`listening:${l.id}`]).length;
  const done = vocab + kanji + grammar + kana + reading + listening;
  const total = c.vocab.length + c.kanji.length + c.grammar.length + c.kana.length + c.articles.length + c.listening.length;
  return {
    percent: pct(done, total),
    vocab: { done: vocab, total: c.vocab.length },
    kanji: { done: kanji, total: c.kanji.length },
    grammar: { done: grammar, total: c.grammar.length },
    kana: { done: kana, total: c.kana.length },
    reading: { done: reading, total: c.articles.length },
    listening: { done: listening, total: c.listening.length },
  };
}


export interface LearnerStats {
  vocabLearned: number;
  vocabTotal: number;
  kanjiLearned: number;
  kanjiMastered: number;
  kanjiTotal: number;
  grammarCompleted: number;
  grammarTotal: number;
  kanaLearned: number;
  cardsMastered: number;
  totalMinutes: number;
  totalReviews: number;
  streak: number;
  longestStreak: number;
  accuracy: number;
  readingDone: number;
  listeningDone: number;
  activeDays: number;
}

export function computeStats(
  cards: Record<string, SrsCard>,
  completed: Record<string, number>,
  activity: Record<string, DailyActivity>,
  today = new Date(),
): LearnerStats {
  const list = Object.values(cards);
  const learned = (kind: string) => list.filter((c) => c.kind === kind && c.reps > 0);
  const kanjiCards = learned("kanji");
  const days = Object.values(activity);
  const activeSet = new Set(days.filter((d) => d.xp > 0 || d.minutes >= 1).map((d) => d.date));
  const answered = days.reduce((s, d) => s + d.answered, 0);
  const correct = days.reduce((s, d) => s + d.correct, 0);
  const keys = Object.keys(completed);
  return {
    vocabLearned: learned("vocab").length,
    vocabTotal: VOCABULARY.length,
    kanjiLearned: kanjiCards.length,
    kanjiMastered: kanjiCards.filter((c) => c.state === "mastered" || c.state === "review").length,
    kanjiTotal: KANJI.length,
    grammarCompleted: new Set([
      ...keys.filter((k) => k.startsWith("grammar:")).map((k) => k.slice(8)),
      ...learned("grammar").map((c) => c.itemId),
    ]).size,
    grammarTotal: GRAMMAR.length,
    kanaLearned: learned("kana").length,
    cardsMastered: list.filter((c) => c.state === "mastered").length,
    totalMinutes: Math.round(days.reduce((s, d) => s + d.minutes, 0)),
    totalReviews: days.reduce((s, d) => s + d.reviews, 0),
    streak: computeStreak(activeSet, today),
    longestStreak: longestStreak(activeSet),
    accuracy: pct(correct, answered),
    readingDone: keys.filter((k) => k.startsWith("reading:")).length,
    listeningDone: keys.filter((k) => k.startsWith("listening:")).length,
    activeDays: activeSet.size,
  };
}

export function emptyDay(date: string): DailyActivity {
  return { date, xp: 0, minutes: 0, reviews: 0, correct: 0, answered: 0, lessons: 0 };
}

/** Series for charts: last N days of activity. */
export function activitySeries(activity: Record<string, DailyActivity>, days: number, today = new Date()) {
  return lastNDays(days, today).map((date) => activity[date] ?? emptyDay(date));
}
