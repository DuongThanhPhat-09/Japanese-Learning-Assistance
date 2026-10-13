import { describe, expect, it } from "vitest";
import { kanaToRomaji, looseKana, romajiMatches, romajiToHiragana, toHiragana, toKatakana } from "@/lib/romaji";

describe("kana → romaji", () => {
  it.each([
    ["たべる", "taberu"],
    ["がっこう", "gakkou"],
    ["きって", "kitte"],
    ["しゃしん", "shashin"],
    ["まっちゃ", "matcha"],
    ["きんえん", "kin'en"],
    ["こんにちは", "konnichiha"],
    ["コーヒー", "koohii"],
    ["パーティー", "paatii"],
    ["ファイル", "fairu"],
    ["ヴァイオリン", "vaiorin"],
    ["ちず", "chizu"],
  ])("%s → %s", (kana, romaji) => expect(kanaToRomaji(kana)).toBe(romaji));
});

describe("romaji → kana", () => {
  it.each([
    ["taberu", "たべる"],
    ["gakkou", "がっこう"],
    ["shinbun", "しんぶん"],
    ["sinbun", "しんぶん"],
    ["kin'en", "きんえん"],
    ["konnnichiha", "こんにちは"],
    ["matcha", "まっちゃ"],
    ["tsukue", "つくえ"],
    ["tukue", "つくえ"],
    ["jisho", "じしょ"],
    ["zisyo", "じしょ"],
  ])("%s → %s", (r, k) => expect(romajiToHiragana(r)).toBe(k));

  it("matches typed romaji leniently", () => {
    expect(romajiMatches("koohii", "コーヒー")).toBe(true);
    expect(romajiMatches("ko-hi-", "コーヒー")).toBe(true);
    expect(romajiMatches("shi", "し")).toBe(true);
    expect(romajiMatches("si", "し")).toBe(true);
    expect(romajiMatches("n", "ん")).toBe(true);
    expect(romajiMatches("ka", "き")).toBe(false);
    expect(romajiMatches("", "あ")).toBe(false);
  });

  it("converts scripts", () => {
    expect(toHiragana("カタカナ")).toBe("かたかな");
    expect(toKatakana("ひらがな")).toBe("ヒラガナ");
    expect(looseKana("ラーメン")).toBe("らあめん");
  });
});
