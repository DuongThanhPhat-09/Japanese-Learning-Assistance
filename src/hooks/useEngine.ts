"use client";

import { useEffect, useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { buildDailyPlan, isBeginnerStage, mainFrontier, proFrontier, type EngineInput } from "@/lib/engine";
import { dateKey } from "@/lib/date";

const NO_BLOCKS: string[] = [];

/** Memoised engine input assembled from the store. */
export function useEngineInput(): EngineInput {
  const cards = useAppStore((s) => s.cards);
  const completed = useAppStore((s) => s.completed);
  const scores = useAppStore((s) => s.scores);
  const activity = useAppStore((s) => s.activity);
  const examResults = useAppStore((s) => s.examResults);
  const itemStats = useAppStore((s) => s.itemStats);
  const dailyMinutes = useAppStore((s) => s.profile.dailyMinutes);
  const newCardsPerDay = useAppStore((s) => s.profile.newCardsPerDay);
  const track = useAppStore((s) => s.profile.track);
  const createdAt = useAppStore((s) => s.profile.createdAt);
  return useMemo(
    () => ({ cards, completed, scores, activity, examResults, itemStats, profile: { dailyMinutes, newCardsPerDay, track, createdAt } }),
    [cards, completed, scores, activity, examResults, itemStats, dailyMinutes, newCardsPerDay, track, createdAt],
  );
}

/** Where the learner is: main stage, parallel professional stage, and whether to show the beginner-first UI. */
export function useLearner() {
  const input = useEngineInput();
  return useMemo(() => {
    const stage = mainFrontier(input);
    return { input, stage, pro: proFrontier(input), beginner: isBeginnerStage(stage) };
  }, [input]);
}

/**
 * Today's plan. Generated once per day and cached in the store so it stays
 * stable while the learner works through it (learning new cards would
 * otherwise reshuffle the plan mid-session).
 */
export function useDailyPlan() {
  const plan = useAppStore((s) => s.plan);
  // Stable fallback: a fresh [] per call would look like a state change and loop forever.
  const done = useAppStore((s) => s.planDone[dateKey()] ?? NO_BLOCKS);
  const today = dateKey();

  useEffect(() => {
    if (!plan || plan.date !== today) regeneratePlan();
  }, [plan, today]);

  return { plan: plan && plan.date === today ? plan : null, done };
}

export function regeneratePlan() {
  const s = useAppStore.getState();
  const input: EngineInput = {
    cards: s.cards,
    completed: s.completed,
    scores: s.scores,
    activity: s.activity,
    examResults: s.examResults,
    itemStats: s.itemStats,
    profile: { dailyMinutes: s.profile.dailyMinutes, newCardsPerDay: s.profile.newCardsPerDay, track: s.profile.track, createdAt: s.profile.createdAt },
  };
  s.savePlan(buildDailyPlan(input));
}
