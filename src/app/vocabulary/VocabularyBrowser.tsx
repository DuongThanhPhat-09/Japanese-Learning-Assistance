"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Download, Heart, Plus, Search } from "lucide-react";
import { ALL_TAGS, POS_LABEL, VOCABULARY } from "@/data/vocab";
import { toHiragana } from "@/lib/romaji";
import { toCsv, downloadFile } from "@/lib/export";
import { cardId } from "@/lib/srs";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/primitives";
import { EmptyState, PageHeader } from "@/components/learning/common";
import { VocabCard } from "@/components/learning/VocabCard";
import { toast } from "sonner";

const LEVELS = [
  ["all", "Tất cả cấp độ"],
  ["intro", "Nhập môn"],
  ["kana", "Kana"],
  ["N5", "N5"],
  ["N4", "N4"],
  ["N3", "N3"],
  ["N2", "N2"],
  ["N1", "N1"],
  ["business", "Business"],
  ["it", "IT"],
  ["brse", "BrSE"],
  ["native", "Native"],
] as const;

const PAGE = 40;

export function VocabularyBrowser() {
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [level, setLevel] = useState(params.get("level") ?? "all");
  const [tag, setTag] = useState("all");
  const [pos, setPos] = useState("all");
  const [status, setStatus] = useState("all");
  const [favOnly, setFavOnly] = useState(false);
  const [limit, setLimit] = useState(PAGE);
  const favorites = useAppStore((s) => s.favorites);
  const cards = useAppStore((s) => s.cards);
  const addCards = useAppStore((s) => s.addCards);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const needleKana = toHiragana(needle);
    return VOCABULARY.filter((v) => {
      if (level !== "all" && v.level !== level) return false;
      if (tag !== "all" && !v.tags.includes(tag)) return false;
      if (pos !== "all" && v.pos !== pos) return false;
      if (favOnly && !favorites.includes(v.id)) return false;
      if (status !== "all") {
        const c = cards[cardId("vocab", v.id)];
        if (status === "new" && c) return false;
        if (status === "learning" && !(c && c.state !== "mastered")) return false;
        if (status === "mastered" && c?.state !== "mastered") return false;
      }
      if (!needle) return true;
      return (
        v.kanji.includes(needle) ||
        toHiragana(v.kana).includes(needleKana) ||
        v.romaji.includes(needle) ||
        v.meaning.toLowerCase().includes(needle) ||
        v.tags.some((t) => t.includes(needle))
      );
    });
  }, [q, level, tag, pos, favOnly, favorites, status, cards]);

  const tags = useMemo(() => (level === "all" ? ALL_TAGS : Array.from(new Set(VOCABULARY.filter((v) => v.level === level).flatMap((v) => v.tags))).sort()), [level]);

  const exportCsv = () => {
    const rows = filtered.map((v) => ({
      kanji: v.kanji,
      kana: v.kana,
      romaji: v.romaji,
      meaning: v.meaning,
      level: v.level,
      pos: POS_LABEL[v.pos] ?? v.pos,
      example: v.example,
      example_vi: v.exampleVi,
      tags: v.tags,
      srs_state: cards[cardId("vocab", v.id)]?.state ?? "",
      favorite: favorites.includes(v.id) ? "yes" : "",
    }));
    downloadFile(`vocabulary-${level}.csv`, toCsv(rows), "text/csv");
  };

  return (
    <div>
      <PageHeader
        title="Từ vựng"
        jp="語彙"
        description={`${VOCABULARY.length} từ có ví dụ và bản dịch tiếng Việt — tìm kiếm theo kanji, kana, romaji hoặc nghĩa.`}
        actions={
          <>
            <Button variant="outline" onClick={exportCsv}>
              <Download /> CSV
            </Button>
            <Button
              onClick={() => {
                const n = addCards(filtered.slice(0, 50).map((v) => ({ kind: "vocab" as const, itemId: v.id })));
                toast.success(n ? `Đã thêm ${n} từ vào hàng chờ — mỗi ngày engine giới thiệu một phần theo sức ôn của bạn` : "Các từ này đã có trong SRS");
              }}
            >
              <Plus /> Thêm 50 từ vào hàng chờ
            </Button>
          </>
        }
      />
      <div className="mb-4 flex flex-col gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => { setQ(e.target.value); setLimit(PAGE); }} placeholder="Tìm: 食べる, taberu, ăn…" className="pl-9" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={level} onChange={(e) => { setLevel(e.target.value); setTag("all"); setLimit(PAGE); }}>
            {LEVELS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </Select>
          <Select value={tag} onChange={(e) => { setTag(e.target.value); setLimit(PAGE); }}>
            <option value="all">Tất cả chủ đề</option>
            {tags.map((t) => <option key={t} value={t}>#{t}</option>)}
          </Select>
          <Select value={pos} onChange={(e) => { setPos(e.target.value); setLimit(PAGE); }}>
            <option value="all">Mọi từ loại</option>
            {Object.entries(POS_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </Select>
          <Select value={status} onChange={(e) => { setStatus(e.target.value); setLimit(PAGE); }}>
            <option value="all">Mọi trạng thái</option>
            <option value="new">Chưa học</option>
            <option value="learning">Đang học / ôn</option>
            <option value="mastered">Thành thạo</option>
          </Select>
          <Button variant={favOnly ? "default" : "outline"} onClick={() => setFavOnly((f) => !f)}>
            <Heart className={favOnly ? "fill-current" : ""} /> Yêu thích ({favorites.length})
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">{filtered.length} kết quả</p>
      </div>
      {filtered.length ? (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            {filtered.slice(0, limit).map((v) => <VocabCard key={v.id} v={v} />)}
          </div>
          {limit < filtered.length && (
            <div className="mt-4 flex justify-center">
              <Button variant="outline" onClick={() => setLimit((l) => l + PAGE)}>Xem thêm ({filtered.length - limit})</Button>
            </div>
          )}
        </>
      ) : (
        <EmptyState icon="🔍" title="Không tìm thấy từ nào">Thử từ khóa khác hoặc bỏ bớt bộ lọc.</EmptyState>
      )}
    </div>
  );
}
