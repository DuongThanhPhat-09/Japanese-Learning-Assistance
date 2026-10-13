import type { ExamQuestion, ExamResult, ExamSection, JlptLevel, MockExam } from "@/types";
import { VOCABULARY } from "@/data/vocab";
import { GRAMMAR, GRAMMAR_BY_ID } from "@/data/grammar";
import { KANJI } from "@/data/kanji";
import { ARTICLES } from "@/data/reading";
import { LISTENING } from "@/data/listening";
import { hasKanji } from "./romaji";
import { sample, seededRandom, shuffle, unique, hashString } from "./utils";

export const EXAM_CONFIG: Record<JlptLevel, { minutes: number; passMark: number; counts: Record<ExamSection, number> }> = {
  N5: { minutes: 25, passMark: 60, counts: { vocabulary: 8, kanji: 6, grammar: 8, reading: 4, listening: 4 } },
  N4: { minutes: 30, passMark: 60, counts: { vocabulary: 8, kanji: 6, grammar: 8, reading: 4, listening: 4 } },
  N3: { minutes: 35, passMark: 60, counts: { vocabulary: 8, kanji: 6, grammar: 8, reading: 5, listening: 4 } },
  N2: { minutes: 40, passMark: 65, counts: { vocabulary: 8, kanji: 6, grammar: 8, reading: 5, listening: 3 } },
  N1: { minutes: 45, passMark: 65, counts: { vocabulary: 8, kanji: 6, grammar: 8, reading: 5, listening: 3 } },
};

export const SECTION_LABEL: Record<ExamSection, string> = {
  vocabulary: "Từ vựng (語彙)",
  kanji: "Chữ Hán (漢字)",
  grammar: "Ngữ pháp (文法)",
  reading: "Đọc hiểu (読解)",
  listening: "Nghe hiểu (聴解)",
};

function opts(correct: string, pool: string[], rand: () => number) {
  const options = shuffle([correct, ...sample(unique(pool.filter((p) => p && p !== correct)), 3, rand)], rand);
  return { options, answer: options.indexOf(correct) };
}

/**
 * Generates a mock exam from the content database. Pass a seed for a
 * reproducible paper (e.g. "N3-paper-1"); without one a fresh paper is drawn.
 */
export function buildMockExam(level: JlptLevel, seed: string | number = Date.now()): MockExam {
  const rand = seededRandom(typeof seed === "number" ? seed : hashString(seed));
  const cfg = EXAM_CONFIG[level];
  const vocab = VOCABULARY.filter((v) => v.level === level);
  const kanji = KANJI.filter((k) => k.level === level);
  const grammar = GRAMMAR.filter((g) => g.level === level && g.quiz);
  const questions: ExamQuestion[] = [];

  sample(vocab, cfg.counts.vocabulary, rand).forEach((v, i) => {
    const reading = hasKanji(v.kanji) && i % 2 === 0;
    const { options, answer } = reading
      ? opts(v.kana, vocab.map((x) => x.kana), rand)
      : opts(v.meaning, vocab.map((x) => x.meaning), rand);
    questions.push({
      id: `v${i}`,
      section: "vocabulary",
      prompt: reading ? `「${v.kanji}」の読み方として正しいものはどれですか。` : `「${v.kanji}」の意味はどれですか。`,
      options,
      answer,
      ref: `vocab:${v.id}`,
      explanation: `${v.kanji}（${v.kana}）: ${v.meaning}`,
    });
  });

  sample(kanji, cfg.counts.kanji, rand).forEach((k, i) => {
    const ex = k.examples[i % k.examples.length];
    const { options, answer } = opts(ex.reading, kanji.flatMap((x) => x.examples.map((e) => e.reading)), rand);
    questions.push({
      id: `k${i}`,
      section: "kanji",
      prompt: `「${ex.word}」の読み方はどれですか。`,
      options,
      answer,
      ref: `kanji:${k.char}`,
      explanation: `${ex.word}（${ex.reading}）: ${ex.meaning} — ${k.char} ${k.hanViet}`,
    });
  });

  sample(grammar, cfg.counts.grammar, rand).forEach((g, i) => {
    const q = g.quiz!;
    const options = shuffle([q.answer, ...q.distractors], rand);
    questions.push({
      id: `g${i}`,
      section: "grammar",
      prompt: `（　）に入れるのに最もよいものを選びなさい。\n${q.q.replace("＿＿", "（　）")}`,
      options,
      answer: options.indexOf(q.answer),
      ref: `grammar:${g.id}`,
      explanation: `${g.pattern}: ${g.meaning}`,
    });
  });

  const readingQs = ARTICLES.filter((a) => a.level === level).flatMap((a) =>
    a.questions.map((q) => ({ ...q, id: `r-${a.id}-${q.id}`, section: "reading" as const, passage: a.id, ref: `reading:${a.id}` })),
  );
  questions.push(...sample(readingQs, cfg.counts.reading, rand));

  const listeningQs = LISTENING.filter((l) => l.level === level || (level === "N2" && l.level === "business")).flatMap((l) =>
    l.questions.map((q) => ({ ...q, id: `l-${l.id}-${q.id}`, section: "listening" as const, audioLines: l.lines, ref: `listening:${l.id}` })),
  );
  questions.push(...sample(listeningQs, cfg.counts.listening, rand));

  return { level, minutes: cfg.minutes, passMark: cfg.passMark, questions };
}

