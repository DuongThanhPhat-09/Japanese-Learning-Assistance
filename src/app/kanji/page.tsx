import { Suspense } from "react";
import { KanjiBrowser } from "./KanjiBrowser";

export default function KanjiPage() {
  return (
    <Suspense>
      <KanjiBrowser />
    </Suspense>
  );
}
