"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Flame, Play, Swords, Timer, Trophy } from "lucide-react";
import type { Level } from "@/types";
import { availableTypes, buildQuiz, QUIZ_TYPE_LABEL, sourceForLevels, type ChoiceQuestion, type Question, type QuizType } from "@/lib/quiz";
import { dateKey } from "@/lib/date";
import { cn, hashString } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Label, Select, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/primitives";
import { PageHeader } from "@/components/learning/common";
import { ChoiceView, QuizRunner } from "@/components/learning/QuizRunner";

const LEVELS: [Level, string][] = [
  ["kana", "Kana"],
  ["intro", "Nhập môn"],
  ["N5", "N5"],
  ["N4", "N4"],
  ["N3", "N3"],
  ["N2", "N2"],
  ["N1", "N1"],
  ["business", "Business"],
  ["it", "IT"],
  ["brse", "BrSE"],
];

export default function QuizPage() {
  return (
    <div>
      <PageHeader title="Quiz & Thử thách" jp="クイズ" description="Trắc nghiệm, điền chỗ trống, ghép cặp, nghe hiểu, nhận diện Kanji, sửa lỗi ngữ pháp và gõ romaji. Điểm = XP + độ chính xác + thưởng tốc độ." />
      <Tabs defaultValue="custom">
        <TabsList>
          <TabsTrigger value="custom"><Swords /> Tự tạo quiz</TabsTrigger>
          <TabsTrigger value="daily"><Flame /> Thử thách hằng ngày</TabsTrigger>
          <TabsTrigger value="challenge"><Timer /> Chế độ tốc độ 60s</TabsTrigger>
        </TabsList>
        <TabsContent value="custom"><CustomQuiz /></TabsContent>
        <TabsContent value="daily"><DailyChallenge /></TabsContent>
        <TabsContent value="challenge"><SpeedChallenge /></TabsContent>
      </Tabs>
    </div>
  );
}

