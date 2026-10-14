"use client";

import { useEffect, useRef, useState } from "react";
import { Eraser, Eye, EyeOff, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Stroke-order viewer. KanjiVG SVGs ship in /strokes/{codepoint}.svg (refresh
 * with `npm run fetch:strokes`) and are animated stroke by stroke;
 * otherwise a large reference glyph is shown with the stroke count.
 */
export function StrokeOrder({ char, strokes }: { char: string; strokes?: number }) {
  const [svg, setSvg] = useState<string | null>(null);
  const [key, setKey] = useState(0);
  const code = char.codePointAt(0)!.toString(16).padStart(5, "0");

  useEffect(() => {
    let cancelled = false;
    setSvg(null);
    fetch(`/strokes/${code}.svg`)
      .then((r) => (r.ok ? r.text() : null))
      .then((t) => {
        if (!cancelled && t && t.includes("<svg")) setSvg(t.replace(/<\?xml[^>]*\?>/, "").replace(/<!DOCTYPE[^>]*(\[[\s\S]*?\])?>/, ""));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [code]);

  // Stagger each stroke's animation.
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.querySelectorAll("path").forEach((p, i) => ((p as SVGPathElement).style.animationDelay = `${i * 0.7}s`));
  }, [svg, key]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="writing-grid relative grid size-40 place-items-center rounded-xl border bg-card">
        {svg ? (
          <div key={key} ref={ref} className="stroke-anim size-36 [&_svg]:size-full" dangerouslySetInnerHTML={{ __html: svg }} />
        ) : (
          <span className="font-jp-serif text-8xl leading-none">{char}</span>
        )}
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {strokes ? <span>{strokes} nét</span> : null}
        {svg && (
          <Button size="sm" variant="ghost" onClick={() => setKey((k) => k + 1)}>
            <Play /> Xem lại thứ tự nét
          </Button>
        )}
      </div>
      {!svg && <p className="max-w-40 text-center text-[11px] text-muted-foreground">Chưa có dữ liệu thứ tự nét cho chữ này.</p>}
    </div>
  );
}

/** Freehand writing canvas with a faint guide glyph. */
export function WritingCanvas({ guide, size = 240 }: { guide?: string; size?: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [showGuide, setShowGuide] = useState(true);
  const [strokes, setStrokes] = useState(0);

  const ctx = () => canvas.current?.getContext("2d") ?? null;

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    c.width = size * dpr;
    c.height = size * dpr;
    const g = c.getContext("2d")!;
    g.scale(dpr, dpr);
    g.lineCap = "round";
    g.lineJoin = "round";
    g.lineWidth = size / 28;
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, guide]);

  function clear() {
    const g = ctx();
    if (!g) return;
    g.clearRect(0, 0, size, size);
    setStrokes(0);
  }

  function pos(e: React.PointerEvent) {
    const r = canvas.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * size, y: ((e.clientY - r.top) / r.height) * size };
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="writing-grid relative rounded-xl border bg-card" style={{ width: size, height: size }}>
        {guide && showGuide && (
          <span className="pointer-events-none absolute inset-0 grid select-none place-items-center font-jp-serif leading-none text-foreground/10" style={{ fontSize: size * 0.75 }}>
            {guide}
          </span>
        )}
        <canvas
          ref={canvas}
          className="absolute inset-0 touch-none"
          style={{ width: size, height: size }}
          onPointerDown={(e) => {
            drawing.current = true;
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            const g = ctx()!;
            g.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--foreground") || "#111";
            const p = pos(e);
            g.beginPath();
            g.moveTo(p.x, p.y);
          }}
          onPointerMove={(e) => {
            if (!drawing.current) return;
            const g = ctx()!;
            const p = pos(e);
            g.lineTo(p.x, p.y);
            g.stroke();
          }}
          onPointerUp={() => {
            if (drawing.current) setStrokes((s) => s + 1);
            drawing.current = false;
          }}
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{strokes} nét đã viết</span>
        <Button size="sm" variant="outline" onClick={clear}>
          <Eraser /> Xóa
        </Button>
        {guide && (
          <Button size="sm" variant="ghost" onClick={() => setShowGuide((v) => !v)}>
            {showGuide ? <EyeOff /> : <Eye />} Mẫu
          </Button>
        )}
      </div>
    </div>
  );
}
