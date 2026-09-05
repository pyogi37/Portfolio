"use client";

import { useEffect, useRef, useState } from "react";
import { data } from "@/lib/data";
import { Figure } from "@/components/Figure";

type Pt = { id: string; x: number; y: number };

/* Fig. 5: a scatter of topics on two axes, "reads about" against "builds with". Solid points are work; hollow points are curiosity. Draggable, because it is a personal figure. */
export function RabbitHoles() {
  const items = data.interests.rabbitHoles;
  const ref = useRef<HTMLDivElement>(null);
  const [pts, setPts] = useState<Pt[]>([]);
  const [hover, setHover] = useState<string | null>(null);
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const [size, setSize] = useState({ w: 800, h: 440 });
  const PAD = { l: 48, r: 24, t: 28, b: 44 };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: Math.max(380, Math.min(520, el.clientWidth * 0.55)) }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    // Rough authored positions: curiosity (x) vs how much he builds with it (y). Not measurements.
    const seed: Record<string, [number, number]> = {
      ai: [0.9, 0.92], backend: [0.7, 0.88], "system-design": [0.78, 0.72],
      economics: [0.92, 0.28], "political-science": [0.8, 0.14], investing: [0.6, 0.18],
      travel: [0.55, 0.06], photography: [0.68, 0.34], reading: [0.96, 0.5],
      fitness: [0.3, 0.08], cooking: [0.42, 0.2], productivity: [0.62, 0.55], music: [0.38, 0.3],
    };
    setPts(
      items.map((it) => {
        const [sx, sy] = seed[it.id] ?? [0.5, 0.5];
        return { id: it.id, x: PAD.l + sx * (size.w - PAD.l - PAD.r), y: PAD.t + (1 - sy) * (size.h - PAD.t - PAD.b) };
      }),
    );
  }, [items, size.w, size.h]);

  const onDown = (e: React.PointerEvent, id: string) => {
    const p = pts.find((q) => q.id === id)!;
    drag.current = { id, dx: e.clientX - p.x, dy: e.clientY - p.y };
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const { id, dx, dy } = drag.current;
    setPts((prev) => prev.map((p) => (p.id === id ? { ...p, x: e.clientX - dx, y: e.clientY - dy } : p)));
  };
  const onUp = () => (drag.current = null);

  const byId = Object.fromEntries(items.map((i) => [i.id, i]));
  const hovered = hover ? byId[hover] : null;

  return (
    <Figure
      id="rabbit-holes"
      n={5}
      title="Things I keep going down rabbit holes on."
      lede={
        <>
          Not a skills list. <span className="text-curve-a">Solid</span> points are things he works on; <span className="text-curve-b">hollow</span> points are things he is curious about. Positions are a self-portrait, not data. Drag them if you disagree.
        </>
      }
      interaction="Hover or tab to any point to read the note behind it."
    >
      <div ref={ref} className="plate relative overflow-hidden rounded-sm" style={{ height: size.h }}>
        <svg width={size.w} height={size.h} className="absolute inset-0 touch-none select-none" onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}>
          <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={size.h - PAD.b} stroke="var(--ink)" strokeWidth={1} />
          <line x1={PAD.l} y1={size.h - PAD.b} x2={size.w - PAD.r} y2={size.h - PAD.b} stroke="var(--ink)" strokeWidth={1} />
          <text transform={`translate(${PAD.l - 12} ${(PAD.t + size.h - PAD.b) / 2}) rotate(-90)`} textAnchor="middle" fontSize={13} fontStyle="italic" fontFamily="var(--font-serif)" fill="var(--ink-2)">builds with</text>
          <text x={size.w - PAD.r} y={size.h - PAD.b + 22} textAnchor="end" fontSize={13} fontStyle="italic" fontFamily="var(--font-serif)" fill="var(--ink-2)">reads about</text>
          {pts.map((p) => {
            const it = byId[p.id];
            const work = it.kind === "work";
            const isHover = hover === p.id;
            return (
              <g key={p.id} transform={`translate(${p.x},${p.y})`} className="cursor-grab active:cursor-grabbing" onPointerDown={(e) => onDown(e, p.id)} onPointerEnter={() => setHover(p.id)} onPointerLeave={() => setHover(null)} onClick={() => setHover(p.id)} tabIndex={0} onFocus={() => setHover(p.id)} onBlur={() => setHover(null)} role="button" aria-label={`${it.label}: ${it.note}`} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") { e.preventDefault(); setHover(p.id); } }}>
                <circle r={26} fill="transparent" />
                {/* same ring as Fig. 1 and the graph: the mark answers the pointer */}
                <circle r={13} fill="none" stroke={work ? "var(--curve-a)" : "var(--curve-b)"} strokeWidth={1} strokeDasharray="2 3" opacity={isHover ? 0.75 : 0} style={{ transition: "opacity .2s ease" }} />
                <circle r={isHover ? 7 : 5.5} fill={work ? "var(--curve-a)" : "var(--paper)"} stroke={work ? "var(--curve-a)" : "var(--curve-b)"} strokeWidth={1.8} />
                <text y={-12} textAnchor="middle" fontSize={13} fontFamily="var(--font-serif)" fontStyle="italic" fill={isHover ? "var(--ink)" : "var(--ink-2)"} style={{ pointerEvents: "none" }}>
                  {it.label}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex justify-center">
          <div className={`plate rounded-sm px-4 py-2 text-[15px] transition ${hovered ? "opacity-100" : "opacity-0"}`} aria-live="polite">
            {hovered && (
              <>
                <span className="font-serif italic">{hovered.label}:</span> <span className="text-ink-2">“{hovered.note}”</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Figure>
  );
}
