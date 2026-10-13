"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  CardKind,
  DailyActivity,
  DictEntry,
  ExamResult,
  Goal,
  Grade,
  ItemStat,
  Note,
  PlannerTask,
  SrsCard,
  Track,
} from "@/types";
import type { DailyPlan } from "@/lib/engine";
import { cardId, newCard, reviewCard as scheduleReview } from "@/lib/srs";
import { XP } from "@/lib/xp";
import { dateKey } from "@/lib/date";
import { emptyDay } from "@/lib/stats";
import { uid } from "@/lib/utils";

export interface Profile {
  name: string;
  dailyGoalXp: number;
  weeklyGoalMinutes: number;
  newCardsPerDay: number;
  furiganaDefault: boolean;
  /** Daily study time the plan is built for. */
  dailyMinutes: number;
  /** Professional goal studied alongside JLPT. */
  track: Track;
  createdAt: number;
}

export interface QuizRecord {
  date: number;
  mode: string;
  correct: number;
  total: number;
  xp: number;
}

export interface AppData {
  version: number;
  profile: Profile;
  xp: number;
  activity: Record<string, DailyActivity>;
  cards: Record<string, SrsCard>;
  favorites: string[];
  completed: Record<string, number>;
  examResults: ExamResult[];
  quizHistory: QuizRecord[];
  achievements: Record<string, number>;
  challengeBest: number;
  tasks: PlannerTask[];
  goals: Goal[];
  notes: Note[];
  dictionary: DictEntry[];
  /** Answer history per item (quizzes, exams, drills) — drives weakness detection and gates. */
  itemStats: Record<string, ItemStat>;
  /** Best comprehension score (0–100) per "reading:<id>" / "listening:<id>". */
  scores: Record<string, number>;
  /** Today's plan, generated once per day so it stays stable while the learner works through it. */
  plan: DailyPlan | null;
  /** Completed plan block ids per date. */
  planDone: Record<string, string[]>;
}

interface Actions {
  updateProfile: (p: Partial<Profile>) => void;
  addXp: (amount: number) => void;
  logAnswer: (correct: boolean) => void;
  bumpCounter: (name: string, n?: number) => void;
  /** Records per-item results; wrong answers on cards already in the deck make them due again now. */
  recordResults: (results: { ref?: string; correct: boolean }[]) => void;
  setScore: (key: string, pct: number) => void;
  /** Adds freshly taught items to SRS, scheduled by how the learner did on the immediate test. */
  introduceCards: (items: { kind: CardKind; itemId: string; firstTry: boolean }[]) => void;
  savePlan: (plan: DailyPlan) => void;
  /** After a new memory hook is written, a leech gets a fresh start (lapses reset to 1). */
  repairLeeches: (ids: string[]) => void;
  completeBlock: (id: string) => void;
  addMinutes: (minutes: number) => void;
  addCard: (kind: CardKind, itemId: string) => void;
  addCards: (items: { kind: CardKind; itemId: string }[]) => number;
  removeCard: (id: string) => void;
  gradeCard: (id: string, grade: Grade) => void;
  toggleFavorite: (vocabId: string) => void;
  markComplete: (key: string, xp?: number) => void;
  recordExam: (r: Omit<ExamResult, "id" | "date">) => ExamResult;
  recordQuiz: (r: Omit<QuizRecord, "date">) => void;
  unlockAchievement: (id: string) => void;
  setChallengeBest: (score: number) => void;
  upsertTask: (t: Omit<PlannerTask, "id"> & { id?: string }) => void;
  removeTask: (id: string) => void;
  upsertGoal: (g: Omit<Goal, "id" | "createdAt"> & { id?: string }) => void;
  removeGoal: (id: string) => void;
  upsertNote: (n: Partial<Note> & { title: string; body: string }) => string;
  removeNote: (id: string) => void;
  upsertDict: (e: Omit<DictEntry, "id" | "createdAt"> & { id?: string }) => void;
  importDict: (entries: Omit<DictEntry, "id" | "createdAt">[]) => number;
  removeDict: (id: string) => void;
  importData: (data: AppData) => void;
  resetAll: () => void;
}

