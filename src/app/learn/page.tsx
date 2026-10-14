"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, ChevronRight, Crown, Eye, Lock, Play, Sparkles } from "lucide-react";
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
const NODE = 80;

export default function LearnPage() {
  const { input, stage: main, pro } = useLearner();
  const [open, setOpen] = useState<StageId | null>(main.id);
  const statuses = new Map(STAGES.map((s) => [s.id, stageStatus(s, input)]));
  const doneCount = [...statuses.values()].filter((s) => s === "done").length;
  const mainReadiness = stageReadiness(main, input);
  // Journey progress: finished stages plus the share of the current one.
  const journey = Math.round(((doneCount + mainReadiness / 100) / STAGES.length) * 100);
  const currentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, []);

  let index = 0;
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-10">
      <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 pt-2">
        <h1 className="text-[28px] font-extrabold leading-tight tracking-tight sm:text-[32px]">Hành trình của bạn</h1>
        <Card className="flex items-center gap-4 p-5">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl text-white" style={{ background: main.color }}>
            <StageIcon name={main.icon} className="size-6" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex items-baseline justify-between gap-3">
              <p className="truncate font-bold">
                Đang học {main.title}
                {pro ? ` + ${pro.title}` : ""}
              </p>
              <span className="shrink-0 text-sm font-extrabold tabular-nums text-primary">{journey}%</span>
            </div>
            <Progress value={journey} className="h-2.5" />
            <p className="text-xs text-muted-foreground">
              {doneCount}/{STAGES.length} chặng đã chinh phục
            </p>
          </div>
        </Card>
      </motion.header>

      {UNITS.map((unit, u) => {
        const stages = unit.stages.map((id) => STAGE_BY_ID.get(id)!);
        const unitDone = stages.filter((s) => statuses.get(s.id) === "done").length;
        const unitLocked = stages.every((s) => statuses.get(s.id) === "locked");
        const color = stages[0].color;
        return (
          <section key={unit.title} className="flex flex-col items-center gap-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              className={cn("flex w-full items-center justify-between gap-4 rounded-3xl px-6 py-5 text-white shadow-soft", unitLocked && "opacity-75")}
              style={{ background: `linear-gradient(135deg, ${color}, color-mix(in oklch, ${color} 70%, black))` }}
            >
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest text-white/80">Phần {u + 1}</p>
                <h2 className="text-xl font-extrabold">{unit.title}</h2>
                <p className="text-sm text-white/85">{unit.subtitle}</p>
              </div>
              <span className="shrink-0 rounded-full bg-white/20 px-3 py-1 text-sm font-extrabold tabular-nums">
                {unitDone === stages.length ? <Check className="size-4" strokeWidth={3} /> : unitLocked ? <Lock className="size-4" /> : `${unitDone}/${stages.length}`}
              </span>
            </motion.div>

            <div className="flex w-full flex-col items-center gap-7">
              {stages.map((s) => {
                const offset = WIND[index++ % WIND.length];
                const status = statuses.get(s.id)!;
                const isOpen = open === s.id;
                const readiness = status === "current" ? stageReadiness(s, input) : 0;
                return (
                  <div key={s.id} ref={status === "current" && s.id === main.id ? currentRef : undefined} className="flex w-full flex-col items-center gap-4">
                    <PathNode stage={s} status={status} offset={offset} open={isOpen} readiness={readiness} onClick={() => setOpen(isOpen ? null : s.id)} />
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="panel"
                          initial={{ opacity: 0, height: 0, scale: 0.96 }}
                          animate={{ opacity: 1, height: "auto", scale: 1 }}
                          exit={{ opacity: 0, height: 0, scale: 0.96 }}
                          transition={{ type: "spring", stiffness: 320, damping: 30 }}
                          className="w-full max-w-sm overflow-hidden"
                        >
                          <StagePanel stage={s} status={status} readiness={stageReadiness(s, input)} />
                        </motion.div>
                      )}
                    </AnimatePresence>
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

/** Ring around the current node showing how close the learner is to finishing the stage. */
function ReadinessRing({ value, color }: { value: number; color: string }) {
  const size = NODE + 18;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="pointer-events-none absolute -rotate-90" style={{ left: -9, top: -9 }} aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c * (1 - Math.max(0.04, value / 100)) }}
        transition={{ duration: 1.1, ease: "easeOut", delay: 0.3 }}
      />
    </svg>
  );
}

function PathNode({ stage, status, offset, open, readiness, onClick }: { stage: Stage; status: StageStatus; offset: number; open: boolean; readiness: number; onClick: () => void }) {
  const locked = status === "locked";
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="flex flex-col items-center gap-2"
      style={{ x: offset }}
    >
      {status === "current" && !open && (
        <motion.span
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          className="rounded-xl border-2 border-hairline bg-card px-3 py-1 text-xs font-extrabold uppercase tracking-wider shadow-soft"
          style={{ color: stage.color }}
        >
          Học tiếp
        </motion.span>
      )}
      <div className="relative" style={{ width: NODE, height: NODE }}>
        {status === "current" && <ReadinessRing value={readiness} color={stage.color} />}
        <motion.button
          onClick={onClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92, y: 4 }}
          aria-expanded={open}
          aria-label={`${stage.title}${locked ? " (chưa mở khóa)" : status === "done" ? " (đã hoàn thành)" : ""}`}
          className={cn(
            "relative grid size-full place-items-center rounded-full",
            status === "done" && "ring-4 ring-amber-400 ring-offset-4 ring-offset-background",
            locked ? "shadow-[0_6px_0_0_var(--border)]" : "text-white shadow-[0_6px_0_0_var(--node-shadow)]",
          )}
          style={
            locked
              ? { background: `color-mix(in oklch, ${stage.color} 16%, var(--muted))`, color: `color-mix(in oklch, ${stage.color} 55%, var(--muted-foreground))` }
              : ({ background: stage.color, "--node-shadow": `color-mix(in oklch, ${stage.color} 65%, black)` } as React.CSSProperties)
          }
        >
          <StageIcon name={stage.icon} className="size-8" />
          {status === "done" && (
            <span className="absolute -right-2 -top-2 grid size-8 place-items-center rounded-full bg-amber-400 text-white ring-4 ring-background">
              <Crown className="size-4 fill-white" />
            </span>
          )}
          {locked && (
            <span className="absolute -right-1 -top-1 grid size-7 place-items-center rounded-full bg-card text-muted-foreground ring-4 ring-background">
              <Lock className="size-3.5" />
            </span>
          )}
        </motion.button>
      </div>
      <div className="text-center">
        <p className={cn("text-[15px] font-bold leading-tight", locked && "text-muted-foreground")}>{stage.title}</p>
        <p className="text-xs text-muted-foreground">{status === "current" ? `${readiness}% chặng này` : stage.subtitle}</p>
      </div>
    </motion.div>
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
    <Card className="p-5">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: stage.color }}>
            {status === "done" ? "Đã chinh phục 👑" : status === "current" ? "Bạn đang ở đây" : status === "locked" ? "Sắp tới" : "Có thể học"}
          </p>
          <h3 className="mt-1 text-lg font-extrabold leading-tight">{stage.title}</h3>
          <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">{stage.description}</p>
        </div>

        {(status === "locked" || status === "current") && (
          <div className="rounded-2xl bg-muted/60 p-4">
            <p className="flex items-center gap-1.5 text-sm font-bold">
              <Sparkles className="size-4" style={{ color: stage.color }} /> Bạn sẽ làm được
            </p>
            <ul className="mt-2 flex flex-col gap-1.5 text-sm">
              {stage.goals.map((g) => (
                <li key={g} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0" style={{ color: stage.color }} strokeWidth={3} /> {g}
                </li>
              ))}
            </ul>
          </div>
        )}

        {status === "current" && (
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tiến độ chặng này</span>
              <span className="font-bold tabular-nums">{readiness}%</span>
            </div>
            <Progress value={readiness} style={{ background: stage.color }} />
          </div>
        )}

        {status === "current" ? (
          <Button asChild size="lg" className="shine h-14">
            <Link href="/today/?start=1">
              <Play className="fill-current" /> Học tiếp
            </Link>
          </Button>
        ) : status === "locked" ? (
          <>
            <p className="flex items-start gap-2 text-sm text-muted-foreground">
              <Lock className="mt-0.5 size-4 shrink-0" /> Mở khóa khi bạn hoàn thành {prev?.title ?? "chặng trước"}.
            </p>
            <Button asChild size="lg" variant="outline">
              <Link href={`/stage/${stage.id}/`}>
                <Eye /> Xem trước nội dung
              </Link>
            </Button>
          </>
        ) : (
          <Button asChild size="lg" variant={status === "done" ? "secondary" : "default"}>
            <Link href={`/stage/${stage.id}/`}>{status === "done" ? "Ôn lại chặng này" : "Vào học"}</Link>
          </Button>
        )}
        {status === "current" && (
          <Link href={`/stage/${stage.id}/`} className="flex items-center justify-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
            Xem nội dung chặng <ChevronRight className="size-4" />
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
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-2 gap-3 overflow-hidden p-0.5 sm:grid-cols-3"
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
