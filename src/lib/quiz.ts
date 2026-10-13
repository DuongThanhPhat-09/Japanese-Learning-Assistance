import type { Grammar, Kana, Kanji, Level, ListeningExercise, Vocab } from "@/types";
import { VOCABULARY } from "@/data/vocab";
import { GRAMMAR } from "@/data/grammar";
import { KANJI } from "@/data/kanji";
import { HIRAGANA, KATAKANA } from "@/data/kana";
import { LISTENING } from "@/data/listening";
import { rubyToKana, stripRuby } from "./ruby";
import { hasKanji } from "./romaji";
import { sample, seededRandom, shuffle, unique } from "./utils";

export type QuizType = "multiple-choice" | "fill-blank" | "matching" | "listening" | "kanji" | "correction" | "typing";

export const QUIZ_TYPE_LABEL: Record<QuizType, string> = {
  "multiple-choice": "Trắc nghiệm từ vựng",
  "fill-blank": "Điền vào chỗ trống",
  matching: "Ghép cặp",
  listening: "Nghe hiểu",
  kanji: "Nhận diện Kanji",
  correction: "Sửa lỗi ngữ pháp",
  typing: "Gõ romaji (Kana)",
};

export interface ChoiceQuestion {
  kind: "choice";
  type: QuizType;
  prompt: string;
  /** Large Japanese text shown above the options. */
  display?: string;
  /** Text read aloud (listening questions). */
  speak?: string;
  options: string[];
  answer: number;
  ref?: string;
  explanation?: string;
}

export interface MatchingQuestion {
  kind: "matching";
  type: "matching";
  prompt: string;
  pairs: [string, string][];
  ref?: string;
}

export interface TypingQuestion {
  kind: "typing";
  type: "typing";
  prompt: string;
  display: string;
  answerKana: string;
  answerRomaji: string;
  ref?: string;
}

export type Question = ChoiceQuestion | MatchingQuestion | TypingQuestion;

export interface QuizSource {
  vocab: Vocab[];
  grammar: Grammar[];
  kanji: Kanji[];
  kana: Kana[];
  listening: ListeningExercise[];
}

export function sourceForLevels(levels: Level[]): QuizSource {
  const jlpt = levels.filter((l) => /^N\d$/.test(l));
  return {
    vocab: VOCABULARY.filter((v) => levels.includes(v.level)),
    grammar: GRAMMAR.filter((g) => levels.includes(g.level) && g.quiz),
    kanji: KANJI.filter((k) => jlpt.includes(k.level)),
    kana: levels.includes("kana") ? [...HIRAGANA, ...KATAKANA] : [],
    listening: LISTENING.filter((l) => levels.includes(l.level)),
  };
}

function choice(correct: string, wrongPool: string[], rand: () => number, n = 3) {
  const wrong = sample(unique(wrongPool.filter((w) => w && w !== correct)), n, rand);
  const options = shuffle([correct, ...wrong], rand);
  return { options, answer: options.indexOf(correct) };
}

// ------------------------------------------------------------------ generators

function vocabQuestion(v: Vocab, pool: Vocab[], rand: () => number): ChoiceQuestion {
  const mode = rand();
  if (hasKanji(v.kanji) && mode < 0.4) {
    const { options, answer } = choice(v.kana, pool.map((p) => p.kana), rand);
    return { kind: "choice", type: "multiple-choice", prompt: "Chọn cách đọc đúng", display: v.kanji, options, answer, ref: `vocab:${v.id}`, explanation: `${v.kanji}（${v.kana}）: ${v.meaning}` };
  }
  if (mode < 0.75) {
    const { options, answer } = choice(v.meaning, pool.map((p) => p.meaning), rand);
    return { kind: "choice", type: "multiple-choice", prompt: "Từ này nghĩa là gì?", display: v.kanji, options, answer, ref: `vocab:${v.id}`, explanation: `${v.kanji}（${v.kana}）: ${v.meaning}` };
  }
  const { options, answer } = choice(v.kanji, pool.map((p) => p.kanji), rand);
  return { kind: "choice", type: "multiple-choice", prompt: `Từ nào có nghĩa “${v.meaning}”?`, options, answer, ref: `vocab:${v.id}`, explanation: `${v.kanji}（${v.kana}）` };
}

function grammarFill(g: Grammar, rand: () => number): ChoiceQuestion | null {
  if (!g.quiz) return null;
  const options = shuffle([g.quiz.answer, ...g.quiz.distractors], rand);
  return {
    kind: "choice",
    type: "fill-blank",
    prompt: "Chọn từ thích hợp điền vào chỗ trống",
    display: g.quiz.q,
    options,
    answer: options.indexOf(g.quiz.answer),
    ref: `grammar:${g.id}`,
    explanation: `${g.pattern}: ${g.meaning}`,
  };
}

function grammarCorrection(g: Grammar, rand: () => number): ChoiceQuestion | null {
  if (!g.quiz) return null;
  const fill = (x: string) => g.quiz!.q.replace("＿＿", x);
  const correct = fill(g.quiz.answer);
  const wrongs = g.quiz.distractors.map(fill);
  const options = shuffle([correct, ...wrongs.slice(0, 3)], rand);
  return {
    kind: "choice",
    type: "correction",
    prompt: "Câu nào đúng ngữ pháp?",
    options,
    answer: options.indexOf(correct),
    ref: `grammar:${g.id}`,
    explanation: `Mẫu ${g.pattern} — ${g.meaning}`,
  };
}

