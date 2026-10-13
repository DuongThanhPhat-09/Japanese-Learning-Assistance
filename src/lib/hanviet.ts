import { KANJI_BY_CHAR } from "@/data/kanji";

/**
 * Sino-Vietnamese (Hán Việt) reading of a word, derived from the kanji DB.
 * Roughly 60% of intermediate/business vocabulary is Sino-Japanese, so for
 * Vietnamese learners 経験 → KINH NGHIỆM is often the fastest path to meaning.
 * Returns null unless every kanji in the word is known (partial readings mislead).
 */
export function hanViet(word: string): { reading: string; parts: { char: string; hv: string; meaning: string }[] } | null {
  const chars = [...word].filter((ch) => /[一-龯々]/.test(ch));
  if (!chars.length) return null;
  const parts = chars.map((ch) => {
    const k = KANJI_BY_CHAR.get(ch);
    return k ? { char: ch, hv: k.hanViet, meaning: k.meaning } : null;
  });
  if (parts.some((p) => !p)) return null;
  const ok = parts as { char: string; hv: string; meaning: string }[];
  return { reading: ok.map((p) => p.hv).join(" "), parts: ok };
}