const SECTIONS: ExamSection[] = ["vocabulary", "kanji", "grammar", "reading", "listening"];

export function gradeExam(exam: MockExam, answers: Record<string, number>, seconds: number): Omit<ExamResult, "id" | "date"> {
  const sections = Object.fromEntries(SECTIONS.map((s) => [s, { correct: 0, total: 0 }])) as ExamResult["sections"];
  const wrongRefs: string[] = [];
  let correct = 0;
  for (const q of exam.questions) {
    sections[q.section].total++;
    if (answers[q.id] === q.answer) {
      correct++;
      sections[q.section].correct++;
    } else if (q.ref) wrongRefs.push(q.ref);
  }
  const score = exam.questions.length ? Math.round((correct / exam.questions.length) * 100) : 0;
  // JLPT also requires a minimum per section; here: at least 1/3 in each non-empty section.
  const sectionOk = SECTIONS.every((s) => sections[s].total === 0 || sections[s].correct / sections[s].total >= 1 / 3);
  return { level: exam.level, score, passed: score >= exam.passMark && sectionOk, seconds, sections, wrongRefs: unique(wrongRefs) };
}

export interface Weakness {
  section: ExamSection;
  accuracy: number;
  advice: string;
}

const ADVICE: Record<ExamSection, string> = {
  vocabulary: "Ôn từ vựng bằng SRS mỗi ngày, ưu tiên thẻ “Yếu” và học theo chủ đề.",
  kanji: "Học chữ Hán theo âm Hán Việt + bộ thủ, luyện đọc từ ghép chứa chữ đó.",
  grammar: "Xem lại phần so sánh mẫu ngữ pháp và luyện dạng “Sửa lỗi ngữ pháp”.",
  reading: "Đọc mỗi ngày một bài, bật bộ đếm giờ, tắt furigana dần dần.",
  listening: "Nghe lặp lại hội thoại, nhại theo (shadowing) và luyện quiz nghe.",
};

/** Sections sorted from weakest to strongest, with study advice. */
export function weaknessReport(result: Pick<ExamResult, "sections">): Weakness[] {
  return SECTIONS.filter((s) => result.sections[s].total > 0)
    .map((s) => ({ section: s, accuracy: Math.round((result.sections[s].correct / result.sections[s].total) * 100), advice: ADVICE[s] }))
    .sort((a, b) => a.accuracy - b.accuracy);
}

/** Converts wrong-answer refs into human-readable review topics with links. */
export function recommendedTopics(refs: string[]): { label: string; href: string }[] {
  return refs.slice(0, 12).map((ref) => {
    const [kind, ...rest] = ref.split(":");
    const id = rest.join(":");
    switch (kind) {
      case "grammar": {
        const g = GRAMMAR_BY_ID.get(id);
        return { label: `Ngữ pháp: ${g?.pattern ?? id}`, href: `/grammar/?id=${encodeURIComponent(id)}` };
      }
      case "kanji":
        return { label: `Chữ Hán: ${id}`, href: `/kanji/?char=${encodeURIComponent(id)}` };
      case "vocab": {
        const v = VOCABULARY.find((x) => x.id === id);
        return { label: `Từ vựng: ${v ? `${v.kanji}（${v.kana}）` : id}`, href: `/vocabulary/?q=${encodeURIComponent(v?.kanji ?? id)}` };
      }
      case "reading":
        return { label: `Bài đọc: ${ARTICLES.find((a) => a.id === id)?.titleVi ?? id}`, href: `/reading/?id=${encodeURIComponent(id)}` };
      case "listening":
        return { label: `Bài nghe: ${LISTENING.find((l) => l.id === id)?.titleVi ?? id}`, href: `/listening/?id=${encodeURIComponent(id)}` };
      default:
        return { label: ref, href: "/" };
    }
  });
}
