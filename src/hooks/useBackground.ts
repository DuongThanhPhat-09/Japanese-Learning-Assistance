"use client";

import { useEffect, useRef } from "react";
import { useAppStore, type AppState } from "@/store/useAppStore";
import { useCelebrations } from "@/store/useCelebrations";
import { ACHIEVEMENTS } from "@/data/achievements";
import { computeStats } from "@/lib/stats";
import { levelFromXp } from "@/lib/xp";
import { dateKey } from "@/lib/date";

const TICK_MS = 30_000;
const IDLE_MS = 120_000;

/** Counts study time while the tab is visible and the learner was active in the last 2 minutes. */
export function useStudyTimer() {
  const lastActive = useRef(Date.now());
  useEffect(() => {
    const mark = () => (lastActive.current = Date.now());
    const events = ["pointerdown", "keydown", "scroll", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, mark, { passive: true }));
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible" && Date.now() - lastActive.current < IDLE_MS) {
        useAppStore.getState().addMinutes(TICK_MS / 60_000);
      }
    }, TICK_MS);
    return () => {
      events.forEach((e) => window.removeEventListener(e, mark));
      window.clearInterval(id);
    };
  }, []);
}

/** Watches progress and unlocks achievements; several unlocks at once are grouped into one celebration. */
export function useAchievementWatcher() {
  useEffect(() => {
    const check = () => {
      const s = useAppStore.getState();
      const stats = computeStats(s.cards, s.completed, s.activity);
      const ctx = {
        stats,
        xp: s.xp,
        level: levelFromXp(s.xp),
        examsPassed: s.examResults.filter((r) => r.passed).length,
        examsTaken: s.examResults.length,
        challengeBest: s.challengeBest,
        notes: s.notes.length,
        dictionary: s.dictionary.length,
      };
      const unlocked = ACHIEVEMENTS.filter((a) => !s.achievements[a.id] && a.check(ctx));
      unlocked.forEach((a) => s.unlockAchievement(a.id));
      if (unlocked.length) {
        useCelebrations.getState().push({
          kind: "achievement",
          items: unlocked.map(({ id, title, description, icon, tier }) => ({ id, title, description, icon, tier })),
        });
      }
    };
    let timer: number | undefined;
    const unsub = useAppStore.subscribe(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(check, 800);
    });
    check();
    return () => {
      unsub();
      window.clearTimeout(timer);
    };
  }, []);
}

/**
 * Celebrates earned progress: a level-up, the first XP of the day once the
 * streak is at least 2 days, and crossing the daily XP goal.
 * Earned XP always moves the total and today's XP together (`addXp`), which
 * tells it apart from bulk changes such as importing a backup or demo data.
 */
export function useProgressCelebrations() {
  useEffect(() => {
    const snapshot = (s: AppState) => {
      const day = dateKey();
      return { day, total: s.xp, today: s.activity[day]?.xp ?? 0 };
    };
    let prev = snapshot(useAppStore.getState());
    return useAppStore.subscribe((s) => {
      const now = snapshot(s);
      const todayBefore = now.day === prev.day ? prev.today : 0;
      const gained = now.total - prev.total;
      const levelBefore = levelFromXp(prev.total);
      prev = now;
      if (gained <= 0 || gained !== now.today - todayBefore) return;

      const push = useCelebrations.getState().push;
      const goal = s.profile.dailyGoalXp;
      const crossedGoal = todayBefore < goal && now.today >= goal;
      const level = levelFromXp(now.total);
      if (level > levelBefore) push({ kind: "level", level });
      if (todayBefore > 0 && !crossedGoal) return;
      const streak = computeStats(s.cards, s.completed, s.activity).streak;
      if (todayBefore === 0 && streak >= 2) push({ kind: "streak", streak });
      if (crossedGoal) push({ kind: "goal", xp: now.today, goal, streak });
    });
  }, []);
}
