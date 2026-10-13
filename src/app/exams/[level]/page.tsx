import type { JlptLevel } from "@/types";
import { ExamRunner } from "./ExamRunner";

export function generateStaticParams() {
  return ["n5", "n4", "n3", "n2", "n1"].map((level) => ({ level }));
}

export default async function ExamPage({ params }: { params: Promise<{ level: string }> }) {
  const { level } = await params;
  return <ExamRunner level={level.toUpperCase() as JlptLevel} />;
}
