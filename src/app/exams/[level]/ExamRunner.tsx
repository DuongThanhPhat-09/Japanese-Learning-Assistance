"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Clock, Send, Volume2, XCircle } from "lucide-react";
import type { ExamResult, ExamSection, JlptLevel, MockExam } from "@/types";
import { buildMockExam, gradeExam, recommendedTopics, SECTION_LABEL, weaknessReport } from "@/lib/exam";
import { ARTICLE_BY_ID } from "@/data/reading";
import { rubyToKana } from "@/lib/ruby";
import { speakSequence } from "@/lib/speech";
import { cn, formatSeconds } from "@/lib/utils";
import { markPlanItem, useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, Progress } from "@/components/ui/primitives";
import { PageHeader } from "@/components/learning/common";
import { JapaneseText } from "@/components/learning/JapaneseText";

export function ExamRunner({ level }: { level: JlptLevel }) {
  const [exam, setExam] = useState<MockExam | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [idx, setIdx] = useState(0);
  const [left, setLeft] = useState(0);
  const [result, setResult] = useState<ExamResult | null>(null);
  const recordExam = useAppStore((s) => s.recordExam);

  const start = () => {
    const e = buildMockExam(level);
    setExam(e);
    setAnswers({});
    setIdx(0);
    setLeft(e.minutes * 60);
    setResult(null);
  };

  const submit = () => {
    if (!exam) return;
    const graded = gradeExam(exam, answers, exam.minutes * 60 - left);
    useAppStore.getState().recordResults(exam.questions.map((q) => ({ ref: q.ref, correct: answers[q.id] === q.answer })));
    setResult(recordExam(graded));
    markPlanItem("mock-exam");
  };

  useEffect(() => {
    if (!exam || result) return;
    const id = setInterval(() => setLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [exam, result]);

  useEffect(() => {
    if (exam && !result && left <= 0) submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

  if (!exam) {
    return (
      <div>
        <PageHeader title={`Thi thử JLPT ${level}`} jp="模擬試験" />
        <Card className="mx-auto flex max-w-lg flex-col items-center gap-4 p-8 text-center">
          <p className="text-5xl font-black text-primary">{level}</p>
          <p className="text-muted-foreground">Đề được sinh ngẫu nhiên từ kho dữ liệu mỗi lần làm. Đồng hồ đếm ngược, hết giờ tự động nộp bài. Để đỗ cần đạt điểm tổng và tối thiểu 1/3 số câu mỗi phần.</p>
          <ul className="text-left text-sm">
            {Object.entries(SECTION_LABEL).map(([k, v]) => <li key={k}>• {v}</li>)}
          </ul>
          <Button size="lg" onClick={start}>Bắt đầu làm bài</Button>
        </Card>
      </div>
    );
  }

  if (result) return <ExamResultView exam={exam} answers={answers} result={result} onRetry={start} />;

  const q = exam.questions[idx];
  const answered = Object.keys(answers).length;
  const article = q.passage ? ARTICLE_BY_ID.get(q.passage) : undefined;

  return (
    <div className="flex flex-col gap-4">
      <div className="sticky top-14 z-20 -mx-4 flex items-center gap-3 border-b bg-background/95 px-4 py-2 backdrop-blur lg:-mx-8 lg:px-8">
        <span className="font-black">{level}</span>
        <Progress value={(answered / exam.questions.length) * 100} />
        <span className="shrink-0 text-sm text-muted-foreground">{answered}/{exam.questions.length}</span>
        <span className={cn("flex shrink-0 items-center gap-1 font-mono font-bold", left < 60 && "text-rose-500")}>
          <Clock className="size-4" /> {formatSeconds(Math.max(0, left))}
        </span>
        <Button size="sm" onClick={() => confirm("Nộp bài ngay?") && submit()}>
          <Send /> Nộp bài
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
        <Card className="p-6">
          <p className="mb-3 text-xs font-bold uppercase text-primary">{SECTION_LABEL[q.section]} · Câu {idx + 1}</p>
          {article && (
            <div className="mb-4 max-h-72 overflow-y-auto rounded-xl bg-muted/50 p-4 text-lg">
              {article.paragraphs.map((p, i) => (
                <p key={i} className="mb-2"><JapaneseText text={p} furigana={level === "N5" || level === "N4"} interactive={false} /></p>
              ))}
            </div>
          )}
          {q.audioLines && (
            <Button variant="secondary" className="mb-4" onClick={() => speakSequence(q.audioLines!.map((l) => rubyToKana(l.jp)))}>
              <Volume2 /> Nghe đoạn hội thoại
            </Button>
          )}
          <p className="font-jp mb-4 whitespace-pre-line text-lg font-semibold">{q.prompt}</p>
          <div className="grid gap-2">
            {q.options.map((o, i) => (
              <button
                key={i}
                onClick={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
                className={cn("font-jp flex items-center gap-3 rounded-xl border-2 bg-card px-4 py-3 text-left", answers[q.id] === i && "border-primary bg-primary/10")}
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-full border text-xs">{i + 1}</span>
                {o}
              </button>
            ))}
          </div>
          <div className="mt-5 flex justify-between">
            <Button variant="outline" disabled={idx === 0} onClick={() => setIdx((i) => i - 1)}><ChevronLeft /> Trước</Button>
            <Button variant="outline" disabled={idx === exam.questions.length - 1} onClick={() => setIdx((i) => i + 1)}>Sau <ChevronRight /></Button>
          </div>
        </Card>
        <Card className="h-fit p-4">
          <p className="mb-2 text-sm font-semibold">Danh sách câu</p>
          <div className="grid grid-cols-6 gap-1.5 lg:grid-cols-5">
            {exam.questions.map((x, i) => (
              <button
                key={x.id}
                onClick={() => setIdx(i)}
                className={cn("aspect-square rounded-md border text-xs font-semibold", answers[x.id] !== undefined && "border-primary bg-primary/15 text-primary", i === idx && "ring-2 ring-ring")}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function ExamResultView({ exam, answers, result, onRetry }: { exam: MockExam; answers: Record<string, number>; result: ExamResult; onRetry: () => void }) {
  const weak = weaknessReport(result);
  const topics = useMemo(() => recommendedTopics(result.wrongRefs), [result]);
  return (
    <div className="flex flex-col gap-4">
      <Card className={cn("flex flex-col items-center gap-2 p-8 text-center", result.passed ? "bg-emerald-500/8" : "bg-rose-500/8")}>
        {result.passed ? <CheckCircle2 className="size-12 text-emerald-500" /> : <XCircle className="size-12 text-rose-500" />}
        <p className="text-5xl font-black">{result.score}%</p>
        <p className="text-lg font-bold">{result.passed ? `Đỗ đề thi thử ${result.level}! 🎉` : `Chưa đạt (cần ${exam.passMark}% và ≥1/3 mỗi phần)`}</p>
        <p className="text-sm text-muted-foreground">Thời gian làm bài: {formatSeconds(result.seconds)} · +{50 + Math.round(result.score / 2)} XP</p>
        <div className="mt-2 flex gap-2">
          <Button onClick={onRetry}>Làm đề mới</Button>
          <Button asChild variant="outline"><Link href="/exams/">Lịch sử</Link></Button>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Phân tích theo phần</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-3">
            {(Object.keys(result.sections) as ExamSection[]).filter((s) => result.sections[s].total).map((s) => {
              const sec = result.sections[s];
              const p = Math.round((sec.correct / sec.total) * 100);
              return (
                <div key={s}>
                  <div className="mb-1 flex justify-between text-sm"><span>{SECTION_LABEL[s]}</span><span className="font-semibold">{sec.correct}/{sec.total} ({p}%)</span></div>
                  <Progress value={p} indicatorClassName={p < 34 ? "bg-rose-500" : p < 60 ? "bg-amber-500" : "bg-emerald-500"} />
                </div>
              );
            })}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="size-4 text-amber-500" /> Báo cáo điểm yếu</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-3">
            {weak.slice(0, 3).map((w) => (
              <div key={w.section} className="rounded-lg bg-muted/60 p-3">
                <p className="font-semibold">{SECTION_LABEL[w.section]} — {w.accuracy}%</p>
                <p className="text-sm text-muted-foreground">{w.advice}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {topics.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Chủ đề nên ôn lại</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {topics.map((t) => (
              <Link key={t.href + t.label} href={t.href} className="font-jp rounded-full border px-3 py-1.5 text-sm hover:border-primary hover:text-primary">{t.label}</Link>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Xem lại đáp án</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3">
          {exam.questions.map((q, i) => {
            const ok = answers[q.id] === q.answer;
            return (
              <div key={q.id} className={cn("rounded-lg border-l-4 p-3", ok ? "border-emerald-500 bg-emerald-500/5" : "border-rose-500 bg-rose-500/5")}>
                <p className="font-jp whitespace-pre-line text-sm font-semibold">{i + 1}. {q.prompt}</p>
                <p className="font-jp text-sm">
                  Đáp án: <b>{q.options[q.answer]}</b>
                  {!ok && <span className="text-rose-600"> · Bạn chọn: {answers[q.id] !== undefined ? q.options[answers[q.id]] : "(bỏ trống)"}</span>}
                </p>
                {q.explanation && <p className="font-jp text-xs text-muted-foreground">{q.explanation}</p>}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
