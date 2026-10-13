import { describe, expect, it } from "vitest";
import { parseRuby, rubyToKana, stripRuby } from "@/lib/ruby";
import { csvEscape, parseCsv, toCsv } from "@/lib/export";
import { computeStreak, dateKey, lastNDays, longestStreak } from "@/lib/date";

describe("ruby markup", () => {
  const src = "{私|わたし}は{学生|がくせい}です。";
  it("parses tokens", () => {
    expect(parseRuby(src)).toEqual([
      { type: "ruby", base: "私", reading: "わたし" },
      { type: "text", text: "は" },
      { type: "ruby", base: "学生", reading: "がくせい" },
      { type: "text", text: "です。" },
    ]);
  });
  it("strips and converts", () => {
    expect(stripRuby(src)).toBe("私は学生です。");
    expect(rubyToKana(src)).toBe("わたしはがくせいです。");
  });
});

describe("CSV", () => {
  it("escapes and round-trips", () => {
    expect(csvEscape('a,"b"')).toBe('"a,""b"""');
    const csv = toCsv([{ word: "食べる", meaning: "ăn, uống", tags: ["n5", "verb"] }]);
    expect(csv).toBe('word,meaning,tags\r\n食べる,"ăn, uống",n5|verb');
    expect(parseCsv(csv)).toEqual([
      ["word", "meaning", "tags"],
      ["食べる", "ăn, uống", "n5|verb"],
    ]);
  });
  it("parses quoted newlines and BOM", () => {
    expect(parseCsv('﻿a,b\n"x\ny",z\n')).toEqual([
      ["a", "b"],
      ["x\ny", "z"],
    ]);
  });
});

describe("dates & streaks", () => {
  const today = new Date(2026, 4, 20);
  it("lists last N days", () => {
    expect(lastNDays(3, today)).toEqual(["2026-05-18", "2026-05-19", "2026-05-20"]);
  });
  it("counts the current streak, tolerating no activity yet today", () => {
    const days = new Set(["2026-05-17", "2026-05-18", "2026-05-19"]);
    expect(computeStreak(days, today)).toBe(3);
    days.add(dateKey(today));
    expect(computeStreak(days, today)).toBe(4);
    expect(computeStreak(new Set(["2026-05-10"]), today)).toBe(0);
  });
  it("finds the longest streak", () => {
    expect(longestStreak(new Set(["2026-01-01", "2026-01-02", "2026-01-05", "2026-01-06", "2026-01-07"]))).toBe(3);
  });
});
