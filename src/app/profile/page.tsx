"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Clock, Flame, Moon, Sun, Target, Zap } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useStats } from "@/hooks/useStats";
import { useLearner } from "@/hooks/useEngine";
import { ACHIEVEMENTS, TIER_COLOR } from "@/data/achievements";
import { activitySeries } from "@/lib/stats";
import { countByState, forecast } from "@/lib/srs";
import { addDays, lastNDays, weekdayLabel } from "@/lib/date";
import { levelTitle } from "@/lib/xp";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Progress, Switch } from "@/components/ui/primitives";
import { ActivityHeatmap, AreaSeries, BarSeries, SrsStateBar } from "@/components/charts/Charts";
import { PROFILE_MENU } from "@/components/layout/nav";
import { useTheme } from "@/components/layout/AppShell";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { Reveal, RevealItem } from "@/components/motion/Reveal";

export default function ProfilePage() {
  const stats = useStats();
  const name = useAppStore((s) => s.profile.name);
  const unlocked = useAppStore((s) => s.achievements);
  const { stage, beginner } = useLearner();

  const badges = useMemo(
    () =>
      ACHIEVEMENTS.filter((a) => unlocked[a.id])
        .sort((a, b) => unlocked[b.id] - unlocked[a.id])
        .slice(0, 6),
    [unlocked],
  );

  return (
    <Reveal className="mx-auto flex max-w-2xl flex-col gap-8">
      {/* Identity + level */}
      <RevealItem className="flex items-center gap-5 pt-2">
        <span className="bg-hero grid size-20 shrink-0 place-items-center rounded-full text-3xl font-black text-white shadow-lift">{name.trim().charAt(0).toUpperCase() || "?"}</span>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <h1 className="truncate text-[26px] font-extrabold leading-tight tracking-tight">{name}</h1>
          <p className="text-sm text-muted-foreground">
            Cấp {stats.level} · <span className="font-jp">{levelTitle(stats.level)}</span> · Đang học {stage.title}
          </p>
          <div className="flex items-center gap-3">
            <Progress value={stats.percent} className="h-2" indicatorClassName="bg-xp" />
            <span className="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">
              {stats.current}/{stats.needed} XP
            </span>
          </div>
        </div>
      </RevealItem>

      {/* Headline numbers */}
      <RevealItem className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric icon={<Flame />} tone="text-streak bg-streak/12" value={<NumberTicker value={stats.streak} />} unit="ngày" label={`Chuỗi · kỷ lục ${stats.longestStreak}`} />
        <Metric icon={<Zap />} tone="text-xp bg-xp/15" value={<NumberTicker value={stats.xp} />} unit="XP" label="Tổng kinh nghiệm" />
        <Metric icon={<Clock />} tone="text-info bg-info/12" {...studyTime(stats.totalMinutes)} label="Thời gian học" />
        <Metric icon={<Target />} tone="text-primary bg-primary/12" value={`${stats.accuracy}%`} label="Độ chính xác" />
      </RevealItem>

      {/* Achievements preview */}
      <RevealItem className="flex flex-col gap-3">
        <SectionTitle title="Thành tích" href="/achievements/" action={`${Object.keys(unlocked).length}/${ACHIEVEMENTS.length} · Xem tất cả`} />
        <Card className="p-5">
          {badges.length ? (
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
              {badges.map((a) => (
                <div key={a.id} className="flex flex-col items-center gap-1.5 text-center" title={a.description}>
                  <span className={cn("grid size-14 place-items-center rounded-full bg-gradient-to-br font-jp text-2xl shadow-soft", TIER_COLOR[a.tier])}>{a.icon}</span>
                  <span className="line-clamp-2 text-xs font-semibold leading-tight">{a.title}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-[15px] text-muted-foreground">Hoàn thành bài học đầu tiên để nhận huy hiệu 🌱</p>
          )}
        </Card>
      </RevealItem>

      <WeeklyChart />
      <AdvancedStats defaultOpen={!beginner} />

      {/* Menu */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold tracking-tight">Cá nhân & cài đặt</h2>
        <Card className="divide-y divide-hairline overflow-hidden">
          {PROFILE_MENU.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/50">
              <item.icon className="size-5 text-muted-foreground" />
              <span className="flex-1 font-semibold">{item.label}</span>
              <ChevronRight className="size-5 text-muted-foreground" />
            </Link>
          ))}
          <ThemeRow />
        </Card>
      </section>
    </Reveal>
  );
}

/** Compact study time for a stat tile: "45 phút" or "22,8 giờ". */
function studyTime(minutes: number) {
  return minutes < 60 ? { value: `${minutes}`, unit: "phút" } : { value: (minutes / 60).toLocaleString("vi-VN", { maximumFractionDigits: 1 }), unit: "giờ" };
}

function Metric({ icon, tone, value, unit, label }: { icon: React.ReactNode; tone: string; value: React.ReactNode; unit?: string; label: string }) {
  return (
    <Card className="flex flex-col gap-3 p-4">
      <span className={cn("grid size-9 place-items-center rounded-xl [&_svg]:size-[18px]", tone)}>{icon}</span>
      <div>
        <p className="text-2xl font-extrabold leading-none tabular-nums">
          {value}
          {unit && <span className="ml-1 text-sm font-bold text-muted-foreground">{unit}</span>}
        </p>
        <p className="mt-1.5 truncate text-xs text-muted-foreground">{label}</p>
      </div>
    </Card>
  );
}

function SectionTitle({ title, href, action }: { title: string; href: string; action: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h2 className="text-lg font-bold tracking-tight">{title}</h2>
      <Link href={href} className="flex items-center gap-0.5 text-sm font-semibold text-primary">
        {action} <ChevronRight className="size-4" />
      </Link>
    </div>
  );
}

function WeeklyChart() {
  const activity = useAppStore((s) => s.activity);
  const week = useMemo(() => activitySeries(activity, 7).map((d) => ({ ...d, label: weekdayLabel(d.date) })), [activity]);
  const total = week.reduce((s, d) => s + d.xp, 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle>XP 7 ngày qua</CardTitle>
        <CardDescription>{total.toLocaleString("vi-VN")} XP trong tuần</CardDescription>
      </CardHeader>
      <CardContent>
        <BarSeries data={week} dataKey="xp" xKey="label" unit="XP" height={190} />
      </CardContent>
    </Card>
  );
}

/** Deep analytics: open by default from N4, collapsed for beginners. */
function AdvancedStats({ defaultOpen }: { defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const stats = useStats();
  const activity = useAppStore((s) => s.activity);
  const cards = useAppStore((s) => s.cards);
  const list = useMemo(() => Object.values(cards), [cards]);
  const month = useMemo(() => activitySeries(activity, 30).map((d) => ({ ...d, label: d.date.slice(5).replace("-", "/"), minutes: Math.round(d.minutes) })), [activity]);
  const heat = useMemo(() => activitySeries(activity, 7 * 18), [activity]);
  const fc = useMemo(() => {
    const days = lastNDays(7, addDays(new Date(), 6));
    return forecast(list, 7).map((n, i) => ({ label: i === 0 ? "Hôm nay" : weekdayLabel(days[i]), cards: n }));
  }, [list]);

  return (
    <section className="flex flex-col gap-4">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center justify-between text-left" aria-expanded={open}>
        <div>
          <h2 className="text-lg font-bold tracking-tight">Thống kê nâng cao</h2>
          <p className="text-sm text-muted-foreground">Kiến thức, lịch hoạt động, trạng thái thẻ, dự báo ôn</p>
        </div>
        <ChevronDown className={cn("size-5 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="animate-pop flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Kiến thức đã học</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {[
                ["Từ vựng", stats.vocabLearned, stats.vocabTotal],
                ["Ngữ pháp", stats.grammarCompleted, stats.grammarTotal],
                ["Kanji (đã học)", stats.kanjiLearned, stats.kanjiTotal],
              ].map(([label, n, total]) => (
                <div key={label} className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{label}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {n} / {total}
                    </span>
                  </div>
                  <Progress value={(Number(n) / Math.max(1, Number(total))) * 100} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Phút học 30 ngày qua</CardTitle>
            </CardHeader>
            <CardContent>
              <AreaSeries data={month} dataKey="minutes" xKey="label" unit="phút" height={190} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Lịch hoạt động</CardTitle>
              <CardDescription>18 tuần gần nhất · {stats.activeDays} ngày có học</CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityHeatmap days={heat} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Trạng thái thẻ SRS ({list.length})</CardTitle>
              <CardDescription>Mới → Đang học → Ôn tập → Thành thạo</CardDescription>
            </CardHeader>
            <CardContent>
              <SrsStateBar counts={countByState(list)} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Dự báo ôn tập 7 ngày</CardTitle>
            </CardHeader>
            <CardContent>
              <BarSeries data={fc} dataKey="cards" xKey="label" unit="thẻ" height={170} />
            </CardContent>
          </Card>
        </div>
      )}
    </section>
  );
}

function ThemeRow() {
  const { dark, toggle } = useTheme();
  return (
    <label className="flex cursor-pointer items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/50">
      {dark ? <Moon className="size-5 text-muted-foreground" /> : <Sun className="size-5 text-muted-foreground" />}
      <span className="flex-1 font-semibold">Giao diện tối</span>
      <Switch checked={dark} onCheckedChange={toggle} />
    </label>
  );
}
