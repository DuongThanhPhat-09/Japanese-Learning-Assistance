"use client";

import { useEffect, useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import type { Grade, SrsCard } from "@/types";
import { previewInterval } from "@/lib/srs";
import { XP } from "@/lib/xp";
import { resolveCard } from "@/lib/cards";
import { speak } from "@/lib/speech";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Card, Progress } from "@/components/ui/primitives";
import { SpeakButton } from "./common";
import { CompletionCard } from "@/components/motivation/Celebration";
import { useFocusSession } from "@/store/useCelebrations";

const GRADES: { grade: Grade; label: string; key: string; className: string }[] = [
  { grade: "again", label: "Quên", key: "1", className: "bg-rose-500 hover:bg-rose-600 text-white" },
  { grade: "hard", label: "Khó", key: "2", className: "bg-amber-500 hover:bg-amber-600 text-white" },
  { grade: "good", label: "Nhớ", key: "3", className: "bg-emerald-500 hover:bg-emerald-600 text-white" },
  { grade: "easy", label: "Dễ", key: "4", className: "bg-sky-500 hover:bg-sky-600 text-white" },
];

/**
 * Flashcard review session. Cards graded "again" are re-queued at the end of
 * the session so the learner sees them again before finishing.
 */
export function ReviewSession({ cards, onFinish }: { cards: SrsCard[]; onFinish: (stats: { reviewed: number; correct: number }) => void }) {
  const dictionary = useAppStore((s) => s.dictionary);
  const gradeCard = useAppStore((s) => s.gradeCard);
  const liveCards = useAppStore((s) => s.cards);
  const [queue, setQueue] = useState(() => cards.map((c) => c.id));
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [correct, setCorrect] = useState(0);
  const total = cards.length;
  useFocusSession(queue.length > 0);

  const current = queue[0] ? liveCards[queue[0]] : undefined;
  const face = useMemo(() => (current ? resolveCard(current, dictionary) : null), [current, dictionary]);

  useEffect(() => {
    if (!queue.length) onFinish({ reviewed, correct });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue.length]);

  // Skip cards whose content no longer exists.
  useEffect(() => {
    if (current && !face) setQueue((q) => q.slice(1));
  }, [current, face]);

  const grade = (g: Grade) => {
    if (!current) return;
    gradeCard(current.id, g);
    setReviewed((r) => r + 1);
    if (g !== "again") setCorrect((c) => c + 1);
    setFlipped(false);
    setQueue((q) => (g === "again" ? [...q.slice(1), q[0]] : q.slice(1)));
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      if (e.code === "Space") {
        e.preventDefault();
        setFlipped(true);
      } else if (flipped) {
        const g = GRADES.find((x) => x.key === e.key);
        if (g) grade(g.grade);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!current || !face) return null;
  const done = total - new Set(queue).size;

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <div className="flex items-center gap-3">
        <Progress value={(done / Math.max(total, 1)) * 100} />
        <span className="shrink-0 text-sm font-semibold text-muted-foreground">
          {done}/{total}
        </span>
      </div>
      <Card
        className={cn("relative flex min-h-80 cursor-pointer select-none flex-col items-center justify-center gap-3 p-8 text-center transition-all", flipped && "border-primary/40")}
        onClick={() => {
          if (!flipped && face.speak) speak(face.speak);
          setFlipped(true);
        }}
      >
        <span className="absolute left-4 top-4 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">{face.label}</span>
        <span className="absolute right-3 top-3">{face.speak && <SpeakButton text={face.speak} />}</span>
        <p className={cn("font-jp font-bold", face.front.length > 6 ? "text-3xl" : "text-6xl")}>{face.front}</p>
        {face.frontHint && !flipped && <p className="text-sm text-muted-foreground">{face.frontHint}</p>}
        {flipped ? (
          <div className="animate-pop flex flex-col items-center gap-2">
            {face.reading && <p className="font-jp text-lg text-muted-foreground">{face.reading}</p>}
            <p className="text-xl font-bold text-primary">{face.back}</p>
            {face.details?.map((d, i) => (
              <p key={i} className="font-jp max-w-md text-sm text-muted-foreground">
                {d}
              </p>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">Chạm hoặc nhấn Space để xem đáp án</p>
        )}
      </Card>
      {flipped ? (
        <div className="grid grid-cols-4 gap-2">
          {GRADES.map((g) => (
            <button key={g.grade} onClick={() => grade(g.grade)} className={cn("flex flex-col items-center rounded-xl py-2.5 font-bold shadow-sm transition-transform active:scale-95", g.className)}>
              {g.label}
              <span className="text-[11px] font-medium opacity-90">{previewInterval(current, g.grade)}</span>
            </button>
          ))}
        </div>
      ) : (
        <Button size="lg" onClick={() => setFlipped(true)}>
          Hiện đáp án
        </Button>
      )}
      <p className="text-center text-xs text-muted-foreground">Phím tắt: Space = lật thẻ · 1 Quên · 2 Khó · 3 Nhớ · 4 Dễ</p>
    </div>
  );
}

export function SessionSummary({ reviewed, correct, onRestart, restartLabel = "Phiên mới" }: { reviewed: number; correct: number; onRestart?: () => void; restartLabel?: string }) {
  const accuracy = reviewed ? Math.round((correct / reviewed) * 100) : 0;
  return (
    <CompletionCard
      emoji={accuracy >= 90 ? "🌟" : accuracy >= 70 ? "💪" : "🌱"}
      title={accuracy >= 90 ? "Xuất sắc!" : accuracy >= 70 ? "Làm tốt lắm!" : "Hoàn thành phiên ôn!"}
      message={accuracy >= 70 ? "Trí nhớ của bạn đang được củng cố đúng lúc." : "Những thẻ quên sẽ quay lại sớm — lặp lại chính là cách nhớ lâu."}
      stats={[
        { label: "Lượt ôn", value: reviewed },
        { label: "Nhớ", value: `${accuracy}%`, tone: "good" },
        { label: "XP", value: `+${reviewed * XP.review.good}`, tone: "xp" },
      ]}
    >
      {onRestart && (
        <Button size="lg" onClick={onRestart}>
          <RotateCcw /> {restartLabel}
        </Button>
      )}
    </CompletionCard>
  );
}
