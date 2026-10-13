import type { Difficulty, Level, Vocab } from "@/types";
import { kanaToRomaji } from "@/lib/romaji";
import { HIRAGANA_WORDS, KATAKANA_WORDS } from "../kana";
import type { VocabGroup } from "./types";
import { INTRO } from "./intro";
import { N5 } from "./n5";
import { N4 } from "./n4";
import { N3 } from "./n3";
import { N2 } from "./n2";
import { N1 } from "./n1";
import { BUSINESS } from "./business";
import { IT } from "./it";
import { BRSE } from "./brse";
import { NATIVE } from "./native";

export { POS_LABEL } from "./types";

const DIFFICULTY: Record<Level, Difficulty> = {
  intro: 1, kana: 1, N5: 1, N4: 2, N3: 3, N2: 4, N1: 5, business: 4, it: 3, brse: 4, native: 5,
};

function expand(level: Level, groups: VocabGroup[]): Vocab[] {
  return groups.flatMap(({ tag, items }) =>
    items.map(([kanji, kana, meaning, pos, example, exampleVi]) => ({
      id: `${level}:${kanji}`,
      level,
      kanji,
      kana,
      romaji: kanaToRomaji(kana),
      meaning,
      pos,
      example,
      exampleVi,
      difficulty: DIFFICULTY[level],
      tags: [tag],
    })),
  );
}

const KANA_VOCAB: Vocab[] = [
  ...HIRAGANA_WORDS.map(([w, m]) => ({ w, m, tag: "hiragana" })),
  ...KATAKANA_WORDS.map(([w, m]) => ({ w, m, tag: "katakana" })),
].map(({ w, m, tag }) => ({
  id: `kana:${w}`,
  level: "kana" as const,
  kanji: w,
  kana: w,
  romaji: kanaToRomaji(w),
  meaning: m,
  pos: tag === "katakana" ? "kata" : "n",
  example: "",
  exampleVi: "",
  difficulty: 1 as const,
  tags: [tag],
}));

export const VOCABULARY: Vocab[] = [
  ...expand("intro", INTRO),
  ...KANA_VOCAB,
  ...expand("N5", N5),
  ...expand("N4", N4),
  ...expand("N3", N3),
  ...expand("N2", N2),
  ...expand("N1", N1),
  ...expand("business", BUSINESS),
  ...expand("it", IT),
  ...expand("brse", BRSE),
  ...expand("native", NATIVE),
];

export const VOCAB_BY_ID = new Map(VOCABULARY.map((v) => [v.id, v]));

export const ALL_TAGS = Array.from(new Set(VOCABULARY.flatMap((v) => v.tags))).sort();

export function vocabByLevel(levels: Level[]): Vocab[] {
  return VOCABULARY.filter((v) => levels.includes(v.level));
}

export function vocabByTag(level: Level, tag: string): Vocab[] {
  return VOCABULARY.filter((v) => v.level === level && v.tags.includes(tag));
}

/** Best-effort lookup of a surface form (used by reading popups). */
export function lookupWord(surface: string): Vocab | undefined {
  return VOCABULARY.find((v) => v.kanji === surface) ?? VOCABULARY.find((v) => v.kana === surface);
}
