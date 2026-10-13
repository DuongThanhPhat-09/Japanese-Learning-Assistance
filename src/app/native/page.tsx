"use client";

import Link from "next/link";
import { BookOpen, FileText, Headphones, MessageSquare, Sparkles } from "lucide-react";
import { ARTICLES, CATEGORY_LABEL } from "@/data/reading";
import { LISTENING } from "@/data/listening";
import { GRAMMAR } from "@/data/grammar";
import { VOCABULARY } from "@/data/vocab";
import { Card, CardContent, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/primitives";
import { PageHeader } from "@/components/learning/common";
import { VocabCard } from "@/components/learning/VocabCard";
import { ArticleList } from "../reading/ReadingBrowser";
import { ListeningList } from "../listening/ListeningBrowser";

const CATEGORIES = ["news", "technical", "novel", "business-report", "debate", "academic"] as const;

export default function NativePage() {
  const native = ARTICLES.filter((a) => a.level === "native" || (a.level === "N1" && a.category === "academic"));
  return (
    <div>
      <PageHeader
        title="Trình độ bản xứ"
        jp="ネイティブレベル"
        description="Luyện đọc – nghe – viết – tranh biện với tài liệu tốc độ thật: phân tích tin tức, bài kỹ thuật, văn học, báo cáo kinh doanh, chủ đề tranh biện và văn bản học thuật."
      />
      <Tabs defaultValue="news">
        <TabsList>
          {CATEGORIES.map((c) => (
            <TabsTrigger key={c} value={c}>{c === "debate" ? <MessageSquare /> : <FileText />} {CATEGORY_LABEL[c]}</TabsTrigger>
          ))}
          <TabsTrigger value="listening"><Headphones /> Nghe</TabsTrigger>
          <TabsTrigger value="expressions"><Sparkles /> Thành ngữ & văn phong</TabsTrigger>
        </TabsList>
        {CATEGORIES.map((c) => (
          <TabsContent key={c} value={c} className="flex flex-col gap-4">
            <CategoryGuide category={c} />
            <ArticleList articles={native.filter((a) => a.category === c)} />
          </TabsContent>
        ))}
        <TabsContent value="listening">
          <ListeningList items={LISTENING.filter((l) => l.level === "native" || l.level === "N1")} />
        </TabsContent>
        <TabsContent value="expressions" className="flex flex-col gap-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="size-4" /> Mẫu văn viết cao cấp</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-2">
              {GRAMMAR.filter((g) => g.level === "native").map((g) => (
                <Link key={g.id} href={`/grammar/?id=${g.id}`} className="rounded-lg border p-3 hover:border-primary">
                  <p className="font-jp font-bold">{g.pattern}</p>
                  <p className="text-sm text-muted-foreground">{g.meaning}</p>
                </Link>
              ))}
            </CardContent>
          </Card>
          <div className="grid gap-3 md:grid-cols-2">
            {VOCABULARY.filter((v) => v.level === "native").map((v) => <VocabCard key={v.id} v={v} />)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const GUIDES: Record<string, string> = {
  news: "Phân tích tin tức: xác định 5W1H, tìm câu chủ đề của mỗi đoạn, chú ý các cụm như 「〜とみられる」「〜とされる」(nguồn tin gián tiếp).",
  technical: "Bài kỹ thuật: đọc tiêu đề → kết luận → lập luận. Ghi lại thuật ngữ vào Từ điển cá nhân và đối chiếu với tiếng Anh.",
  novel: "Văn học: chú ý từ tượng thanh/tượng hình, chủ ngữ bị lược bỏ và cảm xúc ẩn sau hành động nhân vật.",
  "business-report": "Báo cáo kinh doanh: nắm các cụm 前年同期比, 牽引, 下回る/上回る và cấu trúc Kết quả → Nguyên nhân → Phương châm.",
  debate: "Tranh biện: dùng 「確かに〜が、〜」 để nhượng bộ, 「その根拠は〜」 để đưa căn cứ, 「以上の理由から〜」 để kết luận.",
  academic: "Học thuật: tìm luận điểm chính (主張), căn cứ (根拠) và phản luận; chú ý các mẫu 〜にほかならない, 〜と言えよう.",
};

function CategoryGuide({ category }: { category: string }) {
  return <p className="font-jp rounded-xl bg-fuchsia-500/8 p-4 text-sm">🎯 {GUIDES[category]}</p>;
}
