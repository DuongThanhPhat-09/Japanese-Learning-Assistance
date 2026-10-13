"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Goal as GoalIcon, ListTodo, Minus, Plus, Trash2 } from "lucide-react";
import type { PlannerTask } from "@/types";
import { addDays, dateKey, parseDateKey, VI_WEEKDAYS } from "@/lib/date";
import { cn, pct } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, Input, Label, Progress, Select, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/primitives";
import { EmptyState, PageHeader } from "@/components/learning/common";

const CATEGORIES: Record<PlannerTask["category"], string> = {
  vocabulary: "Từ vựng",
  grammar: "Ngữ pháp",
  kanji: "Kanji",
  reading: "Đọc",
  listening: "Nghe",
  review: "Ôn tập SRS",
  exam: "Thi thử",
  other: "Khác",
};

export default function PlannerPage() {
  return (
    <div>
      <PageHeader title="Kế hoạch & Mục tiêu" jp="学習計画" description="Lập kế hoạch học theo ngày, xem lịch học và theo dõi mục tiêu dài hạn (ví dụ: đỗ N3 vào tháng 7)." />
      <Tabs defaultValue="planner">
        <TabsList>
          <TabsTrigger value="planner"><ListTodo /> Kế hoạch</TabsTrigger>
          <TabsTrigger value="calendar"><CalendarDays /> Lịch học</TabsTrigger>
          <TabsTrigger value="goals"><GoalIcon /> Mục tiêu</TabsTrigger>
        </TabsList>
        <TabsContent value="planner"><Planner /></TabsContent>
        <TabsContent value="calendar"><LearningCalendar /></TabsContent>
        <TabsContent value="goals"><GoalTracker /></TabsContent>
      </Tabs>
    </div>
  );
}