function CustomQuiz() {
  const [levels, setLevels] = useState<Level[]>(["N5"]);
  const source = useMemo(() => sourceForLevels(levels), [levels]);
  const available = availableTypes(source);
  const [types, setTypes] = useState<QuizType[]>(["multiple-choice", "fill-blank", "kanji"]);
  const [count, setCount] = useState(10);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const active = types.filter((t) => available.includes(t));

  if (questions) return <QuizRunner questions={questions} mode={`custom:${levels.join("+")}`} onExit={() => setQuestions(null)} />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thiết lập quiz</CardTitle>
        <CardDescription>Chọn cấp độ và dạng câu hỏi</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label>Cấp độ</Label>
          <div className="flex flex-wrap gap-2">
            {LEVELS.map(([l, label]) => {
              const on = levels.includes(l);
              return (
                <button key={l} onClick={() => setLevels((ls) => (on ? (ls.length > 1 ? ls.filter((x) => x !== l) : ls) : [...ls, l]))} className={cn("rounded-xl border-2 px-3 py-1.5 text-sm font-bold", on ? "border-primary bg-primary/10 text-primary" : "bg-card")}>
                  {label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Dạng câu hỏi</Label>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {(Object.keys(QUIZ_TYPE_LABEL) as QuizType[]).map((t) => {
              const ok = available.includes(t);
              const on = types.includes(t) && ok;
              return (
                <button
                  key={t}
                  disabled={!ok}
                  onClick={() => setTypes((ts) => (ts.includes(t) ? ts.filter((x) => x !== t) : [...ts, t]))}
                  className={cn("rounded-xl border-2 p-3 text-left text-sm font-semibold disabled:opacity-40", on ? "border-primary bg-primary/10" : "bg-card")}
                >
                  {QUIZ_TYPE_LABEL[t]}
                  {!ok && <span className="block text-xs font-normal text-muted-foreground">Không có dữ liệu ở cấp độ này</span>}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Label>Số câu</Label>
          <Select value={String(count)} onChange={(e) => setCount(Number(e.target.value))}>
            {[5, 10, 15, 20, 30].map((n) => <option key={n} value={n}>{n}</option>)}
          </Select>
          <Button size="lg" disabled={!active.length} onClick={() => setQuestions(buildQuiz({ source, types: active, count }))}>
            <Play /> Bắt đầu
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/** Same 15 questions for everyone on a given day (seeded by date); mixed levels around the learner's current stage. */
function DailyChallenge() {
  const key = dateKey();
  const done = useAppStore((s) => s.quizHistory.find((q) => q.mode === `daily:${key}`));
  const [start, setStart] = useState(false);
  const questions = useMemo(
    () => buildQuiz({ source: sourceForLevels(["N5", "N4", "N3"]), types: ["multiple-choice", "fill-blank", "kanji", "correction", "matching"], count: 15, seed: hashString(key) }),
    [key],
  );
  if (start) return <QuizRunner questions={questions} mode={`daily:${key}`} onExit={() => setStart(false)} />;
  return (
    <Card className="flex flex-col items-center gap-3 p-8 text-center">
      <Flame className="size-12 text-orange-500" />
      <h2 className="text-xl font-extrabold">Thử thách ngày {key.split("-").reverse().join("/")}</h2>
      <p className="max-w-md text-sm text-muted-foreground">15 câu hỏi cố định trong ngày (N5–N3). Hoàn thành để giữ chuỗi ngày học và nhận XP.</p>
      {done && <p className="font-semibold text-primary">Hôm nay: {done.correct}/{done.total} đúng · +{done.xp} XP</p>}
      <Button size="lg" onClick={() => setStart(true)}>{done ? "Làm lại" : "Bắt đầu thử thách"}</Button>
    </Card>
  );
}

/** Answer as many questions as possible in 60 seconds. */
function SpeedChallenge() {
  const best = useAppStore((s) => s.challengeBest);
  const [level, setLevel] = useState<Level>("N5");
  const [phase, setPhase] = useState<"idle" | "run" | "end">("idle");
  const [time, setTime] = useState(60);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [q, setQ] = useState<ChoiceQuestion | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [qn, setQn] = useState(0);
  const pool = useRef<ChoiceQuestion[]>([]);

  const nextQ = () => {
    if (!pool.current.length) {
      pool.current = buildQuiz({ source: sourceForLevels([level]), types: ["multiple-choice", "kanji", "fill-blank"].filter((t) => availableTypes(sourceForLevels([level])).includes(t as QuizType)) as QuizType[], count: 30 }).filter(
        (x): x is ChoiceQuestion => x.kind === "choice",
      );
    }
    setPicked(null);
    setQn((n) => n + 1);
    setQ(pool.current.pop() ?? null);
  };

  useEffect(() => {
    if (phase !== "run") return;
    const id = setInterval(() => setTime((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase === "run" && time <= 0) {
      setPhase("end");
      const { setChallengeBest, addXp, recordQuiz } = useAppStore.getState();
      setChallengeBest(score);
      addXp(score * 3);
      recordQuiz({ mode: `challenge:${level}`, correct: score, total: score, xp: score * 3 });
    }
  }, [time, phase, score, level]);

  const begin = () => {
    pool.current = [];
    setScore(0);
    setStreak(0);
    setTime(60);
    nextQ();
    setPhase("run");
  };

  if (phase === "run" && q)
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <div className="flex items-center justify-between rounded-xl bg-muted p-3 font-bold">
          <span className={cn("flex items-center gap-1", time <= 10 && "text-rose-500")}><Timer className="size-4" /> {time}s</span>
          <span>Điểm: {score}</span>
          <span className="text-orange-500">Combo ×{streak}</span>
        </div>
        <Card className="p-6">
          <ChoiceView
            key={qn}
            q={q}
            locked={picked !== null}
            picked={picked}
            onAnswer={(i) => {
              setPicked(i);
              const ok = i === q.answer;
              useAppStore.getState().logAnswer(ok);
              if (ok) {
                setScore((s) => s + 1 + (streak >= 4 ? 1 : 0));
                setStreak((s) => s + 1);
              } else {
                setStreak(0);
                setTime((t) => Math.max(0, t - 3));
              }
              setTimeout(nextQ, ok ? 250 : 700);
            }}
          />
        </Card>
        <p className="text-center text-xs text-muted-foreground">Sai trừ 3 giây · Combo 5+ được nhân đôi điểm</p>
      </div>
    );

  return (
    <Card className="flex flex-col items-center gap-3 p-8 text-center">
      <Trophy className="size-12 text-amber-500" />
      <h2 className="text-xl font-extrabold">Chế độ thử thách 60 giây</h2>
      {phase === "end" && <p className="text-lg font-bold text-primary">Kết quả: {score} điểm · +{score * 3} XP</p>}
      <p className="text-sm text-muted-foreground">Kỷ lục của bạn: <b>{best}</b> điểm</p>
      <div className="flex items-center gap-2">
        <Select value={level} onChange={(e) => setLevel(e.target.value as Level)}>
          {LEVELS.filter(([l]) => l !== "kana" && l !== "intro").map(([l, label]) => <option key={l} value={l}>{label}</option>)}
        </Select>
        <Button size="lg" onClick={begin}><Play /> {phase === "end" ? "Chơi lại" : "Bắt đầu"}</Button>
      </div>
    </Card>
  );
}
