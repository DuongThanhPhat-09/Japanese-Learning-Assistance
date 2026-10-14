/**
 * Stroke data (KanjiVG) and stroke matching for guided writing practice.
 * Coordinates use the KanjiVG 109 × 109 viewBox.
 */

export const STROKE_BOX = 109;

export type Point = { x: number; y: number };

export interface StrokeData {
  /** SVG path data per stroke, in stroke order. */
  paths: string[];
}

/** Extracts the stroke paths, in stroke order, from a KanjiVG SVG file. */
export function parseKanjiVG(svg: string): StrokeData {
  const strokes: { n: number; d: string }[] = [];
  for (const tag of svg.match(/<path\b[^>]*>/g) ?? []) {
    const id = /\bid="[^"]*-s(\d+)"/.exec(tag);
    const d = /\bd="([^"]+)"/.exec(tag);
    if (id && d) strokes.push({ n: Number(id[1]), d: d[1] });
  }
  return { paths: strokes.sort((a, b) => a.n - b.n).map((s) => s.d) };
}

const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

export function pathLength(points: Point[]): number {
  let len = 0;
  for (let i = 1; i < points.length; i++) len += dist(points[i - 1], points[i]);
  return len;
}

/** Resamples a polyline to `n` points evenly spaced along its length. */
export function resample(points: Point[], n = 32): Point[] {
  if (points.length === 0) return [];
  if (points.length === 1) return Array.from({ length: n }, () => ({ ...points[0] }));
  const total = pathLength(points);
  if (total === 0) return Array.from({ length: n }, () => ({ ...points[0] }));
  const step = total / (n - 1);
  const out: Point[] = [{ ...points[0] }];
  let acc = 0;
  let prev = points[0];
  for (let i = 1; i < points.length && out.length < n; i++) {
    let cur = points[i];
    let d = dist(prev, cur);
    while (acc + d >= step && out.length < n) {
      const t = (step - acc) / d;
      const p = { x: prev.x + t * (cur.x - prev.x), y: prev.y + t * (cur.y - prev.y) };
      out.push(p);
      prev = p;
      d = dist(prev, cur);
      acc = 0;
    }
    acc += d;
    prev = cur;
  }
  while (out.length < n) out.push({ ...points[points.length - 1] });
  return out;
}

/** Mean distance between two polylines after resampling (same direction). */
export function strokeDistance(a: Point[], b: Point[], n = 32): number {
  const ra = resample(a, n);
  const rb = resample(b, n);
  let sum = 0;
  for (let i = 0; i < n; i++) sum += dist(ra[i], rb[i]);
  return sum / n;
}

export type StrokeVerdict = "ok" | "reversed" | "order" | "short" | "off";

export interface StrokeCheck {
  verdict: StrokeVerdict;
  /** For "order": index of the stroke the learner actually drew. */
  matched?: number;
}

/**
 * Tolerances in viewBox units (109 = full box). Lenient enough for a finger on
 * a phone, strict enough that a wrong stroke or a reversed direction fails.
 */
export const TOLERANCE = { shape: 13, ends: 22, minLength: 0.35 };

function fits(user: Point[], expected: Point[]): boolean {
  if (strokeDistance(user, expected) > TOLERANCE.shape) return false;
  return dist(user[0], expected[0]) <= TOLERANCE.ends && dist(user[user.length - 1], expected[expected.length - 1]) <= TOLERANCE.ends;
}

/**
 * Checks a drawn stroke against stroke `index` of the character.
 * `strokes` are the expected strokes as sampled points.
 */
export function checkStroke(user: Point[], strokes: Point[][], index: number): StrokeCheck {
  const expected = strokes[index];
  const userLen = pathLength(user);
  const expectedLen = pathLength(expected);
  // Short marks (dakuten, dots) are short on purpose; compare relative to the expected stroke.
  if (user.length < 2 || userLen < Math.min(expectedLen * TOLERANCE.minLength, 6)) return { verdict: "short" };
  if (fits(user, expected)) return { verdict: "ok" };
  if (fits([...user].reverse(), expected)) return { verdict: "reversed" };
  for (let j = index + 1; j < strokes.length; j++) if (fits(user, strokes[j])) return { verdict: "order", matched: j };
  return { verdict: "off" };
}
