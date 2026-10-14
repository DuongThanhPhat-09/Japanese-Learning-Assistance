"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { BookA, BookOpen, Brain, ChevronDown, ChevronRight, CircleX, Library, ListChecks, Play, SlidersHorizontal, Sparkles, Timer, Wrench, type LucideIcon } from "lucide-react";
import type { CardKind, SrsCard } from "@/types";
import { buildSession, forecast, type SessionOptions } from "@/lib/srs";
import { minutesFor, reviewPool, reviewPresets, type ReviewPreset } from "@/lib/review-presets";
import { leeches } from "@/lib/engine";
import { missedCards, weakCards } from "@/lib/weak";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Card, Label, Select, Switch } from "@/components/ui/primitives";
import { ReviewSession, SessionSummary } from "@/components/learning/ReviewSession";
import { LeechRepair } from "@/components/learning/LeechRepair";

const KINDS: { kind: CardKind; label: string }[] = [
  { kind: "vocab", label: "Từ vựng" },
  { kind: "kanji", label: "Kanji" },
  { kind: "grammar", label: "Ngữ pháp" },
  { kind: "kana", label: "Kana" },
  { kind: "custom", label: "Từ điển cá nhân" },
];

const MODES: { mode: SessionOptions["mode"]; label: string; desc: string }[] = [
  { mode: "due", label: "Đến hạn", desc: "Thẻ đến lịch ôn theo SRS" },
  { mode: "new", label: "Thẻ mới", desc: "Học thẻ chưa từng ôn" },
  { mode: "weak", label: "Thẻ yếu", desc: "Thẻ đã từng quên" },
  { mode: "random", label: "Ngẫu nhiên", desc: "Ôn tự do các thẻ đã học" },
  { mode: "all", label: "Tất cả", desc: "Mọi thẻ đã học, theo thứ tự" },
];

const WEAK_LIMIT = 20;

type Active = { kind: "cards"; title: string; cards: SrsCard[] } | { kind: "leech"; ids: string[] };

export default function ReviewPage() {
  return (
    <Suspense>
      <ReviewView />
    </Suspense>
  );
}

