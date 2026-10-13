"use client";

import { useEffect, useRef, useState } from "react";
import { Eye, Mic, Play, Square, Turtle, Volume2 } from "lucide-react";
import type { Sentence } from "@/lib/engine";
import { speak } from "@/lib/speech";
import { cn } from "@/lib/utils";
import { markPlanItem, useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Card, Progress } from "@/components/ui/primitives";

/** Offline voice recorder (MediaRecorder); playback stays in memory, nothing is uploaded. */
function useRecorder() {
  const [recording, setRecording] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);
  const rec = useRef<MediaRecorder | null>(null);
  useEffect(() => setSupported(typeof window !== "undefined" && !!navigator.mediaDevices && typeof MediaRecorder !== "undefined"), []);
  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks: Blob[] = [];
      const r = new MediaRecorder(stream);
      r.ondataavailable = (e) => chunks.push(e.data);
      r.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setUrl((old) => {
          if (old) URL.revokeObjectURL(old);
          return URL.createObjectURL(new Blob(chunks, { type: r.mimeType }));
        });
      };
      r.start();
      rec.current = r;
      setRecording(true);
    } catch {
      setSupported(false);
    }
  };
  const stop = () => {
    rec.current?.stop();
    setRecording(false);
  };
  const reset = () => setUrl(null);
  return { recording, url, supported, start, stop, reset };
}

const RATINGS = [
  { v: 0, label: "Chưa được", cls: "bg-rose-500 hover:bg-rose-600" },
  { v: 1, label: "Tạm", cls: "bg-amber-500 hover:bg-amber-600" },
  { v: 2, label: "Trôi chảy", cls: "bg-emerald-500 hover:bg-emerald-600" },
];

/**
 * Speaking practice from sentences the learner already understands.
 * - shadow: hear → repeat in sync → record → compare.
 * - reflex: see Vietnamese → say Japanese aloud within ~5 s → reveal and compare.
 */
export function SpeakingSession({ sentences, mode, onDone }: { sentences: Sentence[]; mode: "shadowing" | "reflex"; onDone?: () => void }) {
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(mode === "shadowing");
  const [ratings, setRatings] = useState<number[]>([]);
  const r = useRecorder();
  const s = sentences[i];

  useEffect(() => {
    if (mode === "shadowing" && s) speak(s.jp, { rate: 0.9 });
    setRevealed(mode === "shadowing");
    r.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  const rate = (v: number) => {
    const next = [...ratings, v];
    setRatings(next);
    if (i + 1 < sentences.length) return setI(i + 1);
    const st = useAppStore.getState();
    st.bumpCounter("shadow");
    st.addXp(sentences.length * 2);
    markPlanItem(mode);
    setI(i + 1);
    onDone?.();
  };

  if (!s) {
    const fluent = ratings.filter((x) => x === 2).length;
    return (
      <Card className="mx-auto flex max-w-md flex-col items-center gap-2 p-8 text-center">
        <p className="text-xl font-extrabold">Xong {sentences.length} câu</p>
        <p className="text-sm text-muted-foreground">
          Trôi chảy {fluent}/{sentences.length}. Câu “chưa được” sẽ xuất hiện lại trong các phiên sau khi bạn còn học mẫu đó.
        </p>
      </Card>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div className="flex items-center gap-3">
        <Progress value={(i / sentences.length) * 100} />
        <span className="shrink-0 text-sm font-semibold text-muted-foreground">
          {i + 1}/{sentences.length}
        </span>
      </div>
      <Card className="flex flex-col items-center gap-4 p-6 text-center">
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{mode === "shadowing" ? "Nghe → nói đuổi theo cùng nhịp" : "Nhìn tiếng Việt → nói tiếng Nhật trong 5 giây"}</span>
        {mode === "reflex" && <p className="text-xl font-semibold">{s.vi}</p>}
        {revealed ? (
          <div className="animate-pop flex flex-col gap-1">
            <p className="font-jp text-2xl leading-relaxed">{s.jp}</p>
            {mode === "shadowing" && <p className="text-sm text-muted-foreground">{s.vi}</p>}
          </div>
        ) : (
          <Button
            variant="secondary"
            onClick={() => {
              setRevealed(true);
              speak(s.jp);
            }}
          >
            <Eye /> Đã nói — xem đáp án
          </Button>
        )}
        {revealed && (
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="outline" onClick={() => speak(s.jp)}>
              <Volume2 /> Nghe mẫu
            </Button>
            <Button variant="outline" onClick={() => speak(s.jp, { rate: 0.65 })}>
              <Turtle /> Nghe chậm
            </Button>
            {r.supported &&
              (r.recording ? (
                <Button variant="destructive" onClick={r.stop}>
                  <Square /> Dừng ghi
                </Button>
              ) : (
                <Button variant="outline" onClick={r.start}>
                  <Mic /> Ghi âm giọng tôi
                </Button>
              ))}
            {r.url && (
              <Button variant="outline" onClick={() => new Audio(r.url!).play()}>
                <Play /> Nghe lại giọng tôi
              </Button>
            )}
          </div>
        )}
      </Card>
      {revealed && (
        <div className="grid grid-cols-3 gap-2">
          {RATINGS.map((x) => (
            <button key={x.v} onClick={() => rate(x.v)} className={cn("rounded-xl py-2.5 font-bold text-white", x.cls)}>
              {x.label}
            </button>
          ))}
        </div>
      )}
      <p className="text-center text-xs text-muted-foreground">
        {mode === "shadowing" ? "Mẹo: lần 1 nghe, lần 2 nói nhỏ theo, lần 3 nói to cùng nhịp. Chú ý trường âm và âm ngắt (っ)." : "Không cần hoàn hảo — nói ra được ý trong 5 giây quan trọng hơn. So đáp án và nói lại câu mẫu một lần."}
      </p>
    </div>
  );
}
