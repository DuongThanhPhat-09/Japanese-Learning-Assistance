import { describe, expect, it } from "vitest";
import { availableTypes, buildQuiz, sourceForLevels } from "@/lib/quiz";
import { buildMockExam, gradeExam, recommendedTopics, weaknessReport } from "@/lib/exam";

describe("quiz engine", () => {
  const source = sourceForLevels(["N5"]);
  it("offers every quiz type for N5", () => {
    expect(availableTypes(source)).toEqual(
      expect.arrayContaining(["multiple-choice", "fill-blank", "matching", "listening", "kanji", "correction", "typing"]),
    );
  });
  it("builds deterministic quizzes with valid answers", () => {
    const types = ["multiple-choice", "fill-blank", "kanji", "correction"] as const;
    const a = buildQuiz({ source, types: [...types], count: 12, seed: 42 });
    const b = buildQuiz({ source, types: [...types], count: 12, seed: 42 });
    expect(a).toEqual(b);
    expect(a).toHaveLength(12);
    for (const q of a) {
      if (q.kind !== "choice") continue;
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(new Set(q.options).size).toBe(q.options.length);
    }
  });
  it("builds kana typing questions", () => {
    const qs = buildQuiz({ source: sourceForLevels(["kana"]), types: ["typing"], count: 5, seed: 1 });
    expect(qs.every((q) => q.kind === "typing")).toBe(true);
  });
});

describe("mock exams", () => {
  it.each(["N5", "N4", "N3", "N2", "N1"] as const)("generates a %s paper with all sections", (level) => {
    const exam = buildMockExam(level, `${level}-test`);
    const sections = new Set(exam.questions.map((q) => q.section));
    expect(sections).toEqual(new Set(["vocabulary", "kanji", "grammar", "reading", "listening"]));
    expect(new Set(exam.questions.map((q) => q.id)).size).toBe(exam.questions.length);
  });

  it("grades, reports weaknesses and recommends topics", () => {
    const exam = buildMockExam("N5", "grade-test");
    const answers = Object.fromEntries(exam.questions.map((q) => [q.id, q.section === "grammar" ? -1 : q.answer]));
    const r = gradeExam(exam, answers, 600);
    expect(r.sections.grammar.correct).toBe(0);
    expect(r.passed).toBe(false); // grammar section below 1/3
    expect(weaknessReport(r)[0].section).toBe("grammar");
    const topics = recommendedTopics(r.wrongRefs);
    expect(topics.length).toBeGreaterThan(0);
    expect(topics.some((t) => t.label.startsWith("Ngữ pháp"))).toBe(true);
  });
});
