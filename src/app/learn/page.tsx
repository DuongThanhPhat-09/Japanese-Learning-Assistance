"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, ChevronRight, Crown, Lock, Play } from "lucide-react";
import type { Stage, StageId, Track } from "@/types";
import { STAGES, STAGE_BY_ID } from "@/data/stages";
import { stageReadiness, stageStatus, type StageStatus } from "@/lib/engine";
import { useLearner } from "@/hooks/useEngine";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, Progress } from "@/components/ui/primitives";
import { StageIcon } from "@/components/learning/StageIcon";
import { PRACTICE_LIBRARY } from "@/components/layout/nav";

const UNITS: { title: string; subtitle: string; stages: StageId[] }[] = [
  { title: "Khởi đầu", subtitle: "Chữ viết, phát âm và những câu đầu tiên", stages: ["beginner", "hiragana", "katakana"] },
  { title: "JLPT", subtitle: "Từ sơ cấp N5 đến cao cấp N1", stages: ["n5", "n4", "n3", "n2", "n1"] },
  { title: "Chuyên ngành", subtitle: "Tiếng Nhật cho công việc", stages: ["business", "it", "brse"] },
  { title: "Đỉnh cao", subtitle: "Tiếng Nhật như người bản xứ", stages: ["native"] },
];

/** Horizontal offsets that make the path wind like a trail. */
const WIND = [0, 48, 72, 48, 0, -48, -72, -48];

