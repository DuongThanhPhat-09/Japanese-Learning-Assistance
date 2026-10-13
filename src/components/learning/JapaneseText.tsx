"use client";

import { useMemo, useState } from "react";
import { parseRuby } from "@/lib/ruby";
import { lookupWord } from "@/data/vocab";
import { KANJI_BY_CHAR } from "@/data/kanji";
import { cn } from "@/lib/utils";
import { SpeakButton } from "./common";

export interface GlossEntry {
  word: string;
  reading: string;
  meaning: string;
}

interface PopupInfo {
  base: string;
  reading: string;
  meaning?: string;
  extra?: string;
  x: number;
  y: number;
}

function findMeaning(base: string, reading: string, glossary: GlossEntry[] = []) {
  const g = glossary.find((e) => e.word === base || e.word.startsWith(base) || base.startsWith(e.word));
  if (g) return { meaning: g.meaning, reading: g.reading };
  const v = lookupWord(base) ?? lookupWord(reading);
  if (v) return { meaning: v.meaning, reading: v.kana };
  const kanjiInfo = [...base]
    .map((ch) => KANJI_BY_CHAR.get(ch))
    .filter(Boolean)
    .map((k) => `${k!.char} ${k!.hanViet} (${k!.meaning})`)
    .join(" · ");
  return { meaning: undefined, reading, extra: kanjiInfo || undefined };
}

/**
 * Renders `{漢字|かんじ}` markup as ruby text. Words with ruby are tappable and show
 * a vocabulary popup (from the article glossary, the vocabulary DB or the kanji DB).
 */
export function JapaneseText({
  text,
  furigana = true,
  glossary,
  className,
  interactive = true,
}: {
  text: string;
  furigana?: boolean;
  glossary?: GlossEntry[];
  className?: string;
  interactive?: boolean;
}) {
  const tokens = useMemo(() => parseRuby(text), [text]);
  const [popup, setPopup] = useState<PopupInfo | null>(null);

  return (
    <span className={cn("font-jp relative leading-[2.2]", !furigana && "hide-furigana", className)}>
      {tokens.map((t, i) =>
        t.type === "text" ? (
          <span key={i}>{t.text}</span>
        ) : (
          <ruby
            key={i}
            className={cn(interactive && "cursor-pointer rounded decoration-primary/40 decoration-dotted underline-offset-4 hover:bg-primary/10 hover:underline")}
            onClick={(e) => {
              if (!interactive) return;
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              const info = findMeaning(t.base, t.reading, glossary);
              setPopup({ base: t.base, ...info, reading: info.reading ?? t.reading, x: rect.left + rect.width / 2, y: rect.bottom });
            }}
          >
            {t.base}
            <rt>{t.reading}</rt>
          </ruby>
        ),
      )}
      {popup && (
        <>
          <span className="fixed inset-0 z-40" onClick={() => setPopup(null)} />
          <span
            className="animate-pop fixed z-50 block w-64 -translate-x-1/2 rounded-xl border bg-popover p-3 text-left font-sans text-sm leading-normal text-popover-foreground shadow-xl"
            style={{ left: Math.min(Math.max(popup.x, 140), (typeof window !== "undefined" ? window.innerWidth : 1000) - 140), top: popup.y + 8 }}
          >
            <span className="flex items-center justify-between gap-2">
              <span className="font-jp text-xl font-bold">{popup.base}</span>
              <SpeakButton text={popup.reading} />
            </span>
            <span className="block font-jp text-muted-foreground">{popup.reading}</span>
            {popup.meaning && <span className="mt-1 block font-medium">{popup.meaning}</span>}
            {popup.extra && <span className="mt-1 block text-xs text-muted-foreground">{popup.extra}</span>}
            {!popup.meaning && !popup.extra && <span className="mt-1 block text-xs text-muted-foreground">Chưa có trong từ điển — hãy thêm vào Từ điển cá nhân.</span>}
          </span>
        </>
      )}
    </span>
  );
}
