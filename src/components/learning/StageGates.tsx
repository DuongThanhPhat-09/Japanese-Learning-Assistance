"use client";

import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import type { Stage } from "@/types";
import { stageGates, stageReadiness } from "@/lib/engine";
import { useEngineInput } from "@/hooks/useEngine";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Progress } from "@/components/ui/primitives";

/** Level-up requirements for a stage, measured on retention and performance. */
export function StageGates({ stage, compact = false }: { stage: Stage; compact?: boolean }) {
  const input = useEngineInput();
  const gates = stageGates(stage, input);
  const readiness = stageReadiness(stage, input);
  const passed = gates.every((g) => g.met);
  const list = (
    <ul className="flex flex-col gap-2.5">
      {gates.map((g) => {
        const p = g.target ? Math.min(100, (g.current / g.target) * 100) : 100;
        return (
          <li key={g.id} className="flex items-start gap-2.5">
            {g.met ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" /> : <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-2 text-sm">
                {g.href ? (
                  <Link href={g.href} className={cn("font-medium hover:text-primary", g.met && "text-muted-foreground")}>
                    {g.label}
                  </Link>
                ) : (
                  <span className={cn("font-medium", g.met && "text-muted-foreground")}>{g.label}</span>
                )}
                <span className="shrink-0 text-xs font-semibold text-muted-foreground">
                  {g.current}
                  {g.unit === "%" ? "%" : ""} / {g.target}
                  {g.unit === "%" ? "%" : ` ${g.unit}`}
                </span>
              </div>
              {!g.met && <Progress value={p} className="mt-1 h-1.5" />}
              {g.detail && !g.met && <p className="mt-0.5 text-[11px] text-muted-foreground">{g.detail}</p>}
            </div>
          </li>
        );
      })}
    </ul>
  );
  if (compact) return list;
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>{passed ? "✓ Đã đủ điều kiện lên cấp" : `Điều kiện lên cấp · sẵn sàng ${readiness}%`}</CardTitle>
        <CardDescription>Đo bằng trí nhớ thật (thẻ nhớ qua mốc 7 ngày), điểm đọc/nghe hiểu và thi thử — không tính số bài đã “xem”.</CardDescription>
      </CardHeader>
      <CardContent>{list}</CardContent>
    </Card>
  );
}
