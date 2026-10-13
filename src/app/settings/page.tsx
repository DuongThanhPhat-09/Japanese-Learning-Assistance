"use client";

import Link from "next/link";
import { useRef } from "react";
import { Database, Download, FileJson, FileSpreadsheet, FileText, RotateCcw, Upload, User } from "lucide-react";
import { exportSnapshot, useAppStore, type AppData } from "@/store/useAppStore";
import { VOCAB_BY_ID } from "@/data/vocab";
import { KANJI_BY_CHAR } from "@/data/kanji";
import { GRAMMAR_BY_ID } from "@/data/grammar";
import { downloadFile, toCsv } from "@/lib/export";
import { buildDemoData } from "@/lib/demo";
import { dateKey } from "@/lib/date";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Select, Switch } from "@/components/ui/primitives";
import { regeneratePlan } from "@/hooks/useEngine";
import type { Track } from "@/types";
import { PageHeader } from "@/components/learning/common";
import { toast } from "sonner";

export default function SettingsPage() {
  const profile = useAppStore((s) => s.profile);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const importData = useAppStore((s) => s.importData);
  const resetAll = useAppStore((s) => s.resetAll);
  const file = useRef<HTMLInputElement>(null);
  const stamp = dateKey();

  const exportJson = () => downloadFile(`nihongopath-backup-${stamp}.json`, JSON.stringify(exportSnapshot(), null, 2), "application/json");

  const exportCards = () => {
    const s = useAppStore.getState();
    const rows = Object.values(s.cards).map((c) => {
      let front = c.itemId;
      let back = "";
      if (c.kind === "vocab") { const v = VOCAB_BY_ID.get(c.itemId); front = v?.kanji ?? front; back = v ? `${v.kana} — ${v.meaning}` : ""; }
      if (c.kind === "kanji") { const k = KANJI_BY_CHAR.get(c.itemId); back = k ? `${k.hanViet} — ${k.meaning}` : ""; }
      if (c.kind === "grammar") { const g = GRAMMAR_BY_ID.get(c.itemId); front = g?.pattern ?? front; back = g?.meaning ?? ""; }
      if (c.kind === "custom") { const d = s.dictionary.find((x) => x.id === c.itemId); front = d?.word ?? front; back = d?.meaning ?? ""; }
      return { kind: c.kind, front, back, state: c.state, interval_step: c.step, reps: c.reps, lapses: c.lapses, due: new Date(c.due).toISOString(), last_reviewed: c.lastReviewed ? new Date(c.lastReviewed).toISOString() : "" };
    });
    downloadFile(`srs-cards-${stamp}.csv`, toCsv(rows), "text/csv");
  };

  const exportActivity = () => {
    const rows = Object.values(useAppStore.getState().activity).sort((a, b) => a.date.localeCompare(b.date)).map((d) => ({ ...d, minutes: Math.round(d.minutes) }));
    downloadFile(`activity-${stamp}.csv`, toCsv(rows), "text/csv");
  };

  const exportExams = () => {
    const rows = useAppStore.getState().examResults.map((r) => ({
      date: new Date(r.date).toISOString(),
      level: r.level,
      score: r.score,
      passed: r.passed ? "yes" : "no",
      seconds: r.seconds,
      ...Object.fromEntries(Object.entries(r.sections).map(([k, v]) => [k, `${v.correct}/${v.total}`])),
    }));
    downloadFile(`exams-${stamp}.csv`, toCsv(rows), "text/csv");
  };

  const onImport = async (f: File) => {
    try {
      const data = JSON.parse(await f.text()) as AppData;
      if (typeof data !== "object" || !data.profile || !data.cards) throw new Error("invalid");
      if (!confirm("Nhập bản sao lưu sẽ ghi đè toàn bộ dữ liệu hiện tại. Tiếp tục?")) return;
      importData(data);
      toast.success("Đã khôi phục dữ liệu");
    } catch {
      toast.error("File không hợp lệ");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Cài đặt & Xuất dữ liệu" jp="設定" description="Mọi dữ liệu được lưu cục bộ trong trình duyệt (localStorage) — không có máy chủ, không cần mạng. Hãy sao lưu JSON định kỳ." />

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><User className="size-4" /> Hồ sơ học tập</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1"><Label>Tên hiển thị</Label><Input value={profile.name} onChange={(e) => updateProfile({ name: e.target.value })} /></div>
          <div className="flex flex-col gap-1"><Label>Mục tiêu XP mỗi ngày</Label><Input type="number" min={10} step={10} value={profile.dailyGoalXp} onChange={(e) => updateProfile({ dailyGoalXp: Math.max(10, Number(e.target.value)) })} /></div>
          <div className="flex flex-col gap-1"><Label>Mục tiêu phút mỗi tuần</Label><Input type="number" min={10} step={10} value={profile.weeklyGoalMinutes} onChange={(e) => updateProfile({ weeklyGoalMinutes: Math.max(10, Number(e.target.value)) })} /></div>
          <div className="flex flex-col gap-1"><Label>Giới hạn mục mới mỗi ngày</Label><Input type="number" min={0} max={100} value={profile.newCardsPerDay} onChange={(e) => updateProfile({ newCardsPerDay: Math.max(0, Number(e.target.value)) })} /></div>
          <div className="flex flex-col gap-1">
            <Label>Thời gian học mỗi ngày</Label>
            <Select value={String(profile.dailyMinutes)} onChange={(e) => { updateProfile({ dailyMinutes: Number(e.target.value) }); regeneratePlan(); }}>
              {[15, 20, 30, 45, 60, 90].map((m) => <option key={m} value={m}>{m} phút</option>)}
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <Label>Mục tiêu nghề nghiệp</Label>
            <Select value={profile.track} onChange={(e) => { updateProfile({ track: e.target.value as Track }); regeneratePlan(); }}>
              <option value="jlpt">Chỉ JLPT (N5 → N1)</option>
              <option value="business">JLPT + Tiếng Nhật thương mại</option>
              <option value="brse">JLPT + Business + IT + BrSE</option>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground sm:col-span-2 lg:col-span-4">
            Engine dùng thời gian học để chia khối ôn/học mới/đầu vào/đầu ra và tự giảm số mục mới khi nợ ôn tập tăng. Mục tiêu nghề nghiệp mở thêm 25% thời gian cho Business/BrSE sau khi qua N5.
          </p>
          <label className="flex items-center gap-2 text-sm sm:col-span-2"><Switch checked={profile.furiganaDefault} onCheckedChange={(v) => updateProfile({ furiganaDefault: v })} /> Bật furigana mặc định khi đọc</label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Download className="size-4" /> Xuất dữ liệu</CardTitle>
          <CardDescription>CSV mở được bằng Excel / Google Sheets (UTF-8), JSON dùng để sao lưu & khôi phục, PDF là báo cáo học tập.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <Button variant="outline" onClick={exportJson}><FileJson /> Sao lưu toàn bộ (JSON)</Button>
          <Button variant="outline" onClick={exportCards}><FileSpreadsheet /> Thẻ SRS (CSV)</Button>
          <Button variant="outline" onClick={exportActivity}><FileSpreadsheet /> Nhật ký học tập (CSV)</Button>
          <Button variant="outline" onClick={exportExams}><FileSpreadsheet /> Kết quả thi thử (CSV)</Button>
          <Button variant="outline" asChild><Link href="/vocabulary/"><FileSpreadsheet /> Từ vựng (CSV, có bộ lọc)</Link></Button>
          <Button asChild><Link href="/report/"><FileText /> Báo cáo học tập (PDF)</Link></Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Upload className="size-4" /> Khôi phục & dữ liệu mẫu</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => file.current?.click()}><Upload /> Nhập bản sao lưu JSON</Button>
          <input ref={file} type="file" accept="application/json,.json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onImport(f); e.target.value = ""; }} />
          <Button
            variant="secondary"
            onClick={() => {
              if (!confirm("Nạp dữ liệu demo (45 ngày học mẫu) sẽ ghi đè dữ liệu hiện tại. Tiếp tục?")) return;
              importData(buildDemoData());
              toast.success("Đã nạp dữ liệu demo");
            }}
          >
            <Database /> Nạp dữ liệu demo
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (!confirm("Xóa TOÀN BỘ tiến độ học tập? Không thể hoàn tác.")) return;
              resetAll();
              toast.success("Đã đặt lại dữ liệu");
            }}
          >
            <RotateCcw /> Đặt lại tất cả
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Hoạt động ngoại tuyến</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
          <p>• Toàn bộ nội dung (từ vựng, ngữ pháp, kanji, bài đọc, bài nghe, đề thi) được đóng gói sẵn trong ứng dụng.</p>
          <p>• Phát âm dùng giọng đọc tiếng Nhật có sẵn trong hệ điều hành (Windows: cài gói giọng nói Japanese trong Settings → Time & Language → Speech).</p>
          <p>• Âm thanh bài nghe: đặt file MP3 vào <code>public/audio/listening/&lt;id&gt;.mp3</code>.</p>
          <p>• Hoạt ảnh thứ tự nét: chạy <code>npm run fetch:strokes</code> một lần (khi có mạng) để tải dữ liệu KanjiVG vào <code>public/strokes</code>.</p>
        </CardContent>
      </Card>
    </div>
  );
}
