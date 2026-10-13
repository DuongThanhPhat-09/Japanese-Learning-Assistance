import { Suspense } from "react";
import { VocabularyBrowser } from "./VocabularyBrowser";

export default function VocabularyPage() {
  return (
    <Suspense>
      <VocabularyBrowser />
    </Suspense>
  );
}
