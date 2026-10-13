/** Parser for the `{漢字|かんじ}` furigana markup used in reading/listening content. */

export type RubyToken = { type: "text"; text: string } | { type: "ruby"; base: string; reading: string };

const RUBY_RE = /\{([^|{}]+)\|([^{}]+)\}/g;

export function parseRuby(input: string): RubyToken[] {
  const tokens: RubyToken[] = [];
  let last = 0;
  for (const m of input.matchAll(RUBY_RE)) {
    const idx = m.index ?? 0;
    if (idx > last) tokens.push({ type: "text", text: input.slice(last, idx) });
    tokens.push({ type: "ruby", base: m[1], reading: m[2] });
    last = idx + m[0].length;
  }
  if (last < input.length) tokens.push({ type: "text", text: input.slice(last) });
  return tokens;
}

/** Plain text without readings (for display without furigana or for TTS of the written form). */
export function stripRuby(input: string): string {
  return input.replace(RUBY_RE, "$1");
}

/** Reading-only text (all kana) — best input for speech synthesis. */
export function rubyToKana(input: string): string {
  return input.replace(RUBY_RE, "$2");
}
