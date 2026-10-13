"use client";

import * as React from "react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/primitives";

const COLORS = ["#22c55e", "#f59e0b", "#3b82f6", "#ec4899", "#a855f7", "#14b8a6", "#f97316"];

/** One-shot confetti burst. Purely decorative; hidden for reduced-motion users. */
export function Confetti({ count = 46, className }: { count?: number; className?: string }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        dur: 1.8 + Math.random() * 1.4,
        drift: (Math.random() - 0.5) * 160,
        spin: 360 + Math.random() * 540,
        color: COLORS[i % COLORS.length],
        round: Math.random() > 0.6,
      })),
    [count],
  );
  return (
    <div aria-hidden className={cn("pointer-events-none fixed inset-0 z-[60] overflow-hidden", className)}>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={
            {
              left: `${p.left}%`,
              background: p.color,
              borderRadius: p.round ? "999px" : undefined,
              width: p.round ? 9 : undefined,
              height: p.round ? 9 : undefined,
              "--delay": `${p.delay}s`,
              "--dur": `${p.dur}s`,
              "--drift": `${p.drift}px`,
              "--spin": `${p.spin}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

export interface CompletionStat {
  label: string;
  value: React.ReactNode;
  tone?: "xp" | "good" | "streak" | "neutral";
}

const TONE: Record<NonNullable<CompletionStat["tone"]>, string> = {
  xp: "text-xp-ink",
  good: "text-primary",
  streak: "text-streak-ink",
  neutral: "text-foreground",
};

/** Shared "you finished something" screen: big emoji, title, a few stat chips, one primary action. */
export function CompletionCard({
  emoji,
  title,
  message,
  stats = [],
  confetti = true,
  children,
  className,
}: {
  emoji: React.ReactNode;
  title: string;
  message?: React.ReactNode;
  stats?: CompletionStat[];
  confetti?: boolean;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <>
      {confetti && <Confetti />}
      <Card className={cn("animate-rise mx-auto flex w-full max-w-md flex-col items-center gap-5 px-6 py-10 text-center sm:px-10", className)}>
        <div className="animate-celebrate grid size-24 place-items-center rounded-full bg-primary/12 text-5xl">{emoji}</div>
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h2>
          {message && <p className="text-[15px] leading-relaxed text-muted-foreground">{message}</p>}
        </div>
        {stats.length > 0 && (
          <div className={cn("grid w-full gap-2", stats.length === 1 ? "grid-cols-1" : stats.length === 2 ? "grid-cols-2" : "grid-cols-3")}>
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl bg-muted/70 px-2 py-3">
                <p className={cn("text-2xl font-extrabold tabular-nums", TONE[s.tone ?? "neutral"])}>{s.value}</p>
                <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        )}
        {children && <div className="flex w-full flex-col gap-2">{children}</div>}
      </Card>
    </>
  );
}
