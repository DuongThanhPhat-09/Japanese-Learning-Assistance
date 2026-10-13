"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Headphones } from "lucide-react";
import type { ListeningExercise } from "@/types";
import { LISTENING, LISTENING_BY_ID, LISTENING_CATEGORY_LABEL } from "@/data/listening";
import { stripRuby } from "@/lib/ruby";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/primitives";
import { LevelBadge, PageHeader } from "@/components/learning/common";
import { ListeningPlayer } from "@/components/learning/ListeningPlayer";

export function ListeningList({ items }: { items: ListeningExercise[] }) {
  const completed = useAppStore((s) => s.completed);
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((l) => (
        <Link key={l.id} href={`/listening/?id=${l.id}`}>
          <Card className="flex h-full gap-3 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/50">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sky-500/12 text-sky-600 dark:text-sky-400">
              <Headphones className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <LevelBadge level={l.level} />
                <span className="text-[11px] text-muted-foreground">{LISTENING_CATEGORY_LABEL[l.category]}</span>
                {completed[`listening:${l.id}`] && <span className="text-xs font-bold text-primary">✓</span>}
              </div>
              <p className="font-jp mt-1 font-bold">{stripRuby(l.title)}</p>
              <p className="text-sm text-muted-foreground">{l.titleVi}</p>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export function ListeningBrowser() {
  const params = useSearchParams();
  const router = useRouter();
  const id = params.get("id");
  const ex = id ? LISTENING_BY_ID.get(id) : undefined;
  const [cat, setCat] = useState("all");

  if (ex)
    return (
      <div className="flex flex-col gap-4">
        <button onClick={() => router.push("/listening/")} className="flex items-center gap-1 self-start text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Quay lại
        </button>
        <ListeningPlayer key={ex.id} ex={ex} />
      </div>
    );

  const cats = ["all", ...Object.keys(LISTENING_CATEGORY_LABEL)];
  return (
    <div>
      <PageHeader title="Nghe hiểu" jp="聴解" description="Hội thoại hằng ngày, văn phòng, cuộc họp và điện thoại công việc. Hỗ trợ file âm thanh cục bộ, nếu chưa có sẽ dùng giọng đọc tiếng Nhật offline của hệ điều hành." />
      <div className="mb-4 flex flex-wrap gap-2">
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={cn("rounded-xl border-2 px-3 py-1.5 text-sm font-bold", cat === c ? "border-primary bg-primary/10 text-primary" : "bg-card")}>
            {c === "all" ? "Tất cả" : LISTENING_CATEGORY_LABEL[c]}
          </button>
        ))}
      </div>
      <ListeningList items={LISTENING.filter((l) => cat === "all" || l.category === cat)} />
    </div>
  );
}
