import { Suspense } from "react";
import { ReadingBrowser } from "./ReadingBrowser";

export default function ReadingPage() {
  return (
    <Suspense>
      <ReadingBrowser />
    </Suspense>
  );
}
