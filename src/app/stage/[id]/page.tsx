import { STAGES } from "@/data/stages";
import type { StageId } from "@/types";
import { StageView } from "./StageView";

export function generateStaticParams() {
  return STAGES.map((s) => ({ id: s.id }));
}

export default async function StagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StageView id={id as StageId} />;
}
