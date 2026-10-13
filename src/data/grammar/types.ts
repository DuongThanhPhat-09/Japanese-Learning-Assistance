import type { Grammar } from "@/types";

/** Authoring format: id and level are assigned by the index. */
export type GrammarDef = Omit<Grammar, "id" | "level">;
