"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import type { CardKind } from "@/types";
import { VOCAB_BY_ID, VOCABULARY } from "@/data/vocab";
import { KANJI, KANJI_BY_CHAR } from "@/data/kanji";
import { HIRAGANA, KATAKANA } from "@/data/kana";
import type { ChoiceQuestion, TypingQuestion } from "@/lib/quiz";
import { hanViet } from "@/lib/hanviet";
import { speak } from "@/lib/speech";
import { sample, shuffle } from "@/lib/utils";
import { markPlanItem, useAppStore } from "@/store/useAppStore";
import { useFocusSession } from "@/store/useCelebrations";
import { CompletionCard } from "@/components/motivation/Celebration";
import { Button } from "@/components/ui/button";
import { Card, Progress } from "@/components/ui/primitives";
import { SpeakButton } from "./common";
import { StrokeOrder } from "./Writing";
import { ChoiceView, TypingView } from "./QuizRunner";

const KANA_BY_ID = new Map([...HIRAGANA, ...KATAKANA].map((k) => [k.id, k]));
/** Working-memory sized chunks: teach 5, test 5. */
const CHUNK = 5;

type LearnKind = Extract<CardKind, "vocab" | "kanji" | "kana">;
interface Item {
  kind: LearnKind;
  itemId: string;
}

function parse(id: string): Item {
  const i = id.indexOf(":");
  return { kind: id.slice(0, i) as LearnKind, itemId: id.slice(i + 1) };
}

function questionFor(item: Item): ChoiceQuestion | TypingQuestion | null {
  if (item.kind === "kana") {
    const k = KANA_BY_ID.get(item.itemId);
    return k ? { kind: "typing", type: "typing", prompt: "Gõ romaji của ký tự vừa học", display: k.char, answerKana: k.char, answerRomaji: k.romaji, ref: `kana:${k.id}` } : null;
  }
  if (item.kind === "kanji") {
    const k = KANJI_BY_CHAR.get(item.itemId);
    if (!k) return null;
    const correct = `${k.hanViet} — ${k.meaning}`;
    const pool = KANJI.filter((x) => x.level === k.level && x.char !== k.char).map((x) => `${x.hanViet} — ${x.meaning}`);
    const options = shuffle([correct, ...sample(pool, 3)]);
    return { kind: "choice", type: "kanji", prompt: "Chữ Hán này nghĩa là gì?", display: k.char, options, answer: options.indexOf(correct), ref: `kanji:${k.char}` };
  }
  const v = VOCAB_BY_ID.get(item.itemId);
  if (!v) return null;
  const pool = VOCABULARY.filter((x) => x.level === v.level && x.id !== v.id).map((x) => x.meaning);
  const options = shuffle([v.meaning, ...sample(Array.from(new Set(pool)), 3)]);
  return { kind: "choice", type: "multiple-choice", prompt: "Từ vừa học nghĩa là gì?", display: v.kanji, options, answer: options.indexOf(v.meaning), ref: `vocab:${v.id}` };
}