export default function LearnPage() {
  const { input, stage: main, pro } = useLearner();
  const [open, setOpen] = useState<StageId | null>(main.id);
  const statuses = new Map(STAGES.map((s) => [s.id, stageStatus(s, input)]));
  const doneCount = [...statuses.values()].filter((s) => s === "done").length;
  const currentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, []);

  let index = 0;
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-10">
      <header className="flex flex-col gap-2 pt-2">
        <h1 className="text-[28px] font-extrabold leading-tight tracking-tight sm:text-[32px]">Lộ trình của bạn</h1>
        <p className="text-base text-muted-foreground">
          Đang học <b className="text-foreground">{main.title}</b>
          {pro && (
            <>
              {" "}
              và <b className="text-foreground">{pro.title}</b>
            </>
          )}{" "}
          · {doneCount}/{STAGES.length} giai đoạn hoàn thành
        </p>
      </header>

      {UNITS.map((unit, u) => {
        const stages = unit.stages.map((id) => STAGE_BY_ID.get(id)!);
        const unitDone = stages.filter((s) => statuses.get(s.id) === "done").length;
        const unitLocked = stages.every((s) => statuses.get(s.id) === "locked");
        const color = stages[0].color;
        return (
          <section key={unit.title} className="flex flex-col items-center gap-8">
            <div
              className={cn("flex w-full items-center justify-between gap-4 rounded-3xl px-6 py-5 text-white shadow-soft", unitLocked && "opacity-60 grayscale")}
              style={{ background: `linear-gradient(135deg, ${color}, color-mix(in oklch, ${color} 70%, black))` }}
            >
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest text-white/80">Phần {u + 1}</p>
                <h2 className="text-xl font-extrabold">{unit.title}</h2>
                <p className="text-sm text-white/85">{unit.subtitle}</p>
              </div>
              <span className="shrink-0 rounded-full bg-white/20 px-3 py-1 text-sm font-extrabold tabular-nums">
                {unitDone === stages.length ? <Check className="size-4" strokeWidth={3} /> : `${unitDone}/${stages.length}`}
              </span>
            </div>

            <div className="flex w-full flex-col items-center gap-7">
              {stages.map((s) => {
                const offset = WIND[index++ % WIND.length];
                const status = statuses.get(s.id)!;
                const isOpen = open === s.id;
                return (
                  <div key={s.id} ref={status === "current" && s.id === main.id ? currentRef : undefined} className="flex w-full flex-col items-center gap-4">
                    <PathNode stage={s} status={status} offset={offset} open={isOpen} onClick={() => setOpen(isOpen ? null : s.id)} />
                    {isOpen && <StagePanel stage={s} status={status} readiness={stageReadiness(s, input)} />}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      <PracticeLibrary />
    </div>
  );
}

function PathNode({ stage, status, offset, open, onClick }: { stage: Stage; status: StageStatus; offset: number; open: boolean; onClick: () => void }) {
  const locked = status === "locked";
  return (
    <div className="flex flex-col items-center gap-2" style={{ transform: `translateX(${offset}px)` }}>
      {status === "current" && !open && (
        <span className="animate-rise rounded-xl border-2 border-hairline bg-card px-3 py-1 text-xs font-extrabold uppercase tracking-wider shadow-soft" style={{ color: stage.color }}>
          Tiếp tục
        </span>
      )}
      <button
        onClick={onClick}
        aria-expanded={open}
        aria-label={`${stage.title}${locked ? " (chưa mở khóa)" : status === "done" ? " (đã hoàn thành)" : ""}`}
        className={cn(
          "relative grid size-[76px] place-items-center rounded-full text-white transition-transform active:translate-y-1",
          status === "current" && "animate-pulse-ring",
          locked ? "bg-muted text-muted-foreground shadow-[0_6px_0_0_var(--border)]" : "shadow-[0_6px_0_0_var(--node-shadow)]",
        )}
        style={
          locked
            ? undefined
            : ({ background: stage.color, "--node": stage.color, "--node-shadow": `color-mix(in oklch, ${stage.color} 65%, black)` } as React.CSSProperties)
        }
      >
        <StageIcon name={stage.icon} className="size-8" />
        {status === "done" && (
          <span className="absolute -right-1 -top-1 grid size-7 place-items-center rounded-full bg-amber-400 text-white ring-4 ring-background">
            <Crown className="size-3.5 fill-white" />
          </span>
        )}
        {locked && (
          <span className="absolute -right-1 -top-1 grid size-7 place-items-center rounded-full bg-card text-muted-foreground ring-4 ring-background">
            <Lock className="size-3.5" />
          </span>
        )}
      </button>
      <div className="text-center">
        <p className={cn("text-[15px] font-bold leading-tight", locked && "text-muted-foreground")}>{stage.title}</p>
        <p className="text-xs text-muted-foreground">{stage.subtitle}</p>
      </div>
    </div>
  );
}

/** Which stage unlocks this one, following the learner's track (professional stages run alongside JLPT after N5). */
function unlockedBy(stage: Stage, track: Track): Stage | undefined {
  if (track !== "jlpt") {
    const after: Partial<Record<StageId, StageId>> = { business: "n5", it: "business", brse: "it", native: "n1" };
    if (after[stage.id]) return STAGE_BY_ID.get(after[stage.id]!);
  }
  return STAGES.find((s) => s.order === stage.order - 1);
}

function StagePanel({ stage, status, readiness }: { stage: Stage; status: StageStatus; readiness: number }) {
  const track = useAppStore((s) => s.profile.track);
  const prev = unlockedBy(stage, track);
  return (
    <Card className="animate-pop w-full max-w-sm p-5">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: status === "locked" ? undefined : stage.color }}>
            {status === "done" ? "Đã hoàn thành" : status === "current" ? "Đang học" : status === "locked" ? "Chưa mở khóa" : "Có thể học"}
          </p>
          <h3 className="mt-1 text-lg font-extrabold leading-tight">{stage.title}</h3>
          <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">{stage.description}</p>
        </div>
        {status !== "locked" && status !== "done" && (
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sẵn sàng lên cấp</span>
              <span className="font-bold tabular-nums">{readiness}%</span>
            </div>
            <Progress value={readiness} indicatorClassName="transition-all" style={{ background: stage.color }} />
          </div>
        )}
        {status === "current" ? (
          <Button asChild size="lg">
            <Link href="/today/?start=1">
              <Play className="fill-current" /> Tiếp tục học
            </Link>
          </Button>
        ) : status === "locked" ? (
          <Button size="lg" disabled variant="secondary" className="h-auto whitespace-normal py-3.5">
            <Lock /> Hoàn thành {prev?.title ?? "giai đoạn trước"} để mở khóa
          </Button>
        ) : (
          <Button asChild size="lg" variant={status === "done" ? "secondary" : "default"}>
            <Link href={`/stage/${stage.id}/`}>{status === "done" ? "Ôn lại giai đoạn" : "Vào học"}</Link>
          </Button>
        )}
        {(status === "current" || status === "locked") && (
          <Link href={`/stage/${stage.id}/`} className="flex items-center justify-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
            {status === "locked" ? "Xem trước nội dung" : "Xem nội dung & điều kiện lên cấp"} <ChevronRight className="size-4" />
          </Link>
        )}
      </div>
    </Card>
  );
}

function PracticeLibrary() {
  const { beginner } = useLearner();
  const [open, setOpen] = useState(!beginner);
  return (
    <section className="flex flex-col gap-4 border-t border-hairline pt-8">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center justify-between text-left" aria-expanded={open}>
        <div>
          <h2 className="text-lg font-bold tracking-tight">Luyện tập tự do</h2>
          <p className="text-sm text-muted-foreground">Tra cứu và luyện thêm ngoài lộ trình</p>
        </div>
        <ChevronDown className={cn("size-5 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="animate-pop grid grid-cols-2 gap-3 sm:grid-cols-3">
          {PRACTICE_LIBRARY.map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="flex h-full flex-col gap-3 p-4 transition-all hover:-translate-y-0.5 hover:shadow-lift">
                <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <item.icon className="size-5" />
                </span>
                <div>
                  <p className="font-bold leading-tight">{item.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
