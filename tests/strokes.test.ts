import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { checkStroke, parseKanjiVG, pathLength, resample, type Point } from "@/lib/strokes";

const line = (x1: number, y1: number, x2: number, y2: number, n = 20): Point[] =>
  Array.from({ length: n }, (_, i) => ({ x: x1 + ((x2 - x1) * i) / (n - 1), y: y1 + ((y2 - y1) * i) / (n - 1) }));
// Wobbly hand-drawn version of a line.
const wobble = (pts: Point[], amp = 3) => pts.map((p, i) => ({ x: p.x + Math.sin(i) * amp, y: p.y + Math.cos(i * 1.3) * amp }));

// 十: horizontal stroke first, then vertical.
const JUU = [line(20, 50, 90, 50), line(55, 15, 55, 95)];

describe("stroke matching", () => {
  it("resamples evenly along the length", () => {
    const r = resample(line(0, 0, 100, 0, 3), 5);
    expect(r.map((p) => Math.round(p.x))).toEqual([0, 25, 50, 75, 100]);
    expect(Math.round(pathLength(r))).toBe(100);
  });

  it("accepts a wobbly but correct stroke", () => {
    expect(checkStroke(wobble(line(22, 52, 88, 49)), JUU, 0).verdict).toBe("ok");
  });

  it("detects a stroke drawn in the wrong direction", () => {
    expect(checkStroke(line(90, 50, 20, 50), JUU, 0).verdict).toBe("reversed");
  });

  it("detects a correct stroke drawn out of order", () => {
    expect(checkStroke(line(55, 15, 55, 95), JUU, 0)).toEqual({ verdict: "order", matched: 1 });
  });

  it("rejects taps and unrelated strokes", () => {
    expect(checkStroke([{ x: 50, y: 50 }], JUU, 0).verdict).toBe("short");
    expect(checkStroke(line(10, 90, 40, 100), JUU, 0).verdict).toBe("off");
  });

  it("accepts short marks such as dakuten when drawn in place", () => {
    const dakuten = [line(20, 50, 90, 50), line(80, 10, 84, 18, 5)];
    expect(checkStroke(line(80, 11, 83, 18, 6), dakuten, 1).verdict).toBe("ok");
  });
});

describe("KanjiVG parsing", () => {
  it("reads the strokes of あ in stroke order", () => {
    const svg = readFileSync("public/strokes/03042.svg", "utf8");
    const { paths } = parseKanjiVG(svg);
    expect(paths).toHaveLength(3);
    expect(paths.every((d) => d.startsWith("M"))).toBe(true);
  });

  it("orders strokes by their number, not document order", () => {
    const svg = '<path id="kvg:x-s2" d="M2,2"/><path d="M9,9" id="kvg:x-s1"/>';
    expect(parseKanjiVG(svg).paths).toEqual(["M9,9", "M2,2"]);
  });
});
