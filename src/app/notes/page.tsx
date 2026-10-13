"use client";

import { useMemo, useRef, useState } from "react";
import { BookMarked, Download, NotebookPen, Plus, Search, Trash2, Upload } from "lucide-react";
import type { Note } from "@/types";
import { cardId } from "@/lib/srs";
import { downloadFile, parseCsv, toCsv } from "@/lib/export";
import { toHiragana } from "@/lib/romaji";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, Input, Label, Tabs, TabsContent, TabsList, TabsTrigger, Textarea } from "@/components/ui/primitives";
import { EmptyState, PageHeader, SpeakButton } from "@/components/learning/common";
import { toast } from "sonner";

export default function NotesPage() {
  return (
    <div>
      <PageHeader title="Ghi chú & Từ điển cá nhân" jp="ノート・単語帳" description="Ghi chú học tập có thẻ (tag) và tìm kiếm; từ điển cá nhân có thể nhập/xuất CSV và đưa vào SRS." />
      <Tabs defaultValue="notes">
        <TabsList>
          <TabsTrigger value="notes"><NotebookPen /> Ghi chú</TabsTrigger>
          <TabsTrigger value="dict"><BookMarked /> Từ điển cá nhân</TabsTrigger>
        </TabsList>
        <TabsContent value="notes"><Notes /></TabsContent>
        <TabsContent value="dict"><PersonalDictionary /></TabsContent>
      </Tabs>
    </div>
  );
}

function Notes() {
  const notes = useAppStore((s) => s.notes);
  const upsertNote = useAppStore((s) => s.upsertNote);
  const removeNote = useAppStore((s) => s.removeNote);
  const [activeId, setActiveId] = useState<string | null>(notes[0]?.id ?? null);
  const [q, setQ] = useState("");
  const active = notes.find((n) => n.id === activeId);
  const filtered = notes.filter((n) => {
    const s = q.toLowerCase();
    return !s || n.title.toLowerCase().includes(s) || n.body.toLowerCase().includes(s) || n.tags.some((t) => t.includes(s));
  });

  const create = () => setActiveId(upsertNote({ title: "Ghi chú mới", body: "", tags: [] }));

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
      <Card className="flex h-fit flex-col gap-2 p-3">
        <Button onClick={create}><Plus /> Ghi chú mới</Button>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm ghi chú…" className="pl-9" />
        </div>
        <div className="flex max-h-[60vh] flex-col gap-1 overflow-y-auto">
          {filtered.map((n) => (
            <button key={n.id} onClick={() => setActiveId(n.id)} className={cn("rounded-lg px-3 py-2 text-left", n.id === activeId ? "bg-primary/10" : "hover:bg-muted")}>
              <p className="truncate text-sm font-semibold">{n.title || "(không tiêu đề)"}</p>
              <p className="truncate text-xs text-muted-foreground">{new Date(n.updatedAt).toLocaleString("vi-VN")} {n.tags.map((t) => `#${t}`).join(" ")}</p>
            </button>
          ))}
          {!filtered.length && <p className="p-3 text-sm text-muted-foreground">Không có ghi chú.</p>}
        </div>
      </Card>
      {active ? <NoteEditor key={active.id} note={active} onDelete={() => { removeNote(active.id); setActiveId(null); }} /> : <EmptyState icon="📝" title="Chọn hoặc tạo một ghi chú" />}
    </div>
  );
}

function NoteEditor({ note, onDelete }: { note: Note; onDelete: () => void }) {
  const upsertNote = useAppStore((s) => s.upsertNote);
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const [tags, setTags] = useState(note.tags.join(", "));
  const timer = useRef<number | undefined>(undefined);
  const save = (patch: Partial<Note>) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => upsertNote({ id: note.id, title, body, tags: tags.split(",").map((t) => t.trim()).filter(Boolean), ...patch }), 400);
  };
  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex gap-2">
        <Input value={title} onChange={(e) => { setTitle(e.target.value); save({ title: e.target.value }); }} className="text-lg font-bold" />
        <Button variant="ghost" size="icon" onClick={onDelete} aria-label="Xóa ghi chú"><Trash2 /></Button>
      </div>
      <Input value={tags} onChange={(e) => { setTags(e.target.value); save({ tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) }); }} placeholder="Thẻ, cách nhau bởi dấu phẩy: n3, ngữ pháp" />
      <Textarea value={body} onChange={(e) => { setBody(e.target.value); save({ body: e.target.value }); }} className="font-jp min-h-[50vh] leading-relaxed" placeholder="Ghi chú… (tự động lưu)" />
      <p className="text-xs text-muted-foreground">Tự động lưu cục bộ · {body.length} ký tự</p>
    </Card>
  );
}

