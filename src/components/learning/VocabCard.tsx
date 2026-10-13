"use client";

import { Heart } from "lucide-react";
import type { Vocab } from "@/types";
import { POS_LABEL } from "@/data/vocab";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/primitives";
import { AddToSrsButton, DifficultyDots, LevelBadge, SpeakButton } from "./common";

export function VocabCard({ v, compact = false }: { v: Vocab; compact?: boolean }) {
  const fav = useAppStore((s) => s.favorites.includes(v.id));
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const showKana = v.kanji !== v.kana;
  return (
    <Card className="flex flex-col gap-2 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="font-jp text-2xl font-bold">{v.kanji}</span>
            {showKana && <span className="font-jp text-muted-foreground">{v.kana}</span>}
          </div>
          <p className="text-xs italic text-muted-foreground">{v.romaji}</p>
        </div>
        <div className="flex shrink-0 items-center">
          <SpeakButton text={v.kana} />
          <button
            onClick={() => toggleFavorite(v.id)}
            className={cn("grid size-9 place-items-center rounded-lg hover:bg-muted", fav ? "text-rose-500" : "text-muted-foreground")}
            aria-label={fav ? "Bỏ yêu thích" : "Yêu thích"}
          >
            <Heart className={cn("size-4", fav && "fill-current")} />
          </button>
        </div>
      </div>
      <p className="font-semibold">{v.meaning}</p>
      {!compact && v.example && (
        <div className="rounded-lg bg-muted/60 p-2.5 text-sm">
          <p className="font-jp">{v.example}</p>
          <p className="text-muted-foreground">{v.exampleVi}</p>
        </div>
      )}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <LevelBadge level={v.level} />
          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px]">{POS_LABEL[v.pos] ?? v.pos}</span>
          {v.tags.map((t) => (
            <span key={t} className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">
              #{t}
            </span>
          ))}
          <DifficultyDots value={v.difficulty} />
        </div>
        <AddToSrsButton kind="vocab" itemId={v.id} />
      </div>
    </Card>
  );
}
