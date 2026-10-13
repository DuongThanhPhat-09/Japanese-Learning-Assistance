import type { DictEntry, SrsCard } from "@/types";
import { VOCAB_BY_ID } from "@/data/vocab";
import { KANJI_BY_CHAR } from "@/data/kanji";
import { GRAMMAR_BY_ID } from "@/data/grammar";
import { HIRAGANA, KATAKANA } from "@/data/kana";
import { hanViet } from "./hanviet";

const KANA_BY_ID = new Map([...HIRAGANA, ...KATAKANA].map((k) => [k.id, k]));

export interface CardFace {
  front: string;
  frontHint?: string;
  reading?: string;
  back: string;
  details?: string[];
  speak?: string;
  label: string;
}

/** Resolves an SRS card into displayable front/back faces. */
export function resolveCard(card: SrsCard, dictionary: DictEntry[] = []): CardFace | null {
  switch (card.kind) {
    case "vocab": {
      const v = VOCAB_BY_ID.get(card.itemId);
      if (!v) return null;
      return {
        front: v.kanji,
        reading: v.kanji !== v.kana ? v.kana : undefined,
        back: v.meaning,
        details: [hanViet(v.kanji) && `Hán Việt: ${hanViet(v.kanji)!.reading}`, v.romaji, v.example && `${v.example} — ${v.exampleVi}`].filter(Boolean) as string[],
        speak: v.kana,
        label: "Từ vựng",
      };
    }
    case "kanji": {
      const k = KANJI_BY_CHAR.get(card.itemId);
      if (!k) return null;
      return {
        front: k.char,
        reading: [...k.onyomi, ...k.kunyomi].join("・"),
        back: `${k.hanViet} — ${k.meaning}`,
        details: [k.examples.map((e) => `${e.word}（${e.reading}）${e.meaning}`).join("; "), k.hint],
        speak: k.kunyomi[0]?.replace(/\./g, "") ?? k.onyomi[0],
        label: "Kanji",
      };
    }
    case "grammar": {
      const g = GRAMMAR_BY_ID.get(card.itemId);
      if (!g) return null;
      // Cloze card: produce the pattern in context (retrieval + production), not just recognise its name.
      if (g.quiz)
        return {
          front: g.quiz.q,
          frontHint: "Điền mẫu phù hợp và đọc to cả câu",
          back: g.quiz.answer,
          details: [`${g.pattern} — ${g.meaning}`, g.quiz.q.replace("＿＿", g.quiz.answer), ...g.examples.slice(0, 1).map((e) => `${e.jp} — ${e.vi}`)],
          speak: g.quiz.q.replace("＿＿", g.quiz.answer),
          label: "Ngữ pháp",
        };
      return {
        front: g.pattern,
        frontHint: "Nghĩa và cách dùng?",
        back: g.meaning,
        details: [g.formation, ...g.examples.slice(0, 2).map((e) => `${e.jp} — ${e.vi}`)],
        speak: g.examples[0]?.jp,
        label: "Ngữ pháp",
      };
    }
    case "kana": {
      const k = KANA_BY_ID.get(card.itemId);
      if (!k) return null;
      return { front: k.char, back: k.romaji, details: k.hint ? [k.hint] : [], speak: k.char, label: k.script === "hiragana" ? "Hiragana" : "Katakana" };
    }
    case "custom": {
      const d = dictionary.find((x) => x.id === card.itemId);
      if (!d) return null;
      return { front: d.word, reading: d.reading || undefined, back: d.meaning, details: d.example ? [d.example] : [], speak: d.reading || d.word, label: "Từ điển cá nhân" };
    }
  }
}