export type AppState = AppData & Actions;

export const DATA_VERSION = 2;

export function initialData(): AppData {
  return {
    version: DATA_VERSION,
    profile: {
      name: "Học viên",
      dailyGoalXp: 100,
      weeklyGoalMinutes: 210,
      newCardsPerDay: 15,
      furiganaDefault: true,
      dailyMinutes: 30,
      track: "jlpt",
      createdAt: Date.now(),
    },
    xp: 0,
    activity: {},
    cards: {},
    favorites: [],
    completed: {},
    examResults: [],
    quizHistory: [],
    achievements: {},
    challengeBest: 0,
    tasks: [],
    goals: [],
    notes: [],
    dictionary: [],
    itemStats: {},
    scores: {},
    plan: null,
    planDone: {},
  };
}

type NumericField = Exclude<keyof DailyActivity, "date" | "counters">;

/** Apply a patch (and optional event counters) to today's activity record. */
function bumpToday(activity: Record<string, DailyActivity>, patch: Partial<Record<NumericField, number>>, counters: Record<string, number> = {}) {
  const key = dateKey();
  const day = { ...(activity[key] ?? emptyDay(key)) };
  for (const [k, v] of Object.entries(patch) as [NumericField, number][]) day[k] += v;
  if (Object.keys(counters).length) {
    const c = { ...(day.counters ?? {}) };
    for (const [k, v] of Object.entries(counters)) c[k] = (c[k] ?? 0) + v;
    day.counters = c;
  }
  return { ...activity, [key]: day };
}

