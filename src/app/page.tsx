"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Brain, Check, ChevronRight, Flame, Play } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useStats } from "@/hooks/useStats";
import { useDailyPlan, useLearner } from "@/hooks/useEngine";
import { INLINE_BLOCKS } from "@/lib/engine";
import { isDue } from "@/lib/srs";
import { addDays, dateKey, startOfWeek, VI_WEEKDAYS } from "@/lib/date";
import { cn, formatMinutes, pct } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, Progress, ProgressRing } from "@/components/ui/primitives";
import { StageIcon } from "@/components/learning/StageIcon";

function greeting(hour: number) {
  if (hour < 11) return "Chào buổi sáng";
  if (hour < 14) return "Chào buổi trưa";
  if (hour < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

/** One short, situational nudge — never a metric. */
function motivation({ todayXp, goal, streak, planDone, beginner }: { todayXp: number; goal: number; streak: number; planDone: boolean; beginner: boolean }) {
  if (planDone) return "Xong kế hoạch hôm nay rồi! Nghỉ ngơi giúp trí nhớ được củng cố.";
  if (todayXp >= goal) return "Đã đạt mục tiêu hôm nay — mọi thứ thêm vào đều là phần thưởng.";
  if (streak > 0 && todayXp === 0) return `Học một chút để giữ chuỗi ${streak} ngày nhé 🔥`;
  if (todayXp > 0) return `Còn ${goal - todayXp} XP nữa là đạt mục tiêu hôm nay.`;
  if (beginner) return "Mỗi ngày 15–30 phút là đủ. Cứ đi từng bước nhỏ.";
  return "Ôn đúng lúc, học vừa sức — kế hoạch hôm nay đã sẵn sàng.";
}

export default function HomePage() {
  const stats = useStats();
  const profile = useAppStore((s) => s.profile);
  const activity = useAppStore((s) => s.activity);
  const cards = useAppStore((s) => s.cards);
  const { stage, beginner } = useLearner();
  const { plan, done } = useDailyPlan();

  const due = useMemo(() => Object.values(cards).filter((c) => isDue(c)).length, [cards]);
  const todayXp = activity[dateKey()]?.xp ?? 0;
  const goal = profile.dailyGoalXp;
  const blocksDone = plan ? plan.blocks.filter((b) => done.includes(b.id)).length : 0;
  const nextBlock = plan?.blocks.find((b) => !done.includes(b.id));
  const planFinished = !!plan && plan.blocks.length > 0 && !nextBlock;
  // Inline blocks open straight away on Today; page-based blocks (reading, kana course…) link to their page.
  const continueHref = nextBlock && !INLINE_BLOCKS.has(nextBlock.kind) && nextBlock.href ? nextBlock.href : "/today/?start=1";

  const week = useMemo(() => {
    const start = startOfWeek();
    return Array.from({ length: 7 }, (_, i) => {
      const key = dateKey(addDays(start, i));
      const d = activity[key];
      return { key, label: VI_WEEKDAYS[i], active: !!d && (d.xp > 0 || d.minutes >= 1), minutes: d?.minutes ?? 0 };
    });
  }, [activity]);
  const weekMinutes = week.reduce((s, d) => s + d.minutes, 0);
  const todayKey = dateKey();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      {/* Welcome */}
      <section className="animate-rise flex flex-col gap-3 pt-2">
        <div>
          <h1 className="text-[28px] font-extrabold leading-tight tracking-tight sm:text-[32px]">
            {greeting(new Date().getHours())}, {profile.name} 👋
          </h1>
          <p className="mt-1.5 text-base text-muted-foreground">{motivation({ todayXp, goal, streak: stats.streak, planDone: planFinished, beginner })}</p>
        </div>
        <Link href="/profile/" className="group flex max-w-sm items-center gap-3">
          <span className="shrink-0 rounded-full bg-xp/15 px-2.5 py-0.5 text-xs font-extrabold text-xp-ink">Cấp {stats.level}</span>
          <Progress value={stats.percent} className="h-2" indicatorClassName="bg-xp" />
          <span className="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">
            {stats.current}/{stats.needed} XP
          </span>
        </Link>
      </section>

      {/* Continue learning: the one primary action */}
      <section className="bg-hero animate-rise relative overflow-hidden rounded-3xl p-6 text-white shadow-lift sm:p-8" style={{ animationDelay: "60ms" }}>
        <StageIcon name={stage.icon} className="pointer-events-none absolute -right-6 -top-6 size-40 opacity-10" />
        <p className="text-xs font-bold uppercase tracking-widest text-white/80">
          Giai đoạn {stage.order} · {stage.title}
        </p>
        {planFinished ? (
          <>
            <h2 className="mt-3 text-2xl font-extrabold leading-snug sm:text-[28px]">Hoàn thành bài học hôm nay 🎉</h2>
            <p className="mt-1.5 text-white/85">Hẹn gặp lại ngày mai. Muốn học thêm? Đọc hoặc nghe một bài nhẹ nhàng.</p>
            <Progress value={100} className="mt-5 h-2.5 bg-white/25" indicatorClassName="bg-white" />
            <Button asChild size="lg" className="mt-6 w-full bg-white text-emerald-700 shadow-[0_4px_0_0_rgba(0,0,0,0.15)] hover:bg-white/95 sm:w-auto">
              <Link href="/learn/">
                Xem lộ trình <ChevronRight />
              </Link>
            </Button>
          </>
        ) : (
          <>
            <h2 className="font-jp mt-3 line-clamp-2 text-2xl font-extrabold leading-snug sm:text-[28px]">{nextBlock?.title ?? "Bài học hôm nay"}</h2>
            <p className="mt-1.5 text-white/85">
              {plan ? `≈ ${plan.minutes} phút · ${blocksDone}/${plan.blocks.length} phần đã xong` : "Đang chuẩn bị kế hoạch…"}
            </p>
            <Progress value={plan ? pct(blocksDone, plan.blocks.length) : 0} className="mt-5 h-2.5 bg-white/25" indicatorClassName="bg-white" />
            <Button asChild size="lg" className="mt-6 w-full bg-white text-emerald-700 shadow-[0_4px_0_0_rgba(0,0,0,0.15)] hover:bg-white/95 sm:w-auto sm:min-w-64">
              <Link href={continueHref}>
                <Play className="fill-current" /> {blocksDone ? "Tiếp tục học" : "Bắt đầu học"}
              </Link>
            </Button>
          </>
        )}
      </section>

      {/* Today at a glance */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold tracking-tight">Hôm nay</h2>
        <Card className="grid grid-cols-3 divide-x divide-hairline">
          <div className="flex flex-col items-center gap-2 p-4 sm:p-5">
            <ProgressRing value={pct(todayXp, goal)} size={64} stroke={7} color="var(--xp)">
              {todayXp >= goal ? <Check className="size-6 text-xp" strokeWidth={3} /> : <span className="text-sm font-extrabold tabular-nums">{pct(todayXp, goal)}%</span>}
            </ProgressRing>
            <div className="text-center">
              <p className="text-sm font-bold tabular-nums">
                {todayXp}/{goal} XP
              </p>
              <p className="text-xs text-muted-foreground">Mục tiêu ngày</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 sm:p-5">
            <span className={cn("grid size-16 place-items-center rounded-full", todayXp > 0 ? "bg-streak/12" : "bg-muted")}>
              <Flame className={cn("size-8", todayXp > 0 ? "animate-flicker fill-streak/70 text-streak" : "text-muted-foreground")} />
            </span>
            <div className="text-center">
              <p className="text-sm font-bold tabular-nums">{stats.streak} ngày</p>
              <p className="text-xs text-muted-foreground">Chuỗi học</p>
            </div>
          </div>
          <Link href={due ? "/review/?start=1" : "/review/"} className="group flex flex-col items-center gap-2 rounded-r-2xl p-4 transition-colors hover:bg-muted/50 sm:p-5">
            <span className={cn("relative grid size-16 place-items-center rounded-full", due ? "bg-info/12 text-info" : "bg-muted text-muted-foreground")}>
              <Brain className="size-8" />
              {due > 0 && <span className="absolute -right-1 -top-1 grid h-6 min-w-6 place-items-center rounded-full bg-destructive px-1.5 text-xs font-extrabold text-white">{due > 99 ? "99+" : due}</span>}
            </span>
            <div className="text-center">
              <p className="text-sm font-bold">{due ? "Ôn ngay" : "Đã ôn xong"}</p>
              <p className="text-xs text-muted-foreground">{due ? `${due} thẻ đến hạn` : "Không có thẻ đến hạn"}</p>
            </div>
          </Link>
        </Card>
      </section>

      {/* Weekly progress */}
      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-bold tracking-tight">Tuần này</h2>
          <span className="text-sm font-semibold tabular-nums text-muted-foreground">
            {formatMinutes(weekMinutes)} / {formatMinutes(profile.weeklyGoalMinutes)}
          </span>
        </div>
        <Card className="flex flex-col gap-5 p-5 sm:p-6">
          <div className="grid grid-cols-7 gap-1">
            {week.map((d) => {
              const isToday = d.key === todayKey;
              const future = d.key > todayKey;
              return (
                <div key={d.key} className="flex flex-col items-center gap-2">
                  <span className={cn("text-xs font-bold", isToday ? "text-foreground" : "text-muted-foreground")}>{d.label}</span>
                  <span
                    className={cn(
                      "grid size-9 place-items-center rounded-full transition-colors sm:size-10",
                      d.active ? "bg-streak text-white" : future ? "bg-muted/50" : "bg-muted",
                      isToday && !d.active && "ring-2 ring-streak/60 ring-offset-2 ring-offset-card",
                    )}
                  >
                    {d.active && <Check className="size-5" strokeWidth={3} />}
                  </span>
                </div>
              );
            })}
          </div>
          <Progress value={pct(weekMinutes, profile.weeklyGoalMinutes)} className="h-2" />
        </Card>
      </section>

    </div>
  );
}
