"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useFocusSession } from "@/store/useCelebrations";
import { Button } from "@/components/ui/button";
import { Card, Progress } from "@/components/ui/primitives";

/** "How Japanese works" — the orientation shown before the first kana lesson. */
export const ORIENTATION_SECTIONS = [
  { emoji: "✍️", t: "Ba bảng chữ cái", d: "Hiragana (ひらがな) cho từ thuần Nhật và ngữ pháp; Katakana (カタカナ) cho từ ngoại lai; Kanji (漢字) mang nghĩa — người Việt có lợi thế nhờ âm Hán Việt." },
  { emoji: "🗣️", t: "Phát âm", d: "Tiếng Nhật có 5 nguyên âm a-i-u-e-o, không có thanh điệu như tiếng Việt nhưng có trọng âm cao độ. Âm “u” tròn môi nhẹ; “r” nằm giữa r và l." },
  { emoji: "🧩", t: "Trật tự câu", d: "Chủ ngữ – Tân ngữ – Động từ (SOV): 私はご飯を食べます = Tôi cơm ăn. Trợ từ (は, を, に…) đánh dấu vai trò của từ." },
  { emoji: "🙇", t: "Lịch sự", d: "Bắt đầu với thể です・ます. Khi đi làm sẽ học thêm kính ngữ (Keigo) ở giai đoạn Business." },
];

/** The orientation as a guided lesson: one idea per screen, then done. */
export function OrientationLesson({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const [finished, setFinished] = useState(false);
  useFocusSession(!finished);
  const last = i === ORIENTATION_SECTIONS.length - 1;
  const s = ORIENTATION_SECTIONS[i];

  const next = () => {
    if (!last) return setI(i + 1);
    useAppStore.getState().markComplete("intro:orientation");
    setFinished(true);
    onDone();
  };

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-5">
      <Progress value={((i + (finished ? 1 : 0)) / ORIENTATION_SECTIONS.length) * 100} className="h-3" />
      <AnimatePresence mode="wait">
        <motion.div key={i} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ type: "spring", stiffness: 320, damping: 30 }}>
          <Card className="flex min-h-72 flex-col items-center justify-center gap-4 px-6 py-10 text-center">
            <span className="text-6xl">{s.emoji}</span>
            <h2 className="text-2xl font-extrabold tracking-tight">{s.t}</h2>
            <p className="font-jp max-w-md text-[17px] leading-relaxed text-muted-foreground">{s.d}</p>
          </Card>
        </motion.div>
      </AnimatePresence>
      {!finished && (
        <motion.div whileTap={{ scale: 0.97 }}>
          <Button size="lg" className="h-14 w-full" onClick={next}>
            {last ? (
              <>
                <Check /> Tôi đã hiểu
              </>
            ) : (
              <>
                Tiếp <ArrowRight />
              </>
            )}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
