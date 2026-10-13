import { Suspense } from "react";
import { ListeningBrowser } from "./ListeningBrowser";

export default function ListeningPage() {
  return (
    <Suspense>
      <ListeningBrowser />
    </Suspense>
  );
}
