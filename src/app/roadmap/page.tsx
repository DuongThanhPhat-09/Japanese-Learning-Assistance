"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** The roadmap now lives in the Learn tab; keep old links working. */
export default function RoadmapRedirect() {
  const router = useRouter();
  useEffect(() => router.replace("/learn/"), [router]);
  return null;
}