function kanjiQuestion(k: Kanji, pool: Kanji[], rand: () => number): ChoiceQuestion {
  if (rand() < 0.5) {
    const { options, answer } = choice(`${k.hanViet} — ${k.meaning}`, pool.map((p) => `${p.hanViet} — ${p.meaning}`), rand);
    return { kind: "choice", type: "kanji", prompt: "Chữ Hán này có nghĩa là gì?", display: k.char, options, answer, ref: `kanji:${k.char}`, explanation: `${k.char}: On ${k.onyomi.join("・")} / Kun ${k.kunyomi.join("・") || "—"}` };
  }
  const ex = k.examples[0];
  const { options, answer } = choice(ex.reading, pool.flatMap((p) => p.examples.map((e) => e.reading)), rand);
  return { kind: "choice", type: "kanji", prompt: "Chọn cách đọc của từ", display: ex.word, options, answer, ref: `kanji:${k.char}`, explanation: `${ex.word}（${ex.reading}）: ${ex.meaning}` };
}

function listeningQuestions(source: QuizSource, vocab: Vocab[], rand: () => number, n: number): ChoiceQuestion[] {
  const out: ChoiceQuestion[] = [];
  for (const ex of shuffle(source.listening, rand)) {
    const speak = ex.lines.map((l) => rubyToKana(l.jp)).join("。");
    for (const q of ex.questions) {
      out.push({ kind: "choice", type: "listening", prompt: q.prompt, speak, options: q.options, answer: q.answer, ref: `listening:${ex.id}` });
    }
  }
  // Word-level dictation: hear a word, choose the meaning.
  for (const v of shuffle(vocab, rand).slice(0, n)) {
    const { options, answer } = choice(v.meaning, vocab.map((p) => p.meaning), rand);
    out.push({ kind: "choice", type: "listening", prompt: "Nghe và chọn nghĩa đúng", speak: v.kana, options, answer, ref: `vocab:${v.id}`, explanation: `${v.kanji}（${v.kana}）` });
  }
  return shuffle(out, rand).slice(0, n);
}

function matchingQuestion(vocab: Vocab[], rand: () => number): MatchingQuestion | null {
  const picks = sample(vocab, 5, rand);
  if (picks.length < 3) return null;
  return { kind: "matching", type: "matching", prompt: "Ghép từ với nghĩa tương ứng", pairs: picks.map((v) => [v.kanji, v.meaning]) };
}

function typingQuestion(text: string, prompt: string, ref?: string, romaji?: string): TypingQuestion {
  return { kind: "typing", type: "typing", prompt, display: text, answerKana: text, answerRomaji: romaji ?? "", ref };
}

export interface BuildQuizOptions {
  source: QuizSource;
  types: QuizType[];
  count: number;
  seed?: number;
}

/** Builds a mixed quiz from the selected question types, distributing count evenly. */
export function buildQuiz({ source, types, count, seed }: BuildQuizOptions): Question[] {
  const rand = seed === undefined ? Math.random : seededRandom(seed);
  const vocab = source.vocab;
  const perType = Math.max(1, Math.ceil(count / types.length));
  const out: Question[] = [];
  for (const t of types) {
    const batch: Question[] = [];
    switch (t) {
      case "multiple-choice":
        for (const v of sample(vocab, perType, rand)) batch.push(vocabQuestion(v, vocab, rand));
        break;
      case "fill-blank":
        for (const g of sample(source.grammar, perType, rand)) {
          const q = grammarFill(g, rand);
          if (q) batch.push(q);
        }
        break;
      case "correction":
        for (const g of sample(source.grammar, perType, rand)) {
          const q = grammarCorrection(g, rand);
          if (q) batch.push(q);
        }
        break;
      case "kanji":
        for (const k of sample(source.kanji, perType, rand)) batch.push(kanjiQuestion(k, source.kanji.length >= 4 ? source.kanji : KANJI, rand));
        break;
      case "listening":
        batch.push(...listeningQuestions(source, vocab, rand, perType));
        break;
      case "matching": {
        const rounds = Math.max(1, Math.round(perType / 3));
        for (let i = 0; i < rounds; i++) {
          const q = matchingQuestion(vocab, rand);
          if (q) batch.push(q);
        }
        break;
      }
      case "typing": {
        if (source.kana.length) {
          for (const k of sample(source.kana, perType, rand)) batch.push(typingQuestion(k.char, "Gõ romaji của ký tự", `kana:${k.id}`, k.romaji));
        } else {
          for (const v of sample(vocab.filter((v) => v.kana.length <= 8), perType, rand))
            batch.push(typingQuestion(v.kana, `Gõ romaji cho từ “${v.meaning}”`, `vocab:${v.id}`, v.romaji));
        }
        break;
      }
    }
    out.push(...batch);
  }
  return shuffle(out, rand).slice(0, Math.max(count, types.includes("matching") ? 1 : 0));
}

/** All quiz types that have enough material in a source. */
export function availableTypes(source: QuizSource): QuizType[] {
  const t: QuizType[] = [];
  if (source.vocab.length >= 4) t.push("multiple-choice", "matching");
  if (source.grammar.length) t.push("fill-blank", "correction");
  if (source.kanji.length) t.push("kanji");
  if (source.vocab.length >= 4 || source.listening.length) t.push("listening");
  if (source.kana.length || source.vocab.length) t.push("typing");
  return t;
}

export { stripRuby };
