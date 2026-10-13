"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Brain,
  CalendarCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Compass,
  Flag,
  Headphones,
  Info,
  Mic,
  Play,
  RefreshCw,
  Sparkles,
  Target,
  Wrench,
} from "lucide-react";
import type { StudyBlock } from "@/lib/engine";
import {
  INLINE_BLOCKS,
  LEECH_LAPSES,
  MODE_LABEL,
  PHASE_LABEL,
  PRO_SHARE,
  RATIOS,
  RETENTION_CEILING,
  RETENTION_FLOOR,
  REVIEWS_PER_NEW_CARD,
  REVIEW_SECONDS,
  WEEK_TEMPLATE,
  mainFrontier,
  monthlyMilestones,
  pickSentences,
  planRatio,
  proFrontier,
  stageReadiness,
  weeklyTasks,
  type BlockPhase,
  type Phase,
} from "@/lib/engine";
import { buildSession } from "@/lib/srs";
import { availableTypes, buildQuiz, sourceForLevels, type Question, type QuizType } from "@/lib/quiz";
import { VOCAB_BY_ID } from "@/data/vocab";
import { GRAMMAR_BY_ID } from "@/data/grammar";
import { HIRAGANA, KATAKANA } from "@/data/kana";
import { STAGES, STAGE_BY_ID } from "@/data/stages";
import type { Level } from "@/types";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { regeneratePlan, useDailyPlan, useEngineInput, useLearner } from "@/hooks/useEngine";
import { useStats } from "@/hooks/useStats";
import { dateKey } from "@/lib/date";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Progress, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/primitives";
import { CompletionCard } from "@/components/motivation/Celebration";
import { StageGates } from "@/components/learning/StageGates";
import { ReviewSession, SessionSummary } from "@/components/learning/ReviewSession";
import { LearnSession } from "@/components/learning/LearnSession";
import { SpeakingSession } from "@/components/learning/SpeakingSession";
import { LeechRepair } from "@/components/learning/LeechRepair";
import { QuizRunner } from "@/components/learning/QuizRunner";

const PHASE_STYLE: Record<BlockPhase, { label: string; dot: string; bar: string }> = {
  review: { label: "Ôn tập", dot: "bg-sky-500", bar: "bg-sky-500" },
  learn: { label: "Học mới", dot: "bg-violet-500", bar: "bg-violet-500" },
  output: { label: "Đầu ra (nói/nhớ lại)", dot: "bg-amber-500", bar: "bg-amber-500" },
  input: { label: "Đầu vào (đọc/nghe)", dot: "bg-emerald-500", bar: "bg-emerald-500" },
};

const BLOCK_ICON: Partial<Record<StudyBlock["kind"], typeof Brain>> = {
  review: Brain,
  learn: Sparkles,
  grammar: BookOpen,
  recall: Target,
  "grammar-drill": BookOpen,
  shadowing: Mic,
  reflex: Mic,
  reading: BookOpen,
  listening: Headphones,
  leech: Wrench,
  weakness: Target,
  checkpoint: Flag,
  "mock-exam": Flag,
  reflection: CalendarCheck,
  orientation: Compass,
};

const INLINE = INLINE_BLOCKS;

const LONG_TERM_TABS = ["week", "month", "gates", "principles"];

export function TodayView() {
  const params = useSearchParams();
  const tab = params.get("tab");
  const { beginner } = useLearner();
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <DailyPath autoStart={params.get("start") === "1"} beginner={beginner} />
      <LongTerm initialTab={tab && LONG_TERM_TABS.includes(tab) ? tab : null} />
    </div>
  );
}

/** Reference material (week, month, gates, principles), folded away under the daily path. */
function LongTerm({ initialTab }: { initialTab: string | null }) {
  const [open, setOpen] = useState(!!initialTab);
  return (
    <section className="flex flex-col gap-4 border-t border-hairline pt-6">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center justify-between text-left" aria-expanded={open}>
        <div>
          <h2 className="text-lg font-bold tracking-tight">Kế hoạch dài hạn</h2>
          <p className="text-sm text-muted-foreground">Nhiệm vụ tuần, mốc theo tháng, điều kiện lên cấp, nguyên tắc</p>
        </div>
        <ChevronDown className={cn("size-5 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <Tabs defaultValue={initialTab ?? "week"} className="animate-pop">
          <TabsList>
            <TabsTrigger value="week"><CalendarCheck /> Tuần này</TabsTrigger>
            <TabsTrigger value="month"><Flag /> Theo tháng</TabsTrigger>
            <TabsTrigger value="gates"><Target /> Lên cấp</TabsTrigger>
            <TabsTrigger value="principles"><Info /> Nguyên tắc</TabsTrigger>
          </TabsList>
          <TabsContent value="week"><WeeklyPath /></TabsContent>
          <TabsContent value="month"><Milestones /></TabsContent>
          <TabsContent value="gates"><Gates /></TabsContent>
          <TabsContent value="principles"><Principles /></TabsContent>
        </Tabs>
      )}
    </section>
  );
}

