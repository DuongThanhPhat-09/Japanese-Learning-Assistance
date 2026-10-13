"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";

/** True once the persisted store has been rehydrated from localStorage on the client. */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const p = useAppStore.persist;
    if (p.hasHydrated()) setHydrated(true);
    const unsub = p.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);
  return hydrated;
}
