"use client";

import { Lock } from "lucide-react";
import { ACHIEVEMENTS, TIER_COLOR } from "@/data/achievements";
import { levelProgress, levelTitle, xpForLevel } from "@/lib/xp";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { useStats } from "@/hooks/useStats";
import { Card, CardContent, CardHeader, CardTitle, Progress } from "@/components/ui/primitives";
import { PageHeader } from "@/components/learning/common";

const TIER_LABEL = { bronze: "Đồng", silver: "Bạc", gold: "Vàng", platinum: "Bạch kim" };

export default function AchievementsPage() {
  const unlocked = useAppStore((s) => s.achievements);
  const xp = useAppStore((s) => s.xp);
  const stats = useStats();
  const lp = levelProgress(xp);
  const count = Object.keys(unlocked).length;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Thành tích & Cấp độ" jp="実績" description="Nhận XP từ mọi hoạt động, lên cấp, mở khóa huy hiệu và duy trì chuỗi ngày học." />
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="flex flex-col items-center gap-2 p-6 text-center md:col-span-1">
          <div className="grid size-24 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 text-4xl font-black text-white shadow-lg">{lp.level}</div>
          <p className="font-jp text-lg font-bold">{levelTitle(lp.level)}</p>
          <Progress value={lp.percent} />
          <p className="text-xs text-muted-foreground">{lp.current}/{lp.needed} XP đến cấp {lp.level + 1} · tổng {xp} XP</p>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader><CardTitle>Cách nhận XP</CardTitle></CardHeader>
          <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
            {[
              ["Trả lời đúng quiz", "+10 XP (+1–5 thưởng tốc độ)"],
              ["Quiz hoàn hảo 100%", "+20 XP"],
              ["Ôn thẻ SRS (mọi mức tự chấm)", "+6 XP"],
              ["Hoàn thành bài học / ngữ pháp", "+20 XP"],
              ["Bài đọc / bài nghe (trả lời hết câu hỏi)", "+25 XP"],
              ["Thi thử JLPT", "+50 XP + ½ điểm số"],
              ["Đạt mục tiêu ngày / xong kế hoạch ngày", "+30 XP thưởng"],
              ["Thử thách 60s", "+3 XP mỗi điểm"],
            ].map(([a, b]) => (
              <div key={a} className="flex justify-between rounded-lg bg-muted/50 px-3 py-2"><span>{a}</span><span className="font-semibold text-amber-600 dark:text-amber-400">{b}</span></div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Huy hiệu ({count}/{ACHIEVEMENTS.length})</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {ACHIEVEMENTS.map((a) => {
            const at = unlocked[a.id];
            return (
              <div key={a.id} className={cn("flex flex-col items-center gap-1.5 rounded-xl border p-4 text-center", !at && "opacity-55")}>
                <div className={cn("grid size-14 place-items-center rounded-full bg-gradient-to-br text-2xl shadow", at ? TIER_COLOR[a.tier] : "from-muted to-muted")}>
                  {at ? <span className="font-jp">{a.icon}</span> : <Lock className="size-5 text-muted-foreground" />}
                </div>
                <p className="text-sm font-bold">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.description}</p>
                <span className="text-[10px] font-semibold uppercase text-muted-foreground">{TIER_LABEL[a.tier]}{at ? ` · ${new Date(at).toLocaleDateString("vi-VN")}` : ""}</span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Bậc cấp độ</CardTitle></CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-4">
          {[1, 3, 6, 10, 15, 20, 30, 45].map((l) => (
            <div key={l} className={cn("rounded-lg border p-3", lp.level >= l && "border-primary bg-primary/5")}>
              <p className="font-bold">Cấp {l}+</p>
              <p className="font-jp text-xs">{levelTitle(l)}</p>
              <p className="text-xs text-muted-foreground">{xpForLevel(l).toLocaleString("vi-VN")} XP</p>
            </div>
          ))}
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">Chuỗi hiện tại {stats.streak} ngày · dài nhất {stats.longestStreak} ngày · {stats.activeDays} ngày có học.</p>
    </div>
  );
}