// ------------------------------------------------------------------ daily

function DailyPath({ autoStart, beginner }: { autoStart: boolean; beginner: boolean }) {
  const { plan, done } = useDailyPlan();
  const router = useRouter();
  const stats = useStats();
  const todayXp = useAppStore((s) => s.activity[dateKey()]?.xp ?? 0);
  const [active, setActive] = useState<StudyBlock | null>(null);
  const [activeDone, setActiveDone] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const started = useRef(false);
  const next = plan?.blocks.find((b) => !done.includes(b.id));

  const open = (b: StudyBlock) => {
    setActiveDone(false);
    if (INLINE.has(b.kind)) setActive(b);
    else if (b.href) router.push(b.href);
  };

  // One-click entry from Home: open the next block straight away.
  useEffect(() => {
    if (!autoStart || started.current || !plan) return;
    started.current = true;
    if (next && INLINE.has(next.kind)) open(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, plan]);

  if (!plan) return <p className="text-muted-foreground">Đang lập kế hoạch…</p>;

  const finishBlock = (b: StudyBlock) => {
    const wasLast = !done.includes(b.id) && plan.blocks.every((x) => x.id === b.id || done.includes(x.id));
    useAppStore.getState().completeBlock(b.id);
    setActiveDone(true);
    if (wasLast) setCelebrate(true);
  };

  if (active)
    return (
      <div className="flex flex-col gap-5 pb-24">
        <div className="flex items-center justify-between gap-3">
          <button onClick={() => setActive(null)} className="flex items-center gap-1 text-[15px] font-semibold text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Kế hoạch hôm nay
          </button>
          <span className="text-sm font-semibold tabular-nums text-muted-foreground">
            {plan.blocks.findIndex((b) => b.id === active.id) + 1}/{plan.blocks.length}
          </span>
        </div>
        <h1 className="font-jp text-2xl font-extrabold tracking-tight">{active.title}</h1>
        <BlockRunner key={active.id} block={active} onDone={() => finishBlock(active)} />
        {activeDone && (
          <div className="animate-rise fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 border-t border-hairline bg-background/90 backdrop-blur-xl lg:bottom-0 lg:left-60">
            <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
              <p className="flex items-center gap-2 font-extrabold text-primary">
                <CheckCircle2 className="size-6 shrink-0" /> {next ? "Hoàn thành phần này!" : "Xong kế hoạch hôm nay!"}
              </p>
              <Button size="lg" className="shrink-0" onClick={() => (next ? open(next) : setActive(null))}>
                {next ? "Tiếp tục" : "Xem tổng kết"} <ArrowRight />
              </Button>
            </div>
          </div>
        )}
      </div>
    );

  const ratio = planRatio(plan);
  const recommended = RATIOS[plan.phase];
  const total = Object.values(ratio).reduce((a, b) => a + b, 0) || 1;
  const finished = plan.blocks.length > 0 && !next;
  const doneCount = done.filter((d) => plan.blocks.some((b) => b.id === d)).length;
  const stage = STAGE_BY_ID.get(plan.stageId)!;
  const pro = plan.proStageId ? STAGE_BY_ID.get(plan.proStageId) : null;

  return (
    <div className="flex flex-col gap-8">
      {finished ? (
        <CompletionCard
          confetti={celebrate}
          emoji="🏆"
          title="Hoàn thành kế hoạch hôm nay!"
          message="Dừng ở đây là tốt nhất — trí nhớ được củng cố trong lúc nghỉ và ngủ. Muốn học thêm, hãy chọn đọc hoặc nghe thay vì thêm thẻ mới."
          stats={[
            { label: "Phần đã học", value: plan.blocks.length, tone: "good" },
            { label: "XP hôm nay", value: todayXp, tone: "xp" },
            { label: "Chuỗi ngày", value: `🔥 ${stats.streak}`, tone: "streak" },
          ]}
          className="max-w-none"
        >
          <Button asChild size="lg">
            <Link href="/">Về trang chủ</Link>
          </Button>
        </CompletionCard>
      ) : (
        <section className="bg-hero relative overflow-hidden rounded-3xl p-6 text-white shadow-lift sm:p-8">
          <p className="text-xs font-bold uppercase tracking-widest text-white/80">
            Học hôm nay · {stage.title}
            {pro ? ` + ${pro.title}` : ""}
          </p>
          <h1 className="font-jp mt-3 text-2xl font-extrabold leading-snug sm:text-[28px]">{next?.title ?? "Buổi học hôm nay"}</h1>
          <p className="mt-1.5 text-white/85">
            ≈ {plan.minutes} phút · {doneCount}/{plan.blocks.length} phần đã xong
            {!beginner && ` · ${MODE_LABEL[plan.mode]}`}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-white/75">{plan.headline}</p>
          <Progress value={(doneCount / Math.max(1, plan.blocks.length)) * 100} className="mt-5 h-2.5 bg-white/25" indicatorClassName="bg-white" />
          {next && (
            <Button size="lg" className="mt-6 w-full bg-white text-emerald-700 shadow-[0_4px_0_0_rgba(0,0,0,0.15)] hover:bg-white/95 sm:w-auto sm:min-w-64" onClick={() => open(next)}>
              <Play className="fill-current" /> {doneCount ? "Tiếp tục" : "Bắt đầu"}
            </Button>
          )}
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold tracking-tight">Các phần hôm nay</h2>
        <Card className="divide-y divide-hairline overflow-hidden">
          {plan.blocks.map((b, i) => {
            const isDone = done.includes(b.id);
            const isNext = next?.id === b.id;
            const Icon = BLOCK_ICON[b.kind] ?? Sparkles;
            return (
              <div key={b.id} className={cn("flex items-center gap-4 px-5 py-4", isNext && "bg-primary/6")}>
                <button onClick={() => open(b)} className="flex min-w-0 flex-1 items-center gap-4 text-left">
                  <span
                    className={cn(
                      "grid size-11 shrink-0 place-items-center rounded-full",
                      isDone ? "bg-primary text-primary-foreground" : isNext ? cn("text-white", PHASE_STYLE[b.phase].bar) : "bg-muted text-muted-foreground",
                    )}
                  >
                    {isDone ? <Check className="size-5" strokeWidth={3} /> : <Icon className="size-5" />}
                  </span>
                  <div className="min-w-0">
                    <p className={cn("font-jp font-bold leading-snug", isDone && "text-muted-foreground")}>{b.title}</p>
                    <p className="line-clamp-1 text-sm text-muted-foreground">
                      {i + 1}. {b.minutes} phút · {b.reason}
                    </p>
                  </div>
                </button>
                {!isDone && !INLINE.has(b.kind) ? (
                  <button
                    onClick={() => useAppStore.getState().completeBlock(b.id)}
                    className="grid size-9 shrink-0 place-items-center rounded-full border-2 border-hairline text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    aria-label="Đánh dấu xong"
                    title="Đánh dấu xong (khi đã học ở trang khác)"
                  >
                    <Check className="size-4" strokeWidth={3} />
                  </button>
                ) : (
                  <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
                )}
              </div>
            );
          })}
        </Card>
        <button onClick={regeneratePlan} className="flex items-center gap-1.5 self-center text-sm font-semibold text-muted-foreground hover:text-foreground">
          <RefreshCw className="size-3.5" /> Lập lại kế hoạch
        </button>
      </section>

      {!beginner && (
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between font-bold">
            Chi tiết phân bổ thời gian
            <ChevronDown className="size-5 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <Card className="mt-3">
            <CardHeader>
              <CardDescription>
                Thanh trên: kế hoạch hôm nay · thanh dưới: tỉ lệ khuyến nghị cho giai đoạn {PHASE_LABEL[plan.phase]} · {plan.due} thẻ đến hạn · {plan.newBudget} mục mới · tỉ lệ nhớ{" "}
                {plan.retention === null ? "chưa đủ dữ liệu" : `${Math.round(plan.retention * 100)}%`}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <RatioBar parts={(Object.keys(PHASE_STYLE) as BlockPhase[]).map((p) => ({ p, v: ratio[p] / total }))} />
              <RatioBar parts={(Object.keys(PHASE_STYLE) as BlockPhase[]).map((p) => ({ p, v: recommended[p] }))} muted />
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {(Object.keys(PHASE_STYLE) as BlockPhase[]).map((p) => (
                  <span key={p} className="flex items-center gap-1.5">
                    <span className={cn("size-2.5 rounded-sm", PHASE_STYLE[p].dot)} /> {PHASE_STYLE[p].label}: {ratio[p]} phút · khuyến nghị {Math.round(recommended[p] * 100)}%
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </details>
      )}
    </div>
  );
}

function RatioBar({ parts, muted }: { parts: { p: BlockPhase; v: number }[]; muted?: boolean }) {
  return (
    <div className={cn("flex h-3 w-full gap-[2px] overflow-hidden rounded-full bg-muted", muted && "h-2 opacity-60")}>
      {parts.filter((x) => x.v > 0).map((x) => (
        <div key={x.p} className={cn("h-full first:rounded-l-full last:rounded-r-full", PHASE_STYLE[x.p].bar)} style={{ width: `${x.v * 100}%` }} title={`${PHASE_STYLE[x.p].label}: ${Math.round(x.v * 100)}%`} />
      ))}
    </div>
  );
}

/** Runs an inline block. */
function BlockRunner({ block, onDone }: { block: StudyBlock; onDone: () => void }) {
  const cards = useAppStore((s) => s.cards);
  const input = useEngineInput();
  // Freeze the session content when the block opens.
  const [session] = useState(() => buildSession(Object.values(cards), { mode: "due", limit: 300 }));
  const [sentences] = useState(() => pickSentences(input, 10, proFrontier(input)));
  const [summary, setSummary] = useState<{ reviewed: number; correct: number } | null>(null);
  const questions = useMemo<Question[]>(() => {
    switch (block.kind) {
      case "recall":
        return (block.items ?? [])
          .map((id) => VOCAB_BY_ID.get(id))
          .filter((v): v is NonNullable<typeof v> => !!v)
          .map((v) => ({ kind: "typing" as const, type: "typing" as const, prompt: "Gõ từ tiếng Nhật (romaji hoặc kana) có nghĩa:", display: v.meaning, answerKana: v.kana, answerRomaji: `${v.kanji}（${v.romaji}）`, ref: `recall:vocab:${v.id}` }));
      case "grammar-drill": {
        const grammar = (block.items ?? []).map((id) => GRAMMAR_BY_ID.get(id)!).filter(Boolean);
        return buildQuiz({ source: { vocab: [], grammar, kanji: [], kana: [], listening: [] }, types: ["fill-blank", "correction"], count: grammar.length });
      }
      case "weakness":
        return buildQuiz({ source: sourceForLevels((block.levels ?? ["N5"]) as Level[]), types: (block.quizTypes ?? ["multiple-choice"]) as QuizType[], count: 10 });
      case "checkpoint": {
        const source = sourceForLevels((block.levels ?? ["N5"]) as Level[]);
        return buildQuiz({ source, types: availableTypes(source).filter((t) => t !== "typing"), count: 15 });
      }
      case "kana-drill": {
        const learned = [...HIRAGANA, ...KATAKANA].filter((k) => (cards[`kana:${k.id}`]?.reps ?? 0) > 0);
        const pool = learned.length >= 5 ? learned : HIRAGANA.filter((k) => k.group === "basic");
        return buildQuiz({ source: { vocab: [], grammar: [], kanji: [], kana: pool, listening: [] }, types: ["typing"], count: 15 });
      }
      default:
        return [];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block]);

  switch (block.kind) {
    case "review":
      if (summary) return <SessionSummary {...summary} />;
      return session.length ? (
        <ReviewSession
          cards={session}
          onFinish={(s) => {
            setSummary(s);
            onDone();
          }}
        />
      ) : (
        <DoneNote onDone={onDone} text="Không còn thẻ đến hạn." />
      );
    case "learn":
      return <LearnSession ids={block.items ?? []} onDone={onDone} />;
    case "leech":
      return <LeechRepair cardIds={block.items ?? []} onDone={onDone} />;
    case "reflection":
      return (
        <div className="flex flex-col gap-4">
          <WeeklyPath />
          <DoneNote onDone={onDone} text="Đã xem tổng kết: điều gì chưa đạt tuần này? Đặt 1 mục tiêu cụ thể cho tuần sau trong Kế hoạch & Mục tiêu." />
        </div>
      );
    case "shadowing":
    case "reflex":
      return <SpeakingSession sentences={sentences} mode={block.kind} onDone={onDone} />;
    default:
      return <QuizRunner questions={questions} mode={`plan:${block.kind}`} counter={block.kind === "recall" ? "recall" : "quiz"} onComplete={onDone} />;
  }
}

function DoneNote({ text, onDone }: { text: string; onDone: () => void }) {
  return (
    <Card className="flex items-center justify-between p-5">
      <p>{text}</p>
      <Button onClick={onDone}>Đánh dấu xong</Button>
    </Card>
  );
}

// ------------------------------------------------------------------ weekly

function WeeklyPath() {
  const input = useEngineInput();
  const tasks = weeklyTasks(input);
  const today = (new Date().getDay() + 6) % 7;
  const done = tasks.filter((t) => t.done).length;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Nhiệm vụ tuần · {done}/{tasks.length}</CardTitle>
          <CardDescription>Tự động cập nhật từ hoạt động của bạn (tuần bắt đầu từ thứ Hai)</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {tasks.map((t) => (
            <div key={t.id} className="flex items-start gap-2.5">
              {t.done ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" /> : <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />}
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-2 text-sm">
                  <span className="font-medium">{t.label}</span>
                  <span className="shrink-0 font-semibold text-muted-foreground">{Math.min(t.current, t.target)}/{t.target}</span>
                </div>
                {!t.done && <Progress value={(t.current / t.target) * 100} className="mt-1 h-1.5" />}
                <p className="mt-0.5 text-xs text-muted-foreground">{t.why}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Nhịp học trong tuần</CardTitle>
          <CardDescription>Engine tự điều chỉnh kế hoạch ngày theo nhịp này</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1.5">
          {WEEK_TEMPLATE.map((d, i) => (
            <div key={d.day} className={cn("grid grid-cols-[72px_1fr] gap-2 rounded-lg px-3 py-2 text-sm", i === today ? "bg-primary/10 font-semibold" : "bg-muted/40")}>
              <span>{d.day}</span>
              <span>{d.focus}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ------------------------------------------------------------------ monthly

function Milestones() {
  const input = useEngineInput();
  const list = monthlyMilestones(input);
  const minutes = useAppStore((s) => s.profile.dailyMinutes);
  const STATUS = {
    done: { label: "Đạt", cls: "bg-emerald-500 text-white" },
    "on-track": { label: "Đang tới hạn", cls: "bg-sky-500 text-white" },
    behind: { label: "Chậm tiến độ", cls: "bg-rose-500 text-white" },
    upcoming: { label: "Sắp tới", cls: "bg-muted text-muted-foreground" },
  } as const;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mốc theo tháng</CardTitle>
        <CardDescription>
          Tính cho {minutes} phút/ngày (thay đổi trong Cài đặt). Mốc chỉ “đạt” khi qua điều kiện lên cấp thật sự — kể cả thi thử.
        </CardDescription>
      </CardHeader>
      <CardContent className="relative flex flex-col gap-3 pl-8 before:absolute before:bottom-6 before:left-[27px] before:top-2 before:w-0.5 before:bg-border">
        {list.map((m) => (
          <div key={m.label} className="relative flex flex-col gap-1">
            <span className={cn("absolute -left-[22px] top-1 size-3.5 rounded-full border-2 border-background", m.done ? "bg-emerald-500" : m.status === "behind" ? "bg-rose-500" : "bg-muted-foreground/40")} />
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="w-16 font-bold text-muted-foreground">Tháng {m.month}</span>
              <span className="font-semibold">{m.label}</span>
              <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", STATUS[m.status].cls)}>{STATUS[m.status].label}</span>
            </div>
            {!m.done && <Progress value={m.progress} className="ml-[72px] h-1.5 max-w-md" />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ------------------------------------------------------------------ gates

function Gates() {
  const input = useEngineInput();
  const main = mainFrontier(input);
  const pro = proFrontier(input);
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Giai đoạn hiện tại: {main.title}</CardTitle>
            <CardDescription>Đạt mọi điều kiện dưới đây để lên giai đoạn tiếp theo</CardDescription>
          </CardHeader>
          <CardContent><StageGates stage={main} compact /></CardContent>
        </Card>
        {pro && (
          <Card>
            <CardHeader>
              <CardTitle>Song song: {pro.title}</CardTitle>
              <CardDescription>Mở khóa sau N5, chiếm {Math.round(PRO_SHARE * 100)}% thời gian mỗi ngày</CardDescription>
            </CardHeader>
            <CardContent><StageGates stage={pro} compact /></CardContent>
          </Card>
        )}
      </div>
      <Card>
        <CardHeader><CardTitle>Mức sẵn sàng các giai đoạn</CardTitle></CardHeader>
        <CardContent className="grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
          {STAGES.map((s) => {
            const r = stageReadiness(s, input);
            return (
              <Link key={s.id} href={`/stage/${s.id}/`} className="group flex items-center gap-3">
                <span className="w-5 text-right text-xs font-bold text-muted-foreground">{s.order}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span className={cn("group-hover:text-primary", s.id === main.id && "font-bold")}>{s.title}</span>
                    <span className="text-muted-foreground">{r}%</span>
                  </div>
                  <Progress value={r} className="h-1.5" style={{ background: s.color }} />
                </div>
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

// ------------------------------------------------------------------ principles

function Principles() {
  const phases = Object.keys(RATIOS) as Phase[];
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Tỉ lệ thời gian khuyến nghị</CardTitle>
          <CardDescription>Đầu vào (đọc/nghe) tăng dần theo trình độ; học mới giảm dần khi vốn từ đã lớn.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="py-2">Giai đoạn</th>
                {(Object.keys(PHASE_STYLE) as BlockPhase[]).map((p) => <th key={p}>{PHASE_STYLE[p].label}</th>)}
              </tr>
            </thead>
            <tbody>
              {phases.map((ph) => (
                <tr key={ph} className="border-t">
                  <td className="py-2 font-semibold">{PHASE_LABEL[ph]}</td>
                  {(Object.keys(PHASE_STYLE) as BlockPhase[]).map((p) => <td key={p}>{Math.round(RATIOS[ph][p] * 100)}%</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        {[
          { t: "1. Ôn trước, học sau", d: "Thẻ đến hạn luôn được làm đầu tiên. Nếu thời gian ôn vượt 1,5 lần ngân sách, engine chuyển sang chế độ “trả nợ ôn tập”: 0 thẻ mới cho đến khi an toàn." },
          { t: "2. Thẻ mới theo sức ôn", d: `Mỗi thẻ mới sinh ra khoảng ${REVIEWS_PER_NEW_CARD} lượt ôn mỗi ngày ở trạng thái ổn định; mỗi lượt ôn ≈ ${REVIEW_SECONDS} giây. Số thẻ mới = thời gian ôn ÷ (${REVIEWS_PER_NEW_CARD} × ${REVIEW_SECONDS}s), không vượt giới hạn trong Cài đặt.` },
          { t: "3. Giữ tỉ lệ nhớ 80–93%", d: `Dưới ${RETENTION_FLOOR * 100}%: giảm 60% thẻ mới, tăng luyện nhớ lại. Trên ${Math.round(RETENTION_CEILING * 100)}% và ít nợ: tăng 30% thẻ mới — bạn đang học dưới sức.` },
          { t: "4. Học → kiểm tra ngay", d: "Thẻ mới học theo cụm 5: xem → kiểm tra → học lại mục sai. Đúng ngay lần đầu thì gặp lại ngày mai; sai thì gặp lại sau ~10 phút." },
          { t: "5. Nhận diện → nhớ lại → nói", d: "Từ đã nhớ qua mốc 7 ngày được luyện chiều ngược (nghĩa → tiếng Nhật) và nói phản xạ/shadowing. Ngữ pháp trong SRS là thẻ điền chỗ trống." },
          { t: "6. Lỗi ở đâu, ôn ở đó", d: "Câu sai trong quiz, bài thi, bài đọc khiến thẻ liên quan quay lại hàng ôn ngay hôm nay. Phần thi yếu nhất được luyện 5 phút mỗi ngày trong 3 tuần." },
          { t: `7. Thẻ quên ≥ ${LEECH_LAPSES} lần cần móc nhớ mới`, d: "Ôn thêm không giúp ích. Tách Hán Việt, đặt câu riêng, tạo hình ảnh — rồi kiểm tra lại ngay." },
          { t: "8. Lên cấp bằng trí nhớ, không bằng XP", d: "Điều kiện lên cấp: % thẻ nhớ qua mốc 7 ngày, điểm đọc/nghe ≥ 70%, ngữ pháp vận dụng được và đỗ thi thử. XP chỉ để tạo động lực." },
        ].map((x) => (
          <Card key={x.t} className="p-4">
            <p className="font-bold">{x.t}</p>
            <p className="mt-1 text-sm text-muted-foreground">{x.d}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
