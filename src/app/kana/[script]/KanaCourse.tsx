"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BookOpen, Check, Eye, Grid3x3, Keyboard, PenLine, ScanEye, Volume2 } from "lucide-react";
import type { Kana } from "@/types";
import { HIRAGANA, KANA_GROUP_LABEL, KATAKANA, HIRAGANA_WORDS, KATAKANA_WORDS, kanaLessons } from "@/data/kana";
import { cardId } from "@/lib/srs";
import { kanaToRomaji } from "@/lib/romaji";
import { speak } from "@/lib/speech";
import { buildQuiz, type Question } from "@/lib/quiz";
import { XP } from "@/lib/xp";
import { cn, sample, shuffle } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Card, Dialog, DialogContent, Progress, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/primitives";
import { PageHeader, SpeakButton } from "@/components/learning/common";
import { StrokeOrder, WritingCanvas } from "@/components/learning/Writing";
import { QuizRunner } from "@/components/learning/QuizRunner";
import { toast } from "sonner";

type Script = "hiragana" | "katakana";

export function KanaCourse({ script }: { script: Script }) {
  const params = useSearchParams();
  const list = script === "hiragana" ? HIRAGANA : KATAKANA;
  const lessons = useMemo(() => kanaLessons(script), [script]);
  const cards = useAppStore((s) => s.cards);
  const learned = list.filter((k) => cards[cardId("kana", k.id)]?.reps).length;
  const [detail, setDetail] = useState<Kana | null>(null);
  const label = script === "hiragana" ? "Hiragana" : "Katakana";

  return (
    <div>
      <PageHeader
        title={`Khóa học ${label}`}
        jp={script === "hiragana" ? "ひらがな" : "カタカナ"}
        description={
          script === "hiragana"
            ? "Bảng chữ mềm dùng cho từ thuần Nhật, trợ từ và đuôi động từ. Học theo từng hàng, xem thứ tự nét, nghe phát âm và luyện viết."
            : "Bảng chữ cứng dùng cho từ ngoại lai, tên nước ngoài và rất nhiều thuật ngữ IT. Bao gồm âm mở rộng như ファ, ティ, ウェ."
        }
      />
      <Card className="mb-5 flex items-center gap-4 p-4">
        <span className="font-jp text-3xl font-black text-primary">{script === "hiragana" ? "あ" : "ア"}</span>
        <div className="flex-1">
          <div className="mb-1 flex justify-between text-sm">
            <span className="font-semibold">Đã học</span>
            <span className="text-muted-foreground">
              {learned}/{list.length}
            </span>
          </div>
          <Progress value={(learned / list.length) * 100} />
        </div>
      </Card>

      <Tabs defaultValue={params.get("tab") ?? "lessons"}>
        <TabsList>
          <TabsTrigger value="lessons"><BookOpen /> Bài học</TabsTrigger>
          <TabsTrigger value="chart"><Grid3x3 /> Bảng chữ</TabsTrigger>
          <TabsTrigger value="read-test"><ScanEye /> Kiểm tra đọc</TabsTrigger>
          <TabsTrigger value="write-test"><PenLine /> Kiểm tra viết</TabsTrigger>
          <TabsTrigger value="typing"><Keyboard /> Gõ romaji</TabsTrigger>
          <TabsTrigger value="reading"><Eye /> {script === "katakana" ? "Từ ngoại lai" : "Luyện đọc từ"}</TabsTrigger>
        </TabsList>

        <TabsContent value="lessons" className="flex flex-col gap-4">
          {lessons.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} onOpen={setDetail} />
          ))}
        </TabsContent>

        <TabsContent value="chart" className="flex flex-col gap-6">
          {(["basic", "dakuten", "yoon", "extended"] as const).map((group) => {
            const items = list.filter((k) => k.group === group);
            if (!items.length) return null;
            return (
              <div key={group}>
                <h3 className="mb-2 font-bold">{KANA_GROUP_LABEL[group]}</h3>
                <div className={cn("grid gap-2", group === "yoon" ? "grid-cols-3 sm:grid-cols-6" : "grid-cols-5")}>
                  {items.map((k) => (
                    <KanaTile key={k.id} k={k} learned={!!cards[cardId("kana", k.id)]?.reps} onClick={() => setDetail(k)} />
                  ))}
                </div>
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="read-test">
          <ReadingTest list={list} />
        </TabsContent>
        <TabsContent value="write-test">
          <WritingTest list={list} />
        </TabsContent>
        <TabsContent value="typing">
          <TypingPractice script={script} list={list} />
        </TabsContent>
        <TabsContent value="reading">
          <WordDrill words={script === "hiragana" ? HIRAGANA_WORDS : KATAKANA_WORDS} />
        </TabsContent>
      </Tabs>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        {detail && (
          <DialogContent title={`${detail.char} — ${detail.romaji}`} className="max-w-2xl">
            <KanaDetail k={detail} />
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

function KanaTile({ k, learned, onClick }: { k: Kana; learned: boolean; onClick: () => void }) {
  return (
    <button
      onClick={() => {
        speak(k.char);
        onClick();
      }}
      className={cn("flex flex-col items-center rounded-xl border-2 bg-card py-2 transition-all hover:-translate-y-0.5 hover:border-primary/60", learned && "border-primary/50 bg-primary/5")}
    >
      <span className="font-jp text-3xl font-bold">{k.char}</span>
      <span className="text-xs text-muted-foreground">{k.romaji}</span>
    </button>
  );
}

function KanaDetail({ k }: { k: Kana }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="flex flex-col items-center gap-3">
        <StrokeOrder char={k.char} strokes={k.strokes} />
        <Button variant="secondary" onClick={() => speak(k.char)}>
          <Volume2 /> Phát âm “{k.romaji}”
        </Button>
        {k.hint && <p className="rounded-lg bg-amber-500/10 p-3 text-sm">💡 {k.hint}</p>}
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm font-semibold">Luyện viết</p>
        <WritingCanvas guide={k.char} size={220} />
      </div>
    </div>
  );
}

function LessonCard({ lesson, onOpen }: { lesson: { id: string; title: string; chars: Kana[] }; onOpen: (k: Kana) => void }) {
  const cards = useAppStore((s) => s.cards);
  const done = useAppStore((s) => !!s.completed[`kana-lesson:${lesson.id}`]);
  const [quiz, setQuiz] = useState<Question[] | null>(null);
  const finish = () => {
    // Reading a lesson is exposure, not learning: characters only count as learned after
    // they are retrieved in a test (Learn session / quick test) and survive SRS intervals.
    const { addCards, markComplete } = useAppStore.getState();
    addCards(lesson.chars.map((k) => ({ kind: "kana" as const, itemId: k.id })));
    markComplete(`kana-lesson:${lesson.id}`, XP.kanaLesson);
    toast.success("Đã xem xong bài — các ký tự vào hàng chờ. Vào “Học hôm nay” để học và kiểm tra ngay.");
  };
  return (
    <Card className="p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-bold">
          {lesson.title} {done && <span className="ml-1 text-sm text-primary">✓</span>}
        </h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setQuiz(buildQuiz({ source: { vocab: [], grammar: [], kanji: [], kana: lesson.chars, listening: [] }, types: ["typing"], count: Math.min(10, lesson.chars.length) }))}>
            Kiểm tra nhanh
          </Button>
          <Button size="sm" onClick={finish} variant={done ? "secondary" : "default"}>
            <Check /> {done ? "Đã xem" : "Xem xong bài"}
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-10">
        {lesson.chars.map((k) => (
          <KanaTile key={k.id} k={k} learned={!!cards[cardId("kana", k.id)]?.reps} onClick={() => onOpen(k)} />
        ))}
      </div>
      <Dialog open={!!quiz} onOpenChange={(o) => !o && setQuiz(null)}>
        {quiz && (
          <DialogContent title={`Kiểm tra: ${lesson.title}`} className="max-w-2xl">
            <QuizRunner questions={quiz} mode="kana-lesson" onExit={() => setQuiz(null)} />
          </DialogContent>
        )}
      </Dialog>
    </Card>
  );
}

/** Reading test: see a character, choose its romaji. */
function ReadingTest({ list }: { list: Kana[] }) {
  const [group, setGroup] = useState<"basic" | "all">("basic");
  const [key, setKey] = useState(0);
  const questions = useMemo<Question[]>(() => {
    const pool = group === "basic" ? list.filter((k) => k.group === "basic") : list;
    return sample(pool, 15).map((k) => {
      const options = shuffle([k.romaji, ...sample(pool.filter((p) => p.romaji !== k.romaji).map((p) => p.romaji), 3)]);
      return { kind: "choice", type: "multiple-choice", prompt: "Ký tự này đọc là gì?", display: k.char, options, answer: options.indexOf(k.romaji), ref: `kana:${k.id}` };
    });
  }, [list, group, key]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Button size="sm" variant={group === "basic" ? "default" : "outline"} onClick={() => { setGroup("basic"); setKey((k) => k + 1); }}>46 chữ cơ bản</Button>
        <Button size="sm" variant={group === "all" ? "default" : "outline"} onClick={() => { setGroup("all"); setKey((k) => k + 1); }}>Tất cả</Button>
      </div>
      <QuizRunner key={`${group}-${key}`} questions={questions} mode="kana-reading" onExit={() => setKey((k) => k + 1)} />
    </div>
  );
}

/** Writing test: see the romaji, write the character, reveal and self-grade. */
function WritingTest({ list }: { list: Kana[] }) {
  const [order, setOrder] = useState(() => shuffle(list.filter((k) => k.group === "basic")));
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState({ ok: 0, total: 0 });
  const k = order[i % order.length];
  const grade = (ok: boolean) => {
    setScore((s) => ({ ok: s.ok + (ok ? 1 : 0), total: s.total + 1 }));
    useAppStore.getState().logAnswer(ok);
    useAppStore.getState().recordResults([{ ref: `kana:${k.id}`, correct: ok }]);
    if (ok) useAppStore.getState().addXp(XP.correctAnswer / 2);
    setRevealed(false);
    setI((n) => n + 1);
  };
  return (
    <Card className="mx-auto flex max-w-lg flex-col items-center gap-4 p-6">
      <p className="text-sm text-muted-foreground">
        Viết ký tự cho âm sau · Điểm {score.ok}/{score.total}
      </p>
      <p className="text-5xl font-extrabold">{k.romaji}</p>
      <WritingCanvas key={i} size={240} />
      {revealed ? (
        <div className="flex flex-col items-center gap-3">
          <StrokeOrder char={k.char} strokes={k.strokes} />
          <div className="flex gap-2">
            <Button variant="destructive" onClick={() => grade(false)}>Viết sai</Button>
            <Button onClick={() => grade(true)}>Viết đúng</Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => setRevealed(true)}>Xem đáp án</Button>
      )}
      <Button variant="ghost" size="sm" onClick={() => { setOrder(shuffle(order)); setI(0); setScore({ ok: 0, total: 0 }); }}>
        Làm lại từ đầu
      </Button>
    </Card>
  );
}

function TypingPractice({ script, list }: { script: Script; list: Kana[] }) {
  const [mode, setMode] = useState<"chars" | "words">("chars");
  const [key, setKey] = useState(0);
  const words = script === "hiragana" ? HIRAGANA_WORDS : KATAKANA_WORDS;
  const questions = useMemo<Question[]>(() => {
    if (mode === "chars") return buildQuiz({ source: { vocab: [], grammar: [], kanji: [], kana: list, listening: [] }, types: ["typing"], count: 15 });
    return sample(words, 10).map(([w, m]) => ({ kind: "typing", type: "typing", prompt: `Gõ romaji — “${m}”`, display: w, answerKana: w, answerRomaji: kanaToRomaji(w) }));
  }, [mode, list, words, key]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Button size="sm" variant={mode === "chars" ? "default" : "outline"} onClick={() => { setMode("chars"); setKey((k) => k + 1); }}>Ký tự</Button>
        <Button size="sm" variant={mode === "words" ? "default" : "outline"} onClick={() => { setMode("words"); setKey((k) => k + 1); }}>Từ</Button>
      </div>
      <p className="text-xs text-muted-foreground">Chấp nhận cả Hepburn và Kunrei (shi/si, tsu/tu, chi/ti…). Trường âm có thể gõ “-” hoặc lặp nguyên âm (koohii / ko-hi-).</p>
      <QuizRunner key={`${mode}-${key}`} questions={questions} mode={`kana-typing-${script}`} onExit={() => setKey((k) => k + 1)} />
    </div>
  );
}

function WordDrill({ words }: { words: [string, string][] }) {
  const [show, setShow] = useState<Record<string, boolean>>({});
  const [all, setAll] = useState(false);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Đọc to từng từ, sau đó chạm để kiểm tra cách đọc và nghĩa.</p>
        <Button size="sm" variant="outline" onClick={() => setAll((a) => !a)}>{all ? "Ẩn tất cả" : "Hiện tất cả"}</Button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {words.map(([w, m]) => {
          const open = all || show[w];
          return (
            <div role="button" tabIndex={0} key={w} onClick={() => setShow((s) => ({ ...s, [w]: !s[w] }))} className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border bg-card p-3 text-center hover:border-primary/50">
              <span className="font-jp text-2xl font-bold">{w}</span>
              {open ? (
                <span className="animate-pop text-sm">
                  <span className="block italic text-muted-foreground">{kanaToRomaji(w)}</span>
                  <span className="font-medium">{m}</span>
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">chạm để xem</span>
              )}
              {open && <SpeakButton text={w} size="sm" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
