import type { JlptLevel, Kanji } from "@/types";
import type { KanjiTuple } from "./types";
import { N5_KANJI } from "./n5";
import { N4_KANJI } from "./n4";
import { N3_KANJI } from "./n3";
import { N1_KANJI, N2_KANJI } from "./n2n1";

const split = (s: string) => s.split(" ").filter(Boolean);

function expand(level: JlptLevel, rows: KanjiTuple[]): Kanji[] {
  return rows.map(([char, hanViet, meaning, on, kun, strokes, radicals, examples, sJp, sVi, hint]) => ({
    char,
    level,
    hanViet,
    meaning,
    onyomi: split(on),
    kunyomi: split(kun),
    strokes,
    radicals: split(radicals),
    examples: examples
      .split(";")
      .filter(Boolean)
      .map((e) => {
        const [word, reading, m] = e.split("|");
        return { word, reading, meaning: m };
      }),
    sentence: { jp: sJp, vi: sVi },
    hint,
  }));
}

export const KANJI: Kanji[] = [
  ...expand("N5", N5_KANJI),
  ...expand("N4", N4_KANJI),
  ...expand("N3", N3_KANJI),
  ...expand("N2", N2_KANJI),
  ...expand("N1", N1_KANJI),
];

export const KANJI_BY_CHAR = new Map(KANJI.map((k) => [k.char, k]));

export function kanjiByLevel(levels: string[]): Kanji[] {
  return KANJI.filter((k) => levels.includes(k.level));
}

/** Kanji appearing in a set of words (used for domain stages such as IT / Business). */
export function kanjiInWords(words: string[]): Kanji[] {
  const chars = new Set(words.join("").split(""));
  return KANJI.filter((k) => chars.has(k.char));
}
