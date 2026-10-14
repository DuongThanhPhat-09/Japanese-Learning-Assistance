/**
 * Adaptive study engine.
 *
 * Decides what the learner should do today, in which order and for how long,
 * from their actual memory state — not from what they have merely "seen".
 * Pure functions only: all inputs come from the persisted store, so the
 * engine is deterministic and unit-tested.
 *
 * Principles (see docs/LEARNING_DESIGN.md):
 *  1. Due reviews first — reviewing at the moment of forgetting is the cheapest learning.
 *  2. New material is throttled by review capacity and measured retention.
 *  3. Recognition must be promoted to recall and speech (output blocks).
 *  4. Input volume grows with level (reading/listening share rises from ~5% to ~50%).
 *  5. Levels are earned through retention gates and mock exams, not XP.
 */
import type { CardKind, DailyActivity, ExamResult, ItemStat, Kana, Kanji, SrsCard, Stage, StageId, Track, Vocab } from "@/types";
import { STAGES, STAGE_BY_ID } from "@/data/stages";
import { GRAMMAR_BY_ID } from "@/data/grammar";
import { ARTICLES } from "@/data/reading";
import { LISTENING } from "@/data/listening";
import { BUSINESS_MODULE } from "@/data/modules/business";
import { IT_MODULE } from "@/data/modules/it";
import { BRSE_MODULE } from "@/data/modules/brse";
import { stageContent } from "./stats";
import { cardId, isDue } from "./srs";
import { EXAM_CONFIG } from "./exam";
import { addDays, dateKey, DAY_MS, startOfWeek } from "./date";
import { stripRuby } from "./ruby";
import { hasKanji } from "./romaji";

// ------------------------------------------------------------------ constants

/** Average seconds per SRS review (flip + grade). */
export const REVIEW_SECONDS = 8;
/** Steady-state reviews generated per new card per day (1-3-7-14-30… ladder with ~10% lapses). */
export const REVIEWS_PER_NEW_CARD = 6;
/** Minutes to teach + test one new item. */
export const MINUTES_PER_NEW_ITEM = 0.8;
/** Target recall rate. Below the floor we slow down; above the ceiling intervals are "too easy". */
export const RETENTION_FLOOR = 0.8;
export const RETENTION_CEILING = 0.93;
/** A card failed this many times is a leech and needs repair, not more repetition. */
export const LEECH_LAPSES = 4;
/** Minimum reviews in the window before retention is trusted. */
const MIN_REVIEWS_FOR_RETENTION = 30;

export type Phase = "kana" | "basic" | "intermediate" | "advanced" | "mastery";
export type BlockPhase = "review" | "learn" | "input" | "output";

/** Recommended share of daily time per activity type, by phase. */
export const RATIOS: Record<Phase, Record<BlockPhase, number>> = {
  kana: { review: 0.35, learn: 0.45, input: 0.05, output: 0.15 },
  basic: { review: 0.35, learn: 0.25, input: 0.25, output: 0.15 },
  intermediate: { review: 0.3, learn: 0.2, input: 0.35, output: 0.15 },
  advanced: { review: 0.25, learn: 0.15, input: 0.45, output: 0.15 },
  mastery: { review: 0.2, learn: 0.1, input: 0.5, output: 0.2 },
};

export const PHASE_LABEL: Record<Phase, string> = {
  kana: "Nền tảng chữ viết",
  basic: "Sơ cấp (N5–N4)",
  intermediate: "Trung cấp (N3)",
  advanced: "Cao cấp (N2–N1)",
  mastery: "Chuyên sâu",
};

/** Share of daily time given to the professional track once it is unlocked. */
export const PRO_SHARE = 0.25;

// ------------------------------------------------------------------ input

export interface EngineInput {
  cards: Record<string, SrsCard>;
  completed: Record<string, number>;
  scores: Record<string, number>;
  activity: Record<string, DailyActivity>;
  examResults: ExamResult[];
  itemStats: Record<string, ItemStat>;
  profile: { dailyMinutes: number; newCardsPerDay: number; track: Track; createdAt: number };
}

// ------------------------------------------------------------------ helpers

export const isRetained = (c?: SrsCard) => !!c && (c.state === "review" || c.state === "mastered");

export function statAccuracy(stats: Record<string, ItemStat>, prefix: string) {
  let ok = 0;
  let bad = 0;
  for (const [ref, s] of Object.entries(stats)) {
    if (ref.startsWith(prefix)) {
      ok += s.ok;
      bad += s.bad;
    }
  }
  const n = ok + bad;
  return { n, pct: n ? Math.round((ok / n) * 100) : 0 };
}

function counter(day: DailyActivity | undefined, name: string) {
  return day?.counters?.[name] ?? 0;
}

/** SRS recall rate over the last `days` days, or null when there is too little data. */
export function recentRetention(activity: Record<string, DailyActivity>, now = new Date(), days = 14): number | null {
  let pass = 0;
  let fail = 0;
  for (let i = 0; i < days; i++) {
    const d = activity[dateKey(addDays(now, -i))];
    pass += counter(d, "srsPass");
    fail += counter(d, "srsFail");
  }
  return pass + fail >= MIN_REVIEWS_FOR_RETENTION ? pass / (pass + fail) : null;
}

export function leeches(cards: Record<string, SrsCard>): SrsCard[] {
  return Object.values(cards)
    .filter((c) => c.lapses >= LEECH_LAPSES)
    .sort((a, b) => b.lapses - a.lapses);
}

/** Grammar counts as mastered when its cloze card survived a 7-day interval, or the learner answers it reliably. */
export function grammarMastered(input: EngineInput, id: string): boolean {
  if (isRetained(input.cards[cardId("grammar", id)])) return true;
  const s = input.itemStats[`grammar:${id}`];
  return !!s && s.ok + s.bad >= 3 && s.ok / (s.ok + s.bad) >= 0.75;
}

// ------------------------------------------------------------------ level-up gates

export interface Gate {
  id: string;
  label: string;
  current: number;
  target: number;
  unit: "%" | "điểm" | "chủ đề" | "bài";
  met: boolean;
  detail?: string;
  href?: string;
}

const PRO_MODULES = { business: BUSINESS_MODULE, it: IT_MODULE, brse: BRSE_MODULE } as const;

function pctGate(id: string, label: string, done: number, total: number, target: number, href?: string): Gate {
  const current = total ? Math.round((done / total) * 100) : 100;
  return { id, label, current, target, unit: "%", met: current >= target, detail: `${done}/${total}`, href };
}

