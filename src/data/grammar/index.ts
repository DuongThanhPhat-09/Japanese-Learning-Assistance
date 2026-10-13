import type { Grammar, Level } from "@/types";
import type { GrammarDef } from "./types";
import { N5_GRAMMAR } from "./n5";
import { N4_GRAMMAR } from "./n4";
import { N3_GRAMMAR } from "./n3";
import { N2_GRAMMAR } from "./n2";
import { N1_GRAMMAR } from "./n1";
import { BRSE_GRAMMAR, BUSINESS_GRAMMAR, IT_GRAMMAR, NATIVE_GRAMMAR } from "./pro";

function build(level: Level, defs: GrammarDef[]): Grammar[] {
  const prefix = level.toLowerCase();
  return defs.map((d, i) => ({ ...d, id: `${prefix}-${String(i + 1).padStart(2, "0")}`, level }));
}

export const GRAMMAR: Grammar[] = [
  ...build("N5", N5_GRAMMAR),
  ...build("N4", N4_GRAMMAR),
  ...build("N3", N3_GRAMMAR),
  ...build("N2", N2_GRAMMAR),
  ...build("N1", N1_GRAMMAR),
  ...build("business", BUSINESS_GRAMMAR),
  ...build("it", IT_GRAMMAR),
  ...build("brse", BRSE_GRAMMAR),
  ...build("native", NATIVE_GRAMMAR),
];

export const GRAMMAR_BY_ID = new Map(GRAMMAR.map((g) => [g.id, g]));

export function grammarByLevel(levels: Level[]): Grammar[] {
  return GRAMMAR.filter((g) => levels.includes(g.level));
}
