import { Suspense } from "react";
import { KanaCourse } from "./KanaCourse";

export function generateStaticParams() {
  return [{ script: "hiragana" }, { script: "katakana" }];
}

export default async function KanaPage({ params }: { params: Promise<{ script: string }> }) {
  const { script } = await params;
  return (
    <Suspense>
      <KanaCourse script={script === "katakana" ? "katakana" : "hiragana"} />
    </Suspense>
  );
}