function accuracyGate(id: string, label: string, stats: Record<string, ItemStat>, prefix: string, target: number, minAnswers: number, href?: string): Gate {
  const a = statAccuracy(stats, prefix);
  const current = a.n >= minAnswers ? a.pct : 0;
  return { id, label, current, target, unit: "%", met: current >= target, detail: a.n >= minAnswers ? `${a.n} lượt trả lời` : `cần thêm ${minAnswers - a.n} lượt (đang ${a.pct}%)`, href };
}

function scoredGate(id: string, label: string, keys: string[], scores: Record<string, number>, href?: string): Gate | null {
  if (!keys.length) return null;
  const passed = keys.filter((k) => (scores[k] ?? 0) >= 70).length;
  return pctGate(id, label, passed, keys.length, 100, href);
}

/**
 * Level-up requirements for a stage. Every gate measures retention or
 * performance (≥ 7-day memory, comprehension scores, mock exam), never mere exposure.
 */
export function stageGates(stage: Stage, input: EngineInput, now = new Date()): Gate[] {
  const { cards, scores, itemStats, completed } = input;
  const c = stageContent(stage);
  const retainedCount = (ids: string[]) => ids.filter((id) => isRetained(cards[id])).length;
  const gates: (Gate | null)[] = [];

  if (stage.kana) {
    const basic = c.kana.filter((k) => k.group === "basic").map((k) => cardId("kana", k.id));
    const all = c.kana.map((k) => cardId("kana", k.id));
    gates.push(pctGate("kana-basic", "Nhớ 46 chữ cơ bản qua mốc ôn 7 ngày", retainedCount(basic), basic.length, 90, `/kana/${stage.kana}/`));
    gates.push(pctGate("kana-all", "Nhớ toàn bộ bảng chữ (âm đục, âm ghép…)", retainedCount(all), all.length, 80, `/kana/${stage.kana}/`));
    gates.push(accuracyGate("kana-accuracy", "Đọc/gõ đúng ≥ 90% (tối thiểu 40 lượt)", itemStats, `kana:${stage.kana === "hiragana" ? "h" : "k"}:`, 90, 40, `/kana/${stage.kana}/?tab=typing`));
    return gates.filter((g): g is Gate => !!g);
  }

  if (stage.id === "beginner") {
    // Orientation stage: understand how Japanese works and meet survival phrases. No reading gates yet.
    const started = c.vocab.filter((v) => (cards[cardId("vocab", v.id)]?.reps ?? 0) > 0).length;
    gates.push({ id: "orientation", label: "Đọc phần nhập môn: chữ viết, phát âm, trật tự câu", current: completed["intro:orientation"] ? 1 : 0, target: 1, unit: "bài", met: !!completed["intro:orientation"], href: "/stage/beginner/" });
    gates.push({ id: "phrases", label: "Học 20 câu chào hỏi / số đếm (qua kiểm tra)", current: started, target: 20, unit: "bài", met: started >= 20, detail: `${started}/${c.vocab.length}`, href: "/today/" });
    return gates.filter((g): g is Gate => !!g);
  }

  const vocabIds = c.vocab.map((v) => cardId("vocab", v.id));
  const kanjiIds = c.kanji.map((k) => cardId("kanji", k.char));
  const grammarMasteredCount = c.grammar.filter((g) => grammarMastered(input, g.id)).length;
  const isJlpt = /^n[1-5]$/.test(stage.id);
  const isPro = stage.id === "business" || stage.id === "it" || stage.id === "brse";

  gates.push(pctGate("vocab", "Từ vựng nhớ qua mốc 7 ngày", retainedCount(vocabIds), vocabIds.length, isJlpt ? 80 : 70, `/stage/${stage.id}/`));
  if (isJlpt && kanjiIds.length) gates.push(pctGate("kanji", "Kanji nhớ qua mốc 7 ngày", retainedCount(kanjiIds), kanjiIds.length, 70, `/kanji/`));
  if (c.grammar.length) gates.push(pctGate("grammar", "Ngữ pháp vận dụng được (thẻ điền chỗ trống ≥ 7 ngày hoặc đúng ≥ 75%)", grammarMasteredCount, c.grammar.length, 80, `/grammar/`));
  gates.push(scoredGate("reading", "Bài đọc đạt ≥ 70% câu hỏi", c.articles.map((a) => `reading:${a.id}`), scores, "/reading/"));
  gates.push(scoredGate("listening", "Bài nghe đạt ≥ 70% câu hỏi", c.listening.map((l) => `listening:${l.id}`), scores, "/listening/"));

  if (isJlpt) {
    const level = stage.id.toUpperCase() as keyof typeof EXAM_CONFIG;
    const since = now.getTime() - 60 * DAY_MS;
    const best = Math.max(0, ...input.examResults.filter((r) => r.level === level && r.date >= since).map((r) => (r.passed ? r.score : Math.min(r.score, EXAM_CONFIG[level].passMark - 1))));
    gates.push({ id: "mock", label: `Đỗ thi thử ${level} trong 60 ngày gần nhất`, current: best, target: EXAM_CONFIG[level].passMark, unit: "điểm", met: best >= EXAM_CONFIG[level].passMark, href: `/exams/${stage.id}/` });
  }

  if (isPro) {
    const mod = PRO_MODULES[stage.id as keyof typeof PRO_MODULES];
    const topicKeys = mod.topics.map((t) => `module:${mod.id}:${t.id}`);
    if (mod.id === "business") topicKeys.push("module:business:keigo");
    const done = topicKeys.filter((k) => completed[k]).length;
    gates.push({ id: "topics", label: "Hoàn thành các chủ đề", current: done, target: topicKeys.length, unit: "chủ đề", met: done >= topicKeys.length, href: `/modules/${mod.id}/` });
    if (mod.id === "business") gates.push(accuracyGate("keigo", "Chuyển đổi kính ngữ đúng ≥ 80% (tối thiểu 20 lượt)", itemStats, "keigo:", 80, 20, "/modules/business/"));
    const roleplays = mod.topics.flatMap((t) => t.roleplays ?? []);
    if (roleplays.length) {
      const rp = roleplays.filter((r) => completed[`roleplay:${r.title}`]).length;
      gates.push({ id: "roleplay", label: "Thực hành nhập vai (viết/nói rồi so với mẫu)", current: rp, target: roleplays.length, unit: "bài", met: rp >= roleplays.length, href: `/modules/${mod.id}/` });
    }
  }
  return gates.filter((g): g is Gate => !!g);
}

