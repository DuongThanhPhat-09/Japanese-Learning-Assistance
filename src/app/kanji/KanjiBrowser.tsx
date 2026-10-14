"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Lightbulb, Plus, Search } from "lucide-react";
import type { Kanji } from "@/types";
import { KANJI, KANJI_BY_CHAR } from "@/data/kanji";
import { VOCABULARY } from "@/data/vocab";
import { cardId } from "@/lib/srs";
import { toHiragana } from "@/lib/romaji";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, Input, Select } from "@/components/ui/primitives";
import { AddToSrsButton, EmptyState, LevelBadge, PageHeader, SpeakButton } from "@/components/learning/common";
import { StrokeOrder } from "@/components/learning/Writing";
import { StrokeTracer } from "@/components/learning/StrokeTracer";
import { toast } from "sonner";

export function KanjiBrowser() {
  const params = useSearchParams();
  const char = params.get("char");
  const k = char ? KANJI_BY_CHAR.get(char) : undefined;
  return k ? <KanjiDetail key={k.char} k={k} /> : <KanjiList />;
}

function KanjiList() {
  const [level, setLevel] = useState("all");
  const [q, setQ] = useState("");
  const [strokes, setStrokes] = useState("all");
  const cards = useAppStore((s) => s.cards);
  const addCards = useAppStore((s) => s.addCards);
  const list = useMemo(() => {
    const n = q.trim().toLowerCase();
    const nk = toHiragana(n);
    return KANJI.filter((k) => {
      if (level !== "all" && k.level !== level) return false;
      if (strokes !== "all") {
        const [a, b] = strokes.split("-").map(Number);
        if (k.strokes < a || k.strokes > b) return false;
      }
      if (!n) return true;
      return (
        k.char === q.trim() ||
        k.hanViet.toLowerCase().includes(n) ||
        k.meaning.toLowerCase().includes(n) ||
        k.onyomi.some((o) => toHiragana(o).includes(nk)) ||
        k.kunyomi.some((o) => o.replace(".", "").includes(nk)) ||
        k.radicals.includes(q.trim()) ||
        k.examples.some((e) => e.word.includes(q.trim()))
      );
    });
  }, [level, q, strokes]);

  return (
    <div>
      <PageHeader
        title="Kanji"
        jp="漢字"
        description={`${KANJI.length} chữ Hán N5–N1 với âm Hán Việt, On/Kun, số nét, bộ thủ, từ ví dụ, câu ví dụ và mẹo ghi nhớ.`}
        actions={
          <Button
            onClick={() => {
              const n = addCards(list.filter((k) => !cards[cardId("kanji", k.char)]).slice(0, 20).map((k) => ({ kind: "kanji" as const, itemId: k.char })));
              toast.success(n ? `Đã thêm ${n} chữ Hán vào SRS` : "Đã có trong SRS");
            }}
          >
            <Plus /> Thêm 20 chữ vào SRS
          </Button>
        }
      />
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm: 日, nhật, にち, mặt trời, 亻…" className="pl-9" />
        </div>
        <Select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="all">Tất cả cấp độ</option>
          {["N5", "N4", "N3", "N2", "N1"].map((l) => <option key={l} value={l}>{l}</option>)}
        </Select>
        <Select value={strokes} onChange={(e) => setStrokes(e.target.value)}>
          <option value="all">Mọi số nét</option>
          <option value="1-4">1–4 nét</option>
          <option value="5-8">5–8 nét</option>
          <option value="9-12">9–12 nét</option>
          <option value="13-30">13+ nét</option>
        </Select>
      </div>
      <p className="mb-3 text-sm text-muted-foreground">{list.length} chữ</p>
      {list.length ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-8">
          {list.map((k) => {
            const c = cards[cardId("kanji", k.char)];
            return (
              <Link key={k.char} href={`/kanji/?char=${encodeURIComponent(k.char)}`}>
                <Card className={cn("flex flex-col items-center gap-0.5 p-3 transition-all hover:-translate-y-0.5 hover:border-primary/50", c?.state === "mastered" && "border-primary bg-primary/5")}>
                  <span className="font-jp text-4xl font-bold">{k.char}</span>
                  <span className="text-xs font-bold text-primary">{k.hanViet}</span>
                  <span className="line-clamp-1 text-[11px] text-muted-foreground">{k.meaning}</span>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState icon="🔍" title="Không tìm thấy chữ Hán" />
      )}
    </div>
  );
}

function KanjiDetail({ k }: { k: Kanji }) {
  const router = useRouter();
  const related = VOCABULARY.filter((v) => v.kanji.includes(k.char)).slice(0, 8);
  return (
    <div className="flex flex-col gap-4">
      <button onClick={() => router.push("/kanji/")} className="flex items-center gap-1 self-start text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Danh sách Kanji
      </button>
      <Card className="grid gap-6 p-6 md:grid-cols-[auto_1fr]">
        <StrokeOrder char={k.char} strokes={k.strokes} />
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <LevelBadge level={k.level} />
            <span className="text-2xl font-extrabold text-primary">{k.hanViet}</span>
            <span className="text-lg">— {k.meaning}</span>
          </div>
          <dl className="grid grid-cols-[110px_1fr] gap-y-2 text-sm">
            <dt className="text-muted-foreground">Âm On (音)</dt>
            <dd className="font-jp font-medium">{k.onyomi.join("・") || "—"}</dd>
            <dt className="text-muted-foreground">Âm Kun (訓)</dt>
            <dd className="font-jp font-medium">{k.kunyomi.join("・") || "—"}</dd>
            <dt className="text-muted-foreground">Số nét</dt>
            <dd className="font-medium">{k.strokes}</dd>
            <dt className="text-muted-foreground">Bộ thủ</dt>
            <dd className="font-jp font-medium">{k.radicals.join("  ")}</dd>
          </dl>
          <p className="flex gap-2 rounded-lg bg-amber-500/10 p-3 text-sm">
            <Lightbulb className="size-4 shrink-0 text-amber-500" /> <span className="font-jp">{k.hint}</span>
          </p>
          <div>
            <AddToSrsButton kind="kanji" itemId={k.char} size="default" />
          </div>
        </div>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Từ ví dụ</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2">
            {k.examples.map((e) => (
              <div key={e.word} className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2">
                <span className="font-jp text-xl font-bold">{e.word}</span>
                <span className="font-jp text-sm text-muted-foreground">{e.reading}</span>
                <span className="ml-auto text-sm">{e.meaning}</span>
                <SpeakButton text={e.reading} />
              </div>
            ))}
            {related.length > 0 && (
              <>
                <p className="mt-2 text-xs font-semibold uppercase text-muted-foreground">Trong kho từ vựng</p>
                <div className="flex flex-wrap gap-2">
                  {related.map((v) => (
                    <Link key={v.id} href={`/vocabulary/?q=${encodeURIComponent(v.kanji)}`} className="font-jp rounded-full border px-3 py-1 text-sm hover:border-primary">
                      {v.kanji} <span className="text-muted-foreground">{v.meaning}</span>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Câu ví dụ</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <p className="font-jp text-lg">{k.sentence.jp}</p>
                <p className="text-sm text-muted-foreground">{k.sentence.vi}</p>
              </div>
              <SpeakButton text={k.sentence.jp} />
            </div>
            <div className="flex flex-col items-center gap-1">
              <p className="text-sm font-semibold">Luyện viết</p>
              <StrokeTracer char={k.char} size={260} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
