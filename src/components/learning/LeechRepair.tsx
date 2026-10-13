"use client";

import { useMemo, useState } from "react";
import { Wrench } from "lucide-react";
import { resolveCard } from "@/lib/cards";
import { hanViet } from "@/lib/hanviet";
import { markPlanItem, useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Card, Input } from "@/components/ui/primitives";
import { ReviewSession, SessionSummary } from "./ReviewSession";
import { toast } from "sonner";

/**
 * Leeches (cards failed ≥ 4 times) are not fixed by more repetition. The learner
 * writes a new memory hook for each (Hán Việt split, own sentence, image), then
 * re-tests them immediately. Hooks are saved to Notes.
 */
export function LeechRepair({ cardIds, onDone }: { cardIds: string[]; onDone?: () => void }) {
  const cards = useAppStore((s) => s.cards);
  const dictionary = useAppStore((s) => s.dictionary);
  const list = useMemo(() => cardIds.map((id) => cards[id]).filter(Boolean), [cardIds, cards]);
  const [hooks, setHooks] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<"write" | "review" | "done">("write");
  const [summary, setSummary] = useState<{ reviewed: number; correct: number } | null>(null);

  if (phase === "review")
    return (
      <ReviewSession
        cards={list}
        onFinish={(s) => {
          setSummary(s);
          setPhase("done");
          markPlanItem("leech");
          onDone?.();
        }}
      />
    );
  if (phase === "done" && summary) return <SessionSummary {...summary} onRestart={() => setPhase("write")} />;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Với mỗi thẻ, viết một “móc nhớ” mới: tách âm Hán Việt, đặt một câu về chính bạn, hoặc liên tưởng hình ảnh. Sau đó ôn lại ngay.
      </p>
      {list.map((c) => {
        const face = resolveCard(c, dictionary);
        if (!face) return null;
        const hv = c.kind === "vocab" ? hanViet(face.front) : null;
        return (
          <Card key={c.id} className="flex flex-col gap-2 p-4">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="font-jp text-2xl font-bold">{face.front}</span>
              {face.reading && <span className="font-jp text-muted-foreground">{face.reading}</span>}
              <span className="font-semibold">— {face.back}</span>
              <span className="ml-auto text-xs text-rose-500">quên {c.lapses} lần</span>
            </div>
            {hv && <p className="text-sm">Hán Việt: <b>{hv.reading}</b> ({hv.parts.map((p) => p.meaning).join(" + ")})</p>}
            <Input value={hooks[c.id] ?? ""} onChange={(e) => setHooks({ ...hooks, [c.id]: e.target.value })} placeholder="Móc nhớ của bạn…" />
          </Card>
        );
      })}
      <Button
        size="lg"
        onClick={() => {
          const lines = list
            .map((c) => {
              const f = resolveCard(c, dictionary);
              return hooks[c.id] && f ? `• ${f.front} (${f.back}): ${hooks[c.id]}` : null;
            })
            .filter(Boolean);
          if (lines.length) {
            useAppStore.getState().upsertNote({ title: `Móc nhớ thẻ khó ${new Date().toLocaleDateString("vi-VN")}`, body: lines.join("\n"), tags: ["leech"] });
            toast.success("Đã lưu móc nhớ vào Ghi chú");
          }
          useAppStore.getState().repairLeeches(list.map((c) => c.id));
          setPhase("review");
        }}
      >
        <Wrench /> Lưu móc nhớ & ôn lại ngay
      </Button>
    </div>
  );
}
