"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookOpen, ClipboardCopy, Crown, Eye, FileText, MessageCircle, Plus, Theater } from "lucide-react";
import type { ModuleTopic, ProModule, RolePlay } from "@/types";
import { BUSINESS_MODULE, KEIGO_INTRO, KEIGO_RULES, KEIGO_VERBS } from "@/data/modules/business";
import { IT_MODULE } from "@/data/modules/it";
import { BRSE_MODULE } from "@/data/modules/brse";
import { VOCABULARY } from "@/data/vocab";
import { GRAMMAR } from "@/data/grammar";
import { LISTENING } from "@/data/listening";
import { stripRuby } from "@/lib/ruby";
import { cn, sample, shuffle } from "@/lib/utils";
import { markPlanItem, useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, Switch, Tabs, TabsContent, TabsList, TabsTrigger, Textarea } from "@/components/ui/primitives";
import { PageHeader, SpeakButton } from "@/components/learning/common";
import { VocabCard } from "@/components/learning/VocabCard";
import { toast } from "sonner";

const MODULES: Record<string, ProModule> = { business: BUSINESS_MODULE, it: IT_MODULE, brse: BRSE_MODULE };
const JP: Record<string, string> = { business: "ビジネス日本語", it: "IT日本語", brse: "ブリッジSE日本語" };

