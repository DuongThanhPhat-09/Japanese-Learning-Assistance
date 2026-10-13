"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import type { Article } from "@/types";
import { ARTICLES, ARTICLE_BY_ID, CATEGORY_LABEL } from "@/data/reading";
import { stripRuby } from "@/lib/ruby";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/primitives";
import { LevelBadge, PageHeader } from "@/components/learning/common";
import { ArticleReader } from "@/components/learning/ArticleReader";

const LEVELS = ["all", "N5", "N4", "N3", "N2", "N1", "native"];

export function ArticleList({ articles }: { articles: Article[] }) {
  const completed = useAppStore((s) => s.completed);
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {articles.map((a) => (
        <Link key={a.id} href={`/reading/?id=${a.id}`}>
          <Card className="flex h-full gap-3 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/50">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <FileText className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <LevelBadge level={a.level} />
                <span className="text-[11px] text-muted-foreground">{CATEGORY_LABEL[a.category]}</span>
                {completed[`reading:${a.id}`] && <span className="text-xs font-bold text-primary">✓</span>}
              </div>
              <p className="font-jp mt-1 font-bold">{stripRuby(a.title)}</p>
              <p className="text-sm text-muted-foreground">{a.titleVi}</p>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export function ReadingBrowser() {
  const params = useSearchParams();
  const router = useRouter();
  const id = params.get("id");
  const article = id ? ARTICLE_BY_ID.get(id) : undefined;
  const [level, setLevel] = useState("all");

  if (article)
    return (
      <div className="flex flex-col gap-4">
        <button onClick={() => router.push("/reading/")} className="flex items-center gap-1 self-start text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Quay lại
        </button>
        <ArticleReader key={article.id} article={article} />
      </div>
    );

  const list = ARTICLES.filter((a) => level === "all" || a.level === level);
  return (
    <div>
      <PageHeader title="Đọc hiểu" jp="読解" description="Bài đọc từ N5 đến trình độ bản xứ: bật/tắt furigana, chạm để tra từ, bật bản dịch và bấm giờ đọc." />
      <div className="mb-4 flex flex-wrap gap-2">
        {LEVELS.map((l) => (
          <button key={l} onClick={() => setLevel(l)} className={cn("rounded-xl border-2 px-3 py-1.5 text-sm font-bold", level === l ? "border-primary bg-primary/10 text-primary" : "bg-card")}>
            {l === "all" ? "Tất cả" : l === "native" ? "Bản xứ" : l}
          </button>
        ))}
      </div>
      <ArticleList articles={list} />
    </div>
  );
}
