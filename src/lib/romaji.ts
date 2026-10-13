/**
 * Kana ⇄ romaji conversion (modified Hepburn) used for auto-generated romaji
 * and for typing practice. Pure and dependency-free.
 */

const MONO: Record<string, string> = {
  あ: "a", い: "i", う: "u", え: "e", お: "o",
  か: "ka", き: "ki", く: "ku", け: "ke", こ: "ko",
  さ: "sa", し: "shi", す: "su", せ: "se", そ: "so",
  た: "ta", ち: "chi", つ: "tsu", て: "te", と: "to",
  な: "na", に: "ni", ぬ: "nu", ね: "ne", の: "no",
  は: "ha", ひ: "hi", ふ: "fu", へ: "he", ほ: "ho",
  ま: "ma", み: "mi", む: "mu", め: "me", も: "mo",
  や: "ya", ゆ: "yu", よ: "yo",
  ら: "ra", り: "ri", る: "ru", れ: "re", ろ: "ro",
  わ: "wa", ゐ: "wi", ゑ: "we", を: "wo", ん: "n",
  が: "ga", ぎ: "gi", ぐ: "gu", げ: "ge", ご: "go",
  ざ: "za", じ: "ji", ず: "zu", ぜ: "ze", ぞ: "zo",
  だ: "da", ぢ: "ji", づ: "zu", で: "de", ど: "do",
  ば: "ba", び: "bi", ぶ: "bu", べ: "be", ぼ: "bo",
  ぱ: "pa", ぴ: "pi", ぷ: "pu", ぺ: "pe", ぽ: "po",
  ゔ: "vu",
  ぁ: "a", ぃ: "i", ぅ: "u", ぇ: "e", ぉ: "o", ゃ: "ya", ゅ: "yu", ょ: "yo", ゎ: "wa",
};

const DI: Record<string, string> = {
  きゃ: "kya", きゅ: "kyu", きょ: "kyo",
  しゃ: "sha", しゅ: "shu", しょ: "sho", しぇ: "she",
  ちゃ: "cha", ちゅ: "chu", ちょ: "cho", ちぇ: "che",
  にゃ: "nya", にゅ: "nyu", にょ: "nyo",
  ひゃ: "hya", ひゅ: "hyu", ひょ: "hyo",
  みゃ: "mya", みゅ: "myu", みょ: "myo",
  りゃ: "rya", りゅ: "ryu", りょ: "ryo",
  ぎゃ: "gya", ぎゅ: "gyu", ぎょ: "gyo",
  じゃ: "ja", じゅ: "ju", じょ: "jo", じぇ: "je",
  ぢゃ: "ja", ぢゅ: "ju", ぢょ: "jo",
  びゃ: "bya", びゅ: "byu", びょ: "byo",
  ぴゃ: "pya", ぴゅ: "pyu", ぴょ: "pyo",
  ふぁ: "fa", ふぃ: "fi", ふぇ: "fe", ふぉ: "fo", ふゅ: "fyu",
  てぃ: "ti", でぃ: "di", とぅ: "tu", どぅ: "du", でゅ: "dyu", てゅ: "tyu",
  うぃ: "wi", うぇ: "we", うぉ: "wo", いぇ: "ye",
  ゔぁ: "va", ゔぃ: "vi", ゔぇ: "ve", ゔぉ: "vo",
  つぁ: "tsa", つぃ: "tsi", つぇ: "tse", つぉ: "tso",
  くぁ: "kwa", ぐぁ: "gwa",
};

/** Katakana → hiragana (leaves ー and non-kana untouched). */
export function toHiragana(s: string): string {
  let out = "";
  for (const ch of s) {
    const code = ch.charCodeAt(0);
    out += code >= 0x30a1 && code <= 0x30f6 ? String.fromCharCode(code - 0x60) : ch;
  }
  return out;
}

export function toKatakana(s: string): string {
  let out = "";
  for (const ch of s) {
    const code = ch.charCodeAt(0);
    out += code >= 0x3041 && code <= 0x3096 ? String.fromCharCode(code + 0x60) : ch;
  }
  return out;
}

export function isKana(ch: string): boolean {
  const c = ch.charCodeAt(0);
  return (c >= 0x3040 && c <= 0x30ff) || ch === "ー";
}

export function hasKanji(s: string): boolean {
  return /[一-龯㐀-䶿々]/.test(s);
}

