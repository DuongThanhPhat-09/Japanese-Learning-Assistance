// One-time download of KanjiVG stroke-order SVGs (CC BY-SA 3.0, https://kanjivg.tagaini.net)
// for every kana and kanji in the app, into public/strokes/<codepoint>.svg.
// After this runs once, stroke-order animations work fully offline.
//
// Usage: npm run fetch:strokes
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { join } from "node:path";

const OUT = join("public", "strokes");
const BASE = "https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji";

async function collectChars() {
  const files = ["src/data/kana.ts", "src/data/kanji/n5.ts", "src/data/kanji/n4.ts", "src/data/kanji/n3.ts", "src/data/kanji/n2n1.ts"];
  const chars = new Set();
  for (const f of files) {
    const text = await readFile(f, "utf8");
    if (f.endsWith("kana.ts")) {
      for (const ch of text.match(/[ぁ-ゖ]/g) ?? []) {
        chars.add(ch);
        chars.add(String.fromCharCode(ch.charCodeAt(0) + 0x60)); // katakana counterpart
      }
    } else {
      for (const m of text.matchAll(/^\s*\["(.)",/gm)) chars.add(m[1]);
    }
  }
  return [...chars];
}

await mkdir(OUT, { recursive: true });
const chars = await collectChars();
let ok = 0;
let skipped = 0;
for (const ch of chars) {
  const code = ch.codePointAt(0).toString(16).padStart(5, "0");
  const dest = join(OUT, `${code}.svg`);
  try {
    await access(dest);
    skipped++;
    continue;
  } catch {}
  const res = await fetch(`${BASE}/${code}.svg`);
  if (!res.ok) continue;
  await writeFile(dest, await res.text());
  ok++;
}
console.log(`KanjiVG: downloaded ${ok}, already present ${skipped}, total characters ${chars.length}.`);