/** 0–100 readiness for a stage: average progress towards each gate. */
export function stageReadiness(stage: Stage, input: EngineInput, now = new Date()): number {
  const gates = stageGates(stage, input, now);
  if (!gates.length) return 0;
  const sum = gates.reduce((s, g) => s + Math.min(1, g.target ? g.current / g.target : 1), 0);
  return Math.round((sum / gates.length) * 100);
}

export function stagePassed(stage: Stage, input: EngineInput, now = new Date()) {
  return stageGates(stage, input, now).every((g) => g.met);
}

const MAIN_SEQUENCE: StageId[] = ["beginner", "hiragana", "katakana", "n5", "n4", "n3", "n2", "n1", "native"];
const PRO_SEQUENCE: Record<Track, StageId[]> = { jlpt: [], business: ["business"], brse: ["business", "it", "brse"] };

/** The JLPT-line stage the learner should be working on (first one whose gates are not all met). */
export function mainFrontier(input: EngineInput, now = new Date()): Stage {
  const seq = input.profile.track === "jlpt" ? STAGES.map((s) => s.id) : MAIN_SEQUENCE;
  for (const id of seq) {
    const s = STAGE_BY_ID.get(id)!;
    if (!stagePassed(s, input, now)) return s;
  }
  return STAGE_BY_ID.get("native")!;
}

/** Professional stage studied in parallel; unlocked once N5 is passed (keigo needs basic grammar). */
export function proFrontier(input: EngineInput, now = new Date()): Stage | null {
  const seq = PRO_SEQUENCE[input.profile.track];
  if (!seq.length || mainFrontier(input, now).order < 4) return null;
  for (const id of seq) {
    const s = STAGE_BY_ID.get(id)!;
    if (!stagePassed(s, input, now)) return s;
  }
  return null;
}

export type StageStatus = "done" | "current" | "available" | "locked";

const isProStage = (id: StageId) => id === "business" || id === "it" || id === "brse";

/**
 * Roadmap state of a stage. "current" is the main frontier or the parallel
 * professional stage; anything beyond the frontier of its own line is locked.
 */
export function stageStatus(stage: Stage, input: EngineInput, now = new Date()): StageStatus {
  if (stagePassed(stage, input, now)) return "done";
  const main = mainFrontier(input, now);
  const pro = proFrontier(input, now);
  if (stage.id === main.id || stage.id === pro?.id) return "current";
  const frontier = pro && isProStage(stage.id) ? pro : main;
  return stage.order > frontier.order ? "locked" : "available";
}

/** Learners before N4 (orientation, kana, N5) get the simplified, beginner-first UI. */
export const isBeginnerStage = (stage: Stage) => stage.order < 4;

export function phaseOf(stage: Stage): Phase {
  if (stage.order <= 2) return "kana";
  if (stage.id === "n5" || stage.id === "n4") return "basic";
  if (stage.id === "n3") return "intermediate";
  if (stage.id === "n2" || stage.id === "n1") return "advanced";
  return "mastery";
}

// ------------------------------------------------------------------ item selection

export interface NewItem {
  kind: Extract<CardKind, "vocab" | "kanji" | "kana">;
  itemId: string;
}

/** Text of the next unread article/dialog of the stage — used to pre-teach its vocabulary. */
function upcomingInputText(stage: Stage, input: EngineInput): string {
  const c = stageContent(stage);
  const a = c.articles.find((x) => input.scores[`reading:${x.id}`] === undefined);
  const l = c.listening.find((x) => input.scores[`listening:${x.id}`] === undefined);
  return [a ? a.paragraphs.map(stripRuby).join("") : "", l ? l.lines.map((x) => stripRuby(x.jp)).join("") : ""].join("");
}

/**
 * Chooses the next new items, in priority order:
 *  1. items the learner queued manually (state "new") from this stage,
 *  2. words that appear in the next reading/listening (pre-teaching makes input comprehensible),
 *  3. words whose kanji are already retained (Hán Việt / kanji synergy),
 *  4. curriculum order.
 * Kanji take ~30% of slots at JLPT stages, preferring kanji found in words already being learned.
 */
export function pickNewItems(stage: Stage, input: EngineInput, n: number): NewItem[] {
  if (n <= 0) return [];
  const { cards } = input;
  const c = stageContent(stage);
  const out: NewItem[] = [];
  const taken = new Set<string>();
  const push = (item: NewItem) => {
    const id = cardId(item.kind, item.itemId);
    if (out.length < n && !taken.has(id)) {
      taken.add(id);
      out.push(item);
    }
  };

  if (stage.id === "beginner") {
    // An absolute beginner cannot read the phrases yet: hiragana first, max 3 survival phrases a day.
    const hira = stageContent(STAGE_BY_ID.get("hiragana")!).kana.filter((k) => !cards[cardId("kana", k.id)] || cards[cardId("kana", k.id)].state === "new");
    hira.slice(0, n - Math.min(3, Math.floor(n / 4))).forEach((k) => push({ kind: "kana", itemId: k.id }));
    c.vocab.filter((v) => !cards[cardId("vocab", v.id)]).forEach((v) => push({ kind: "vocab", itemId: v.id }));
    return out;
  }

  if (stage.kana) {
    const queued = c.kana.filter((k) => cards[cardId("kana", k.id)]?.state === "new");
    const fresh = c.kana.filter((k: Kana) => !cards[cardId("kana", k.id)]);
    [...queued, ...fresh].forEach((k) => push({ kind: "kana", itemId: k.id }));
    // Kana words only once most basic characters are retained.
    const basicRetained = c.kana.filter((k) => k.group === "basic" && isRetained(cards[cardId("kana", k.id)])).length;
    if (basicRetained >= 35) c.vocab.filter((v) => !cards[cardId("vocab", v.id)]).forEach((v) => push({ kind: "vocab", itemId: v.id }));
    return out;
  }

  // 1. manually queued cards of this stage
  const stageIds = new Set([...c.vocab.map((v) => cardId("vocab", v.id)), ...c.kanji.map((k) => cardId("kanji", k.char))]);
  Object.values(cards)
    .filter((card) => card.state === "new" && stageIds.has(card.id))
    .sort((a, b) => a.createdAt - b.createdAt)
    .forEach((card) => push({ kind: card.kind as "vocab" | "kanji", itemId: card.itemId }));

  const kanjiSlots = c.kanji.length ? Math.round((n - out.length) * 0.3) : 0;
  const retainedKanji = new Set(Object.values(cards).filter((x) => x.kind === "kanji" && isRetained(x)).map((x) => x.itemId));
  const upcoming = upcomingInputText(stage, input);

  const vocabScore = (v: Vocab, i: number) =>
    i - (upcoming && v.kanji.length > 1 && upcoming.includes(v.kanji) ? 10_000 : 0) - (hasKanji(v.kanji) && [...v.kanji].filter((ch) => hasKanji(ch)).every((ch) => retainedKanji.has(ch)) ? 1_000 : 0);
  const vocab = c.vocab
    .map((v, i) => ({ v, s: vocabScore(v, i) }))
    .filter(({ v }) => !cards[cardId("vocab", v.id)])
    .sort((a, b) => a.s - b.s)
    .map(({ v }) => v);

  const learningWords = Object.values(cards)
    .filter((x) => x.kind === "vocab" && x.reps > 0)
    .map((x) => x.itemId.split(":").slice(1).join(":"))
    .join("");
  const kanji = c.kanji
    .map((k: Kanji, i) => ({ k, s: i - (learningWords.includes(k.char) ? 1_000 : 0) }))
    .filter(({ k }) => !cards[cardId("kanji", k.char)])
    .sort((a, b) => a.s - b.s)
    .map(({ k }) => k);

  const vocabSlots = n - out.length - Math.min(kanjiSlots, kanji.length);
  vocab.slice(0, vocabSlots).forEach((v) => push({ kind: "vocab", itemId: v.id }));
  kanji.forEach((k) => push({ kind: "kanji", itemId: k.char }));
  vocab.forEach((v) => push({ kind: "vocab", itemId: v.id })); // fill if kanji ran out
  return out;
}