function ReviewView() {
  const params = useSearchParams();
  const cards = useAppStore((s) => s.cards);
  const itemStats = useAppStore((s) => s.itemStats);
  const newPerDay = useAppStore((s) => s.profile.newCardsPerDay);
  const list = useMemo(() => Object.values(cards), [cards]);
  const [active, setActive] = useState<Active | null>(null);
  const [summary, setSummary] = useState<{ reviewed: number; correct: number } | null>(null);

  const pool = useMemo(() => reviewPool(list, newPerDay), [list, newPerDay]);
  const presets = useMemo(() => reviewPresets(pool.cards), [pool]);
  const weak = useMemo(
    () => ({
      vocab: weakCards(cards, itemStats, "vocab"),
      grammar: weakCards(cards, itemStats, "grammar"),
      kanji: weakCards(cards, itemStats, "kanji"),
      missed: missedCards(cards, itemStats),
      leech: leeches(cards),
    }),
    [cards, itemStats],
  );
  const tomorrow = useMemo(() => forecast(list, 2)[1] ?? 0, [list]);

  const start = (title: string, session: SrsCard[]) => {
    setSummary(null);
    setActive({ kind: "cards", title, cards: session });
  };
  const exit = () => {
    setActive(null);
    setSummary(null);
  };

  const startPreset = (p: ReviewPreset) => start(pool.practice ? `Luyện thêm · ${p.label}` : p.id === "full" ? "Ôn hết hôm nay" : p.label, p.cards);

  // One-click entry from Home ("Ôn nhanh").
  useEffect(() => {
    const want = params.get("start");
    if (want && presets.length) startPreset(presets.find((p) => p.id === want) ?? presets[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (summary) return <SessionSummary {...summary} onRestart={exit} restartLabel="Quay lại Ôn tập" />;
  if (active?.kind === "leech")
    return (
      <SessionFrame title="Sửa thẻ hay quên" onExit={exit}>
        <LeechRepair cardIds={active.ids} onDone={() => undefined} />
      </SessionFrame>
    );
  if (active?.kind === "cards")
    return (
      <SessionFrame title={active.title} onExit={exit}>
        <ReviewSession cards={active.cards} onFinish={setSummary} />
      </SessionFrame>
    );

  const actions: { icon: LucideIcon; title: string; hint: string; count: number; onClick: () => void; tone: string }[] = [
    { icon: BookA, title: "Từ vựng hay sai", hint: "Từ đã quên hoặc hay sai", count: weak.vocab.length, onClick: () => start("Từ vựng hay sai", weak.vocab.slice(0, WEAK_LIMIT)), tone: "bg-violet-500/12 text-violet-600 dark:text-violet-400" },
    { icon: BookOpen, title: "Ngữ pháp hay sai", hint: "Mẫu câu cần luyện lại", count: weak.grammar.length, onClick: () => start("Ngữ pháp hay sai", weak.grammar.slice(0, WEAK_LIMIT)), tone: "bg-pink-500/12 text-pink-600 dark:text-pink-400" },
    { icon: Library, title: "Kanji hay sai", hint: "Chữ Hán dễ nhầm", count: weak.kanji.length, onClick: () => start("Kanji hay sai", weak.kanji.slice(0, WEAK_LIMIT)), tone: "bg-sky-500/12 text-sky-600 dark:text-sky-400" },
    { icon: CircleX, title: "Câu sai gần đây", hint: "Từng sai, có luyện trong 14 ngày qua", count: weak.missed.length, onClick: () => start("Câu sai gần đây", weak.missed.slice(0, WEAK_LIMIT)), tone: "bg-rose-500/12 text-rose-600 dark:text-rose-400" },
    { icon: Wrench, title: "Thẻ hay quên", hint: "Quên ≥ 4 lần — cần móc nhớ mới", count: weak.leech.length, onClick: () => setActive({ kind: "leech", ids: weak.leech.slice(0, 5).map((c) => c.id) }), tone: "bg-amber-500/12 text-amber-600 dark:text-amber-400" },
  ];

  const header = (
    <header className="pt-2">
      <h1 className="text-[28px] font-extrabold leading-tight tracking-tight sm:text-[32px]">Ôn tập</h1>
      <p className="mt-1.5 text-base text-muted-foreground">Ôn đúng lúc sắp quên là cách nhớ lâu nhất.</p>
    </header>
  );

  // Brand-new learner: nothing to review yet, so one message and one way forward.
  if (!list.length)
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        {header}
        <Card className="flex flex-col items-center gap-4 px-6 py-10 text-center">
          <span className="text-5xl">🗂️</span>
          <div>
            <p className="text-xl font-extrabold">Chưa có thẻ nào để ôn</p>
            <p className="mx-auto mt-1.5 max-w-sm text-base text-muted-foreground">Mỗi từ, chữ và mẫu câu bạn học sẽ tự xuất hiện ở đây đúng lúc bạn sắp quên.</p>
          </div>
          <Button asChild size="lg" className="w-full sm:w-auto sm:min-w-64">
            <Link href="/today/?start=1">
              <Play className="fill-current" /> Học bài đầu tiên
            </Link>
          </Button>
        </Card>
      </div>
    );

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      {header}

      {/* Time-boxed, one-click sessions */}
      <ReviewPresets presets={presets} practice={pool.practice} tomorrow={tomorrow} onStart={startPreset} />

      {/* Weak spots: one click each, only the ones that exist */}
      {actions.some((a) => a.count) && (
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold tracking-tight">Luyện điểm yếu</h2>
        <Card className="divide-y divide-hairline overflow-hidden">
          {actions.filter((a) => a.count).map((a) => (
            <button key={a.title} disabled={!a.count} onClick={a.onClick} className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/50 disabled:pointer-events-none">
              <span className={cn("grid size-11 shrink-0 place-items-center rounded-2xl", a.count ? a.tone : "bg-muted text-muted-foreground")}>
                <a.icon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className={cn("font-bold", !a.count && "text-muted-foreground")}>{a.title}</p>
                <p className="truncate text-sm text-muted-foreground">{a.count ? a.hint : "Không có — tốt lắm!"}</p>
              </div>
              {a.count > 0 && (
                <>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-sm font-bold tabular-nums">{a.count}</span>
                  <ChevronRight className="size-5 text-muted-foreground" />
                </>
              )}
            </button>
          ))}
        </Card>
      </section>
      )}

      <CustomSession list={list} newPerDay={newPerDay} onStart={(s) => start("Phiên ôn tùy chỉnh", s)} />
    </div>
  );
}

function SessionFrame({ title, onExit, children }: { title: string; onExit: () => void; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="mx-auto flex w-full max-w-xl items-center justify-between">
        <h1 className="text-xl font-extrabold tracking-tight">{title}</h1>
        <Button variant="ghost" size="sm" onClick={onExit}>
          Thoát
        </Button>
      </div>
      {children}
    </div>
  );
}

/** The full manual session builder, hidden until needed. */
function CustomSession({ list, newPerDay, onStart }: { list: SrsCard[]; newPerDay: number; onStart: (s: SrsCard[]) => void }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<SessionOptions["mode"]>("due");
  const [kinds, setKinds] = useState<CardKind[]>(KINDS.map((k) => k.kind));
  const [limit, setLimit] = useState(30);
  const [withNew, setWithNew] = useState(true);
  const preview = useMemo(() => {
    let s = buildSession(list, { mode, kinds, limit });
    if (mode === "due" && withNew && s.length < limit) s = [...s, ...buildSession(list, { mode: "new", kinds, limit: Math.min(newPerDay, limit - s.length) })];
    return s;
  }, [list, mode, kinds, limit, withNew, newPerDay]);

  return (
    <section className="flex flex-col gap-4 border-t border-hairline pt-6">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center justify-between text-left" aria-expanded={open}>
        <span className="flex items-center gap-2 font-bold">
          <SlidersHorizontal className="size-4 text-muted-foreground" /> Tùy chỉnh phiên ôn
        </span>
        <ChevronDown className={cn("size-5 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="animate-pop flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {MODES.map((m) => (
              <button key={m.mode} onClick={() => setMode(m.mode)} className={cn("rounded-2xl border-2 p-3 text-left transition-colors", mode === m.mode ? "border-primary bg-primary/8" : "border-hairline bg-card")}>
                <p className="font-bold">{m.label}</p>
                <p className="text-xs text-muted-foreground">{m.desc}</p>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {KINDS.map((k) => {
              const on = kinds.includes(k.kind);
              return (
                <button
                  key={k.kind}
                  onClick={() => setKinds((ks) => (on ? ks.filter((x) => x !== k.kind) : [...ks, k.kind]))}
                  className={cn("rounded-full border px-3 py-1.5 text-sm font-medium", on ? "border-primary bg-primary/10 text-primary" : "border-hairline text-muted-foreground")}
                >
                  {k.label} ({list.filter((c) => c.kind === k.kind).length})
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Label>Số thẻ</Label>
              <Select value={String(limit)} onChange={(e) => setLimit(Number(e.target.value))}>
                {[10, 20, 30, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </Select>
            </div>
            {mode === "due" && (
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={withNew} onCheckedChange={setWithNew} /> Kèm tối đa {newPerDay} thẻ mới
              </label>
            )}
          </div>
          <Button disabled={!preview.length} onClick={() => onStart(preview)} className="self-start">
            <Play /> Bắt đầu ({preview.length} thẻ)
          </Button>
        </div>
      )}
    </section>
  );
}

/** One big quick-review button, then the longer time boxes. Never a backlog count. */
function ReviewPresets({ presets, practice, tomorrow, onStart }: { presets: ReviewPreset[]; practice: boolean; tomorrow: number; onStart: (p: ReviewPreset) => void }) {
  const [primary, ...rest] = presets;
  const full = presets[presets.length - 1];
  return (
    <section className="flex flex-col gap-4">
      <Card className="flex flex-col items-center gap-5 px-6 py-8 text-center">
        <span className={cn("grid size-16 place-items-center rounded-full", practice ? "bg-primary/12 text-primary" : "bg-info/12 text-info")}>
          {practice ? <Sparkles className="size-8" /> : <Brain className="size-8" />}
        </span>
        <div>
          <p className="text-xl font-extrabold">{practice ? "Bạn đã ôn xong hôm nay 🎉" : "Sẵn sàng ôn tập"}</p>
          <p className="mx-auto mt-1 max-w-sm text-base text-muted-foreground">
            {practice
              ? `Muốn luyện thêm? Chọn một phiên ngắn bên dưới.${tomorrow ? ` Ngày mai có khoảng ${minutesFor(tomorrow)} phút ôn.` : ""}`
              : `Ôn hết hôm nay mất khoảng ${full.minutes} phút — làm từng chút một cũng rất tốt.`}
          </p>
        </div>
        <motion.div whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
          <Button size="lg" className="shine h-16 w-full rounded-2xl text-lg sm:min-w-72" onClick={() => onStart(primary)}>
            <Play className="fill-current" /> {primary.label}
            <span className="font-semibold opacity-80">· {primary.cards.length} thẻ</span>
          </Button>
        </motion.div>
      </Card>
      {rest.length > 0 && (
        <div className={cn("grid gap-3", rest.length === 1 ? "grid-cols-1" : rest.length === 2 ? "grid-cols-2" : "grid-cols-3")}>
          {rest.map((p) => (
            <motion.button
              key={p.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onStart(p)}
              className="flex flex-col items-center gap-1 rounded-2xl border border-hairline bg-card px-3 py-4 shadow-soft"
            >
              {p.id === "full" ? <ListChecks className="size-5 text-primary" /> : <Timer className="size-5 text-primary" />}
              <span className="font-extrabold">{p.label}</span>
              <span className="text-xs text-muted-foreground">{p.id === "full" ? `≈ ${p.minutes} phút` : `${p.cards.length} thẻ`}</span>
            </motion.button>
          ))}
        </div>
      )}
    </section>
  );
}
