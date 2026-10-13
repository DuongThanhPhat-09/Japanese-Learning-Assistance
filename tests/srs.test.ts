import { describe, expect, it } from "vitest";
import { buildSession, countByState, forecast, newCard, previewInterval, REVIEW_INTERVALS, reviewCard } from "@/lib/srs";
import { DAY_MS } from "@/lib/date";

const NOW = new Date(2026, 0, 10, 12).getTime();

describe("SRS scheduler", () => {
  it("starts new cards in the new state", () => {
    const c = newCard("vocab", "N5:食べる", NOW);
    expect(c.state).toBe("new");
    expect(c.step).toBe(-1);
    expect(c.id).toBe("vocab:N5:食べる");
  });

  it("follows the 1-3-7-14-30-60-120 day ladder on 'good'", () => {
    let c = newCard("kanji", "日", NOW);
    const seen: number[] = [];
    let t = NOW;
    for (let i = 0; i < REVIEW_INTERVALS.length; i++) {
      c = reviewCard(c, "good", t);
      seen.push(Math.round((c.due - t) / DAY_MS));
      t = c.due;
    }
    expect(seen).toEqual([1, 3, 7, 14, 30, 60, 120]);
    expect(c.state).toBe("mastered");
  });

  it("maps steps to learning → review → mastered", () => {
    let c = newCard("vocab", "x", NOW);
    c = reviewCard(c, "good", NOW); // 1d
    expect(c.state).toBe("learning");
    c = reviewCard(c, "good", NOW); // 3d
    expect(c.state).toBe("learning");
    c = reviewCard(c, "good", NOW); // 7d
    expect(c.state).toBe("review");
    c = reviewCard(c, "easy", NOW); // 30d
    expect(c.state).toBe("review");
    c = reviewCard(c, "easy", NOW); // 120d
    expect(c.state).toBe("mastered");
  });

  it("'again' resets to relearning in 10 minutes and counts a lapse", () => {
    let c = newCard("vocab", "x", NOW);
    c = reviewCard(c, "good", NOW);
    c = reviewCard(c, "good", NOW);
    c = reviewCard(c, "again", NOW);
    expect(c.step).toBe(-1);
    expect(c.state).toBe("learning");
    expect(c.lapses).toBe(1);
    expect(c.due - NOW).toBe(10 * 60 * 1000);
    c = reviewCard(c, "good", NOW);
    expect(Math.round((c.due - NOW) / DAY_MS)).toBe(1);
  });

  it("'hard' repeats the current interval", () => {
    let c = newCard("vocab", "x", NOW);
    c = reviewCard(c, "good", NOW);
    c = reviewCard(c, "good", NOW); // step 1 (3d)
    c = reviewCard(c, "hard", NOW);
    expect(c.step).toBe(1);
    expect(previewInterval(c, "good")).toBe("7 ngày");
  });

  it("builds due / weak sessions and counts states", () => {
    const a = reviewCard(newCard("vocab", "a", NOW - 3 * DAY_MS), "good", NOW - 3 * DAY_MS); // due 2 days ago
    const b = reviewCard(newCard("vocab", "b", NOW), "good", NOW); // due tomorrow
    const c = { ...reviewCard(newCard("kanji", "c", NOW), "again", NOW), due: NOW - 1 };
    const d = newCard("vocab", "d", NOW);
    const cards = [a, b, c, d];
    expect(buildSession(cards, { mode: "due" }, NOW).map((x) => x.itemId)).toEqual(["a", "c"]);
    expect(buildSession(cards, { mode: "due", kinds: ["vocab"] }, NOW).map((x) => x.itemId)).toEqual(["a"]);
    expect(buildSession(cards, { mode: "new" }, NOW).map((x) => x.itemId)).toEqual(["d"]);
    expect(countByState(cards)).toEqual({ new: 1, learning: 3, review: 0, mastered: 0 });
    const f = forecast(cards, 3, NOW);
    expect(f[0]).toBe(2);
    expect(f[1]).toBe(1);
  });
});