/** Next grammar point to introduce — strictly sequential, and only when the previous one has been reviewed at least once. */
export function nextGrammar(stage: Stage, input: EngineInput): string | null {
  const list = stageContent(stage).grammar;
  const idx = list.findIndex((g) => !input.completed[`grammar:${g.id}`]);
  if (idx < 0) return null;
  if (idx > 0) {
    const prev = input.cards[cardId("grammar", list[idx - 1].id)];
    if (prev && prev.reps === 0) return null; // previous point not yet practised
  }
  return list[idx].id;
}

/** Retained words to practise in the production direction (meaning → Japanese), weakest/oldest first. */
export function pickRecall(input: EngineInput, n: number, now = Date.now()): string[] {
  return Object.values(input.cards)
    .filter((c) => c.kind === "vocab" && isRetained(c))
    .map((c) => {
      const s = input.itemStats[`recall:vocab:${c.itemId}`];
      const acc = s ? s.ok / Math.max(1, s.ok + s.bad) : 0.5;
      return { id: c.itemId, score: acc * 10 + (s ? -Math.min(1, (now - s.last) / (30 * DAY_MS)) : -2) };
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, n)
    .map((x) => x.id);
}

/** Completed grammar to drill as cloze/correction, least accurate first. */
export function pickGrammarDrill(input: EngineInput, n: number): string[] {
  return Object.keys(input.completed)
    .filter((k) => k.startsWith("grammar:"))
    .map((k) => k.slice(8))
    .filter((id) => GRAMMAR_BY_ID.get(id)?.quiz)
    .map((id) => {
      const s = input.itemStats[`grammar:${id}`];
      return { id, acc: s ? s.ok / Math.max(1, s.ok + s.bad) : 0.4 };
    })
    .sort((a, b) => a.acc - b.acc)
    .slice(0, n)
    .map((x) => x.id);
}

export interface Sentence {
  jp: string;
  vi: string;
}

/** Sentences the learner can already understand: examples of completed grammar and retained words, plus pro-track phrases. */
export function pickSentences(input: EngineInput, n: number, pro: Stage | null): Sentence[] {
  const out: Sentence[] = [];
  if (pro) {
    const mod = PRO_MODULES[pro.id as keyof typeof PRO_MODULES];
    const topic = mod?.topics.find((t) => !input.completed[`module:${mod.id}:${t.id}`]) ?? mod?.topics[0];
    topic?.phrases.forEach((p) => out.push({ jp: p.jp, vi: p.vi }));
  }
  const grammarIds = Object.keys(input.completed).filter((k) => k.startsWith("grammar:")).map((k) => k.slice(8));
  // Most recently completed grammar first: consolidate what was just learned.
  grammarIds.sort((a, b) => input.completed[`grammar:${b}`] - input.completed[`grammar:${a}`]);
  for (const id of grammarIds) GRAMMAR_BY_ID.get(id)?.examples.forEach((e) => out.push(e));
  return out.slice(0, n);
}

// ------------------------------------------------------------------ daily plan

export type BlockKind =
  | "review"
  | "learn"
  | "grammar"
  | "recall"
  | "grammar-drill"
  | "shadowing"
  | "reflex"
  | "reading"
  | "listening"
  | "kana-drill"
  | "leech"
  | "weakness"
  | "checkpoint"
  | "mock-exam"
  | "pro-topic"
  | "roleplay"
  | "reflection"
  | "orientation";

export interface StudyBlock {
  id: string;
  kind: BlockKind;
  phase: BlockPhase;
  title: string;
  reason: string;
  minutes: number;
  items?: string[];
  href?: string;
  /** For quiz-type blocks: the quiz types to use. */
  quizTypes?: string[];
  levels?: string[];
}

/** Blocks the Today page runs inline as a focus session; the others open their own page (`href`). */
export const INLINE_BLOCKS: ReadonlySet<BlockKind> = new Set<BlockKind>(["review", "learn", "recall", "grammar-drill", "shadowing", "reflex", "leech", "weakness", "checkpoint", "kana-drill", "reflection", "orientation"]);

/**
 * Title shown to the learner. The review block is framed as a habit, not a
 * backlog: "Ôn 262 thẻ đến hạn" reads as debt and discourages starting.
 */
export function learnerTitle(block: Pick<StudyBlock, "kind" | "title">): string {
  if (block.kind === "review") return "Ôn lại bài đã học";
  if (block.kind === "leech") return "Củng cố những thẻ hay quên";
  return block.title;
}

export type PlanMode = "normal" | "review-debt" | "consolidation" | "checkpoint" | "immersion" | "light";

export interface DailyPlan {
  date: string;
  mode: PlanMode;
  headline: string;
  phase: Phase;
  stageId: StageId;
  proStageId?: StageId;
  minutes: number;
  due: number;
  newBudget: number;
  retention: number | null;
  blocks: StudyBlock[];
}

export const MODE_LABEL: Record<PlanMode, string> = {
  normal: "Ngày học chuẩn",
  "review-debt": "Trả nợ ôn tập",
  consolidation: "Củng cố trí nhớ",
  checkpoint: "Ngày kiểm tra giữa tuần",
  immersion: "Ngày đọc – nghe dài",
  light: "Ngày nhẹ & tổng kết tuần",
};

const r1 = (x: number) => Math.max(1, Math.round(x));

/** Builds today's study plan. `now` is injectable for tests. */
export function buildDailyPlan(input: EngineInput, now = new Date()): DailyPlan {
  const M = Math.max(10, input.profile.dailyMinutes);
  const stage = mainFrontier(input, now);
  const pro = proFrontier(input, now);
  const phase = phaseOf(stage);
  const ratio = RATIOS[phase];
  const weekday = now.getDay(); // 0 Sun … 6 Sat
  const cardList = Object.values(input.cards);
  const due = cardList.filter((c) => isDue(c, now.getTime())).length;
  const dueMinutes = (due * REVIEW_SECONDS) / 60;
  const retention = recentRetention(input.activity, now);
  const blocks: StudyBlock[] = [];

  // --- mode
  const reviewBudget = ratio.review * M;
  let mode: PlanMode = "normal";
  if (dueMinutes > reviewBudget * 1.5) mode = "review-debt";
  else if (retention !== null && retention < RETENTION_FLOOR) mode = "consolidation";
  else if (weekday === 0) mode = "light";
  else if (weekday === 3) mode = "checkpoint";
  else if (weekday === 6 && phase !== "kana") mode = "immersion";

  // --- new-item budget: limited by sustainable review load, retention and mode
  const reviewCapacityCards = (reviewBudget * 60) / REVIEW_SECONDS;
  const sustainable = Math.floor(reviewCapacityCards / REVIEWS_PER_NEW_CARD);
  let newBudget = Math.min(input.profile.newCardsPerDay, sustainable);
  if (mode === "review-debt" || mode === "light") newBudget = 0;
  else if (mode === "consolidation") newBudget = Math.ceil(newBudget * 0.4);
  else if (mode === "immersion") newBudget = Math.ceil(newBudget * 0.5);
  else if (retention !== null && retention > RETENTION_CEILING && dueMinutes < reviewBudget * 0.5) newBudget = Math.min(Math.round(newBudget * 1.3), input.profile.newCardsPerDay * 2);

  // --- time allocation
  const proMinutes = pro ? PRO_SHARE * M : 0;
  const scale = (M - proMinutes) / M;
  let reviewMin = Math.min(dueMinutes, mode === "review-debt" ? 0.7 * M : reviewBudget * 1.5);
  let learnMin = Math.min(ratio.learn * M * scale, newBudget * MINUTES_PER_NEW_ITEM + 4);
  let inputMin = ratio.input * M * scale * (mode === "immersion" ? 1.8 : 1);
  let outputMin = ratio.output * M * scale;
  // Time freed by fewer reviews / new items flows to input and output.
  const spare = M - proMinutes - reviewMin - learnMin - inputMin - outputMin;
  if (spare > 0) {
    inputMin += spare * 0.6;
    outputMin += spare * 0.4;
  } else if (spare < 0) {
    const shrink = (inputMin + outputMin + spare) / (inputMin + outputMin);
    inputMin *= Math.max(0.2, shrink);
    outputMin *= Math.max(0.2, shrink);
  }

  // No fragments: a block shorter than 3 minutes is merged into the other skill.
  if (inputMin < 3) {
    outputMin += inputMin;
    inputMin = 0;
  }
  if (outputMin < 3) {
    inputMin += outputMin;
    outputMin = 0;
  }
  if (phase === "kana") {
    // Before kana is readable, comprehension input is noise: the time goes to retrieval drills.
    outputMin += inputMin;
    inputMin = 0;
  }

  // 1. Review — always first.
  if (due > 0) {
    blocks.push({
      id: "review",
      kind: "review",
      phase: "review",
      title: `Ôn ${due} thẻ đến hạn`,
      reason:
        mode === "review-debt"
          ? "Bạn đang nợ ôn tập. Hôm nay không học thẻ mới — trả nợ trước để không quên những gì đã học."
          : "Ôn đúng lúc sắp quên là cách học rẻ nhất. Luôn ôn trước khi học mới.",
      minutes: r1(reviewMin),
    });
  }

  // 2. Leech repair.
  const leechList = leeches(input.cards);
  if (leechList.length >= 3 && (mode === "light" || mode === "consolidation" || leechList.length >= 8)) {
    blocks.push({
      id: "leech",
      kind: "leech",
      phase: "review",
      title: `Sửa ${Math.min(leechList.length, 10)} thẻ hay quên`,
      reason: `Thẻ quên ≥ ${LEECH_LAPSES} lần không cần ôn thêm mà cần cách nhớ mới: tách Hán Việt, đặt câu riêng, tạo mẹo.`,
      minutes: 5,
      items: leechList.slice(0, 10).map((c) => c.id),
    });
  }

  if (stage.id === "beginner" && !input.completed["intro:orientation"]) {
    blocks.push({
      id: "orientation",
      kind: "orientation",
      phase: "learn",
      title: "Nhập môn: tiếng Nhật hoạt động thế nào?",
      reason: "5 phút hiểu 3 bảng chữ, phát âm và trật tự câu giúp mọi bài học sau dễ hiểu hơn.",
      minutes: 5,
      href: "/stage/beginner/",
    });
  }

  // 3. Learn new items.
  const newItems = pickNewItems(stage, input, newBudget);
  if (newItems.length) {
    blocks.push({
      id: "learn",
      kind: "learn",
      phase: "learn",
      title: `Học ${newItems.length} mục mới — ${stage.title}`,
      reason: "Học theo cụm 5 mục: xem → kiểm tra ngay → mục sai được dạy lại. Ưu tiên từ xuất hiện trong bài đọc/nghe sắp tới.",
      minutes: r1(Math.min(learnMin, newItems.length * MINUTES_PER_NEW_ITEM)),
      items: newItems.map((i) => cardId(i.kind, i.itemId)),
    });
  }

  // 4. One new grammar point (never on review-debt / light days).
  if (mode !== "review-debt" && mode !== "light" && (phase !== "kana" || stage.id === "katakana")) {
    const g = nextGrammar(stage, input);
    if (g) {
      const gp = GRAMMAR_BY_ID.get(g)!;
      blocks.push({
        id: `grammar-${g}`,
        kind: "grammar",
        phase: "learn",
        title: `Ngữ pháp mới: ${gp.pattern}`,
        reason: "Mỗi ngày tối đa 1 mẫu, chỉ khi mẫu trước đã được ôn. Đọc giải thích → làm bài tập → mẫu tự vào SRS dạng điền chỗ trống.",
        minutes: 4,
        href: `/grammar/?id=${g}`,
        items: [g],
      });
    }
  }

  // 5. Output — recall, grammar drill, shadowing/reflex (or kana drill).
  if (phase === "kana" && outputMin > 0) {
    blocks.push({
      id: "kana-drill",
      kind: "kana-drill",
      phase: "output",
      title: "Gõ / viết kana từ trí nhớ",
      reason: "Nhận ra chữ chưa đủ — phải tự viết/gõ được. Kiểm tra chủ động củng cố trí nhớ mạnh hơn đọc lại.",
      // A 15-question retrieval drill; more repetition of the same few characters has diminishing returns.
      minutes: Math.min(8, r1(outputMin)),
      href: `/kana/${stage.kana ?? "hiragana"}/?tab=typing`,
      levels: ["kana"],
    });
  } else {
    let left = outputMin;
    const recall = pickRecall(input, Math.round(outputMin * 1.2), now.getTime());
    if (recall.length >= 5) {
      const m = Math.min(left * 0.4, recall.length / 3);
      blocks.push({
        id: "recall",
        kind: "recall",
        phase: "output",
        title: `Nhớ lại ${recall.length} từ: nghĩa → tiếng Nhật`,
        reason: "Thẻ SRS chỉ luyện chiều nhận diện. Muốn nói được phải luyện chiều ngược lại: nhìn nghĩa tiếng Việt, tự gõ ra tiếng Nhật.",
        minutes: r1(m),
        items: recall,
      });
      left -= m;
    }
    const drill = pickGrammarDrill(input, 8);
    if (drill.length >= 3) {
      const m = Math.min(left * 0.4, 5);
      blocks.push({
        id: "grammar-drill",
        kind: "grammar-drill",
        phase: "output",
        title: `Vận dụng ${drill.length} mẫu ngữ pháp đã học`,
        reason: "Đọc hiểu một mẫu ≠ dùng được. Điền chỗ trống và sửa câu sai buộc bạn chọn đúng mẫu trong ngữ cảnh — ưu tiên mẫu hay sai.",
        minutes: r1(m),
        items: drill,
      });
      left -= m;
    }
    const sentences = pickSentences(input, 12, pro);
    if (sentences.length >= 3 && left >= 2) {
      const reflex = weekday % 2 === 0 && sentences.length >= 6;
      blocks.push({
        id: reflex ? "reflex" : "shadowing",
        kind: reflex ? "reflex" : "shadowing",
        phase: "output",
        title: reflex ? "Nói phản xạ: Việt → Nhật" : "Shadowing: nghe và nói theo",
        reason: reflex
          ? "Nhìn câu tiếng Việt, nói to tiếng Nhật trong 3 giây rồi so đáp án. Đây là bước chuyển từ “hiểu” sang “nói được”."
          : "Nghe câu mẫu, nói đuổi theo cùng nhịp, ghi âm và so sánh. Luyện phát âm, ngữ điệu và tốc độ xử lý.",
        minutes: r1(left),
      });
    }
  }

  // 6. Input — reading / listening (re-reading allowed when everything is read).
  if (inputMin > 0) {
    const c = stageContent(stage);
    const pickInput = <T extends { id: string }>(list: T[], prefix: string) => {
      const unread = list.find((x) => input.scores[`${prefix}:${x.id}`] === undefined);
      if (unread) return { item: unread, reread: false };
      const weak = list.find((x) => (input.scores[`${prefix}:${x.id}`] ?? 0) < 70);
      if (weak) return { item: weak, reread: true };
      const oldest = [...list].sort((a, b) => (input.completed[`${prefix}:${a.id}`] ?? 0) - (input.completed[`${prefix}:${b.id}`] ?? 0))[0];
      return oldest ? { item: oldest, reread: true } : null;
    };
    const article = pickInput(c.articles.length ? c.articles : ARTICLES.filter((a) => a.level === "native"), "reading");
    const dialog = pickInput(c.listening.length ? c.listening : LISTENING.filter((l) => l.level === "native" || l.level === "N1"), "listening");
    const both = inputMin >= 12 || mode === "immersion";
    const readingFirst = weekday % 2 === 1;
    const add = (kind: "reading" | "listening", m: number) => {
      const p = kind === "reading" ? article : dialog;
      if (!p) return;
      const title = kind === "reading" ? `Đọc: ${stripRuby(ARTICLES.find((a) => a.id === p.item.id)!.title)}` : `Nghe: ${stripRuby(LISTENING.find((l) => l.id === p.item.id)!.title)}`;
      blocks.push({
        id: kind,
        kind,
        phase: "input",
        title: (p.reread ? "Đọc/nghe lại — " : "") + title,
        reason: p.reread
          ? "Đọc/nghe lại bài đã gặp giúp tăng tốc độ xử lý và tự động hóa — lần này tắt furigana/lời thoại trước."
          : kind === "reading"
            ? "Đọc lần 1 không furigana, chạm từ lạ; lần 2 bật dịch để kiểm tra; trả lời câu hỏi để tính điểm."
            : "Nghe 2 lần không xem lời thoại, trả lời câu hỏi, rồi mới mở lời thoại và shadowing đoạn khó.",
        minutes: r1(m),
        href: kind === "reading" ? `/reading/?id=${p.item.id}` : `/listening/?id=${p.item.id}`,
        items: [p.item.id],
      });
    };
    if (both) {
      add(readingFirst ? "reading" : "listening", inputMin / 2);
      add(readingFirst ? "listening" : "reading", inputMin / 2);
    } else add(readingFirst ? "reading" : "listening", inputMin);
  }

  // 7. Professional track.
  if (pro) {
    const mod = PRO_MODULES[pro.id as keyof typeof PRO_MODULES];
    const keigoFirst = mod.id === "business" && !input.completed["module:business:keigo"];
    const topic = keigoFirst ? null : mod.topics.find((t) => !input.completed[`module:${mod.id}:${t.id}`]);
    const roleplayDay = weekday === 4 || weekday === 6;
    const rp = mod.topics.flatMap((t) => (t.roleplays ?? []).map((r) => ({ t, r }))).find(({ r }) => !input.completed[`roleplay:${r.title}`]);
    if (roleplayDay && rp) {
      blocks.push({
        id: "roleplay",
        kind: "roleplay",
        phase: "output",
        title: `Nhập vai: ${rp.r.title}`,
        reason: "Viết rồi đọc to câu trả lời như đang nói với khách hàng, sau đó so với mẫu. Luyện phản xạ công việc thật.",
        minutes: r1(proMinutes),
        href: `/modules/${mod.id}/`,
      });
    } else {
      blocks.push({
        id: "pro-topic",
        kind: "pro-topic",
        phase: "output",
        title: keigoFirst ? "Kính ngữ (Keigo): bảng động từ + luyện tập" : `${pro.title}: ${topic?.title ?? "ôn chủ đề"}`,
        reason: keigoFirst
          ? "Keigo là nền của mọi giao tiếp công việc. Luyện chuyển đổi 尊敬語・謙譲語 đến khi đúng ≥ 80%."
          : "Học mẫu câu → nghe hội thoại → nói phản xạ các mẫu câu của chủ đề. Chủ đề chỉ tính là xong khi bạn đánh dấu sau khi luyện nói.",
        minutes: r1(proMinutes),
        href: `/modules/${mod.id}/`,
      });
    }
  }

  // 8. Weakness from the latest mock exam (within 21 days).
  const lastExam = input.examResults[0];
  if (lastExam && now.getTime() - lastExam.date < 21 * DAY_MS && mode !== "review-debt") {
    const weakest = (Object.entries(lastExam.sections) as [string, { correct: number; total: number }][])
      .filter(([, s]) => s.total > 0)
      .map(([k, s]) => ({ k, acc: s.correct / s.total }))
      .sort((a, b) => a.acc - b.acc)[0];
    const map: Record<string, string[]> = { vocabulary: ["multiple-choice", "matching"], kanji: ["kanji"], grammar: ["fill-blank", "correction"], listening: ["listening"] };
    if (weakest && weakest.acc < 0.6 && map[weakest.k]) {
      blocks.push({
        id: "weakness",
        kind: "weakness",
        phase: "output",
        title: `Vá điểm yếu: ${({ vocabulary: "từ vựng", kanji: "kanji", grammar: "ngữ pháp", listening: "nghe" } as Record<string, string>)[weakest.k]}`,
        reason: `Bài thi thử gần nhất phần này chỉ đạt ${Math.round(weakest.acc * 100)}%. 5 phút luyện có chủ đích mỗi ngày đến lần thi tới.`,
        minutes: 5,
        quizTypes: map[weakest.k],
        levels: [lastExam.level],
      });
    }
  }

  // 9. Weekly rhythm.
  const isJlpt = /^n[1-5]$/.test(stage.id);
  if (mode === "checkpoint") {
    blocks.push({
      id: "checkpoint",
      kind: "checkpoint",
      phase: "output",
      title: "Kiểm tra giữa tuần (15 câu trộn)",
      reason: "Kiểm tra xen kẽ nhiều dạng câu hỏi giúp phát hiện lỗ hổng sớm; câu sai tự động quay lại hàng ôn hôm nay.",
      minutes: 7,
      levels: stage.levels,
    });
  }
  if (mode === "immersion" && isJlpt) {
    const level = stage.id.toUpperCase();
    const lastMock = input.examResults.find((r) => r.level === level);
    const vocabReady = stageReadiness(stage, input, now) >= 55;
    if (vocabReady && (!lastMock || now.getTime() - lastMock.date > 13 * DAY_MS)) {
      blocks.push({
        id: "mock-exam",
        kind: "mock-exam",
        phase: "input",
        title: `Thi thử ${level} (2 tuần/lần)`,
        reason: "Thi thử định kỳ đo tiến bộ thật và tạo báo cáo điểm yếu cho 2 tuần tới. Câu sai được đưa vào hàng ôn.",
        minutes: EXAM_CONFIG[level as keyof typeof EXAM_CONFIG].minutes,
        href: `/exams/${stage.id}/`,
      });
    }
  }
  if (mode === "light") {
    blocks.push({
      id: "reflection",
      kind: "reflection",
      phase: "review",
      title: "Tổng kết tuần & đặt mục tiêu tuần sau",
      reason: "Xem tỉ lệ nhớ, nợ ôn tập và các điều kiện lên cấp còn thiếu. Ngày nhẹ giúp duy trì chuỗi mà không kiệt sức.",
      minutes: 3,
      href: "/today/?tab=week",
    });
  }

  const minutes = blocks.reduce((s, b) => s + b.minutes, 0);
  return {
    date: dateKey(now),
    mode,
    headline: headlineFor(mode, retention, due),
    phase,
    stageId: stage.id,
    proStageId: pro?.id,
    minutes,
    due,
    newBudget: newItems.length,
    retention,
    blocks,
  };
}

function headlineFor(mode: PlanMode, retention: number | null, due: number): string {
  const r = retention === null ? "" : ` Tỉ lệ nhớ 14 ngày: ${Math.round(retention * 100)}%.`;
  switch (mode) {
    case "review-debt":
      return `Có ${due} thẻ đến hạn — vượt khả năng ôn trong ngày. Hôm nay chỉ ôn, không học mới, cho đến khi nợ về mức an toàn.${r}`;
    case "consolidation":
      return `Tỉ lệ nhớ đang dưới ${RETENTION_FLOOR * 100}% — giảm thẻ mới, tăng luyện nhớ lại và đọc/nghe lại.${r}`;
    case "checkpoint":
      return `Thứ Tư: học như thường + bài kiểm tra ngắn để phát hiện lỗ hổng sớm.${r}`;
    case "immersion":
      return `Thứ Bảy: ít thẻ mới, nhiều đọc – nghe. Nếu đủ điều kiện, làm bài thi thử định kỳ.${r}`;
    case "light":
      return `Chủ nhật: ngày nhẹ — chỉ ôn, sửa thẻ khó và tổng kết tuần. Không học thẻ mới.${r}`;
    default:
      return `Ôn trước → học mới → luyện nói/nhớ lại → đọc/nghe. Làm theo thứ tự từ trên xuống.${r}`;
  }
}

/** Planned minutes per phase, for the ratio bar. */
export function planRatio(plan: DailyPlan): Record<BlockPhase, number> {
  const out: Record<BlockPhase, number> = { review: 0, learn: 0, input: 0, output: 0 };
  for (const b of plan.blocks) out[b.phase] += b.minutes;
  return out;
}

// ------------------------------------------------------------------ weekly path

export interface WeeklyTask {
  id: string;
  label: string;
  why: string;
  current: number;
  target: number;
  done: boolean;
}

export function weeklyTasks(input: EngineInput, now = new Date()): WeeklyTask[] {
  const start = startOfWeek(now);
  const days = Array.from({ length: 7 }, (_, i) => input.activity[dateKey(addDays(start, i))]);
  const sum = (name: string) => days.reduce((s, d) => s + counter(d, name), 0);
  const activeDays = days.filter((d) => d && (d.xp > 0 || d.minutes >= 5)).length;
  const stage = mainFrontier(input, now);
  const phase = phaseOf(stage);
  const pro = proFrontier(input, now);
  const t = (id: string, label: string, why: string, current: number, target: number): WeeklyTask => ({ id, label, why, current, target, done: current >= target });

  const tasks = [
    t("days", "Học ít nhất 5/7 ngày", "Học đều đặn ngắn hằng ngày hiệu quả hơn học dồn — SRS cần bạn có mặt đúng ngày.", activeDays, 5),
    t("plan", "Hoàn thành kế hoạch ngày ≥ 4 lần", "Kế hoạch đã cân bằng ôn/học/đầu vào/đầu ra cho bạn.", sum("planDone"), 4),
  ];
  if (phase === "kana") {
    tasks.push(t("learned", "Học ≥ 40 mục mới (qua kiểm tra ngay)", "Bảng chữ cần hoàn thành nhanh để chuyển sang N5.", sum("learned"), 40));
  } else {
    tasks.push(
      t("reading", "Đọc ≥ 2 bài (kể cả đọc lại) và trả lời câu hỏi", "Đầu vào hiểu được là nguồn chính của từ vựng thụ động và tốc độ đọc.", sum("reading"), 2),
      t("listening", "Nghe ≥ 2 bài và trả lời câu hỏi", "Kỹ năng nghe chỉ tăng khi nghe đủ nhiều — N3 trở lên tốc độ tăng mạnh.", sum("listening"), 2),
      t("speak", "≥ 3 phiên shadowing / nói phản xạ", "Không luyện nói thì không nói được — dù hiểu ngữ pháp.", sum("shadow"), 3),
      t("recall", "≥ 3 phiên nhớ lại (nghĩa → tiếng Nhật)", "Chuyển từ vựng nhận diện thành từ vựng chủ động.", sum("recall"), 3),
      t("checkpoint", "1 bài kiểm tra tổng hợp hoặc thi thử", "Đo lường giúp engine điều chỉnh trọng tâm tuần sau.", sum("quiz") + sum("mock"), 1),
    );
  }
  if (pro) tasks.push(t("roleplay", "1 bài nhập vai công việc", "Business/BrSE cần phản xạ trong tình huống thật, không chỉ thuộc mẫu câu.", sum("roleplay"), 1));
  return tasks;
}

/** Template shown to the learner: what each weekday is for. */
export const WEEK_TEMPLATE: { day: string; focus: string }[] = [
  { day: "Thứ 2", focus: "Ngày chuẩn: ôn → học mới → nhớ lại → đọc" },
  { day: "Thứ 3", focus: "Ngày chuẩn: ôn → học mới → shadowing → nghe" },
  { day: "Thứ 4", focus: "Kiểm tra giữa tuần (15 câu trộn) + học như thường" },
  { day: "Thứ 5", focus: "Ngày chuẩn + nhập vai công việc (nếu theo Business/BrSE)" },
  { day: "Thứ 6", focus: "Ngày chuẩn: ôn → học mới → nói phản xạ → đọc" },
  { day: "Thứ 7", focus: "Đọc – nghe dài, ít thẻ mới; thi thử mỗi 2 tuần" },
  { day: "Chủ nhật", focus: "Ngày nhẹ: chỉ ôn, sửa thẻ khó, tổng kết tuần" },
];

// ------------------------------------------------------------------ monthly milestones

export interface Milestone {
  month: number;
  label: string;
  progress: number; // 0–100
  done: boolean;
  status: "done" | "on-track" | "behind" | "upcoming";
}

interface MilestoneDef {
  month: number;
  label: string;
  tracks?: Track[];
  stage: StageId;
  half?: boolean;
}

const MILESTONES: MilestoneDef[] = [
  { month: 1, label: "Thuộc Hiragana", stage: "hiragana" },
  { month: 1, label: "Thuộc Katakana", stage: "katakana" },
  { month: 2, label: "Nửa chặng N5 (≥ 50% điều kiện)", stage: "n5", half: true },
  { month: 3, label: "Vượt cửa N5 (đỗ thi thử N5)", stage: "n5" },
  { month: 5, label: "Nửa chặng N4", stage: "n4", half: true },
  { month: 6, label: "Vượt cửa N4", stage: "n4" },
  { month: 8, label: "Keigo & giao tiếp công việc cơ bản", stage: "business", tracks: ["business", "brse"], half: true },
  { month: 8, label: "Nửa chặng N3", stage: "n3", half: true, tracks: ["jlpt"] },
  { month: 10, label: "Vượt cửa N3 — qua vùng “bình nguyên trung cấp”", stage: "n3" },
  { month: 12, label: "Sẵn sàng Business Japanese", stage: "business", tracks: ["business", "brse"] },
  { month: 13, label: "Tiếng Nhật IT", stage: "it", tracks: ["brse"] },
  { month: 15, label: "Sẵn sàng làm BrSE", stage: "brse", tracks: ["brse"] },
  { month: 15, label: "Nửa chặng N2", stage: "n2", half: true, tracks: ["jlpt", "business"] },
  { month: 18, label: "Vượt cửa N2", stage: "n2" },
  { month: 24, label: "Vượt cửa N1", stage: "n1" },
];

/**
 * Month-by-month milestones, scaled by daily study time (baseline 30 min/day).
 * Status compares elapsed months since the learner started with the expected month.
 */
export function monthlyMilestones(input: EngineInput, now = new Date()): Milestone[] {
  const factor = Math.min(2, Math.max(0.6, 30 / Math.max(10, input.profile.dailyMinutes)));
  const elapsed = (now.getTime() - input.profile.createdAt) / (30 * DAY_MS);
  return MILESTONES.filter((m) => !m.tracks || m.tracks.includes(input.profile.track)).map((m) => {
    const stage = STAGE_BY_ID.get(m.stage)!;
    const readiness = stageReadiness(stage, input, now);
    const done = m.half ? readiness >= 50 : stagePassed(stage, input, now);
    const progress = done ? 100 : Math.min(99, m.half ? readiness * 2 : readiness);
    const month = Math.max(1, Math.round(m.month * factor));
    const status: Milestone["status"] = done ? "done" : elapsed > month ? "behind" : elapsed > month - 1.5 ? "on-track" : "upcoming";
    return { month, label: m.label, progress, done, status };
  });
}
