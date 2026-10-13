"use client";

import { useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { computeStats } from "@/lib/stats";
import { levelProgress } from "@/lib/xp";

export function useStats() {
  const cards = useAppStore((s) => s.cards);
  const completed = useAppStore((s) => s.completed);
  const activity = useAppStore((s) => s.activity);
  const xp = useAppStore((s) => s.xp);
  return useMemo(() => ({ ...computeStats(cards, completed, activity), xp, ...levelProgress(xp) }), [cards, completed, activity, xp]);
}
