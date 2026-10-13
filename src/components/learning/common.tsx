"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Check, Plus, Volume2 } from "lucide-react";
import type { CardKind } from "@/types";
import { cn } from "@/lib/utils";
import { speak, speechSupported } from "@/lib/speech";
import { cardId } from "@/lib/srs";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function PageHeader({ title, jp, description, actions }: { title: string; jp?: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="flex flex-wrap items-baseline gap-x-3 text-[28px] font-extrabold leading-tight tracking-tight sm:text-[32px]">
          {title}
          {jp && <span className="font-jp text-lg font-bold text-muted-foreground/80">{jp}</span>}
        </h1>
        {description && <p className="mt-2 line-clamp-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground sm:line-clamp-none">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({ icon, title, children }: { icon?: React.ReactNode; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl bg-muted/50 p-10 text-center">
      {icon && <div className="text-4xl">{icon}</div>}
      <p className="font-semibold">{title}</p>
      {children && <div className="text-sm text-muted-foreground">{children}</div>}
    </div>
  );
}

export function SpeakButton({ text, className, size = "icon" }: { text: string; className?: string; size?: "icon" | "sm" }) {
  const [ok, setOk] = useState(true);
  useEffect(() => setOk(speechSupported()), []);
  if (!ok) return null;
  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      className={cn("text-muted-foreground hover:text-primary", className)}
      onClick={(e) => {
        e.stopPropagation();
        speak(text);
      }}
      aria-label="Phát âm"
      title="Phát âm (giọng đọc tiếng Nhật của hệ điều hành)"
    >
      <Volume2 />
    </Button>
  );
}

/** Adds an item to the SRS deck (or shows it is already there). */
export function AddToSrsButton({ kind, itemId, size = "sm" }: { kind: CardKind; itemId: string; size?: "sm" | "default" }) {
  const exists = useAppStore((s) => !!s.cards[cardId(kind, itemId)]);
  const addCard = useAppStore((s) => s.addCard);
  return (
    <Button
      size={size}
      variant={exists ? "secondary" : "outline"}
      disabled={exists}
      onClick={(e) => {
        e.stopPropagation();
        addCard(kind, itemId);
        toast.success("Đã thêm vào hàng chờ — engine sẽ đưa vào bài học mới theo nhịp phù hợp");
      }}
    >
      {exists ? <Check /> : <Plus />}
      {exists ? "Đã trong SRS" : "Thêm vào hàng chờ"}
    </Button>
  );
}

export function LevelBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    intro: "bg-green-500/15 text-green-700 dark:text-green-300",
    kana: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300",
    N5: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
    N4: "bg-purple-500/15 text-purple-700 dark:text-purple-300",
    N3: "bg-pink-500/15 text-pink-700 dark:text-pink-300",
    N2: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
    N1: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
    business: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300",
    it: "bg-teal-500/15 text-teal-700 dark:text-teal-300",
    brse: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
    native: "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300",
  };
  const label: Record<string, string> = { intro: "Nhập môn", kana: "Kana", business: "Business", it: "IT", brse: "BrSE", native: "Native" };
  return <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold", colors[level] ?? "bg-muted")}>{label[level] ?? level}</span>;
}

export function DifficultyDots({ value }: { value: number }) {
  return (
    <span className="inline-flex gap-0.5" title={`Độ khó ${value}/5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={cn("size-1.5 rounded-full", i <= value ? "bg-amber-500" : "bg-muted-foreground/25")} />
      ))}
    </span>
  );
}
