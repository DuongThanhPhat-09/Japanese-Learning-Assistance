"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowLeft, Printer } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useStats } from "@/hooks/useStats";
import { STAGES } from "@/data/stages";
import { ACHIEVEMENTS } from "@/data/achievements";
import { activitySeries } from "@/lib/stats";
import { stageReadiness } from "@/lib/engine";
import { useEngineInput } from "@/hooks/useEngine";
import { countByState } from "@/lib/srs";
import { SECTION_LABEL, weaknessReport } from "@/lib/exam";
import { levelTitle } from "@/lib/xp";
import { formatMinutes } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * Printable learning report. "Lưu PDF" opens the browser print dialog, where
 * "Save as PDF" produces the file offline with correct Japanese/Vietnamese glyphs.
 */
export default function ReportPage() {
  const s = useAppStore();
  const engineInput = useEngineInput();
  const stats = useStats();
  const month = useMemo(() => activitySeries(s.activity, 30), [s.activity]);
  const counts = countByState(Object.values(s.cards));
  const lastExam = s.examResults[0];
  const maxXp = Math.max(1, ...month.map((d) => d.xp));

  return (
    <div className="print-page mx-auto max-w-3xl bg-white p-8 text-black">
      <div className="no-print mb-6 flex justify-between">
        <Button variant="outline" asChild><Link href="/settings/"><ArrowLeft /> Quay lại</Link></Button>
        <Button onClick={() => window.print()}><Printer /> Lưu PDF / In</Button>
      </div>

      <header className="mb-6 border-b-2 border-emerald-600 pb-4">
        <p className="text-sm font-semibold text-emerald-700">NihongoPath · Báo cáo học tập</p>
        <h1 className="text-3xl font-extrabold">{s.profile.name}</h1>
        <p className="text-sm text-gray-600">Ngày xuất: {new Date().toLocaleDateString("vi-VN")} · Bắt đầu học: {new Date(s.profile.createdAt).toLocaleDateString("vi-VN")}</p>
      </header>

      <section className="mb-6 grid grid-cols-4 gap-3 text-center">
        {[
          ["Cấp chuyên cần (XP)", `${stats.level}`, levelTitle(stats.level)],
          ["Tổng XP", stats.xp.toLocaleString("vi-VN"), ""],
          ["Chuỗi ngày", `${stats.streak}`, `kỷ lục ${stats.longestStreak}`],
          ["Thời gian học", formatMinutes(stats.totalMinutes), `${stats.activeDays} ngày`],
          ["Từ vựng", `${stats.vocabLearned}`, `/ ${stats.vocabTotal}`],
          ["Ngữ pháp", `${stats.grammarCompleted}`, `/ ${stats.grammarTotal}`],
          ["Kanji", `${stats.kanjiLearned}`, `thành thạo ${stats.kanjiMastered}`],
          ["Độ chính xác", `${stats.accuracy}%`, `${stats.totalReviews} lượt ôn`],
        ].map(([label, value, sub]) => (
          <div key={label} className="rounded-lg border border-gray-300 p-3">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-xl font-extrabold">{value}</p>
            <p className="font-jp text-[11px] text-gray-500">{sub}</p>
          </div>
        ))}
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-bold">XP 30 ngày gần nhất</h2>
        <div className="flex h-28 items-end gap-[2px] border-b border-gray-300">
          {month.map((d) => (
            <div key={d.date} className="flex-1 rounded-t-sm bg-emerald-600" style={{ height: `${(d.xp / maxXp) * 100}%`, minHeight: d.xp ? 2 : 0 }} title={`${d.date}: ${d.xp} XP`} />
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-gray-500"><span>{month[0].date}</span><span>{month[month.length - 1].date}</span></div>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-bold">Mức sẵn sàng lên cấp</h2>
        <table className="w-full text-sm">
          <tbody>
            {STAGES.map((st) => {
              const p = stageReadiness(st, engineInput);
              return (
                <tr key={st.id} className="border-b border-gray-200">
                  <td className="py-1.5 pr-2 w-8 text-gray-500">{st.order}</td>
                  <td className="py-1.5">{st.title}</td>
                  <td className="w-1/2 py-1.5">
                    <div className="h-2 rounded-full bg-gray-200"><div className="h-2 rounded-full bg-emerald-600" style={{ width: `${p}%` }} /></div>
                  </td>
                  <td className="w-12 py-1.5 text-right font-semibold">{p}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="mb-6 grid grid-cols-2 gap-6">
        <div>
          <h2 className="mb-2 text-lg font-bold">Thẻ SRS</h2>
          <ul className="text-sm">
            <li>Mới: <b>{counts.new}</b></li>
            <li>Đang học: <b>{counts.learning}</b></li>
            <li>Ôn tập: <b>{counts.review}</b></li>
            <li>Thành thạo: <b>{counts.mastered}</b></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-2 text-lg font-bold">Thi thử gần nhất</h2>
          {lastExam ? (
            <div className="text-sm">
              <p><b>{lastExam.level}</b> · {lastExam.score}% · {lastExam.passed ? "Đỗ" : "Chưa đỗ"} ({new Date(lastExam.date).toLocaleDateString("vi-VN")})</p>
              <p className="mt-1 text-gray-600">Phần yếu nhất: {weaknessReport(lastExam).slice(0, 2).map((w) => `${SECTION_LABEL[w.section]} (${w.accuracy}%)`).join(", ")}</p>
            </div>
          ) : <p className="text-sm text-gray-500">Chưa có</p>}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-bold">Thành tích ({Object.keys(s.achievements).length})</h2>
        <p className="text-sm text-gray-700">{ACHIEVEMENTS.filter((a) => s.achievements[a.id]).map((a) => `${a.icon} ${a.title}`).join(" · ") || "Chưa có"}</p>
      </section>
    </div>
  );
}