/** Maps a result ref to the SRS card it exercises (recall drills exercise the vocab card). */
function refToCardId(ref: string): string {
  return ref.startsWith("recall:") ? ref.slice(7) : ref;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialData(),

      updateProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),

      addXp: (amount) => {
        if (amount <= 0) return;
        set((s) => {
          const key = dateKey();
          const before = s.activity[key]?.xp ?? 0;
          const goal = s.profile.dailyGoalXp;
          // Bonus once when crossing the daily goal.
          const bonus = before < goal && before + amount >= goal ? XP.dailyGoalBonus : 0;
          return { xp: s.xp + amount + bonus, activity: bumpToday(s.activity, { xp: amount + bonus }) };
        });
      },

      logAnswer: (correct) => set((s) => ({ activity: bumpToday(s.activity, { answered: 1, correct: correct ? 1 : 0 }) })),

      bumpCounter: (name, n = 1) => set((s) => ({ activity: bumpToday(s.activity, {}, { [name]: n }) })),

      recordResults: (results) => {
        const now = Date.now();
        set((s) => {
          const itemStats = { ...s.itemStats };
          const cards = { ...s.cards };
          for (const r of results) {
            if (!r.ref) continue;
            const prev = itemStats[r.ref] ?? { ok: 0, bad: 0, last: 0 };
            itemStats[r.ref] = { ok: prev.ok + (r.correct ? 1 : 0), bad: prev.bad + (r.correct ? 0 : 1), last: now };
            const card = cards[refToCardId(r.ref)];
            // A mistake outside SRS means the memory is weaker than its schedule assumes: review it today.
            if (!r.correct && card && card.state !== "new" && card.due > now) cards[card.id] = { ...card, due: now };
          }
          return { itemStats, cards };
        });
      },

      setScore: (key, pct) => set((s) => ({ scores: { ...s.scores, [key]: Math.max(s.scores[key] ?? 0, pct) } })),

      introduceCards: (items) => {
        const now = Date.now();
        set((s) => {
          const cards = { ...s.cards };
          for (const { kind, itemId, firstTry } of items) {
            const id = cardId(kind, itemId);
            const base = cards[id] ?? newCard(kind, itemId, now);
            // Right on the first try: see it tomorrow. Needed re-teaching: see it again later today.
            cards[id] = scheduleReview(base, firstTry ? "good" : "again", now);
          }
          return { cards, activity: bumpToday(s.activity, {}, { learned: items.length }) };
        });
        get().addXp(items.length * 5);
      },

      savePlan: (plan) => set({ plan }),

      repairLeeches: (ids) =>
        set((s) => {
          const cards = { ...s.cards };
          for (const id of ids) if (cards[id]) cards[id] = { ...cards[id], lapses: 1, due: Date.now() };
          return { cards };
        }),

      completeBlock: (id) => {
        const key = dateKey();
        const done = get().planDone[key] ?? [];
        if (done.includes(id)) return;
        const next = [...done, id];
        const plan = get().plan;
        const finishedPlan = !!plan && plan.date === key && plan.blocks.every((b) => next.includes(b.id));
        set((s) => ({
          planDone: { ...s.planDone, [key]: next },
          activity: finishedPlan ? bumpToday(s.activity, {}, { planDone: 1 }) : s.activity,
        }));
        if (finishedPlan) get().addXp(XP.dailyGoalBonus);
      },

      addMinutes: (minutes) => set((s) => ({ activity: bumpToday(s.activity, { minutes }) })),

      addCard: (kind, itemId) => {
        const id = cardId(kind, itemId);
        if (get().cards[id]) return;
        set((s) => ({ cards: { ...s.cards, [id]: newCard(kind, itemId) } }));
      },

      addCards: (items) => {
        const cards = { ...get().cards };
        let added = 0;
        for (const { kind, itemId } of items) {
          const id = cardId(kind, itemId);
          if (!cards[id]) {
            cards[id] = newCard(kind, itemId);
            added++;
          }
        }
        if (added) set({ cards });
        return added;
      },

      removeCard: (id) =>
        set((s) => {
          const cards = { ...s.cards };
          delete cards[id];
          return { cards };
        }),

      gradeCard: (id, grade) => {
        const card = get().cards[id];
        if (!card) return;
        const updated = scheduleReview(card, grade);
        // The first review of a new card is learning, not a retention measurement.
        const counters = card.reps > 0 ? { [grade === "again" ? "srsFail" : "srsPass"]: 1 } : {};
        set((s) => ({
          cards: { ...s.cards, [id]: updated },
          activity: bumpToday(s.activity, { reviews: 1, answered: 1, correct: grade === "again" ? 0 : 1 }, counters),
        }));
        get().addXp(XP.review[grade]);
      },

      toggleFavorite: (vocabId) =>
        set((s) => ({
          favorites: s.favorites.includes(vocabId) ? s.favorites.filter((f) => f !== vocabId) : [...s.favorites, vocabId],
        })),

      markComplete: (key, xp = XP.lessonComplete) => {
        const first = !get().completed[key];
        set((s) => ({
          completed: { ...s.completed, [key]: Date.now() },
          activity: first ? bumpToday(s.activity, { lessons: 1 }) : s.activity,
        }));
        if (first) get().addXp(xp);
      },

      recordExam: (r) => {
        const result: ExamResult = { ...r, id: uid("exam-"), date: Date.now() };
        set((s) => ({ examResults: [result, ...s.examResults].slice(0, 100), activity: bumpToday(s.activity, {}, { mock: 1 }) }));
        get().addXp(XP.examBase + Math.round(r.score / 2));
        return result;
      },

      recordQuiz: (r) => set((s) => ({ quizHistory: [{ ...r, date: Date.now() }, ...s.quizHistory].slice(0, 300) })),

      unlockAchievement: (id) =>
        set((s) => (s.achievements[id] ? s : { achievements: { ...s.achievements, [id]: Date.now() } })),

      setChallengeBest: (score) => set((s) => ({ challengeBest: Math.max(s.challengeBest, score) })),

      upsertTask: (t) =>
        set((s) => {
          if (t.id && s.tasks.some((x) => x.id === t.id)) return { tasks: s.tasks.map((x) => (x.id === t.id ? { ...x, ...t, id: x.id } : x)) };
          return { tasks: [...s.tasks, { ...t, id: uid("task-") }] };
        }),
      removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      upsertGoal: (g) =>
        set((s) => {
          if (g.id && s.goals.some((x) => x.id === g.id)) return { goals: s.goals.map((x) => (x.id === g.id ? { ...x, ...g, id: x.id } : x)) };
          return { goals: [...s.goals, { ...g, id: uid("goal-"), createdAt: Date.now() }] };
        }),
      removeGoal: (id) => set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

      upsertNote: (n) => {
        const now = Date.now();
        const existing = n.id ? get().notes.find((x) => x.id === n.id) : undefined;
        if (existing) {
          set((s) => ({ notes: s.notes.map((x) => (x.id === n.id ? { ...x, ...n, updatedAt: now } : x)) }));
          return existing.id;
        }
        const id = uid("note-");
        set((s) => ({ notes: [{ id, title: n.title, body: n.body, tags: n.tags ?? [], createdAt: now, updatedAt: now }, ...s.notes] }));
        return id;
      },
      removeNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

      upsertDict: (e) =>
        set((s) => {
          if (e.id && s.dictionary.some((x) => x.id === e.id)) return { dictionary: s.dictionary.map((x) => (x.id === e.id ? { ...x, ...e, id: x.id } : x)) };
          return { dictionary: [{ ...e, id: uid("dict-"), createdAt: Date.now() }, ...s.dictionary] };
        }),
      importDict: (entries) => {
        const existing = new Set(get().dictionary.map((d) => `${d.word}|${d.reading}`));
        const fresh = entries
          .filter((e) => e.word && !existing.has(`${e.word}|${e.reading}`))
          .map((e) => ({ ...e, id: uid("dict-"), createdAt: Date.now() }));
        set((s) => ({ dictionary: [...fresh, ...s.dictionary] }));
        return fresh.length;
      },
      removeDict: (id) =>
        set((s) => {
          const cards = { ...s.cards };
          delete cards[cardId("custom", id)];
          return { dictionary: s.dictionary.filter((d) => d.id !== id), cards };
        }),

      importData: (data) => {
        const base = initialData();
        set({ ...base, ...data, profile: { ...base.profile, ...data.profile }, version: DATA_VERSION });
      },
      resetAll: () => set(initialData()),
    }),
    {
      name: "nihongo-path",
      version: DATA_VERSION,
      // v1 to v2 only adds fields; merge() fills defaults, including new nested profile settings.
      migrate: (persisted) => persisted as AppState,
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<AppData>;
        return { ...current, ...p, profile: { ...current.profile, ...(p.profile ?? {}) } };
      },
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => {
        const data: Partial<AppState> = { ...s };
        for (const k of Object.keys(data) as (keyof AppState)[]) if (typeof data[k] === "function") delete data[k];
        return data as AppData;
      },
    },
  ),
);

/** Snapshot of persisted data (no actions) — used for backup/export. */
export function exportSnapshot(): AppData {
  const s = useAppStore.getState();
  const keys = Object.keys(initialData()) as (keyof AppData)[];
  return Object.fromEntries(keys.map((k) => [k, s[k]])) as unknown as AppData;
}

/** Marks matching blocks of today's plan as done (e.g. the reading block when that article is finished). */
export function markPlanItem(kind: string, itemId?: string) {
  const s = useAppStore.getState();
  const plan = s.plan;
  if (!plan || plan.date !== dateKey()) return;
  for (const b of plan.blocks) if (b.kind === kind && (!itemId || !b.items || b.items.includes(itemId))) s.completeBlock(b.id);
}

/** A reading/listening counts as done only after its questions are answered; the score feeds level-up gates. */
export function finishComprehension(kind: "reading" | "listening", id: string, pct: number) {
  const s = useAppStore.getState();
  s.setScore(`${kind}:${id}`, pct);
  s.markComplete(`${kind}:${id}`, kind === "reading" ? XP.readingComplete : XP.listeningComplete);
  s.bumpCounter(kind);
  markPlanItem(kind, id);
}