function Planner() {
  const tasks = useAppStore((s) => s.tasks);
  const upsertTask = useAppStore((s) => s.upsertTask);
  const removeTask = useAppStore((s) => s.removeTask);
  const [date, setDate] = useState(dateKey());
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<PlannerTask["category"]>("review");
  const [minutes, setMinutes] = useState(20);
  const days = Array.from({ length: 7 }, (_, i) => dateKey(addDays(parseDateKey(date), i)));

  const add = () => {
    if (!title.trim()) return;
    upsertTask({ date, title: title.trim(), category, minutes, done: false });
    setTitle("");
  };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader><CardTitle>Thêm nhiệm vụ</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap items-end gap-2">
          <div className="flex min-w-48 flex-1 flex-col gap-1"><Label>Nội dung</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="VD: Học 10 từ N4 chủ đề sức khỏe" /></div>
          <div className="flex flex-col gap-1"><Label>Ngày</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value || dateKey())} /></div>
          <div className="flex flex-col gap-1"><Label>Loại</Label>
            <Select value={category} onChange={(e) => setCategory(e.target.value as PlannerTask["category"])}>
              {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </div>
          <div className="flex w-24 flex-col gap-1"><Label>Phút</Label><Input type="number" min={5} step={5} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} /></div>
          <Button onClick={add}><Plus /> Thêm</Button>
        </CardContent>
      </Card>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {days.map((d) => {
          const list = tasks.filter((t) => t.date === d);
          const total = list.reduce((s, t) => s + t.minutes, 0);
          const dt = parseDateKey(d);
          return (
            <Card key={d} className={cn(d === dateKey() && "ring-2 ring-primary")}>
              <CardHeader className="flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">{VI_WEEKDAYS[(dt.getDay() + 6) % 7]}, {dt.getDate()}/{dt.getMonth() + 1}</CardTitle>
                <span className="text-xs text-muted-foreground">{total} phút</span>
              </CardHeader>
              <CardContent className="flex flex-col gap-1.5">
                {list.length ? list.map((t) => (
                  <div key={t.id} className="flex items-center gap-2 rounded-lg bg-muted/50 px-2 py-1.5 text-sm">
                    <input type="checkbox" checked={t.done} onChange={() => upsertTask({ ...t, done: !t.done })} className="size-4 accent-[var(--primary)]" />
                    <span className={cn("flex-1", t.done && "text-muted-foreground line-through")}>{t.title}</span>
                    <span className="text-[11px] text-muted-foreground">{CATEGORIES[t.category]}</span>
                    <button onClick={() => removeTask(t.id)} className="text-muted-foreground hover:text-destructive" aria-label="Xóa"><Trash2 className="size-3.5" /></button>
                  </div>
                )) : <p className="text-xs text-muted-foreground">Chưa có nhiệm vụ</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function LearningCalendar() {
  const activity = useAppStore((s) => s.activity);
  const tasks = useAppStore((s) => s.tasks);
  const goal = useAppStore((s) => s.profile.dailyGoalXp);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const cells = useMemo(() => {
    const pad = (month.getDay() + 6) % 7;
    const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return [...Array(pad).fill(null), ...Array.from({ length: days }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))];
  }, [month]);
  const [selected, setSelected] = useState(dateKey());
  const sel = activity[selected];
  const selTasks = tasks.filter((t) => t.date === selected);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft /></Button>
          <CardTitle>Tháng {month.getMonth() + 1}/{month.getFullYear()}</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight /></Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-foreground">
            {VI_WEEKDAYS.map((d) => <div key={d} className="py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, i) => {
              if (!d) return <div key={i} />;
              const key = dateKey(d);
              const a = activity[key];
              const xp = a?.xp ?? 0;
              const planned = tasks.filter((t) => t.date === key).length;
              return (
                <button
                  key={key}
                  onClick={() => setSelected(key)}
                  className={cn(
                    "flex aspect-square flex-col items-center justify-center rounded-lg border text-sm",
                    xp >= goal ? "bg-emerald-500 font-bold text-white" : xp > 0 ? "bg-emerald-500/25" : "bg-card",
                    key === selected && "ring-2 ring-ring",
                    key === dateKey() && "border-primary border-2",
                  )}
                >
                  {d.getDate()}
                  {planned > 0 && <span className="mt-0.5 size-1.5 rounded-full bg-sky-500" />}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="size-3 rounded bg-emerald-500" /> Đạt mục tiêu</span>
            <span className="flex items-center gap-1"><span className="size-3 rounded bg-emerald-500/25" /> Có học</span>
            <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-sky-500" /> Có kế hoạch</span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>{parseDateKey(selected).toLocaleDateString("vi-VN")}</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          {sel ? (
            <>
              <p>XP: <b>{sel.xp}</b></p>
              <p>Thời gian: <b>{Math.round(sel.minutes)} phút</b></p>
              <p>Lượt ôn SRS: <b>{sel.reviews}</b></p>
              <p>Trả lời đúng: <b>{sel.correct}/{sel.answered}</b></p>
              <p>Bài hoàn thành: <b>{sel.lessons}</b></p>
            </>
          ) : <p className="text-muted-foreground">Không có hoạt động.</p>}
          {selTasks.length > 0 && (
            <div className="mt-2 border-t pt-2">
              <p className="mb-1 font-semibold">Kế hoạch</p>
              {selTasks.map((t) => <p key={t.id} className={t.done ? "line-through text-muted-foreground" : ""}>• {t.title}</p>)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function GoalTracker() {
  const goals = useAppStore((s) => s.goals);
  const upsertGoal = useAppStore((s) => s.upsertGoal);
  const removeGoal = useAppStore((s) => s.removeGoal);
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState(100);
  const [unit, setUnit] = useState("từ");
  const [deadline, setDeadline] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader><CardTitle>Mục tiêu mới</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap items-end gap-2">
          <div className="flex min-w-48 flex-1 flex-col gap-1"><Label>Mục tiêu</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="VD: Đỗ JLPT N3 tháng 7/2027" /></div>
          <div className="flex w-24 flex-col gap-1"><Label>Chỉ tiêu</Label><Input type="number" min={1} value={target} onChange={(e) => setTarget(Number(e.target.value))} /></div>
          <div className="flex w-28 flex-col gap-1"><Label>Đơn vị</Label><Input value={unit} onChange={(e) => setUnit(e.target.value)} /></div>
          <div className="flex flex-col gap-1"><Label>Hạn chót</Label><Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} /></div>
          <Button onClick={() => { if (title.trim()) { upsertGoal({ title: title.trim(), target, current: 0, unit, deadline: deadline || undefined }); setTitle(""); } }}><Plus /> Thêm</Button>
        </CardContent>
      </Card>
      {goals.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {goals.map((g) => {
            const p = pct(g.current, g.target);
            const daysLeft = g.deadline ? Math.ceil((parseDateKey(g.deadline).getTime() - Date.now()) / 864e5) : null;
            return (
              <Card key={g.id} className="flex flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold">{g.title}</p>
                    {daysLeft !== null && <p className={cn("text-xs", daysLeft < 0 ? "text-destructive" : "text-muted-foreground")}>{daysLeft < 0 ? "Đã quá hạn" : `Còn ${daysLeft} ngày`}</p>}
                  </div>
                  <button onClick={() => removeGoal(g.id)} className="text-muted-foreground hover:text-destructive" aria-label="Xóa"><Trash2 className="size-4" /></button>
                </div>
                <Progress value={p} indicatorClassName={p >= 100 ? "bg-amber-500" : undefined} />
                <div className="flex items-center justify-between">
                  <span className="text-sm"><b>{g.current}</b> / {g.target} {g.unit} ({p}%)</span>
                  <div className="flex gap-1">
                    <Button size="icon" variant="outline" onClick={() => upsertGoal({ ...g, current: Math.max(0, g.current - 1) })}><Minus /></Button>
                    <Button size="icon" variant="outline" onClick={() => upsertGoal({ ...g, current: g.current + 1 })}><Plus /></Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState icon="🎯" title="Chưa có mục tiêu nào">Đặt mục tiêu cụ thể, có số đo và hạn chót giúp bạn duy trì động lực.</EmptyState>
      )}
    </div>
  );
}
