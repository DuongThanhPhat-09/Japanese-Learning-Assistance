"use client";

import { useEffect, useState } from "react";
import { Check, Languages, MessageSquareText, Pause, Play, RotateCcw, Timer, Type } from "lucide-react";
import type { Article, QuizQuestion } from "@/types";
import { CATEGORY_LABEL } from "@/data/reading";
import { rubyToKana, stripRuby } from "@/lib/ruby";
import { XP } from "@/lib/xp";
import { cn, formatSeconds } from "@/lib/utils";
import { finishComprehension, useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, Switch } from "@/components/ui/primitives";
import { LevelBadge, SpeakButton } from "./common";
import { JapaneseText } from "./JapaneseText";

export function ComprehensionQuestions({ questions, onFinish }: { questions: QuizQuestion[]; onFinish?: (pct: number) => void }) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const allAnswered = questions.every((q) => answers[q.id] !== undefined);
  const correct = questions.filter((q) => answers[q.id] === q.answer).length;
  useEffect(() => {
    if (allAnswered && questions.length) onFinish?.(Math.round((correct / questions.length) * 100));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allAnswered]);
  return (
    <div className="flex flex-col gap-5">
      {questions.map((q, qi) => {
        const picked = answers[q.id];
        return (
          <div key={q.id} className="flex flex-col gap-2">
            <p className="font-jp font-semibold">
              {qi + 1}. {q.prompt}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {q.options.map((o, i) => (
                <button
                  key={i}
                  disabled={picked !== undefined}
                  onClick={() => {
                    setAnswers((a) => ({ ...a, [q.id]: i }));
                    useAppStore.getState().logAnswer(i === q.answer);
                  }}
                  className={cn(
                    "font-jp rounded-xl border-2 bg-card px-3 py-2 text-left text-sm",
                    picked !== undefined && i === q.answer && "border-emerald-500 bg-emerald-500/10",
                    picked === i && i !== q.answer && "border-rose-500 bg-rose-500/10",
                  )}
                >
                  {o}
                </button>
              ))}
            </div>
            {picked !== undefined && q.explanation && <p className="text-sm text-muted-foreground">{q.explanation}</p>}
          </div>
        );
      })}
      {allAnswered && (
        <p className="font-semibold">
          Kết quả: {correct}/{questions.length} câu đúng
        </p>
      )}
    </div>
  );
}

export function ArticleReader({ article }: { article: Article }) {
  const furiDefault = useAppStore((s) => s.profile.furiganaDefault);
  const done = useAppStore((s) => !!s.completed[`reading:${article.id}`]);
  const score = useAppStore((s) => s.scores[`reading:${article.id}`]);
  const [furigana, setFurigana] = useState(furiDefault);
  const [translation, setTranslation] = useState(false);
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [finishedAt, setFinishedAt] = useState<number | null>(null);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const chars = article.paragraphs.map(stripRuby).join("").replace(/[\s、。「」]/g, "").length;
  const cpm = finishedAt ? Math.round((chars / Math.max(finishedAt, 1)) * 60) : null;

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <LevelBadge level={article.level} />
          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold">{CATEGORY_LABEL[article.category]}</span>
          {done && <span className="text-sm font-semibold text-primary">✓ Đã đọc</span>}
        </div>
        <h1 className="mt-2 text-2xl font-extrabold">
          <JapaneseText text={article.title} furigana={furigana} interactive={false} />
        </h1>
        <p className="text-muted-foreground">{article.titleVi}</p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Switch checked={furigana} onCheckedChange={setFurigana} /> <Type className="size-4" /> Furigana
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <Switch checked={translation} onCheckedChange={setTranslation} /> <Languages className="size-4" /> Bản dịch
          </label>
          <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm">
            <Timer className="size-4" />
            <span className="w-12 font-mono font-semibold">{formatSeconds(seconds)}</span>
            {!finishedAt && (
              <button onClick={() => setRunning((r) => !r)} className="text-primary" aria-label={running ? "Tạm dừng" : "Bắt đầu"}>
                {running ? <Pause className="size-4" /> : <Play className="size-4" />}
              </button>
            )}
            {running && (
              <button className="text-xs font-bold text-primary" onClick={() => { setRunning(false); setFinishedAt(seconds); }}>
                Xong
              </button>
            )}
            <button onClick={() => { setRunning(false); setSeconds(0); setFinishedAt(null); }} aria-label="Đặt lại">
              <RotateCcw className="size-3.5 text-muted-foreground" />
            </button>
          </div>
          {cpm !== null && <span className="text-sm text-muted-foreground">Tốc độ: <b>{cpm}</b> ký tự/phút</span>}
          <SpeakButton text={article.paragraphs.map(rubyToKana).join("")} size="sm" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex flex-col gap-5">
          {article.paragraphs.map((p, i) => (
            <div key={i}>
              <p className="text-xl">
                <JapaneseText text={p} furigana={furigana} glossary={article.glossary} />
              </p>
              {translation && <p className="mt-1 border-l-4 border-primary/30 pl-3 text-sm text-muted-foreground">{article.translation[i]}</p>}
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">💡 Chạm vào từ có furigana để xem nghĩa.</p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader><CardTitle>Câu hỏi đọc hiểu</CardTitle></CardHeader>
          <CardContent>
            <ComprehensionQuestions questions={article.questions} onFinish={(pct) => finishComprehension("reading", article.id, pct)} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Từ vựng trong bài</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2">
            {article.glossary.map((g) => (
              <div key={g.word} className="rounded-lg bg-muted/50 px-3 py-2">
                <p className="font-jp font-bold">{g.word} <span className="text-sm font-normal text-muted-foreground">{g.reading}</span></p>
                <p className="text-sm">{g.meaning}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {article.discussion && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquareText className="size-4" /> Thảo luận / Viết luận</CardTitle></CardHeader>
          <CardContent>
            <ol className="font-jp flex list-decimal flex-col gap-2 pl-5">{article.discussion.map((d) => <li key={d}>{d}</li>)}</ol>
            <p className="mt-3 text-sm text-muted-foreground">Viết câu trả lời vào mục Ghi chú để lưu lại và tự đánh giá.</p>
          </CardContent>
        </Card>
      )}

      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Check className="size-4" />
        {done ? `Đã hoàn thành · điểm cao nhất ${score ?? 0}% ${(score ?? 0) >= 70 ? "(đạt điều kiện lên cấp)" : "— đọc lại để đạt ≥ 70%"}` : `Trả lời hết câu hỏi để hoàn thành bài (+${XP.readingComplete} XP). Cần ≥ 70% để tính vào điều kiện lên cấp.`}
      </p>
    </div>
  );
}
