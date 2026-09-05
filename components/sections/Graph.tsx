"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY, type SimulationLinkDatum, type SimulationNodeDatum } from "d3-force";
import { data, resolveRef } from "@/lib/data";
import { Figure } from "@/components/Figure";
import { IArrow } from "@/components/Icons";

type N = SimulationNodeDatum & { id: string; label: string; type: string; ref?: string };
type L = SimulationLinkDatum<N>;

const TYPE_COLOR: Record<string, string> = {
  education: "var(--curve-b)",
  experience: "var(--curve-a)",
  project: "var(--ink)",
  technology: "var(--ink-3)",
  domain: "var(--ink-2)",
  interest: "var(--marker)",
};
const TYPE_HOLLOW: Record<string, boolean> = { technology: true, domain: true };

export function Graph() {
  const wrap = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 900, h: 560 });
  const [, force] = useState(0);
  const [selected, setSelected] = useState<string | null>("hawkvision");
  const [filter, setFilter] = useState<string | null>(null);
  const [hot, setHot] = useState<string | null>(null); // the node under the pointer or focus
  const simRef = useRef<ReturnType<typeof forceSimulation<N>> | null>(null);

  const nodes = useMemo<N[]>(() => data.knowledge.nodes.map((n) => ({ ...n })), []);
  const links = useMemo<L[]>(() => data.knowledge.links.map((l) => ({ source: l.source, target: l.target })), []);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: Math.max(620, Math.min(760, el.clientWidth * 0.9)) }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const sim = forceSimulation<N>(nodes)
      .force("link", forceLink<N, L>(links).id((d) => d.id).distance(62).strength(0.55))
      .force("charge", forceManyBody().strength(-150))
      .force("center", forceCenter(size.w / 2, size.h / 2))
      .force("collide", forceCollide<N>((d) => Math.max(20, d.label.length * 3.3)))
      .force("x", forceX(size.w / 2).strength(0.06))
      .force("y", forceY(size.h / 2).strength(0.08))
      .on("tick", () => {
        const pad = 46;
        for (const n of nodes) {
          const half = Math.max(pad, n.label.length * 3.4 + 8);
          if (n.x != null) n.x = Math.max(half, Math.min(size.w - half, n.x));
          if (n.y != null) n.y = Math.max(pad, Math.min(size.h - pad, n.y));
        }
        force((x) => x + 1);
      });
    // Settle before first paint so the figure never shows the unlaid state.
    sim.stop();
    for (let i = 0; i < 160; i++) sim.tick();
    force((x) => x + 1);
    sim.alpha(0.2).restart();
    simRef.current = sim;
    return () => {
      sim.stop();
    };
  }, [nodes, links, size.w, size.h]);

  const neighbors = useMemo(() => {
    const m = new Map<string, Set<string>>();
    for (const l of links) {
      const s = typeof l.source === "object" ? (l.source as N).id : (l.source as string);
      const t = typeof l.target === "object" ? (l.target as N).id : (l.target as string);
      if (!m.has(s)) m.set(s, new Set());
      if (!m.has(t)) m.set(t, new Set());
      m.get(s)!.add(t);
      m.get(t)!.add(s);
    }
    return m;
  }, [links]);

  const drag = useRef<N | null>(null);
  const onDown = (e: React.PointerEvent, n: N) => {
    drag.current = n;
    n.fx = n.x;
    n.fy = n.y;
    simRef.current?.alphaTarget(0.3).restart();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!drag.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    drag.current.fx = e.clientX - rect.left;
    drag.current.fy = e.clientY - rect.top;
  };
  const onUp = () => {
    if (!drag.current) return;
    drag.current.fx = null;
    drag.current.fy = null;
    drag.current = null;
    simRef.current?.alphaTarget(0);
  };

  const sel = nodes.find((n) => n.id === selected) ?? null;
  const selNeighbors = sel ? neighbors.get(sel.id) ?? new Set<string>() : new Set<string>();
  const visible = (n: N) => !filter || n.type === filter || (sel && (n.id === sel.id || selNeighbors.has(n.id)));

  return (
    <Figure id="graph" n={4} title="A background that connects, not a list of keywords." lede="Drag nodes. Click one to see what it links to. Economics sits three hops from a highway camera deployment for a reason.">
      <div className="flex flex-wrap gap-2">
        {Object.entries(data.knowledge.nodeTypes).map(([k, v]) => (
          <button
            key={k}
            onClick={() => setFilter(filter === k ? null : k)}
            className={`chip ${filter === k ? "!bg-ink !text-paper" : ""}`}
          >
            <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full border-2" style={{ borderColor: TYPE_COLOR[k], background: TYPE_HOLLOW[k] ? "transparent" : TYPE_COLOR[k] }} />
            {v}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div ref={wrap} className="plate relative overflow-hidden rounded-sm" style={{ height: size.h }}>
          <svg width={size.w} height={size.h} className="touch-none select-none" onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}>
            {links.map((l, i) => {
              const s = l.source as N;
              const t = l.target as N;
              if (s.x == null || t.x == null) return null;
              const hot = sel && (s.id === sel.id || t.id === sel.id);
              return <line key={i} x1={s.x} y1={s.y} x2={t.x} y2={t.y} stroke={hot ? "var(--curve-a)" : "var(--ink-3)"} strokeOpacity={hot ? 0.9 : 0.35} strokeWidth={hot ? 1.5 : 1} />;
            })}
            {nodes.map((n) => {
              if (n.x == null) return null;
              const isSel = sel?.id === n.id;
              const isNb = selNeighbors.has(n.id);
              const isHot = hot === n.id;
              const dim = !visible(n);
              const r = n.type === "experience" || n.type === "project" ? 10 : n.type === "education" ? 8 : 6;
              return (
                <g
                  key={n.id}
                  transform={`translate(${n.x},${n.y})`}
                  opacity={dim ? 0.18 : 1}
                  className="cursor-grab active:cursor-grabbing"
                  onPointerDown={(e) => onDown(e, n)}
                  onClick={() => setSelected(n.id)}
                  onPointerEnter={() => setHot(n.id)}
                  onPointerLeave={() => setHot((h) => (h === n.id ? null : h))}
                  onFocus={() => setHot(n.id)}
                  onBlur={() => setHot((h) => (h === n.id ? null : h))}
                  tabIndex={dim ? -1 : 0}
                  role="button"
                  aria-label={`${n.label}, ${data.knowledge.nodeTypes[n.type as keyof typeof data.knowledge.nodeTypes]}`}
                  aria-pressed={isSel}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
                      e.preventDefault();
                      setSelected(n.id);
                    }
                  }}
                >
                  <circle r={r + 10} fill="transparent" />
                  {/* the ring answers the pointer before the click commits, as it does on Fig. 1 */}
                  <circle
                    r={r + 7}
                    fill="none"
                    stroke="var(--curve-a)"
                    strokeWidth={1}
                    strokeDasharray="2 3"
                    opacity={isHot && !isSel ? 0.8 : 0}
                    style={{ transition: "opacity .2s ease" }}
                  />
                  <circle r={isSel ? r + 3 : isHot ? r + 1.5 : r} fill={TYPE_HOLLOW[n.type] && !isSel ? "var(--paper)" : TYPE_COLOR[n.type]} stroke={isSel ? "var(--curve-a)" : TYPE_COLOR[n.type]} strokeWidth={isSel ? 2.5 : 1.6} style={{ transition: "r .2s ease" }} />
                  <text y={r + 14} textAnchor="middle" fontSize={11} fill={isSel || isNb || isHot ? "var(--ink)" : "var(--ink-2)"} fontFamily="var(--font-sans)" style={{ pointerEvents: "none" }}>
                    {n.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="plate rounded-sm p-5">
          {sel ? (
            <>
              <div className="fig-label text-[14px]">
                {data.knowledge.nodeTypes[sel.type as keyof typeof data.knowledge.nodeTypes]}
              </div>
              <h3 className="mt-1 font-serif text-2xl">{sel.label}</h3>
              {sel.ref && (
                <Link href={resolveRef(sel.ref).href} className="mt-1 inline-block text-[15px] text-curve-b hover:underline">
                  Open {resolveRef(sel.ref).label} <IArrow className="inline" width={14} height={14} />
                </Link>
              )}
              <div className="fig-label mt-5 text-[14px]">Connected to</div>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {[...selNeighbors].map((id) => {
                  const n = nodes.find((x) => x.id === id)!;
                  return (
                    <li key={id}>
                      <button onClick={() => setSelected(id)} className="chip">
                        {n.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <p className="text-sm text-ink-3">Click a node.</p>
          )}
        </div>
      </div>
    </Figure>
  );
}
