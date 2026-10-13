import { ModuleView } from "./ModuleView";

export function generateStaticParams() {
  return [{ id: "business" }, { id: "it" }, { id: "brse" }];
}

export default async function ModulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ModuleView id={id as "business" | "it" | "brse"} />;
}