function TeachCard({ item }: { item: Item }) {
  useEffect(() => {
    const text = item.kind === "vocab" ? VOCAB_BY_ID.get(item.itemId)?.kana : item.kind === "kana" ? KANA_BY_ID.get(item.itemId)?.char : KANJI_BY_CHAR.get(item.itemId)?.examples[0]?.reading;
    if (text) speak(text);
  }, [item]);

  if (item.kind === "kana") {
    const k = KANA_BY_ID.get(item.itemId)!;
    return (
      <div className="grid items-center gap-6 sm:grid-cols-2">
        <StrokeOrder char={k.char} strokes={k.strokes} />
        <div className="flex flex-col gap-2">
          <p className="text-5xl font-extrabold">{k.romaji}</p>
          {k.hint && <p className="rounded-lg bg-amber-500/10 p-3 text-sm">💡 {k.hint}</p>}
          <p className="text-sm text-muted-foreground">Đọc to 3 lần, viết thử bằng ngón tay theo thứ tự nét.</p>
          <SpeakButton text={k.char} size="sm" />
        </div>
      </div>
    );
  }
  if (item.kind === "kanji") {
    const k = KANJI_BY_CHAR.get(item.itemId)!;
    return (
      <div className="grid gap-6 sm:grid-cols-[auto_1fr]">
        <StrokeOrder char={k.char} strokes={k.strokes} />
        <div className="flex flex-col gap-2">
          <p className="text-2xl font-extrabold text-primary">
            {k.hanViet} <span className="text-lg font-semibold text-foreground">— {k.meaning}</span>
          </p>
          <p className="font-jp text-sm">On: {k.onyomi.join("・") || "—"} · Kun: {k.kunyomi.join("・") || "—"}</p>
          <p className="rounded-lg bg-amber-500/10 p-3 text-sm">💡 <span className="font-jp">{k.hint}</span></p>
          {k.examples.map((e) => (
            <p key={e.word} className="font-jp text-sm">
              <b>{e.word}</b>（{e.reading}）{e.meaning}
            </p>
          ))}
        </div>
      </div>
    );
  }
  const v = VOCAB_BY_ID.get(item.itemId)!;
  const hv = hanViet(v.kanji);
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <p className="font-jp text-5xl font-bold">{v.kanji}</p>
      {v.kanji !== v.kana && <p className="font-jp text-xl text-muted-foreground">{v.kana}</p>}
      <p className="text-sm italic text-muted-foreground">{v.romaji}</p>
      <p className="text-2xl font-bold text-primary">{v.meaning}</p>
      {hv && (
        <div className="flex flex-wrap justify-center gap-2">
          {hv.parts.map((p) => (
            <span key={p.char} className="rounded-lg bg-muted px-2 py-1 text-sm">
              <span className="font-jp font-bold">{p.char}</span> {p.hv} <span className="text-muted-foreground">({p.meaning})</span>
            </span>
          ))}
        </div>
      )}
      {v.example && (
        <div className="mt-1 flex max-w-lg items-start gap-2 rounded-xl bg-muted/60 p-3 text-left">
          <div>
            <p className="font-jp">{v.example}</p>
            <p className="text-sm text-muted-foreground">{v.exampleVi}</p>
          </div>
          <SpeakButton text={v.example} />
        </div>
      )}
      <p className="text-xs text-muted-foreground">Đọc to từ và câu ví dụ một lần trước khi bấm Tiếp.</p>
    </div>
  );
}

/**
 * Teach → immediate test → re-teach mistakes. Each item is scheduled by its
 * first-try result: correct → tomorrow, needed re-teaching → later today.
 */
