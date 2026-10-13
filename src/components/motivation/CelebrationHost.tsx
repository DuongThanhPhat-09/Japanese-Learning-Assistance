"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Flame } from "lucide-react";
import { TIER_COLOR } from "@/data/achievements";
import { levelTitle } from "@/lib/xp";
import { cn } from "@/lib/utils";
import { useCelebrations, type Celebration } from "@/store/useCelebrations";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/ui/primitives";
import { Confetti } from "./Celebration";

const TIER_LABEL = { bronze: "Đồng", silver: "Bạc", gold: "Vàng", platinum: "Bạch kim" };

function streakLine(n: number) {
  if (n >= 30) return "Bạn đã biến việc học thành thói quen thật sự.";
  if (n >= 7) return "Một tuần trọn vẹn — trí nhớ dài hạn đang hình thành.";
  if (n >= 3) return "Đà đang lên! Quay lại ngày mai để giữ lửa.";
  return "Học mỗi ngày một chút là cách nhớ lâu nhất.";
}

function Body({ c }: { c: Celebration }) {
  switch (c.kind) {
    case "level":
      return (
        <>
          <div className="relative grid size-32 place-items-center">
            <span className="animate-burst absolute inset-0 rounded-full bg-primary/40" />
            <span className="animate-celebrate bg-hero relative grid size-28 place-items-center rounded-full text-5xl font-black text-white shadow-lift">{c.level}</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-bold uppercase tracking-widest text-primary">Lên cấp!</p>
            <DialogPrimitive.Title className="text-3xl font-extrabold tracking-tight">Cấp {c.level}</DialogPrimitive.Title>
            <p className="font-jp text-lg font-semibold text-muted-foreground">{levelTitle(c.level)}</p>
          </div>
          <p className="text-[15px] text-muted-foreground">Cấp độ đo sự chăm chỉ của bạn. Tiếp tục giữ nhịp nhé!</p>
        </>
      );
    case "goal":
      return (
        <>
          <ProgressRing value={100} size={128} stroke={12} className="animate-celebrate">
            <span className="text-4xl">🎯</span>
          </ProgressRing>
          <div className="flex flex-col gap-1.5">
            <DialogPrimitive.Title className="text-3xl font-extrabold tracking-tight">Đạt mục tiêu hôm nay!</DialogPrimitive.Title>
            <p className="text-[15px] text-muted-foreground">
              {c.xp} / {c.goal} XP · thưởng <b className="text-xp-ink">+30 XP</b>
            </p>
          </div>
          {c.streak > 0 && (
            <p className="flex items-center gap-1.5 rounded-full bg-streak/12 px-4 py-1.5 font-bold text-streak-ink">
              <Flame className="size-5" /> Chuỗi {c.streak} ngày
            </p>
          )}
        </>
      );
    case "streak":
      return (
        <>
          <div className="relative grid size-32 place-items-center">
            <span className="animate-burst absolute inset-0 rounded-full bg-streak/40" />
            <Flame className="animate-flicker relative size-24 fill-streak/80 text-streak" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col gap-1.5">
            <DialogPrimitive.Title className="text-5xl font-black tabular-nums text-streak-ink">{c.streak}</DialogPrimitive.Title>
            <p className="text-xl font-extrabold">ngày học liên tiếp!</p>
          </div>
          <p className="text-[15px] text-muted-foreground">{streakLine(c.streak)}</p>
        </>
      );
    case "achievement": {
      const one = c.items.length === 1 ? c.items[0] : null;
      return (
        <>
          <div className="flex flex-wrap justify-center gap-3">
            {c.items.slice(0, 6).map((a, i) => (
              <span
                key={a.id}
                className={cn("animate-celebrate grid place-items-center rounded-full bg-gradient-to-br font-jp shadow-lift", TIER_COLOR[a.tier], one ? "size-28 text-5xl" : "size-16 text-3xl")}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                {a.icon}
              </span>
            ))}
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-bold uppercase tracking-widest text-primary">{one ? `Huy hiệu ${TIER_LABEL[one.tier]}` : "Thành tích mới"}</p>
            <DialogPrimitive.Title className="text-3xl font-extrabold tracking-tight">{one ? one.title : `Mở khóa ${c.items.length} thành tích`}</DialogPrimitive.Title>
            <p className="text-[15px] text-muted-foreground">{one ? one.description : c.items.map((a) => a.title).join(" · ")}</p>
          </div>
        </>
      );
    }
  }
}

/**
 * Plays queued celebrations one at a time, but only when no focus session
 * (review, quiz, lesson) is on screen.
 */
export function CelebrationHost() {
  const current = useCelebrations((s) => (s.busy === 0 ? s.queue[0] : undefined));
  const shift = useCelebrations((s) => s.shift);
  return (
    <DialogPrimitive.Root open={!!current} onOpenChange={(o) => !o && shift()}>
      {current && (
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm" />
          <Confetti key={current.id} />
          <DialogPrimitive.Content
            key={current.id}
            aria-describedby={undefined}
            className="animate-pop fixed left-1/2 top-1/2 z-[61] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-5 rounded-3xl bg-popover px-6 pb-6 pt-10 text-center text-popover-foreground shadow-lift"
          >
            <Body c={current} />
            <DialogPrimitive.Close asChild>
              <Button size="lg" className="mt-2 w-full">
                Tiếp tục
              </Button>
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      )}
    </DialogPrimitive.Root>
  );
}