function PersonalDictionary() {
  const dict = useAppStore((s) => s.dictionary);
  const cards = useAppStore((s) => s.cards);
  const upsertDict = useAppStore((s) => s.upsertDict);
  const importDict = useAppStore((s) => s.importDict);
  const removeDict = useAppStore((s) => s.removeDict);
  const addCards = useAppStore((s) => s.addCards);
  const [form, setForm] = useState({ word: "", reading: "", meaning: "", example: "", tags: "" });
  const [q, setQ] = useState("");
  const file = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return dict.filter((d) => !s || d.word.includes(q) || toHiragana(d.reading).includes(toHiragana(s)) || d.meaning.toLowerCase().includes(s) || d.tags.some((t) => t.includes(s)));
  }, [dict, q]);

  const add = () => {
    if (!form.word.trim() || !form.meaning.trim()) return toast.error("Cần nhập từ và nghĩa");
    upsertDict({ word: form.word.trim(), reading: form.reading.trim(), meaning: form.meaning.trim(), example: form.example.trim() || undefined, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean) });
    setForm({ word: "", reading: "", meaning: "", example: "", tags: "" });
  };

  const onImport = async (f: File) => {
    const rows = parseCsv(await f.text());
    if (!rows.length) return;
    const header = rows[0].map((h) => h.trim().toLowerCase());
    const hasHeader = header.includes("word") || header.includes("meaning");
    const col = (name: string, fallback: number) => (hasHeader ? header.indexOf(name) : fallback);
    const [w, r, m, e, t] = [col("word", 0), col("reading", 1), col("meaning", 2), col("example", 3), col("tags", 4)];
    const entries = (hasHeader ? rows.slice(1) : rows).map((row) => ({
      word: row[w]?.trim() ?? "",
      reading: r >= 0 ? row[r]?.trim() ?? "" : "",
      meaning: m >= 0 ? row[m]?.trim() ?? "" : "",
      example: e >= 0 ? row[e]?.trim() || undefined : undefined,
      tags: t >= 0 && row[t] ? row[t].split("|").map((x) => x.trim()).filter(Boolean) : [],
    }));
    const n = importDict(entries.filter((x) => x.word && x.meaning));
    toast.success(`Đã nhập ${n} từ mới`);
  };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader><CardTitle>Thêm từ</CardTitle></CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <div className="flex flex-col gap-1"><Label>Từ *</Label><Input value={form.word} onChange={(e) => setForm({ ...form, word: e.target.value })} placeholder="勉強" className="font-jp" /></div>
          <div className="flex flex-col gap-1"><Label>Cách đọc</Label><Input value={form.reading} onChange={(e) => setForm({ ...form, reading: e.target.value })} placeholder="べんきょう" className="font-jp" /></div>
          <div className="flex flex-col gap-1"><Label>Nghĩa *</Label><Input value={form.meaning} onChange={(e) => setForm({ ...form, meaning: e.target.value })} placeholder="học tập" /></div>
          <div className="flex flex-col gap-1"><Label>Ví dụ</Label><Input value={form.example} onChange={(e) => setForm({ ...form, example: e.target.value })} className="font-jp" /></div>
          <div className="flex flex-col gap-1"><Label>Thẻ</Label><Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="công việc, IT" /></div>
          <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-5">
            <Button onClick={add}><Plus /> Thêm</Button>
            <Button variant="outline" onClick={() => file.current?.click()}><Upload /> Nhập CSV</Button>
            <Button variant="outline" disabled={!dict.length} onClick={() => downloadFile("personal-dictionary.csv", toCsv(dict.map((d) => ({ word: d.word, reading: d.reading, meaning: d.meaning, example: d.example ?? "", tags: d.tags }))), "text/csv")}>
              <Download /> Xuất CSV
            </Button>
            <Button variant="secondary" disabled={!dict.length} onClick={() => { const n = addCards(dict.map((d) => ({ kind: "custom" as const, itemId: d.id }))); toast.success(`Đã thêm ${n} thẻ vào SRS`); }}>
              Đưa tất cả vào SRS
            </Button>
            <input ref={file} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onImport(f); e.target.value = ""; }} />
          </div>
          <p className="text-xs text-muted-foreground sm:col-span-2 lg:col-span-5">Định dạng CSV: <code>word,reading,meaning,example,tags</code> (tags phân tách bằng “|”). Có thể nhập hàng nghìn từ cùng lúc.</p>
        </CardContent>
      </Card>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Tìm trong ${dict.length} từ…`} className="pl-9" />
      </div>
      {filtered.length ? (
        <div className="grid gap-2 md:grid-cols-2">
          {filtered.slice(0, 200).map((d) => (
            <Card key={d.id} className="flex items-start gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p><span className="font-jp text-xl font-bold">{d.word}</span> <span className="font-jp text-sm text-muted-foreground">{d.reading}</span></p>
                <p className="font-medium">{d.meaning}</p>
                {d.example && <p className="font-jp text-sm text-muted-foreground">{d.example}</p>}
                <div className="mt-1 flex flex-wrap gap-1">{d.tags.map((t) => <span key={t} className="rounded-full border px-2 text-[11px] text-muted-foreground">#{t}</span>)}</div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <SpeakButton text={d.reading || d.word} />
                {cards[cardId("custom", d.id)] ? <span className="text-xs text-primary">SRS ✓</span> : (
                  <button className="text-xs font-semibold text-primary" onClick={() => addCards([{ kind: "custom", itemId: d.id }])}>+ SRS</button>
                )}
                <button onClick={() => removeDict(d.id)} className="text-muted-foreground hover:text-destructive" aria-label="Xóa"><Trash2 className="size-4" /></button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon="📖" title="Từ điển cá nhân trống">Thêm từ bạn gặp khi đọc, nghe hoặc trong công việc.</EmptyState>
      )}
    </div>
  );
}
