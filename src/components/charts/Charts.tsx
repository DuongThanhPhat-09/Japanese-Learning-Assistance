"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TooltipProps } from "recharts";
import type { CardState } from "@/types";
import { cn } from "@/lib/utils";
import { parseDateKey } from "@/lib/date";

/**
 * Single-series charts use the brand primary (no legend: the card title names
 * the series). Grid and axes are recessive; every chart has a hover tooltip.
 */

const AXIS = { stroke: "var(--muted-foreground)", fontSize: 11, tickLine: false, axisLine: false } as const;

function ChartTooltip({ active, payload, label, unit }: TooltipProps<number, string> & { unit: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-muted-foreground">{label}</p>
      <p className="text-sm font-bold text-foreground">
        {payload[0].value} {unit}
      </p>
    </div>
  );
}

export function BarSeries({ data, dataKey, xKey, unit, height = 220, color = "var(--primary)" }: { data: object[]; dataKey: string; xKey: string; unit: string; height?: number; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: -18, bottom: 0 }} barCategoryGap="22%">
        <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="0" />
        <XAxis dataKey={xKey} {...AXIS} />
        <YAxis {...AXIS} allowDecimals={false} width={44} />
        <Tooltip cursor={{ fill: "var(--muted)", opacity: 0.6 }} content={<ChartTooltip unit={unit} />} />
        <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} maxBarSize={36} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AreaSeries({ data, dataKey, xKey, unit, height = 220 }: { data: object[]; dataKey: string; xKey: string; unit: string; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.28} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey={xKey} {...AXIS} interval="preserveStartEnd" minTickGap={24} />
        <YAxis {...AXIS} allowDecimals={false} width={44} />
        <Tooltip cursor={{ stroke: "var(--muted-foreground)", strokeDasharray: "3 3" }} content={<ChartTooltip unit={unit} />} />
        <Area type="monotone" dataKey={dataKey} stroke="var(--primary)" strokeWidth={2} fill="url(#area-fill)" isAnimationActive={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Ordered progression new → mastered: one hue, light → dark. */
const STATE_STEPS: { state: CardState; label: string; className: string }[] = [
  { state: "new", label: "Mới", className: "bg-emerald-200 dark:bg-emerald-900" },
  { state: "learning", label: "Đang học", className: "bg-emerald-400 dark:bg-emerald-700" },
  { state: "review", label: "Ôn tập", className: "bg-emerald-600 dark:bg-emerald-500" },
  { state: "mastered", label: "Thành thạo", className: "bg-emerald-800 dark:bg-emerald-300" },
];

export function SrsStateBar({ counts }: { counts: Record<CardState, number> }) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-4 w-full gap-[2px] overflow-hidden rounded-full bg-muted" role="img" aria-label="Phân bố trạng thái thẻ SRS">
        {total > 0 &&
          STATE_STEPS.filter((s) => counts[s.state] > 0).map((s) => (
            <div key={s.state} className={cn("h-full first:rounded-l-full last:rounded-r-full", s.className)} style={{ width: `${(counts[s.state] / total) * 100}%` }} title={`${s.label}: ${counts[s.state]}`} />
          ))}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {STATE_STEPS.map((s) => (
          <div key={s.state} className="flex items-center gap-2 text-sm">
            <span className={cn("size-3 shrink-0 rounded-sm", s.className)} />
            <span className="text-muted-foreground">{s.label}</span>
            <span className="font-bold">{counts[s.state]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** GitHub-style activity heatmap for the last N weeks (sequential single hue). */
export function ActivityHeatmap({ days }: { days: { date: string; xp: number }[] }) {
  const max = Math.max(1, ...days.map((d) => d.xp));
  const level = (xp: number) => (xp === 0 ? 0 : Math.min(4, Math.ceil((xp / max) * 4)));
  const shades = ["bg-muted", "bg-emerald-200 dark:bg-emerald-900", "bg-emerald-400 dark:bg-emerald-700", "bg-emerald-600 dark:bg-emerald-500", "bg-emerald-800 dark:bg-emerald-300"];
  // Pad so the first column starts on Monday.
  const first = days[0] ? parseDateKey(days[0].date) : new Date();
  const pad = (first.getDay() + 6) % 7;
  const cells = [...Array(pad).fill(null), ...days];
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-flow-col grid-rows-7 gap-[3px] overflow-x-auto">
        {cells.map((d, i) =>
          d ? <div key={i} className={cn("size-3 rounded-[3px]", shades[level(d.xp)])} title={`${d.date}: ${d.xp} XP`} /> : <div key={i} className="size-3" />,
        )}
      </div>
      <div className="flex items-center gap-1 self-end text-[11px] text-muted-foreground">
        Ít
        {shades.map((s) => (
          <span key={s} className={cn("size-3 rounded-[3px]", s)} />
        ))}
        Nhiều
      </div>
    </div>
  );
}
