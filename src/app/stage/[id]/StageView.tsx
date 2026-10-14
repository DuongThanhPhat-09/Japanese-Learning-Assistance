"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookA, BookOpen, Brain, ChartBar, FileText, Headphones, Library, PenLine, Play, Plus, Swords } from "lucide-react";
import type { Stage, StageId } from "@/types";
import { STAGE_BY_ID } from "@/data/stages";
import { stageContent, stageProgress } from "@/lib/stats";
import { availableTypes, buildQuiz, type QuizSource } from "@/lib/quiz";
import { buildSession, cardId } from "@/lib/srs";
import { stripRuby } from "@/lib/ruby";
import { markPlanItem, useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, Progress, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/primitives";
import { EmptyState } from "@/components/learning/common";
import { stageStatus } from "@/lib/engine";
import { useEngineInput } from "@/hooks/useEngine";
import { StageIcon } from "@/components/learning/StageIcon";
import { StageGates } from "@/components/learning/StageGates";
import { ORIENTATION_SECTIONS } from "@/components/learning/OrientationLesson";
import { VocabCard } from "@/components/learning/VocabCard";
import { QuizRunner } from "@/components/learning/QuizRunner";
import { ReviewSession, SessionSummary } from "@/components/learning/ReviewSession";
import { toast } from "sonner";

const BATCH = 10;

export function StageView({ id }: { id: StageId }) {
  const stage = STAGE_BY_ID.get(id)!;
  const cards = useAppStore((s) => s.cards);
  const completed = useAppStore((s) => s.completed);
  const addCards = useAppStore((s) => s.addCards);
  const content = useMemo(() => stageContent(stage), [stage]);
  const progress = stageProgress(stage, { cards, completed });

  const [quizKey, setQuizKey] = useState(0);
  const [quizOn, setQuizOn] = useState(false);
  const [reviewKey, setReviewKey] = useState(0);
  const [summary, setSummary] = useState<{ reviewed: number; correct: number } | null>(null);

  const source: QuizSource = useMemo(
    () => ({ vocab: content.vocab, grammar: content.grammar.filter((g) => g.quiz), kanji: content.kanji, kana: content.kana, listening: content.listening }),
    [content],
  );
  const quiz = useMemo(() => buildQuiz({ source, types: availableTypes(source), count: 12 }), [source, quizKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const stageCardIds = useMemo(() => {
    const ids = new Set<string>();
    content.vocab.forEach((v) => ids.add(cardId("vocab", v.id)));
    content.kanji.forEach((k) => ids.add(cardId("kanji", k.char)));
    content.grammar.forEach((g) => ids.add(cardId("grammar", g.id)));
    content.kana.forEach((k) => ids.add(cardId("kana", k.id)));
    return ids;
  }, [content]);
  const session = useMemo(
    () => buildSession(Object.values(cards), { mode: "due", itemFilter: (c) => stageCardIds.has(c.id), limit: 30 }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stageCardIds, reviewKey],
  );

  const unlearned = content.vocab.filter((v) => !cards[cardId("vocab", v.id)]);
  const learnBatch = () => {
    const batch = unlearned.slice(0, BATCH);
    const n = addCards(batch.map((v) => ({ kind: "vocab" as const, itemId: v.id })));
    toast.success(`Đã thêm ${n} từ mới vào SRS — vào tab Ôn tập để học ngay!`);
  };
  const learnKanji = () => {
    const n = addCards(content.kanji.filter((k) => !cards[cardId("kanji", k.char)]).slice(0, BATCH).map((k) => ({ kind: "kanji" as const, itemId: k.char })));
    toast.success(`Đã thêm ${n} chữ Hán vào SRS`);
  };

  return (
    <div>
      <div className="mb-8 flex flex-col gap-5">
        <div className="flex items-start gap-4">
          <span className="grid size-16 shrink-0 place-items-center rounded-3xl text-white shadow-soft" style={{ background: stage.color }}>
            <StageIcon name={stage.icon} className="size-8" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: stage.color }}>
              Giai đoạn {stage.order} · {stage.subtitle}
            </p>
            <h1 className="mt-1 text-[28px] font-extrabold leading-tight tracking-tight">{stage.title}</h1>
            <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">{stage.description}</p>
          </div>
        </div>
        <StagePrimaryAction stage={stage} />
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview"><ChartBar /> Tổng quan</TabsTrigger>
          {stage.kana && <TabsTrigger value="kana"><PenLine /> Kana</TabsTrigger>}
          <TabsTrigger value="vocab"><BookA /> Từ vựng</TabsTrigger>
          <TabsTrigger value="grammar"><BookOpen /> Ngữ pháp</TabsTrigger>
          {content.kanji.length > 0 && <TabsTrigger value="kanji"><Library /> Kanji</TabsTrigger>}
          <TabsTrigger value="listening"><Headphones /> Nghe</TabsTrigger>
          <TabsTrigger value="reading"><FileText /> Đọc</TabsTrigger>
          <TabsTrigger value="quiz"><Swords /> Quiz</TabsTrigger>
          <TabsTrigger value="review"><Brain /> Ôn tập {session.length > 0 && `(${session.length})`}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Mục tiêu giai đoạn</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-2 text-sm">
                {stage.goals.map((g) => (
                  <li key={g} className="flex gap-2">
                    <span style={{ color: stage.color }}>●</span> {g}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Đã gặp (chưa chắc đã nhớ)</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {(
                [
                  ["Kana", progress.kana],
                  ["Từ vựng", progress.vocab],
                  ["Ngữ pháp", progress.grammar],
                  ["Kanji", progress.kanji],
                  ["Đọc hiểu", progress.reading],
                  ["Nghe hiểu", progress.listening],
                ] as const
              )
                .filter(([, p]) => p.total > 0)
                .map(([label, p]) => (
                  <div key={label} className="flex flex-col gap-1">
                    <div className="flex justify-between text-sm">
                      <span>{label}</span>
                      <span className="text-muted-foreground">
                        {p.done}/{p.total}
                      </span>
                    </div>
                    <Progress value={(p.done / p.total) * 100} style={{ background: stage.color }} />
                  </div>
                ))}
            </CardContent>
          </Card>
          {stage.id === "beginner" && <BeginnerIntro />}
          <StageGates stage={stage} />
        </TabsContent>

        {stage.kana && (
          <TabsContent value="kana">
            <Card className="flex flex-col items-start gap-3 p-6">
              <p className="font-jp text-5xl font-bold">{stage.kana === "hiragana" ? "あいうえお" : "アイウエオ"}</p>
              <p className="text-muted-foreground">
                Khóa {stage.kana === "hiragana" ? "Hiragana" : "Katakana"} đầy đủ: bài học theo hàng, thứ tự nét, phát âm, mẹo ghi nhớ, kiểm tra đọc, viết và gõ.
              </p>
              <p className="text-sm">Đã học {progress.kana.done}/{progress.kana.total} ký tự</p>
              <Button asChild>
                <Link href={`/kana/${stage.kana}/`}>Mở khóa học {stage.kana === "hiragana" ? "Hiragana" : "Katakana"}</Link>
              </Button>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="vocab" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              {content.vocab.length} từ · chưa học {unlearned.length}
            </p>
            <Button onClick={learnBatch} disabled={!unlearned.length}>
              <Plus /> Học {Math.min(BATCH, unlearned.length)} từ mới
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {content.vocab.slice(0, 60).map((v) => (
              <VocabCard key={v.id} v={v} />
            ))}
          </div>
          {content.vocab.length > 60 && (
            <Button asChild variant="outline">
              <Link href={`/vocabulary/?level=${stage.levels[0]}`}>Xem tất cả {content.vocab.length} từ</Link>
            </Button>
          )}
        </TabsContent>

        <TabsContent value="grammar" className="flex flex-col gap-2">
          {content.grammar.map((g) => {
            const done = completed[`grammar:${g.id}`];
            return (
              <Link key={g.id} href={`/grammar/?id=${g.id}`}>
                <Card className="flex items-center justify-between gap-3 p-4 transition-colors hover:border-primary/50">
                  <div>
                    <p className="font-jp font-bold">{g.pattern}</p>
                    <p className="text-sm text-muted-foreground">{g.meaning}</p>
                  </div>
                  {done ? <span className="text-sm font-semibold text-primary">✓ Đã học</span> : <span className="text-xs text-muted-foreground">{g.level}</span>}
                </Card>
              </Link>
            );
          })}
        </TabsContent>

        {content.kanji.length > 0 && (
          <TabsContent value="kanji" className="flex flex-col gap-4">
            <div className="flex justify-end">
              <Button onClick={learnKanji}>
                <Plus /> Thêm {BATCH} chữ Hán vào SRS
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-10">
              {content.kanji.map((k) => {
                const c = cards[cardId("kanji", k.char)];
                return (
                  <Link
                    key={k.char}
                    href={`/kanji/?char=${encodeURIComponent(k.char)}`}
                    className="flex flex-col items-center rounded-xl border bg-card p-2 transition-colors hover:border-primary/60"
                    style={c?.reps ? { borderColor: stage.color } : undefined}
                  >
                    <span className="font-jp text-3xl font-bold">{k.char}</span>
                    <span className="text-[10px] text-muted-foreground">{k.hanViet}</span>
                  </Link>
                );
              })}
            </div>
          </TabsContent>
        )}

        <TabsContent value="listening" className="grid gap-3 md:grid-cols-2">
          {content.listening.map((l) => (
            <Link key={l.id} href={`/listening/?id=${l.id}`}>
              <Card className="flex items-center gap-3 p-4 hover:border-primary/50">
                <Headphones className="size-5 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="font-jp font-bold">{stripRuby(l.title)}</p>
                  <p className="text-sm text-muted-foreground">{l.titleVi}</p>
                </div>
                {completed[`listening:${l.id}`] && <span className="text-primary">✓</span>}
              </Card>
            </Link>
          ))}
        </TabsContent>

        <TabsContent value="reading" className="grid gap-3 md:grid-cols-2">
          {stage.kana && (
            <Link href={`/kana/${stage.kana}/?tab=reading`}>
              <Card className="flex items-center gap-3 p-4 hover:border-primary/50">
                <FileText className="size-5 text-primary" />
                <div>
                  <p className="font-bold">Luyện đọc từ {stage.kana === "hiragana" ? "Hiragana" : "Katakana"}</p>
                  <p className="text-sm text-muted-foreground">Đọc nhanh các từ thông dụng</p>
                </div>
              </Card>
            </Link>
          )}
          {content.articles.map((a) => (
            <Link key={a.id} href={`/reading/?id=${a.id}`}>
              <Card className="flex items-center gap-3 p-4 hover:border-primary/50">
                <FileText className="size-5 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="font-jp font-bold">{stripRuby(a.title)}</p>
                  <p className="text-sm text-muted-foreground">{a.titleVi}</p>
                </div>
                {completed[`reading:${a.id}`] && <span className="text-primary">✓</span>}
              </Card>
            </Link>
          ))}
        </TabsContent>

        <TabsContent value="quiz">
          {quizOn ? (
            <QuizRunner key={quizKey} questions={quiz} mode={`stage:${stage.id}`} onExit={() => { setQuizOn(false); setQuizKey((k) => k + 1); }} />
          ) : (
            <Card className="flex flex-col items-center gap-3 p-8 text-center">
              <Swords className="size-10 text-primary" />
              <p className="text-lg font-bold">Quiz tổng hợp giai đoạn {stage.order}</p>
              <p className="text-sm text-muted-foreground">12 câu hỏi trộn: trắc nghiệm, điền chỗ trống, ghép cặp, nghe, kanji, sửa lỗi, gõ romaji.</p>
              <Button size="lg" onClick={() => setQuizOn(true)}>Bắt đầu</Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="review">
          {summary ? (
            <SessionSummary {...summary} onRestart={() => { setSummary(null); setReviewKey((k) => k + 1); }} />
          ) : session.length ? (
            <ReviewSession key={reviewKey} cards={session} onFinish={setSummary} />
          ) : (
            <EmptyState icon="🎉" title="Không có thẻ nào đến hạn trong giai đoạn này">
              Hãy học từ mới ở tab Từ vựng / Kanji, hoặc{" "}
              <Link href="/review/" className="font-semibold text-primary">mở phiên ôn tập thủ công</Link>.
            </EmptyState>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BeginnerIntro() {
  const sections = ORIENTATION_SECTIONS;
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Nhập môn tiếng Nhật</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {sections.map((s) => (
          <div key={s.t} className="rounded-xl bg-muted/60 p-4">
            <p className="font-bold">{s.t}</p>
            <p className="font-jp mt-1 text-sm text-muted-foreground">{s.d}</p>
          </div>
        ))}
        <OrientationDone />
      </CardContent>
    </Card>
  );
}

function OrientationDone() {
  const done = useAppStore((s) => !!s.completed["intro:orientation"]);
  return (
    <div className="sm:col-span-2">
      <Button
        disabled={done}
        onClick={() => {
          useAppStore.getState().markComplete("intro:orientation");
          markPlanItem("orientation");
        }}
      >
        {done ? "✓ Đã đọc phần nhập môn" : "Tôi đã đọc và hiểu phần nhập môn"}
      </Button>
    </div>
  );
}

/** The stage's one primary action: continue the guided plan when this is the current stage, or open the kana course. */
function StagePrimaryAction({ stage }: { stage: Stage }) {
  const input = useEngineInput();
  const status = stageStatus(stage, input);
  if (status === "current")
    return (
      <Button asChild size="lg" className="sm:self-start sm:min-w-64">
        <Link href="/today/?start=1">
          <Play className="fill-current" /> Tiếp tục học
        </Link>
      </Button>
    );
  if (stage.kana && status !== "locked")
    return (
      <Button asChild size="lg" variant={status === "done" ? "secondary" : "default"} className="sm:self-start sm:min-w-64">
        <Link href={`/kana/${stage.kana}/`}>Mở khóa học {stage.kana === "hiragana" ? "Hiragana" : "Katakana"}</Link>
      </Button>
    );
  if (status === "locked")
    return <p className="rounded-2xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground">🔒 Giai đoạn này chưa mở khóa — bạn đang xem trước nội dung.</p>;
  return null;
}