export function ModuleView({ id }: { id: "business" | "it" | "brse" }) {
  const mod = MODULES[id];
  const [topicId, setTopicId] = useState<string>(id === "business" ? "keigo" : mod.topics[0].id);
  const topic = mod.topics.find((t) => t.id === topicId);
  const completed = useAppStore((s) => s.completed);
  const grammar = GRAMMAR.filter((g) => g.level === id);
  const listening = LISTENING.filter((l) => l.level === id);

  return (
    <div>
      <PageHeader title={mod.title} jp={JP[id]} description={mod.description} />
      <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
        <Card className="h-fit p-2">
          <nav className="flex gap-1 overflow-x-auto lg:flex-col">
            {id === "business" && (
              <TopicButton active={topicId === "keigo"} onClick={() => setTopicId("keigo")} done={!!completed[`module:${id}:keigo`]}>
                <Crown className="size-4 text-amber-500" /> Kính ngữ (Keigo)
              </TopicButton>
            )}
            {mod.topics.map((t) => (
              <TopicButton key={t.id} active={topicId === t.id} onClick={() => setTopicId(t.id)} done={!!completed[`module:${id}:${t.id}`]}>
                <span className="font-jp text-xs text-muted-foreground">{t.titleJp}</span> {t.title}
              </TopicButton>
            ))}
            <TopicButton active={topicId === "_extra"} onClick={() => setTopicId("_extra")}>
              <BookOpen className="size-4" /> Ngữ pháp & Bài nghe
            </TopicButton>
          </nav>
        </Card>
        <div className="min-w-0">
          {topicId === "keigo" && <KeigoSection />}
          {topic && <TopicView key={topic.id} moduleId={id} topic={topic} />}
          {topicId === "_extra" && (
            <div className="flex flex-col gap-4">
              <Card>
                <CardHeader><CardTitle>Mẫu ngữ pháp chuyên ngành</CardTitle></CardHeader>
                <CardContent className="flex flex-col gap-2">
                  {grammar.map((g) => (
                    <Link key={g.id} href={`/grammar/?id=${g.id}`} className="rounded-lg border p-3 hover:border-primary">
                      <p className="font-jp font-bold">{g.pattern}</p>
                      <p className="text-sm text-muted-foreground">{g.meaning}</p>
                    </Link>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Bài nghe</CardTitle></CardHeader>
                <CardContent className="flex flex-col gap-2">
                  {listening.map((l) => (
                    <Link key={l.id} href={`/listening/?id=${l.id}`} className="rounded-lg border p-3 hover:border-primary">
                      <p className="font-jp font-bold">{stripRuby(l.title)}</p>
                      <p className="text-sm text-muted-foreground">{l.titleVi}</p>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TopicButton({ active, done, onClick, children }: { active: boolean; done?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={cn("flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium", active ? "bg-primary/12 text-primary" : "hover:bg-muted")}>
      {children}
      {done && <span className="ml-auto text-primary">✓</span>}
    </button>
  );
}

function TopicView({ moduleId, topic }: { moduleId: string; topic: ModuleTopic }) {
  const [vi, setVi] = useState(true);
  const markComplete = useAppStore((s) => s.markComplete);
  const addCards = useAppStore((s) => s.addCards);
  const done = useAppStore((s) => !!s.completed[`module:${moduleId}:${topic.id}`]);
  const finishTopic = () => {
    markComplete(`module:${moduleId}:${topic.id}`);
    markPlanItem("pro-topic");
  };
  const vocab = useMemo(() => VOCABULARY.filter((v) => v.level === moduleId && topic.vocabTag && v.tags.includes(topic.vocabTag)), [moduleId, topic]);

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-5">
        <h2 className="text-xl font-extrabold">{topic.title} <span className="font-jp text-base text-muted-foreground">{topic.titleJp}</span></h2>
        <p className="text-sm text-muted-foreground">{topic.summary}</p>
        <label className="mt-3 flex items-center gap-2 text-sm">
          <Switch checked={vi} onCheckedChange={setVi} /> Hiện tiếng Việt
        </label>
      </Card>
      <Tabs defaultValue="phrases">
        <TabsList>
          <TabsTrigger value="phrases"><MessageCircle /> Mẫu câu</TabsTrigger>
          {topic.conversations.length > 0 && <TabsTrigger value="conv"><MessageCircle /> Hội thoại</TabsTrigger>}
          {topic.templates && <TabsTrigger value="templates"><FileText /> Mẫu văn bản</TabsTrigger>}
          {topic.roleplays && <TabsTrigger value="roleplay"><Theater /> Nhập vai</TabsTrigger>}
          {vocab.length > 0 && <TabsTrigger value="vocab"><BookOpen /> Từ vựng ({vocab.length})</TabsTrigger>}
        </TabsList>
        <TabsContent value="phrases" className="flex flex-col gap-2">
          {topic.phrases.map((p) => (
            <Card key={p.jp} className="flex items-start gap-2 p-4">
              <div className="flex-1">
                <p className="font-jp text-lg">{p.jp}</p>
                {vi && <p className="text-sm text-muted-foreground">{p.vi}</p>}
                {p.note && <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">💡 {p.note}</p>}
              </div>
              <SpeakButton text={p.jp} />
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="conv" className="flex flex-col gap-4">
          {topic.conversations.map((c) => (
            <Card key={c.title}>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>{c.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {c.lines.map((l, i) => (
                  <div key={i} className={cn("flex max-w-[90%] flex-col rounded-2xl px-4 py-2", i % 2 ? "self-end bg-primary/10" : "self-start bg-muted")}>
                    <span className="font-jp text-xs font-bold text-primary">{l.speaker}</span>
                    <span className="flex items-start gap-1">
                      <span className="font-jp">{l.jp}</span>
                      <SpeakButton text={l.jp} className="size-7" />
                    </span>
                    {vi && <span className="text-sm text-muted-foreground">{l.vi}</span>}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        {topic.templates && (
          <TabsContent value="templates" className="flex flex-col gap-4">
            {topic.templates.map((t) => (
              <Card key={t.title}>
                <CardHeader className="flex-row items-center justify-between gap-2">
                  <CardTitle>{t.title}</CardTitle>
                  <Button size="sm" variant="outline" onClick={() => { navigator.clipboard?.writeText(t.body); toast.success("Đã sao chép"); }}>
                    <ClipboardCopy /> Sao chép
                  </Button>
                </CardHeader>
                <CardContent>
                  {t.vi && <p className="mb-3 text-sm text-muted-foreground">{t.vi}</p>}
                  <pre className="font-jp overflow-x-auto whitespace-pre-wrap rounded-xl bg-muted/60 p-4 text-sm leading-relaxed">{t.body}</pre>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        )}
        {topic.roleplays && (
          <TabsContent value="roleplay" className="flex flex-col gap-4">
            {topic.roleplays.map((r) => <RolePlayCard key={r.title} r={r} />)}
          </TabsContent>
        )}
        {vocab.length > 0 && (
          <TabsContent value="vocab" className="flex flex-col gap-3">
            <Button className="self-end" onClick={() => { const n = addCards(vocab.map((v) => ({ kind: "vocab" as const, itemId: v.id }))); toast.success(`Đã thêm ${n} từ vào SRS`); }}>
              <Plus /> Thêm tất cả vào SRS
            </Button>
            <div className="grid gap-3 md:grid-cols-2">{vocab.map((v) => <VocabCard key={v.id} v={v} />)}</div>
          </TabsContent>
        )}
      </Tabs>
      <Button className="self-start" disabled={done} onClick={finishTopic}>
        {done ? "✓ Đã hoàn thành chủ đề" : "Đã luyện nói các mẫu câu — hoàn thành chủ đề (+20 XP)"}
      </Button>
    </div>
  );
}

function RolePlayCard({ r }: { r: RolePlay }) {
  const [answer, setAnswer] = useState("");
  const [show, setShow] = useState(false);
  const upsertNote = useAppStore((s) => s.upsertNote);
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Theater className="size-4" /> {r.title}</CardTitle></CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-lg bg-muted/60 p-3"><p className="text-xs font-bold uppercase text-muted-foreground">Tình huống</p><p className="font-jp">{r.situation}</p></div>
          <div className="rounded-lg bg-muted/60 p-3"><p className="text-xs font-bold uppercase text-muted-foreground">Vai của bạn</p><p>{r.yourRole}</p></div>
          <div className="rounded-lg bg-muted/60 p-3"><p className="text-xs font-bold uppercase text-muted-foreground">Mục tiêu</p><p>{r.goal}</p></div>
        </div>
        <p className="font-semibold">Gợi ý:</p>
        <ul className="list-disc pl-5">{r.hints.map((h) => <li key={h}>{h}</li>)}</ul>
        <Textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Viết (hoặc nói to rồi viết lại) câu trả lời bằng tiếng Nhật…" className="font-jp min-h-28" />
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setShow((s) => !s)}><Eye /> {show ? "Ẩn" : "Xem"} câu trả lời mẫu</Button>
          <Button
            variant="secondary"
            disabled={!answer.trim()}
            onClick={() => {
              upsertNote({ title: `Nhập vai: ${r.title}`, body: `【Bài của tôi】\n${answer}\n\n【Mẫu】\n${r.modelAnswer}`, tags: ["roleplay"] });
              const st = useAppStore.getState();
              st.markComplete(`roleplay:${r.title}`);
              st.bumpCounter("roleplay");
              markPlanItem("roleplay");
              toast.success("Đã lưu vào Ghi chú — hãy đọc to bài của bạn rồi đọc to câu mẫu");
            }}
          >
            Lưu vào ghi chú
          </Button>
        </div>
        {show && (
          <div className="animate-pop flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/5 p-4">
            <p className="font-jp flex-1 leading-relaxed">{r.modelAnswer}</p>
            <SpeakButton text={r.modelAnswer} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function KeigoSection() {
  const markComplete = useAppStore((s) => s.markComplete);
  const done = useAppStore((s) => !!s.completed["module:business:keigo"]);
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 md:grid-cols-3">
        {KEIGO_INTRO.map((k) => (
          <Card key={k.type} className="p-4">
            <p className="font-jp font-bold">{k.type}</p>
            <p className="mt-1 text-sm text-muted-foreground">{k.desc}</p>
            <p className="font-jp mt-2 rounded-lg bg-muted/60 p-2 text-sm">{k.example}</p>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle>Bảng động từ kính ngữ đặc biệt</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="font-jp w-full min-w-[640px] text-sm">
            <thead className="text-left text-muted-foreground">
              <tr><th className="py-2">Thể thường</th><th>Nghĩa</th><th>丁寧語</th><th>尊敬語 (tôn kính)</th><th>謙譲語 (khiêm nhường)</th></tr>
            </thead>
            <tbody>
              {KEIGO_VERBS.map((v) => (
                <tr key={v.plain} className="border-t">
                  <td className="py-2 font-bold">{v.plain}</td>
                  <td className="font-sans">{v.meaning}</td>
                  <td>{v.teineigo}</td>
                  <td className="text-sky-700 dark:text-sky-300">{v.sonkeigo}</td>
                  <td className="text-amber-700 dark:text-amber-300">{v.kenjougo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Quy tắc vàng khi dùng kính ngữ</CardTitle></CardHeader>
        <CardContent>
          <ul className="font-jp flex list-disc flex-col gap-2 pl-5 text-sm">{KEIGO_RULES.map((r) => <li key={r}>{r}</li>)}</ul>
        </CardContent>
      </Card>
      <KeigoDrill />
      <Button className="self-start" disabled={done} onClick={() => { markComplete("module:business:keigo"); markPlanItem("pro-topic"); }}>
        {done ? "✓ Đã hoàn thành Keigo" : "Hoàn thành chủ đề Keigo (+20 XP)"}
      </Button>
    </div>
  );
}

/** Drill: pick the correct sonkeigo/kenjougo form of a verb. */
function KeigoDrill() {
  const verbs = KEIGO_VERBS.filter((v) => v.sonkeigo !== "—" && v.kenjougo !== "—");
  const make = () => {
    const v = sample(verbs, 1)[0];
    const type = Math.random() < 0.5 ? "sonkeigo" : "kenjougo";
    const correct = v[type];
    const other = type === "sonkeigo" ? "kenjougo" : "sonkeigo";
    const pool = verbs.filter((x) => x !== v).map((x) => x[type]);
    const options = shuffle([correct, v[other], ...sample(pool, 2)]);
    return { v, type, correct, options };
  };
  const [q, setQ] = useState(make);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState({ ok: 0, n: 0 });
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Luyện tập Keigo</CardTitle>
        <span className="text-sm text-muted-foreground">{score.ok}/{score.n}</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p>
          Dạng <b className={q.type === "sonkeigo" ? "text-sky-600" : "text-amber-600"}>{q.type === "sonkeigo" ? "tôn kính ngữ (尊敬語)" : "khiêm nhường ngữ (謙譲語)"}</b> của <span className="font-jp text-lg font-bold">{q.v.plain}</span> ({q.v.meaning}) là gì?
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {q.options.map((o) => (
            <button
              key={o}
              disabled={!!picked}
              onClick={() => {
                setPicked(o);
                const ok = o === q.correct;
                setScore((s) => ({ ok: s.ok + (ok ? 1 : 0), n: s.n + 1 }));
                useAppStore.getState().logAnswer(ok);
                useAppStore.getState().recordResults([{ ref: `keigo:${q.v.plain}:${q.type}`, correct: ok }]);
                if (ok) useAppStore.getState().addXp(10);
              }}
              className={cn("font-jp rounded-xl border-2 bg-card px-3 py-2 text-left", picked && o === q.correct && "border-emerald-500 bg-emerald-500/10", picked === o && o !== q.correct && "border-rose-500 bg-rose-500/10")}
            >
              {o}
            </button>
          ))}
        </div>
        {picked && <Button className="self-start" onClick={() => { setQ(make()); setPicked(null); }}>Câu tiếp theo</Button>}
      </CardContent>
    </Card>
  );
}
