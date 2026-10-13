"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronRight, Keyboard, RotateCcw, Volume2, X } from "lucide-react";
import type { ChoiceQuestion, MatchingQuestion, Question, TypingQuestion } from "@/lib/quiz";
import { QUIZ_TYPE_LABEL } from "@/lib/quiz";
import { romajiMatches } from "@/lib/romaji";
import { speak } from "@/lib/speech";
import { scoreQuiz } from "@/lib/xp";
import { cn, shuffle } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { useFocusSession } from "@/store/useCelebrations";
import { CompletionCard } from "@/components/motivation/Celebration";
import { Button } from "@/components/ui/button";
import { Card, Input, Progress } from "@/components/ui/primitives";

export interface QuizAnswer {
  correct: boolean;
  ms: number;
  ref?: string;
}

// ------------------------------------------------------------------ question views

export function ChoiceView({ q, onAnswer, locked, picked }: { q: ChoiceQuestion; onAnswer: (i: number) => void; locked: boolean; picked: number | null }) {
  useEffect(() => {
    if (q.speak) speak(q.speak);
  }, [q]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (!locked && n >= 1 && n <= q.options.length) onAnswer(n - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [q, locked, onAnswer]);
  const jpOptions = q.options.some((o) => /[぀-ヿ一-龯]/.test(o));
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-semibold text-muted-foreground">{q.prompt}</p>
      {q.display && <p className={cn("font-jp text-center font-bold", q.display.length > 8 ? "text-2xl leading-relaxed" : "text-5xl")}>{q.display}</p>}
      {q.speak && (
        <div className="flex justify-center">
          <Button variant="secondary" onClick={() => speak(q.speak!)}>
            <Volume2 /> Nghe lại
          </Button>
        </div>
      )}
      <div className="grid gap-2 sm:grid-cols-2">
        {q.options.map((opt, i) => {
          const isAnswer = i === q.answer;
          const isPicked = i === picked;
          return (
            <button
              key={i}
              disabled={locked}
              onClick={() => onAnswer(i)}
              className={cn(
                "flex items-center gap-3 rounded-xl border-2 bg-card px-4 py-3 text-left font-medium transition-all hover:border-primary/50 disabled:cursor-default",
                jpOptions && "font-jp",
                locked && isAnswer && "border-emerald-500 bg-emerald-500/10",
                locked && isPicked && !isAnswer && "border-rose-500 bg-rose-500/10",
              )}
            >
              <span className="grid size-6 shrink-0 place-items-center rounded-md border text-xs text-muted-foreground">{i + 1}</span>
              <span className="whitespace-pre-line">{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function MatchingView({ q, onDone }: { q: MatchingQuestion; onDone: (correct: boolean) => void }) {
  const right = useMemo(() => shuffle(q.pairs.map((p) => p[1])), [q]);
  const [selLeft, setSelLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrong, setWrong] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);

  const pickRight = (val: string) => {
    if (selLeft === null) return;
    if (q.pairs[selLeft][1] === val) {
      const next = new Set(matched).add(selLeft);
      setMatched(next);
      setSelLeft(null);
      if (next.size === q.pairs.length) onDone(mistakes === 0);
    } else {
      setMistakes((m) => m + 1);
      setWrong(val);
      setTimeout(() => setWrong(null), 500);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold text-muted-foreground">{q.prompt} — chọn một từ bên trái rồi chọn nghĩa bên phải</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          {q.pairs.map(([l], i) => (
            <button
              key={i}
              disabled={matched.has(i)}
              onClick={() => setSelLeft(i)}
              className={cn(
                "font-jp rounded-xl border-2 bg-card px-3 py-2.5 text-lg font-bold transition-all",
                selLeft === i && "border-primary bg-primary/10",
                matched.has(i) && "border-emerald-500/40 bg-emerald-500/10 opacity-60",
              )}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {right.map((r) => {
            const done = [...matched].some((i) => q.pairs[i][1] === r);
            return (
              <button
                key={r}
                disabled={done}
                onClick={() => pickRight(r)}
                className={cn(
                  "rounded-xl border-2 bg-card px-3 py-2.5 text-sm font-medium transition-all",
                  done && "border-emerald-500/40 bg-emerald-500/10 opacity-60",
                  wrong === r && "border-rose-500 bg-rose-500/10",
                )}
              >
                {r}
              </button>
            );
          })}
        </div>
      </div>
      {mistakes > 0 && <p className="text-xs text-rose-500">{mistakes} lần ghép sai</p>}
    </div>
  );
}

export function TypingView({ q, onAnswer, locked }: { q: TypingQuestion; onAnswer: (correct: boolean, typed: string) => void; locked: boolean }) {
  const [value, setValue] = useState("");
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setValue("");
    input.current?.focus();
  }, [q]);
  return (
    <form
      className="flex flex-col items-center gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!locked && value.trim()) onAnswer(romajiMatches(value, q.answerKana), value);
      }}
    >
      <p className="text-sm font-semibold text-muted-foreground">{q.prompt}</p>
      <p className={cn("font-jp text-center font-bold", /[぀-ヿ一-龯]/.test(q.display) ? "text-6xl" : "text-2xl")}>{q.display}</p>
      <div className="flex w-full max-w-sm gap-2">
        <Input ref={input} value={value} onChange={(e) => setValue(e.target.value)} placeholder="romaji…" autoCapitalize="off" autoComplete="off" disabled={locked} className="text-center text-lg" />
        <Button type="submit" disabled={locked || !value.trim()}>
          <Keyboard /> OK
        </Button>
      </div>
      {locked && <p className="text-sm text-muted-foreground">Đáp án: <b>{q.answerRomaji}</b></p>}
    </form>
  );
}

// ------------------------------------------------------------------ runner

export function QuizRunner({
  questions,
  mode,
  onExit,
  onComplete,
  counter = "quiz",
}: {
  questions: Question[];
  mode: string;
  onExit?: () => void;
  /** Called once when the last question is answered. */
  onComplete?: (answers: QuizAnswer[]) => void;
  /** Activity counter bumped on completion (used by weekly tasks). */
  counter?: string;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [locked, setLocked] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const started = useRef(Date.now());
  const { addXp, logAnswer, recordQuiz, recordResults, bumpCounter } = useAppStore.getState();
  const finished = index >= questions.length;
  const q = questions[index];
  useFocusSession(!finished && questions.length > 0);

  useEffect(() => {
    started.current = Date.now();
  }, [index]);

  const result = useMemo(() => (finished ? scoreQuiz(answers) : null), [finished, answers]);
  const saved = useRef(false);
  useEffect(() => {
    if (result && !saved.current) {
      saved.current = true;
      addXp(result.xp);
      recordQuiz({ mode, correct: result.correct, total: result.total, xp: result.xp });
      recordResults(answers);
      bumpCounter(counter);
      onComplete?.(answers);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  const submit = (correct: boolean) => {
    const ms = Date.now() - started.current;
    setAnswers((a) => [...a, { correct, ms, ref: q.ref }]);
    setLastCorrect(correct);
    setLocked(true);
    logAnswer(correct);
  };

  const next = () => {
    setLocked(false);
    setPicked(null);
    setLastCorrect(null);
    setIndex((i) => i + 1);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (locked && e.key === "Enter") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!questions.length) return <p className="text-muted-foreground">Không đủ dữ liệu để tạo câu hỏi.</p>;

  if (finished && result) {
    const wrong = answers.filter((a) => !a.correct).length;
    return (
      <CompletionCard
        emoji={result.perfectBonus ? "🏆" : result.accuracy >= 70 ? "🎉" : "💪"}
        title={result.perfectBonus ? "Hoàn hảo!" : result.accuracy >= 70 ? "Hoàn thành!" : "Đã xong — cố lên!"}
        message={
          <>
            Đúng {result.correct}/{result.total}
            {result.perfectBonus ? " · thưởng hoàn hảo +20 XP" : wrong ? ` · ${wrong} câu cần ôn lại` : ""}
          </>
        }
        stats={[
          { label: "Chính xác", value: `${result.accuracy}%`, tone: "good" },
          { label: "XP", value: `+${result.xp}`, tone: "xp" },
          { label: "Thưởng tốc độ", value: `+${result.speedBonus}` },
        ]}
      >
        {onExit && (
          <Button size="lg" onClick={onExit}>
            <RotateCcw /> Làm bài mới
          </Button>
        )}
      </CompletionCard>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <div className="flex items-center gap-3">
        {onExit && (
          <button onClick={onExit} className="rounded-md p-1 text-muted-foreground hover:bg-muted" aria-label="Thoát">
            <X className="size-5" />
          </button>
        )}
        <Progress value={(index / questions.length) * 100} />
        <span className="shrink-0 text-sm font-semibold text-muted-foreground">
          {index + 1}/{questions.length}
        </span>
      </div>
      <span className="self-start rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">{QUIZ_TYPE_LABEL[q.type]}</span>
      <Card className="p-6">
        {q.kind === "choice" && (
          <ChoiceView
            key={index}
            q={q}
            locked={locked}
            picked={picked}
            onAnswer={(i) => {
              setPicked(i);
              submit(i === q.answer);
            }}
          />
        )}
        {q.kind === "matching" && <MatchingView key={index} q={q} onDone={(ok) => submit(ok)} />}
        {q.kind === "typing" && <TypingView key={index} q={q} locked={locked} onAnswer={(ok) => submit(ok)} />}
      </Card>
      {locked && (
        <div
          className={cn(
            "animate-pop flex flex-col gap-3 rounded-xl p-4 sm:flex-row sm:items-center sm:justify-between",
            lastCorrect ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300" : "bg-rose-500/12 text-rose-700 dark:text-rose-300",
          )}
        >
          <div className="flex items-start gap-2">
            {lastCorrect ? <Check className="mt-0.5 size-5 shrink-0" /> : <X className="mt-0.5 size-5 shrink-0" />}
            <div>
              <p className="font-bold">{lastCorrect ? "Chính xác!" : "Chưa đúng"}</p>
              {q.kind === "choice" && q.explanation && <p className="font-jp text-sm opacity-90">{q.explanation}</p>}
              {q.kind === "choice" && !lastCorrect && <p className="font-jp text-sm">Đáp án: {q.options[q.answer]}</p>}
            </div>
          </div>
          <Button onClick={next} className="shrink-0">
            Tiếp tục <ChevronRight />
          </Button>
        </div>
      )}
    </div>
  );
}
