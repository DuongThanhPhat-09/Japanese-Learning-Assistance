import type { CardKind, ItemStat, SrsCard } from "@/types";
import { DAY_MS } from "./date";

/** Answers on a card, including reverse-recall drills that exercise the same vocab card. */
function answers(stats: Record<string, ItemStat>, id: string) {
  const a = stats[id];
  const r = stats[`recall:${id}`];
  return {
    ok: (a?.ok ?? 0) + (r?.ok ?? 0),
    bad: (a?.bad ?? 0) + (r?.bad ?? 0),
    last: Math.max(a?.last ?? 0, r?.last ?? 0),
  };
}

/**
 * Cards of one kind the learner struggles with: forgotten in SRS at least once,
 * or answered wrong more than 25% of the time (≥ 2 answers) in quizzes and drills.
 * Most-struggled first.
 */
export function weakCards(cards: Record<string, SrsCard>, stats: Record<string, ItemStat>, kind: CardKind): SrsCard[] {
  const score = (c: SrsCard) => {
    const a = answers(stats, c.id);
    return c.lapses * 2 + a.bad - a.ok * 0.25;
  };
  return Object.values(cards)
    .filter((c) => c.kind === kind && c.state !== "new")
    .filter((c) => {
      if (c.lapses > 0) return true;
      const a = answers(stats, c.id);
      return a.ok + a.bad >= 2 && a.bad / (a.ok + a.bad) > 0.25;
    })
    .sort((a, b) => score(b) - score(a));
}

/** Deck cards answered wrong at least once in quizzes, exams or drills practised in the last `days` days. */
export function missedCards(cards: Record<string, SrsCard>, stats: Record<string, ItemStat>, days = 14, now = Date.now()): SrsCard[] {
  const since = now - days * DAY_MS;
  return Object.values(cards)
    .map((c) => ({ c, a: answers(stats, c.id) }))
    .filter(({ c, a }) => c.state !== "new" && a.bad > 0 && a.last >= since)
    .sort((x, y) => y.a.last - x.a.last)
    .map(({ c }) => c);
}
