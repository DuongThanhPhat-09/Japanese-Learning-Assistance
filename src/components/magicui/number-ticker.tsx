"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

/** Magic UI-style number ticker: springs from 0 to `value` when it scrolls into view. */
export function NumberTicker({ value, className, locale = "vi-VN" }: { value: number; className?: string; locale?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { damping: 40, stiffness: 140 });
  const inView = useInView(ref, { once: true, margin: "0px" });

  useEffect(() => {
    if (inView) motionValue.set(value);
  }, [inView, value, motionValue]);

  useEffect(
    () =>
      spring.on("change", (v) => {
        if (ref.current) ref.current.textContent = Math.round(v).toLocaleString(locale);
      }),
    [spring, locale],
  );

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {(0).toLocaleString(locale)}
    </span>
  );
}
