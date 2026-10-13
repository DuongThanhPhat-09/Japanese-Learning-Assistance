"use client";

import { useEffect } from "react";
import { create } from "zustand";
import type { Achievement } from "@/data/achievements";

export type Celebration =
  | { id: string; kind: "level"; level: number }
  | { id: string; kind: "goal"; xp: number; goal: number; streak: number }
  | { id: string; kind: "streak"; streak: number }
  | { id: string; kind: "achievement"; items: Pick<Achievement, "id" | "title" | "description" | "icon" | "tier">[] };

type NewCelebration = Celebration extends infer C ? (C extends Celebration ? Omit<C, "id"> : never) : never;

interface CelebrationState {
  queue: Celebration[];
  /** Number of focus sessions (review, quiz, lesson) on screen. Celebrations wait until it is 0. */
  busy: number;
  push: (c: NewCelebration) => void;
  shift: () => void;
  enter: () => void;
  leave: () => void;
}

/** In-memory (not persisted) queue of celebration modals. */
export const useCelebrations = create<CelebrationState>()((set) => ({
  queue: [],
  busy: 0,
  push: (c) => set((s) => ({ queue: [...s.queue, { ...c, id: `${c.kind}-${Date.now()}-${s.queue.length}` } as Celebration] })),
  shift: () => set((s) => ({ queue: s.queue.slice(1) })),
  enter: () => set((s) => ({ busy: s.busy + 1 })),
  leave: () => set((s) => ({ busy: Math.max(0, s.busy - 1) })),
}));

/**
 * Marks a focus session as active so celebrations never cover a card or
 * steal its keyboard shortcuts; they play as soon as the session ends.
 */
export function useFocusSession(active = true) {
  useEffect(() => {
    if (!active) return;
    useCelebrations.getState().enter();
    return () => useCelebrations.getState().leave();
  }, [active]);
}