export function LearnSession({ ids, onDone }: { ids: string[]; onDone?: () => void }) {
  const items = useMemo(() => ids.map(parse).filter((i) => questionFor(i)), [ids]);
  const chunks = useMemo(() => Array.from({ length: Math.ceil(items.length / CHUNK) }, (_, i) => items.slice(i * CHUNK, i * CHUNK + CHUNK)), [items]);
  const [chunk, setChunk] = useState(0);
  const [phase, setPhase] = useState<"teach" | "test" | "done">("teach");
  useFocusSession(phase !== "done" && items.length > 0);
  const [teachQueue, setTeachQueue] = useState<Item[]>(() => chunks[0] ?? []);
  const [testQueue, setTestQueue] = useState<Item[]>([]);
  const [idx, setIdx] = useState(0);
  const [locked, setLocked] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [firstTry, setFirstTry] = useState<Record<string, boolean>>({});
  const [failed, setFailed] = useState<Item[]>([]);

  const key = (i: Item) => `${i.kind}:${i.itemId}`;
  const current = phase === "teach" ? teachQueue[idx] : testQueue[idx];
  const question = useMemo(() => (phase === "test" && current ? questionFor(current) : null), [phase, current]);
  const totalDone = Object.keys(firstTry).length;

  const finish = (results: Record<string, boolean>) => {
    useAppStore.getState().introduceCards(items.map((i) => ({ ...i, firstTry: results[key(i)] ?? false })));
    markPlanItem("learn");
    setPhase("done");
    onDone?.();
  };

  const nextTeach = () => {
    if (idx + 1 < teachQueue.length) return setIdx(idx + 1);
    setTestQueue(shuffle(teachQueue));
    setIdx(0);
    setFailed([]);
    setPhase("test");
  };

  const answer = (ok: boolean) => {
    if (!current) return;
    setLocked(true);
    useAppStore.getState().logAnswer(ok);
    useAppStore.getState().recordResults([{ ref: question?.ref, correct: ok }]);
    setFirstTry((f) => (key(current) in f ? f : { ...f, [key(current)]: ok }));
    if (!ok) setFailed((f) => [...f, current]);
  };

  const nextTest = () => {
    setLocked(false);
    setPicked(null);
    if (idx + 1 < testQueue.length) return setIdx(idx + 1);
    // Re-teach mistakes, then re-test them.
    if (failed.length) {
      setTeachQueue(failed);
      setIdx(0);
      setPhase("teach");
      return;
    }
    if (chunk + 1 < chunks.length) {
      setChunk(chunk + 1);
      setTeachQueue(chunks[chunk + 1]);
      setIdx(0);
      setPhase("teach");
      return;
    }
    finish(firstTry);
  };

  if (!items.length) return <p className="text-muted-foreground">Không có mục mới phù hợp hôm nay.</p>;

  if (phase === "done") {
    const ok = Object.values(firstTry).filter(Boolean).length;
    return (
      <CompletionCard
        emoji="✨"
        title={`Đã học ${items.length} mục mới!`}
        message="Mục đúng ngay lần đầu sẽ gặp lại vào ngày mai; mục phải học lại sẽ quay lại sau khoảng 10 phút."
        stats={[
          { label: "Mục mới", value: items.length },
          { label: "Đúng lần đầu", value: `${ok}/${items.length}`, tone: "good" },
        ]}
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div className="flex items-center gap-3">
        <Progress value={(totalDone / items.length) * 100} />
        <span className="shrink-0 text-sm font-semibold text-muted-foreground">
          {phase === "teach" ? "Học" : "Kiểm tra"} · cụm {chunk + 1}/{chunks.length}
        </span>
      </div>
      <Card className="p-6">
        {phase === "teach" && current && <TeachCard key={key(current) + idx} item={current} />}
        {phase === "test" && question?.kind === "choice" && (
          <ChoiceView
            key={key(current!) + idx}
            q={question}
            locked={locked}
            picked={picked}
            onAnswer={(i) => {
              setPicked(i);
              answer(i === question.answer);
            }}
          />
        )}
        {phase === "test" && question?.kind === "typing" && (
          <TypingView key={key(current!) + idx} q={question} locked={locked} onAnswer={(ok) => answer(ok)} />
        )}
      </Card>
      {phase === "teach" ? (
        <Button size="lg" onClick={nextTeach}>
          {idx + 1 < teachQueue.length ? "Tiếp" : "Kiểm tra ngay"} <ArrowRight />
        </Button>
      ) : (
        locked && (
          <Button size="lg" onClick={nextTest}>
            {failed.length && idx + 1 >= testQueue.length ? (
              <>
                <RotateCcw /> Học lại {failed.length} mục sai
              </>
            ) : (
              <>
                Tiếp <ArrowRight />
              </>
            )}
          </Button>
        )
      )}
      <p className="text-center text-xs text-muted-foreground">Kiểm tra ngay sau khi học (hiệu ứng truy xuất) giúp nhớ lâu hơn nhiều so với chỉ xem lại.</p>
    </div>
  );
}