export function kanaToRomaji(input: string): string {
  const s = toHiragana(input);
  let out = "";
  let geminate = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === "っ") {
      geminate = true;
      continue;
    }
    if (ch === "ー") {
      const m = out.match(/[aeiou]$/);
      out += m ? m[0] : "";
      continue;
    }
    let roma: string | undefined = DI[s.slice(i, i + 2)];
    if (roma) i++;
    else roma = MONO[ch];
    if (roma === undefined) {
      if (geminate) geminate = false;
      out += ch === "　" ? " " : ch;
      continue;
    }
    if (ch === "ん") {
      const next = s[i + 1];
      const nextRoma = next ? MONO[next] ?? "" : "";
      out += /^[aeiouy]/.test(nextRoma) ? "n'" : "n";
      continue;
    }
    if (geminate) {
      out += roma.startsWith("ch") ? "t" : roma[0];
      geminate = false;
    }
    out += roma;
  }
  return out;
}

// ------------------------------------------------------------------ romaji → kana

const R2K: Record<string, string> = {};
for (const [k, v] of Object.entries(MONO)) if (!/^[ぁぃぅぇぉゃゅょゎゐゑ]$/.test(k) && k !== "ん" && !(v in R2K)) R2K[v] = k;
for (const [k, v] of Object.entries(DI)) if (!(v in R2K)) R2K[v] = k;
Object.assign(R2K, {
  si: "し", ti: "ち", tu: "つ", hu: "ふ", zi: "じ", di: "ぢ", du: "づ",
  sya: "しゃ", syu: "しゅ", syo: "しょ",
  tya: "ちゃ", tyu: "ちゅ", tyo: "ちょ", cya: "ちゃ", cyu: "ちゅ", cyo: "ちょ",
  zya: "じゃ", zyu: "じゅ", zyo: "じょ", jya: "じゃ", jyu: "じゅ", jyo: "じょ",
  dya: "ぢゃ", dyu: "ぢゅ", dyo: "ぢょ",
  wo: "を", ji: "じ", zu: "ず",
  xa: "ぁ", xi: "ぃ", xu: "ぅ", xe: "ぇ", xo: "ぉ", la: "ぁ", li: "ぃ", lu: "ぅ", le: "ぇ", lo: "ぉ",
  xya: "ゃ", xyu: "ゅ", xyo: "ょ", lya: "ゃ", lyu: "ゅ", lyo: "ょ", xtu: "っ", ltu: "っ", xtsu: "っ",
  "-": "ー",
});
// In typing practice "ti"/"di" should be ち/ぢ (IME behaviour), so override the extended-katakana entries.
R2K.ti = "ち";
R2K.di = "ぢ";
R2K.tu = "つ";
R2K.du = "づ";
R2K.wi = "うぃ";
R2K.we = "うぇ";

const MAX_KEY = Math.max(...Object.keys(R2K).map((k) => k.length));

/** IME-style conversion of romaji to hiragana. Unconvertible characters are kept. */
export function romajiToHiragana(input: string): string {
  const s = input.toLowerCase().replace(/\s+/g, "");
  let out = "";
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    // n handling
    if (c === "n") {
      const next = s[i + 1];
      if (next === "n") {
        out += "ん";
        i += 2;
        continue;
      }
      if (next === "'") {
        out += "ん";
        i += 2;
        continue;
      }
      if (next === undefined || !/[aiueoy]/.test(next)) {
        out += "ん";
        i += 1;
        continue;
      }
    }
    // double consonant → small tsu
    if (/[bcdfghjkmpqrstvwxyz]/.test(c) && s[i + 1] === c) {
      out += "っ";
      i += 1;
      continue;
    }
    if (c === "t" && s[i + 1] === "c" && s[i + 2] === "h") {
      out += "っ";
      i += 1;
      continue;
    }
    let matched = false;
    for (let len = MAX_KEY; len > 0; len--) {
      const chunk = s.slice(i, i + len);
      if (R2K[chunk]) {
        out += R2K[chunk];
        i += len;
        matched = true;
        break;
      }
    }
    if (!matched) {
      out += c;
      i++;
    }
  }
  return out;
}

const VOWEL_KANA: Record<string, string> = { a: "あ", i: "い", u: "う", e: "え", o: "お" };

/** Normalises kana for lenient comparison: hiragana, long-vowel mark expanded. */
export function looseKana(s: string): string {
  const h = toHiragana(s).replace(/[\s・、。]/g, "");
  let out = "";
  for (const ch of h) {
    if (ch === "ー") {
      const prev = kanaToRomaji(out.slice(-1));
      const v = prev.match(/[aeiou]$/);
      out += v ? VOWEL_KANA[v[0]] : "";
    } else out += ch;
  }
  return out;
}

/** True if the typed romaji corresponds to the expected kana (accepts Hepburn and Kunrei variants). */
export function romajiMatches(typed: string, expectedKana: string): boolean {
  const t = typed.trim();
  if (!t) return false;
  const typedKana = looseKana(romajiToHiragana(t));
  return typedKana === looseKana(expectedKana) || t.toLowerCase().replace(/\s+/g, "") === kanaToRomaji(expectedKana).replace(/'/g, "");
}
