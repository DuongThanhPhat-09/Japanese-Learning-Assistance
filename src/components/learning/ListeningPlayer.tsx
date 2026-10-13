"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Eye, EyeOff, Languages, Pause, Play, Volume2 } from "lucide-react";
import type { ListeningExercise } from "@/types";
import { LISTENING_CATEGORY_LABEL } from "@/data/listening";
import { rubyToKana } from "@/lib/ruby";
import { hasJapaneseVoice, speak, speakSequence, stopSpeaking } from "@/lib/speech";
import { XP } from "@/lib/xp";
import { cn } from "@/lib/utils";
import { finishComprehension, useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, Select, Switch } from "@/components/ui/primitives";
import { LevelBadge } from "./common";
import { JapaneseText } from "./JapaneseText";
import { ComprehensionQuestions } from "./ArticleReader";

/**
 * Plays the exercise's local audio file if it exists in /public/audio/listening,
 * otherwise reads the dialog line by line with the OS Japanese voice.
 */
export function ListeningPlayer({ ex }: { ex: ListeningExercise }) {
  const done = useAppStore((s) => !!s.completed[`listening:${ex.id}`]);
  const score = useAppStore((s) => s.scores[`listening:${ex.id}`]);
  const [hasAudio, setHasAudio] = useState<boolean | null>(null);
  const [playing, setPlaying] = useState(false);
  const [line, setLine] = useState(-1);
  const [rate, setRate] = useState(0.9);
  const [transcript, setTranscript] = useState(false);
  const [translation, setTranslation] = useState(false);
  const [voiceOk, setVoiceOk] = useState(true);
  const audio = useRef<HTMLAudioElement | null>(null);
  const cancel = useRef<(() => void) | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(ex.audio, { method: "HEAD" })
      .then((r) => alive && setHasAudio(r.ok && (r.headers.get("content-type") ?? "").startsWith("audio")))
      .catch(() => alive && setHasAudio(false));
    const t = setTimeout(() => setVoiceOk(hasJapaneseVoice()), 600);
    return () => {
      alive = false;
      clearTimeout(t);
      stopSpeaking();
      audio.current?.pause();
    };
  }, [ex.audio]);

  const stop = () => {
    cancel.current?.();
    audio.current?.pause();
    setPlaying(false);
    setLine(-1);
  };

  const play = () => {
    if (playing) return stop();
    setPlaying(true);
    if (hasAudio) {
      audio.current ??= new Audio(ex.audio);
      audio.current.playbackRate = rate / 0.9;
      audio.current.onended = () => setPlaying(false);
      audio.current.play().catch(() => setPlaying(false));
      return;
    }
    cancel.current = speakSequence(
      ex.lines.map((l) => rubyToKana(l.jp)),
      { rate, onLine: setLine, onDone: () => { setPlaying(false); setLine(-1); } },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <LevelBadge level={ex.level} />
          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold">{LISTENING_CATEGORY_LABEL[ex.category]}</span>
          {done && <span className="text-sm font-semibold text-primary">✓ Đã hoàn thành</span>}
        </div>
        <h1 className="mt-2 text-2xl font-extrabold">
          <JapaneseText text={ex.title} interactive={false} />
        </h1>
        <p className="text-muted-foreground">{ex.titleVi} — {ex.situation}</p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button size="lg" onClick={play} className="rounded-full">
            {playing ? <Pause /> : <Play />} {playing ? "Dừng" : "Phát hội thoại"}
          </Button>
          <Select value={String(rate)} onChange={(e) => setRate(Number(e.target.value))} className="h-9">
            <option value="0.6">Chậm (0.6×)</option>
            <option value="0.75">Hơi chậm (0.75×)</option>
            <option value="0.9">Bình thường</option>
            <option value="1.1">Nhanh (1.1×)</option>
          </Select>
          <label className="flex items-center gap-2 text-sm font-medium">
            <Switch checked={transcript} onCheckedChange={setTranscript} /> {transcript ? <Eye className="size-4" /> : <EyeOff className="size-4" />} Lời thoại
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <Switch checked={translation} onCheckedChange={setTranslation} /> <Languages className="size-4" /> Bản dịch
          </label>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {hasAudio
            ? "🎧 Đang dùng file âm thanh cục bộ."
            : `🔈 Chưa có file ${ex.audio} — đang dùng giọng đọc tiếng Nhật của hệ điều hành. Đặt file MP3 cùng tên vào public/audio/listening để dùng âm thanh thật.`}
          {!voiceOk && !hasAudio && " ⚠️ Không tìm thấy giọng tiếng Nhật: hãy cài gói ngôn ngữ Japanese (Windows: Settings → Time & Language → Speech)."}
        </p>
      </Card>

      <Card>
        <CardHeader><CardTitle>Hội thoại</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-2">
          {ex.lines.map((l, i) => (
            <div key={i} className={cn("flex items-start gap-3 rounded-xl p-3 transition-colors", line === i ? "bg-primary/10" : "bg-muted/40")}>
              <span className="font-jp w-20 shrink-0 text-sm font-bold text-primary">{l.speaker}</span>
              <div className="min-w-0 flex-1">
                {transcript ? (
                  <p className="text-lg"><JapaneseText text={l.jp} /></p>
                ) : (
                  <p className="select-none text-muted-foreground blur-[5px]">{"・".repeat(Math.min(24, rubyToKana(l.jp).length))}</p>
                )}
                {translation && <p className="text-sm text-muted-foreground">{l.vi}</p>}
              </div>
              <button onClick={() => speak(rubyToKana(l.jp), { rate })} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-primary" aria-label="Nghe câu này">
                <Volume2 className="size-4" />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Câu hỏi nghe hiểu</CardTitle></CardHeader>
        <CardContent>
          <ComprehensionQuestions questions={ex.questions} onFinish={(pct) => finishComprehension("listening", ex.id, pct)} />
        </CardContent>
      </Card>

      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Check className="size-4" />
        {done ? `Đã hoàn thành · điểm cao nhất ${score ?? 0}% ${(score ?? 0) >= 70 ? "(đạt điều kiện lên cấp)" : "— nghe lại để đạt ≥ 70%"}` : `Nghe (chưa xem lời thoại) rồi trả lời hết câu hỏi để hoàn thành (+${XP.listeningComplete} XP).`}
      </p>
    </div>
  );
}
