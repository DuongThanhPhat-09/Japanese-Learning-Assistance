"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, Lightbulb, RotateCcw, Undo2 } from "lucide-react";
import { checkStroke, parseKanjiVG, STROKE_BOX, type Point, type StrokeVerdict } from "@/lib/strokes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { WritingCanvas } from "./Writing";

type Mode = "trace" | "recall";
type Loaded = { paths: string[]; points: Point[][] };

const NS = "http://www.w3.org/2000/svg";

/** Samples each stroke path into points (needs the DOM for path geometry). */
function samplePaths(paths: string[]): Point[][] {
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${STROKE_BOX} ${STROKE_BOX}`);
  Object.assign(svg.style, { position: "absolute", width: "0", height: "0", visibility: "hidden" });
  document.body.appendChild(svg);
  try {
    return paths.map((d) => {
      const p = document.createElementNS(NS, "path");
      p.setAttribute("d", d);
      svg.appendChild(p);
      const len = p.getTotalLength();
      const n = Math.max(8, Math.ceil(len / 2));
      return Array.from({ length: n + 1 }, (_, i) => {
        const pt = p.getPointAtLength((len * i) / n);
        return { x: pt.x, y: pt.y };
      });
    });
  } finally {
    svg.remove();
  }
}

/** Loads KanjiVG stroke data for a character from /strokes (bundled with the app). */
export function useStrokeData(char: string): Loaded | "loading" | "missing" {
  const [state, setState] = useState<Loaded | "loading" | "missing">("loading");
  useEffect(() => {
    let cancelled = false;
    setState("loading");
    const code = char.codePointAt(0)!.toString(16).padStart(5, "0");
    fetch(`/strokes/${code}.svg`)
      .then((r) => (r.ok ? r.text() : null))
      .then((text) => {
        if (cancelled) return;
        const paths = text ? parseKanjiVG(text).paths : [];
        setState(paths.length ? { paths, points: samplePaths(paths) } : "missing");
      })
      .catch(() => !cancelled && setState("missing"));
    return () => {
      cancelled = true;
    };
  }, [char]);
  return state;
}

const PRAISE = ["Tốt lắm!", "Chuẩn rồi!", "Đẹp!", "Chính xác!"];

function message(verdict: StrokeVerdict, current: number, matched?: number) {
  switch (verdict) {
    case "reversed":
      return "Ngược chiều rồi — viết theo hướng chấm tròn chạy nhé.";
    case "order":
      return `Đó là nét số ${(matched ?? 0) + 1}. Hãy viết nét số ${current + 1} trước.`;
    case "short":
      return "Nét hơi ngắn — kéo hết chiều dài của nét nhé.";
    default:
      return "Chưa khớp — thử lại theo nét đang sáng.";
  }
}

/**
 * Guided stroke-by-stroke writing. "Tô theo mẫu" shows the glyph and the next
 * stroke with its direction; "Tự viết" hides everything and only shows a hint
 * after two misses on the same stroke. Each stroke is checked for shape,
 * direction and order. Falls back to a free canvas when no stroke data exists.
 */
export function StrokeTracer({ char, size = 260, initialMode = "trace" }: { char: string; size?: number; initialMode?: Mode }) {
  const data = useStrokeData(char);
  const [mode, setMode] = useState<Mode>(initialMode);
  const [done, setDone] = useState(0);
  const [misses, setMisses] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [drawing, setDrawing] = useState<Point[]>([]);
  const [flash, setFlash] = useState<{ id: number; points: Point[] } | null>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const active = useRef(false);

  const reset = (m: Mode = mode) => {
    setMode(m);
    setDone(0);
    setMisses(0);
    setMistakes(0);
    setDrawing([]);
    setFlash(null);
    setFeedback(null);
  };
  useEffect(() => reset(initialMode), [char]); // eslint-disable-line react-hooks/exhaustive-deps

  if (data === "missing") return <WritingCanvas guide={char} size={size} />;
  if (data === "loading") return <div className="writing-grid aspect-square rounded-2xl border border-hairline bg-card" style={{ width: size, maxWidth: "100%" }} />;

  const total = data.paths.length;
  const finished = done >= total;
  const showHint = !finished && (mode === "trace" || misses >= 2);
  const current = data.points[done];

  const toBox = (e: React.PointerEvent): Point => {
    const r = svgRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * STROKE_BOX, y: ((e.clientY - r.top) / r.height) * STROKE_BOX };
  };

  const finishStroke = () => {
    if (!active.current) return;
    active.current = false;
    const pts = drawing;
    setDrawing([]);
    if (finished || pts.length === 0) return;
    const check = checkStroke(pts, data.points, done);
    if (check.verdict === "ok") {
      setDone(done + 1);
      setMisses(0);
      setFeedback(done + 1 >= total ? null : { ok: true, text: PRAISE[done % PRAISE.length] });
      navigator.vibrate?.(8);
    } else {
      setMisses((m) => m + 1);
      setMistakes((m) => m + 1);
      setFlash({ id: Date.now(), points: pts });
      setFeedback({ ok: false, text: message(check.verdict, done, check.matched) });
    }
  };

  const poly = (pts: Point[]) => pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  return (
    <div className="flex w-full flex-col items-center gap-3" style={{ maxWidth: size }}>
      {/* Mode switch */}
      <div className="grid w-full grid-cols-2 gap-1 rounded-xl bg-muted p-1 text-sm font-semibold">
        {(["trace", "recall"] as const).map((m) => (
          <button key={m} onClick={() => reset(m)} className={cn("flex items-center justify-center gap-1.5 rounded-lg py-1.5 transition-colors", mode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}>
            {m === "trace" ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
            {m === "trace" ? "Tô theo mẫu" : "Tự viết"}
          </button>
        ))}
      </div>

      <div className="writing-grid relative aspect-square w-full rounded-2xl border border-hairline bg-card shadow-soft">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${STROKE_BOX} ${STROKE_BOX}`}
          className="absolute inset-0 size-full touch-none select-none"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          onPointerDown={(e) => {
            if (finished) return;
            active.current = true;
            svgRef.current?.setPointerCapture(e.pointerId);
            setFeedback(null);
            setDrawing([toBox(e)]);
          }}
          onPointerMove={(e) => {
            if (!active.current) return;
            const p = toBox(e);
            setDrawing((d) => {
              const last = d[d.length - 1];
              return last && Math.hypot(p.x - last.x, p.y - last.y) < 0.8 ? d : [...d, p];
            });
          }}
          onPointerUp={finishStroke}
          onPointerCancel={finishStroke}
          aria-label={`Bảng viết chữ ${char}`}
        >
          {/* Ghost glyph */}
          {mode === "trace" && data.paths.map((d, i) => <path key={i} d={d} stroke="var(--muted-foreground)" strokeOpacity={0.18} strokeWidth={7} />)}

          {/* Strokes already written, snapped to the model */}
          {data.paths.slice(0, done).map((d, i) => (
            <motion.path
              key={i}
              d={d}
              stroke={finished ? "var(--primary)" : "var(--foreground)"}
              strokeWidth={5}
              initial={{ pathLength: 0.6, opacity: 0.6 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.25 }}
            />
          ))}

          {/* Next stroke: highlighted, with its start point and a dot running in the writing direction */}
          {showHint && current && (
            <g key={`hint-${done}`}>
              <path d={data.paths[done]} stroke="var(--primary)" strokeOpacity={0.35} strokeWidth={7} />
              <circle cx={current[0].x} cy={current[0].y} r={4.2} fill="var(--primary)" className="animate-pulse" />
              <text x={current[0].x} y={current[0].y + 1.6} textAnchor="middle" fontSize={5} fontWeight={800} fill="var(--primary-foreground)">
                {done + 1}
              </text>
              <circle r={2.2} fill="var(--primary)">
                <animateMotion dur="1.5s" repeatCount="indefinite" path={data.paths[done]} />
              </circle>
            </g>
          )}

          {/* A wrong attempt flashes red, then fades */}
          <AnimatePresence>
            {flash && (
              <motion.polyline
                key={flash.id}
                points={poly(flash.points)}
                stroke="var(--destructive)"
                strokeWidth={5}
                initial={{ opacity: 0.9 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.9, delay: 0.25 }}
                onAnimationComplete={() => setFlash(null)}
              />
            )}
          </AnimatePresence>

          {/* Stroke being drawn */}
          {drawing.length > 1 && <polyline points={poly(drawing)} stroke="var(--foreground)" strokeWidth={5} />}
        </svg>

        {finished && (
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            className="pointer-events-none absolute right-2 top-2 rounded-full bg-primary px-2.5 py-1 text-xs font-extrabold text-primary-foreground shadow-soft"
          >
            {mistakes === 0 ? "Hoàn hảo! 🌟" : "Hoàn thành ✓"}
          </motion.div>
        )}
      </div>

      {/* Feedback and progress */}
      <div className="flex min-h-10 w-full items-center justify-center text-center text-sm font-semibold" aria-live="polite">
        {finished ? (
          <span className="text-primary">
            {mistakes === 0 ? `Viết đúng cả ${total} nét, không lỗi nào!` : `Xong ${total} nét · ${mistakes} lần viết lại`}
          </span>
        ) : feedback ? (
          <span className={feedback.ok ? "text-primary" : "text-destructive"}>{feedback.text}</span>
        ) : (
          <span className="text-muted-foreground">
            Nét {done + 1}/{total}
            {mode === "recall" && misses < 2 ? " · viết từ trí nhớ" : " · bắt đầu ở chấm tròn"}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {finished ? (
          <>
            <Button size="sm" variant="outline" onClick={() => reset()}>
              <RotateCcw /> Viết lại
            </Button>
            <Button size="sm" onClick={() => reset(mode === "trace" ? "recall" : "trace")}>
              {mode === "trace" ? (
                <>
                  <EyeOff /> Thử tự viết
                </>
              ) : (
                <>
                  <Eye /> Tô theo mẫu
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            <Button size="sm" variant="ghost" disabled={done === 0} onClick={() => (setDone(done - 1), setMisses(0), setFeedback(null))}>
              <Undo2 /> Lùi 1 nét
            </Button>
            {mode === "recall" && misses < 2 && (
              <Button size="sm" variant="ghost" onClick={() => setMisses(2)}>
                <Lightbulb /> Gợi ý
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => reset()}>
              <RotateCcw /> Làm lại
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
