"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, Check, GitCompare, Lightbulb, Search } from "lucide-react";
import type { Grammar } from "@/types";
import { GRAMMAR, GRAMMAR_BY_ID } from "@/data/grammar";
import { cn, shuffle } from "@/lib/utils";
import { markPlanItem, useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, Input } from "@/components/ui/primitives";
import { AddToSrsButton, EmptyState, LevelBadge, PageHeader, SpeakButton } from "@/components/learning/common";

const LEVELS = ["N5", "N4", "N3", "N2", "N1", "business", "it", "brse", "native"];
const LEVEL_LABEL: Record<string, string> = { business: "Keigo", it: "IT", brse: "BrSE", native: "Native" };

export function GrammarBrowser() {
  const params = useSearchParams();
  const id = params.get("id");
  const g = id ? GRAMMAR_BY_ID.get(id) : undefined;
  return g ? <GrammarDetail key={g.id} g={g} /> : <GrammarList />;
}

function GrammarList() {
  const [level, setLevel] = useState("N5");
  const [q, setQ] = useState("");
  const completed = useAppStore((s) => s.completed);
  const list = useMemo(() => {
    const n = q.trim().toLowerCase();
    return GRAMMAR.filter((g) => (n ? true : g.level === level)).filter(
      (g) => !n || g.pattern.toLowerCase().includes(n) || g.meaning.toLowerCase().includes(n) || g.explanation.toLowerCase().includes(n),
    );
  }, [level, q]);
  const count = (lvl: string) => GRAMMAR.filter((g) => g.level === lvl).length;
  const done = (lvl: string) => GRAMMAR.filter((g) => g.level === lvl && completed[`grammar:${g.id}`]).length;

  return (
    <div>
      <PageHeader title="Ngữ pháp" jp="文法" description="Mỗi mẫu gồm: cấu trúc, ý nghĩa, giải thích tiếng Việt, lưu ý sử dụng, lỗi thường gặp, ví dụ, so sánh mẫu tương tự và bài tập." />
      <div className="mb-4 flex flex-wrap gap-2">
        {LEVELS.map((l) => (
          <button
            key={l}
            onClick={() => { setLevel(l); setQ(""); }}
            className={cn("rounded-xl border-2 px-3 py-1.5 text-sm font-bold transition-colors", level === l && !q ? "border-primary bg-primary/10 text-primary" : "bg-card hover:border-primary/40")}
          >
            {LEVEL_LABEL[l] ?? l} <span className="font-normal text-muted-foreground">{done(l)}/{count(l)}</span>
          </button>
        ))}
      </div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm mẫu ngữ pháp: ～ても, điều kiện, kính ngữ…" className="pl-9" />
      </div>
      {list.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {list.map((g, i) => (
            <Link key={g.id} href={`/grammar/?id=${g.id}`}>
              <Card className="flex h-full items-start gap-3 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/50">
                <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg text-sm font-bold", completed[`grammar:${g.id}`] ? "bg-primary text-primary-foreground" : "bg-muted")}>
                  {completed[`grammar:${g.id}`] ? <Check className="size-4" /> : i + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-jp font-bold">{g.pattern}</p>
                  <p className="text-sm text-muted-foreground">{g.meaning}</p>
                </div>
                <span className="ml-auto"><LevelBadge level={g.level} /></span>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState icon="🔍" title="Không tìm thấy mẫu ngữ pháp" />
      )}
    </div>
  );
}

function GrammarDetail({ g }: { g: Grammar }) {
  const router = useRouter();
  const done = useAppStore((s) => !!s.completed[`grammar:${g.id}`]);
  const markComplete = useAppStore((s) => s.markComplete);
  const [firstTry, setFirstTry] = useState<boolean | null>(null);
  const siblings = GRAMMAR.filter((x) => x.level === g.level);
  const idx = siblings.findIndex((x) => x.id === g.id);
  const next = siblings[idx + 1];

  return (
    <div className="flex flex-col gap-4">
      <button onClick={() => router.push("/grammar/")} className="flex items-center gap-1 self-start text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Danh sách ngữ pháp
      </button>
      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <LevelBadge level={g.level} />
            <h1 className="font-jp mt-2 text-3xl font-extrabold">{g.pattern}</h1>
            <p className="mt-1 text-lg font-semibold text-primary">{g.meaning}</p>
          </div>
          <div className="flex gap-2">
            <AddToSrsButton kind="grammar" itemId={g.id} size="default" />
          </div>
        </div>
        <div className="mt-4 rounded-xl bg-muted/60 p-4">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Cấu trúc</p>
          <p className="font-jp mt-1 font-medium">{g.formation}</p>
        </div>
        <p className="mt-4 leading-relaxed">{g.explanation}</p>
      </Card>

      <Card>
        <CardHeader><CardTitle>Ví dụ</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3">
          {g.examples.map((e, i) => (
            <div key={i} className="flex items-start gap-2 border-l-4 border-primary/40 pl-3">
              <div className="flex-1">
                <p className="font-jp text-lg">{e.jp}</p>
                <p className="text-sm text-muted-foreground">{e.vi}</p>
              </div>
              <SpeakButton text={e.jp} />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {g.notes.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Lightbulb className="size-4 text-amber-500" /> Lưu ý sử dụng</CardTitle></CardHeader>
            <CardContent>
              <ul className="font-jp flex list-disc flex-col gap-1.5 pl-5 text-sm">{g.notes.map((n) => <li key={n}>{n}</li>)}</ul>
            </CardContent>
          </Card>
        )}
        {g.mistakes.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="size-4 text-rose-500" /> Lỗi thường gặp</CardTitle></CardHeader>
            <CardContent>
              <ul className="font-jp flex list-disc flex-col gap-1.5 pl-5 text-sm">{g.mistakes.map((n) => <li key={n}>{n}</li>)}</ul>
            </CardContent>
          </Card>
        )}
      </div>

      {g.compare && g.compare.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><GitCompare className="size-4 text-info" /> So sánh với mẫu tương tự</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2">
            {g.compare.map((c) => (
              <div key={c.pattern} className="grid gap-1 rounded-lg bg-muted/60 p-3 sm:grid-cols-[180px_1fr]">
                <span className="font-jp font-bold">{c.pattern}</span>
                <span className="font-jp text-sm">{c.note}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {g.quiz && <GrammarExercise g={g} onFirstAnswer={(ok) => setFirstTry(ok)} />}

      <div className="flex flex-wrap justify-between gap-2">
        <Button
          variant={done ? "secondary" : "default"}
          disabled={done || (!!g.quiz && firstTry === null)}
          onClick={() => {
            markComplete(`grammar:${g.id}`);
            // The pattern enters SRS as a cloze card, scheduled by the exercise result.
            useAppStore.getState().introduceCards([{ kind: "grammar", itemId: g.id, firstTry: firstTry ?? false }]);
            markPlanItem("grammar", g.id);
          }}
        >
          <Check /> {done ? "Đã học — mẫu đã vào SRS dạng điền chỗ trống" : g.quiz && firstTry === null ? "Làm bài tập trước khi hoàn thành" : "Hoàn thành & đưa vào SRS (+20 XP)"}
        </Button>
        {next && (
          <Button variant="outline" asChild>
            <Link href={`/grammar/?id=${next.id}`}>Mẫu tiếp theo: <span className="font-jp">{next.pattern}</span></Link>
          </Button>
        )}
      </div>
    </div>
  );
}

function GrammarExercise({ g, onFirstAnswer }: { g: Grammar; onFirstAnswer: (correct: boolean) => void }) {
  const options = useMemo(() => shuffle([g.quiz!.answer, ...g.quiz!.distractors]), [g]);
  const [picked, setPicked] = useState<string | null>(null);
  const attempted = useRef(false);
  const correct = picked === g.quiz!.answer;
  return (
    <Card>
      <CardHeader><CardTitle>Bài tập</CardTitle></CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="font-jp text-lg">{g.quiz!.q.replace("＿＿", picked ? `【${picked}】` : "＿＿")}</p>
        <div className="flex flex-wrap gap-2">
          {options.map((o) => (
            <button
              key={o}
              disabled={!!picked}
              onClick={() => {
                setPicked(o);
                useAppStore.getState().logAnswer(o === g.quiz!.answer);
                useAppStore.getState().recordResults([{ ref: `grammar:${g.id}`, correct: o === g.quiz!.answer }]);
                if (!attempted.current) onFirstAnswer(o === g.quiz!.answer);
                attempted.current = true;
                if (o === g.quiz!.answer) useAppStore.getState().addXp(10);
              }}
              className={cn(
                "font-jp rounded-xl border-2 bg-card px-4 py-2 font-medium",
                picked && o === g.quiz!.answer && "border-emerald-500 bg-emerald-500/10",
                picked === o && !correct && "border-rose-500 bg-rose-500/10",
              )}
            >
              {o}
            </button>
          ))}
        </div>
        {picked && (
          <div className="flex items-center gap-3">
            <p className={correct ? "font-semibold text-emerald-600" : "font-semibold text-rose-600"}>{correct ? "Chính xác! +10 XP" : `Chưa đúng — đáp án: ${g.quiz!.answer}`}</p>
            <Button size="sm" variant="ghost" onClick={() => setPicked(null)}>Làm lại</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
