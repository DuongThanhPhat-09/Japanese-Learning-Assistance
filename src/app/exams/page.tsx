"use client";

import Link from "next/link";
import { GraduationCap, History } from "lucide-react";
import { EXAM_CONFIG, SECTION_LABEL } from "@/lib/exam";
import { formatSeconds } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives";
import { EmptyState, PageHeader } from "@/components/learning/common";
import { BarSeries } from "@/components/charts/Charts";

const LEVELS = ["N5", "N4", "N3", "N2", "N1"] as const;

export default function ExamsPage() {
  const results = useAppStore((s) => s.examResults);
  const trend = [...results].reverse().slice(-12).map((r, i) => ({ label: `#${i + 1} ${r.level}`, score: r.score }));
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Thi thử JLPT" jp="模擬試験" description="Đề thi thử được sinh từ kho dữ liệu theo cấu trúc JLPT: từ vựng, chữ Hán, ngữ pháp, đọc hiểu, nghe hiểu — có bấm giờ, phân tích kết quả, báo cáo điểm yếu và gợi ý chủ đề ôn tập." />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {LEVELS.map((l) => {
          const cfg = EXAM_CONFIG[l];
          const qs = Object.values(cfg.counts).reduce((a, b) => a + b, 0);
          const best = Math.max(0, ...results.filter((r) => r.level === l).map((r) => r.score));
          return (
            <Card key={l} className="flex flex-col items-center gap-2 p-5 text-center">
              <GraduationCap className="size-8 text-primary" />
              <p className="text-2xl font-black">{l}</p>
              <p className="text-xs text-muted-foreground">{qs} câu · {cfg.minutes} phút · đỗ ≥ {cfg.passMark}%</p>
              <p className="text-sm">Điểm cao nhất: <b>{best}%</b></p>
              <Button asChild className="w-full"><Link href={`/exams/${l.toLowerCase()}/`}>Làm bài</Link></Button>
            </Card>
          );
        })}
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><History className="size-4" /> Lịch sử thi thử</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          {results.length ? (
            <>
              <BarSeries data={trend} dataKey="score" xKey="label" unit="%" height={180} />
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground">
                    <tr><th className="py-2">Ngày</th><th>Cấp độ</th><th>Điểm</th><th>Kết quả</th><th>Thời gian</th>{Object.values(SECTION_LABEL).map((s) => <th key={s} className="hidden md:table-cell">{s.split(" ")[0]} {s.split(" ")[1]}</th>)}</tr>
                  </thead>
                  <tbody>
                    {results.slice(0, 20).map((r) => (
                      <tr key={r.id} className="border-t">
                        <td className="py-2">{new Date(r.date).toLocaleDateString("vi-VN")}</td>
                        <td className="font-bold">{r.level}</td>
                        <td>{r.score}%</td>
                        <td className={r.passed ? "font-semibold text-emerald-600" : "font-semibold text-rose-600"}>{r.passed ? "Đỗ" : "Chưa đỗ"}</td>
                        <td>{formatSeconds(r.seconds)}</td>
                        {Object.values(r.sections).map((s, i) => <td key={i} className="hidden md:table-cell">{s.correct}/{s.total}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <EmptyState icon="📝" title="Chưa có bài thi nào">Hãy thử sức với đề N5 trước nhé!</EmptyState>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
