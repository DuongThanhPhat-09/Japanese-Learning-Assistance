import { Suspense } from "react";
import { GrammarBrowser } from "./GrammarBrowser";

export default function GrammarPage() {
  return (
    <Suspense>
      <GrammarBrowser />
    </Suspense>
  );
}
