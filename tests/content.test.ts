import { describe, expect, it } from "vitest";
import { VOCABULARY } from "@/data/vocab";
import { GRAMMAR } from "@/data/grammar";
import { KANJI } from "@/data/kanji";
import { HIRAGANA, KATAKANA, kanaLessons } from "@/data/kana";
import { ARTICLES } from "@/data/reading";
import { LISTENING } from "@/data/listening";
import { STAGES } from "@/data/stages";
import { BUSINESS_MODULE } from "@/data/modules/business";
import { IT_MODULE } from "@/data/modules/it";
import { BRSE_MODULE } from "@/data/modules/brse";
import { parseRuby } from "@/lib/ruby";
import { stageContent } from "@/lib/stats";

const dupes = (xs: string[]) => xs.filter((x, i) => xs.indexOf(x) !== i);

describe("content integrity", () => {
  it("has unique ids", () => {
    expect(dupes(VOCABULARY.map((v) => v.id))).toEqual([]);
    expect(dupes(GRAMMAR.map((g) => g.id))).toEqual([]);
    expect(dupes(KANJI.map((k) => k.char))).toEqual([]);
    expect(dupes([...HIRAGANA, ...KATAKANA].map((k) => k.id))).toEqual([]);
    expect(dupes(ARTICLES.map((a) => a.id))).toEqual([]);
    expect(dupes(LISTENING.map((l) => l.id))).toEqual([]);
  });

  it("has complete kana tables", () => {
    expect(HIRAGANA.filter((k) => k.group === "basic")).toHaveLength(46);
    expect(HIRAGANA).toHaveLength(46 + 25 + 33);
    expect(KATAKANA.length).toBeGreaterThan(HIRAGANA.length);
    for (const k of [...HIRAGANA, ...KATAKANA].filter((k) => k.group === "basic")) {
      expect(k.strokes, k.char).toBeGreaterThan(0);
      expect(k.hint, k.char).toBeTruthy();
    }
    const lessonChars = kanaLessons("hiragana").flatMap((l) => l.chars);
    expect(lessonChars).toHaveLength(HIRAGANA.length);
  });

  it("vocabulary entries are complete", () => {
    expect(VOCABULARY.length).toBeGreaterThan(700);
    for (const v of VOCABULARY) {
      expect(v.kana, v.id).toBeTruthy();
      expect(v.meaning, v.id).toBeTruthy();
      expect(v.romaji, v.id).toMatch(/^[a-z' \-&.]+$/i);
      if (v.level !== "kana") {
        expect(v.example, v.id).toBeTruthy();
        expect(v.exampleVi, v.id).toBeTruthy();
      }
    }
  });

  it("grammar quizzes are well-formed", () => {
    for (const g of GRAMMAR) {
      expect(g.examples.length, g.id).toBeGreaterThan(0);
      if (!g.quiz) continue;
      expect(g.quiz.q, g.id).toContain("＿＿");
      expect(g.quiz.distractors, g.id).not.toContain(g.quiz.answer);
      expect(new Set(g.quiz.distractors).size, g.id).toBe(g.quiz.distractors.length);
    }
    for (const lvl of ["N5", "N4", "N3", "N2", "N1"]) expect(GRAMMAR.filter((g) => g.level === lvl).length).toBeGreaterThanOrEqual(8);
  });

  it("kanji entries are complete", () => {
    for (const k of KANJI) {
      expect(k.strokes, k.char).toBeGreaterThan(0);
      expect(k.onyomi.length + k.kunyomi.length, k.char).toBeGreaterThan(0);
      expect(k.examples.length, k.char).toBeGreaterThan(0);
      for (const e of k.examples) expect(e.reading, k.char).toBeTruthy();
    }
  });

  it("reading & listening questions point to valid options and ruby is balanced", () => {
    for (const a of [...ARTICLES, ...LISTENING]) {
      for (const q of a.questions) expect(q.answer, `${a.id}/${q.id}`).toBeLessThan(q.options.length);
    }
    for (const a of ARTICLES) {
      expect(a.translation.length, a.id).toBe(a.paragraphs.length);
      for (const p of a.paragraphs) {
        const plain = parseRuby(p)
          .filter((t) => t.type === "text")
          .map((t) => (t as { text: string }).text)
          .join("");
        expect(plain, a.id).not.toMatch(/[{}|]/);
      }
    }
  });

  it("every stage has learning material", () => {
    expect(STAGES).toHaveLength(12);
    for (const s of STAGES) {
      const c = stageContent(s);
      expect(c.vocab.length + c.kana.length, s.id).toBeGreaterThan(0);
      expect(c.grammar.length, s.id).toBeGreaterThan(0);
      expect(c.listening.length, s.id).toBeGreaterThan(0);
    }
  });

  it("module topics reference existing vocab tags", () => {
    for (const m of [BUSINESS_MODULE, IT_MODULE, BRSE_MODULE]) {
      for (const t of m.topics) {
        if (!t.vocabTag) continue;
        expect(
          VOCABULARY.some((v) => v.level === m.id && v.tags.includes(t.vocabTag!)),
          `${m.id}/${t.id}`,
        ).toBe(true);
      }
    }
  });
});
