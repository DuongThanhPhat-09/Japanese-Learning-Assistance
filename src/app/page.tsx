"use client";

import Link from "next/link";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Check, ChevronRight, Play, Repeat, Sparkles, Target, Trophy } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useStats } from "@/hooks/useStats";
import { useDailyPlan, useLearner } from "@/hooks/useEngine";
import { INLINE_BLOCKS, learnerTitle } from "@/lib/engine";
import { isDue } from "@/lib/srs";
import { dateKey } from "@/lib/date";
import { levelTitle } from "@/lib/xp";
import { cn, pct } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, Progress } from "@/components/ui/primitives";
import { StageIcon } from "@/components/learning/StageIcon";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { Reveal, RevealItem } from "@/components/motion/Reveal";

const DEFAULT_NAME = "Học viên";
/** Cards in a "quick review" — matches the first preset on the Review tab. */
const QUICK_REVIEW = 10;

function greeting(hour: number) {
  if (hour < 11) return "Chào buổi sáng";
  if (hour < 14) return "Chào buổi trưa";
  if (hour < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

/** One short, situational nudge — never a metric. */
function motivation({ todayXp, goal, streak, planDone }: { todayXp: number; goal: number; streak: number; planDone: boolean }) {
  if (planDone) return "Bạn đã xong bài hôm nay. Nghỉ ngơi giúp trí nhớ được củng cố!";
  if (todayXp >= goal) return "Mục tiêu hôm nay đã đạt — mọi thứ thêm vào đều là phần thưởng.";
  if (streak > 1 && todayXp === 0) return `Chuỗi ${streak} ngày đang chờ bạn. Chỉ cần một bài ngắn thôi 🔥`;
  if (todayXp > 0) return "Đang có đà rất tốt — tiếp tục thôi!";
  return "Mỗi ngày một chút, tiếng Nhật sẽ thành của bạn.";
}

/** Home answers one question, "what next?": welcome, current lesson, today's mission, next level. */
export default function HomePage() {
  const stats = useStats();
  const profile = useAppStore((s) => s.profile);
  const activity = useAppStore((s) => s.activity);
  const cards = useAppStore((s) => s.cards);
  const { stage } = useLearner();
  const { plan, done } = useDailyPlan();

  const due = useMemo(() => Object.values(cards).filter((c) => isDue(c)).length, [cards]);
  const today = activity[dateKey()];
  const todayXp = today?.xp ?? 0;
  const goal = profile.dailyGoalXp;
  const blocksDone = plan ? plan.blocks.filter((b) => done.includes(b.id)).length : 0;
  const nextBlock = plan?.blocks.find((b) => !done.includes(b.id));
  const planFinished = !!plan && plan.blocks.length > 0 && !nextBlock;
  // Inline blocks open straight away on Today; page-based blocks (reading, kana course…) link to their page.
  const continueHref = nextBlock && !INLINE_BLOCKS.has(nextBlock.kind) && nextBlock.href ? nextBlock.href : "/today/?start=1";
  const firstRun = stats.xp === 0 && Object.keys(cards).length === 0;

  if (firstRun) return <Welcome href={continueHref} minutes={nextBlock?.minutes} />;

  const name = profile.name.trim() && profile.name !== DEFAULT_NAME ? `, ${profile.name}` : "";
  const missions = [
    {
      icon: BookOpen,
      title: "Hoàn thành bài học hôm nay",
      progress: plan ? pct(blocksDone, plan.blocks.length) : 0,
      label: plan ? `${blocksDone}/${plan.blocks.length}` : "",
      done: planFinished,
    },
    { icon: Target, title: `Đạt ${goal} XP`, progress: pct(todayXp, goal), label: `${Math.min(todayXp, goal)}/${goal}`, done: todayXp >= goal },
    {
      icon: Repeat,
      title: `Ôn nhanh ${QUICK_REVIEW} thẻ`,
      progress: due === 0 ? 100 : pct(today?.reviews ?? 0, QUICK_REVIEW),
      label: due === 0 ? "" : `${Math.min(today?.reviews ?? 0, QUICK_REVIEW)}/${QUICK_REVIEW}`,
      done: due === 0 || (today?.reviews ?? 0) >= QUICK_REVIEW,
      href: due ? "/review/?start=quick" : undefined,
    },
  ];
  const missionsDone = missions.filter((m) => m.done).length;

  return (
    <Reveal className="mx-auto flex max-w-2xl flex-col gap-8">
      <RevealItem className="pt-2">
        <h1 className="text-[28px] font-extrabold leading-tight tracking-tight sm:text-[32px]">
          {greeting(new Date().getHours())}
          {name} 👋
        </h1>
        <p className="mt-1.5 text-base text-muted-foreground">{motivation({ todayXp, goal, streak: stats.streak, planDone: planFinished })}</p>
      </RevealItem>

      {/* Current lesson: the one primary action */}
      <RevealItem>
        <section className="bg-hero relative overflow-hidden rounded-[28px] p-6 text-white shadow-lift sm:p-8">
          <StageIcon name={stage.icon} className="pointer-events-none absolute -right-8 -top-8 size-44 opacity-10" />
          <p className="text-xs font-bold uppercase tracking-widest text-white/80">Bài học hiện tại · {stage.title}</p>
          {planFinished ? (
            <>
              <h2 className="mt-3 text-[26px] font-extrabold leading-snug sm:text-[30px]">Hôm nay bạn đã học xong 🎉</h2>
              <p className="mt-1.5 text-white/85">Hẹn gặp lại ngày mai — chuỗi ngày học của bạn đã được giữ.</p>
              <Button asChild size="lg" className="mt-7 h-16 w-full rounded-2xl bg-white text-lg text-emerald-700 shadow-[0_5px_0_0_rgba(0,0,0,0.15)] hover:bg-white/95">
                <Link href="/learn/">
                  Xem hành trình <ArrowRight />
                </Link>
              </Button>
            </>
          ) : (
            <>
              <h2 className="font-jp mt-3 line-clamp-2 text-[26px] font-extrabold leading-snug sm:text-[30px]">{nextBlock ? learnerTitle(nextBlock) : "Bài học hôm nay"}</h2>
              <p className="mt-1.5 text-white/85">{plan ? `Khoảng ${plan.minutes} phút · ${blocksDone}/${plan.blocks.length} phần đã xong` : "Đang chuẩn bị bài học…"}</p>
              <Progress value={plan ? pct(blocksDone, plan.blocks.length) : 0} className="mt-5 h-2.5 bg-white/25" indicatorClassName="bg-white" />
              <motion.div whileTap={{ scale: 0.97 }} className="mt-7">
                <Button
                  asChild
                  size="lg"
                  className="shine h-16 w-full rounded-2xl bg-white text-lg text-emerald-700 shadow-[0_5px_0_0_rgba(0,0,0,0.15)] [--shine:oklch(0.62_0.17_150/0.18)] hover:bg-white/95"
                >
                  <Link href={continueHref}>
                    <Play className="fill-current" /> {blocksDone ? "Tiếp tục học" : "Bắt đầu học"}
                  </Link>
                </Button>
              </motion.div>
            </>
          )}
        </section>
      </RevealItem>

      {/* Today's mission */}
      <RevealItem className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-bold tracking-tight">Nhiệm vụ hôm nay</h2>
          <span className="text-sm font-bold tabular-nums text-muted-foreground">
            {missionsDone}/{missions.length}
          </span>
        </div>
        <Card className="divide-y divide-hairline overflow-hidden">
          {missions.map((m) => {
            const row = (
              <div className="flex items-center gap-4 px-5 py-4">
                <span className={cn("grid size-11 shrink-0 place-items-center rounded-full transition-colors", m.done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                  {m.done ? <Check className="size-5" strokeWidth={3} /> : <m.icon className="size-5" />}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className={cn("font-bold", m.done && "text-muted-foreground")}>{m.title}</p>
                    {!m.done && m.label && <span className="shrink-0 text-xs font-bold tabular-nums text-muted-foreground">{m.label}</span>}
                  </div>
                  {!m.done && <Progress value={m.progress} className="h-2" />}
                </div>
                {m.href && !m.done && <ChevronRight className="size-5 shrink-0 text-muted-foreground" />}
              </div>
            );
            return m.href && !m.done ? (
              <Link key={m.title} href={m.href} className="block transition-colors hover:bg-muted/50">
                {row}
              </Link>
            ) : (
              <div key={m.title}>{row}</div>
            );
          })}
        </Card>
        {missionsDone === missions.length && (
          <p className="flex items-center justify-center gap-2 text-sm font-bold text-primary">
            <Trophy className="size-4" /> Hoàn thành mọi nhiệm vụ hôm nay — tuyệt vời!
          </p>
        )}
      </RevealItem>

      {/* Progress to the next level */}
      <RevealItem>
        <Link href="/profile/" className="block">
          <Card className="flex items-center gap-4 p-5 transition-shadow hover:shadow-lift">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-xp/15 text-xl font-black text-xp-ink">{stats.level}</span>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-bold">
                  Lên cấp {stats.level + 1}
                  <span className="font-jp ml-2 text-sm font-medium text-muted-foreground">{levelTitle(stats.level + 1).split(" · ")[1]}</span>
                </p>
                <span className="shrink-0 text-xs font-bold text-muted-foreground">
                  còn <NumberTicker value={stats.needed - stats.current} /> XP
                </span>
              </div>
              <Progress value={stats.percent} className="h-2.5" indicatorClassName="bg-xp" />
            </div>
          </Card>
        </Link>
      </RevealItem>
    </Reveal>
  );
}

/** First visit: an invitation, not a dashboard of empty meters. */
function Welcome({ href, minutes }: { href: string; minutes?: number }) {
  const steps = [
    { glyph: "👋", title: "Làm quen tiếng Nhật", text: "Chữ viết, phát âm, câu chào đầu tiên" },
    { glyph: "あ", title: "Hiragana", text: "Bảng chữ cái đầu tiên" },
    { glyph: "ア", title: "Katakana", text: "Đọc từ ngoại lai, tên riêng" },
  ];
  return (
    <Reveal className="mx-auto flex max-w-xl flex-col items-center gap-10 pt-4 text-center sm:pt-10">
      <RevealItem className="relative">
        <div className="bg-hero animate-float grid size-36 place-items-center rounded-[40px] font-jp text-7xl font-black text-white shadow-lift">あ</div>
        <span className="animate-float absolute -left-8 top-2 grid size-12 place-items-center rounded-2xl bg-card font-jp text-xl font-black text-info shadow-soft [animation-delay:-1.3s]">ア</span>
        <span className="animate-float absolute -right-9 bottom-1 grid size-12 place-items-center rounded-2xl bg-card font-jp text-xl font-black text-streak-ink shadow-soft [animation-delay:-2.6s]">日</span>
      </RevealItem>

      <RevealItem className="flex flex-col gap-3">
        <h1 className="text-[32px] font-extrabold leading-tight tracking-tight sm:text-[40px]">Bắt đầu học tiếng Nhật ngay hôm nay</h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          Học từ con số 0, mỗi ngày chỉ 15 phút. Bài đầu tiên {minutes ? `chỉ khoảng ${minutes} phút` : "rất ngắn"} — bạn sẽ hiểu tiếng Nhật được viết như thế nào.
        </p>
      </RevealItem>

      <RevealItem className="w-full">
        <motion.div whileTap={{ scale: 0.97 }}>
          <Button asChild size="lg" className="shine h-16 w-full rounded-2xl text-lg shadow-[0_5px_0_0_color-mix(in_oklch,var(--primary)_60%,black)]">
            <Link href={href}>
              <Sparkles /> Bắt đầu học ngay
            </Link>
          </Button>
        </motion.div>
        <p className="mt-3 text-sm text-muted-foreground">Miễn phí · Không cần tài khoản · Học được cả khi offline</p>
      </RevealItem>

      <RevealItem className="w-full">
        <p className="mb-3 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Chặng đầu của bạn</p>
        <Card className="divide-y divide-hairline overflow-hidden text-left">
          {steps.map((s, i) => (
            <div key={s.title} className="flex items-center gap-4 px-5 py-4">
              <span className={cn("grid size-12 shrink-0 place-items-center rounded-2xl font-jp text-2xl font-black", i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{s.glyph}</span>
              <div className="min-w-0">
                <p className="font-bold">{s.title}</p>
                <p className="text-sm text-muted-foreground">{s.text}</p>
              </div>
              {i === 0 && <span className="ml-auto shrink-0 rounded-full bg-primary/12 px-2.5 py-1 text-xs font-extrabold text-primary">Bài 1</span>}
            </div>
          ))}
        </Card>
        <p className="mt-3 text-sm text-muted-foreground">…rồi tiếp tục đến N5 → N1 và tiếng Nhật cho công việc.</p>
      </RevealItem>
    </Reveal>
  );
}
