"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { data, resolveRef } from "@/lib/data";
import { useAgent } from "@/components/agent/AgentProvider";
import { IArrow, IMic, ISend } from "@/components/Icons";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EASE } from "@/components/motion/Reveal";

/* Fig. 1: the career as a plotted function. x = systems understood, y = systems built. */
const W = 1000;
const H = 560;
const PAD = { l: 70, r: 40, t: 40, b: 86 };
const PTS: { x: number; y: number; side: "above" | "below"; anchor?: "start" | "middle" | "end" }[] = [
  { x: 0.05, y: 0.08, side: "above", anchor: "start" },
  { x: 0.24, y: 0.18, side: "below" },
  { x: 0.42, y: 0.3, side: "below" },
  { x: 0.55, y: 0.56, side: "above" },
  { x: 0.66, y: 0.5, side: "below" },
  { x: 0.8, y: 0.44, side: "above", anchor: "end" },
  { x: 0.93, y: 0.86, side: "above", anchor: "end" },
];
const px = (x: number) => PAD.l + x * (W - PAD.l - PAD.r);
const py = (y: number) => H - PAD.b - y * (H - PAD.t - PAD.b);

function smoothPath(pts: { x: number; y: number }[]) {
  const p = pts.map((q) => ({ x: px(q.x), y: py(q.y) }));
  let d = `M ${p[0].x} ${p[0].y}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

const NOTES = [
  "Economics and Political Science at the University of Delhi. Incentives, institutions, why organizations behave the way they do.",
  "Coding Ninjas full-stack bootcamp, then projects. No CS degree, a lot of reading.",
  "Edviron: a payment system moving 50+ lakh INR a month, and the query-performance problems that come with it. Then Project Dark Horse: leading five engineers to ship two products from an ambiguous brief.",
  "HawkVision's core engineering team: dashboards, APIs, computer-vision pipeline integrations, Terraform for deployments.",
  "Owned discovery, feasibility, camera placement, architecture and deployment planning for 12 concurrent enterprise PoCs. Once redrew a customer's relay wiring on site to rescue a failed deployment.",
  "Built the India pipeline from scratch, priced deals, wrote 10+ RFP responses scoped at 1,000+ cameras, supported the CEO on international partnerships. 50+ opportunities across 7 countries.",
  "readTrail is a working MVP. This site is an agent grounded in structured data. The experiments are labelled as experiments.",
];

export function Hero() {
  const { ask } = useAgent();
  const steps = data.education.storyView;
  const [sel, setSel] = useState<number>(6);
  const [q, setQ] = useState("");
  const reduce = useReducedMotion();
  const T = reduce ? 0 : 1; // time scale for the focal sequence
  const wrapRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLFormElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [leader, setLeader] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [ready, setReady] = useState(false); // the leader only appears once the plate has landed

  // The callout is an annotation: a leader runs from the plate's edge to the selected point.
  useEffect(() => {
    const update = () => {
      const wrap = wrapRef.current, plate = plateRef.current, svg = svgRef.current;
      if (!wrap || !plate || !svg || window.innerWidth < 768) return setLeader(null);
      const wr = wrap.getBoundingClientRect();
      const pr = plate.getBoundingClientRect();
      const ctm = svg.getScreenCTM();
      if (!ctm) return;
      const pt = new DOMPoint(px(PTS[sel].x), py(PTS[sel].y)).matrixTransform(ctm);
      const x2 = pt.x - wr.left, y2 = pt.y - wr.top;
      // start from the plate edge nearest the point
      const cx = Math.min(Math.max(x2, pr.left - wr.left), pr.right - wr.left);
      const cy = Math.min(Math.max(y2, pr.top - wr.top), pr.bottom - wr.top);
      setLeader({ x1: cx, y1: cy, x2, y2 });
    };
    update();
    window.addEventListener("resize", update);
    const t = setTimeout(update, 900);
    const r = setTimeout(() => setReady(true), reduce ? 0 : 2300);
    return () => { window.removeEventListener("resize", update); clearTimeout(t); clearTimeout(r); };
  }, [sel, reduce]);

  const d = smoothPath(PTS);
  const cur = steps[sel];
  const ref = resolveRef(cur.ref);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    void ask(q);
    setQ("");
  };

  return (
    <section id="top" className="sheet pt-8 sm:pt-12" aria-label="Figure 1">
      <div ref={wrapRef} className="relative flex flex-col-reverse md:block">
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full md:max-h-[76vh]" role="img" aria-label="Figure 1. Priyanshu's career plotted as a curve: systems understood against systems built.">
          {/* axes */}
          <motion.line x1={PAD.l} y1={H - PAD.b} x2={PAD.l} y2={PAD.t - 10} stroke="var(--ink)" strokeWidth={1.2} initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 * T, ease: EASE }} />
          <motion.line x1={PAD.l} y1={H - PAD.b} x2={W - PAD.r + 10} y2={H - PAD.b} stroke="var(--ink)" strokeWidth={1.2} initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7 * T, ease: EASE }} />
          <path d={`M ${PAD.l - 5} ${PAD.t - 2} L ${PAD.l} ${PAD.t - 12} L ${PAD.l + 5} ${PAD.t - 2}`} fill="none" stroke="var(--ink)" strokeWidth={1.2} />
          <path d={`M ${W - PAD.r + 2} ${H - PAD.b - 5} L ${W - PAD.r + 12} ${H - PAD.b} L ${W - PAD.r + 2} ${H - PAD.b + 5}`} fill="none" stroke="var(--ink)" strokeWidth={1.2} />
          <text className="hidden sm:block" transform={`translate(${PAD.l - 14} ${(PAD.t + H - PAD.b) / 2}) rotate(-90)`} textAnchor="middle" fill="var(--ink-2)" fontSize={15} fontStyle="italic" fontFamily="var(--font-serif)">
            systems built
          </text>
          <text className="hidden sm:block" x={W - PAD.r} y={H - PAD.b + 26} textAnchor="end" fill="var(--ink-2)" fontSize={15} fontStyle="italic" fontFamily="var(--font-serif)">
            systems understood
          </text>

          {/* x-axis regions: human → software → intelligent */}
          {[
            ["human systems", 0.0, 0.3, "var(--curve-b)"],
            ["software systems", 0.3, 0.68, "var(--ink-2)"],
            ["intelligent systems", 0.68, 1.0, "var(--curve-a)"],
          ].map(([label, a, b, color]) => (
            <g key={label as string} className="hidden sm:block">
              <line x1={px(a as number) + 4} y1={H - PAD.b + 44} x2={px(b as number) - 4} y2={H - PAD.b + 44} stroke={color as string} strokeWidth={1} />
              <text x={(px(a as number) + px(b as number)) / 2} y={H - PAD.b + 62} textAnchor="middle" fill={color as string} fontSize={14} fontStyle="italic" fontFamily="var(--font-serif)">
                {label}
              </text>
            </g>
          ))}

          {/* the curve */}
          <motion.path d={d} fill="none" stroke="var(--curve-a)" strokeWidth={2.4} strokeLinecap="round" initial={{ pathLength: reduce ? 1 : 0, opacity: 1 }} animate={{ pathLength: 1 }} transition={{ duration: 2.2 * T, ease: EASE, delay: 0.4 * T }} />

          {/* points with leader lines */}
          {PTS.map((p, i) => {
            const cx = px(p.x);
            const cy = py(p.y);
            const up = p.side === "above";
            const ly = up ? cy - 46 : Math.min(cy + 46, H - PAD.b - 20);
            const active = i === sel;
            const s = steps[i];
            const anchor = p.anchor ?? "middle";
            const tx = anchor === "start" ? cx + 10 : anchor === "end" ? cx + 6 : cx;
            return (
              <motion.g
                key={i}
                className="cursor-pointer"
                initial={reduce ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: (0.55 + i * 0.26) * T, ease: EASE }}
                onClick={() => setSel(i)}
                tabIndex={0}
                role="button"
                aria-label={`${s.title}: ${s.subtitle}`}
                onKeyDown={(e) => e.key === "Enter" && setSel(i)}
                whileHover={reduce ? undefined : { scale: 1.02 }}
                style={{ transformOrigin: `${cx}px ${cy}px` }}
              >
                <line className="hidden sm:block" x1={cx} y1={cy} x2={cx} y2={ly + (up ? 12 : -12)} stroke="var(--ink-3)" strokeWidth={0.8} strokeDasharray="2 3" />
                <motion.circle cx={cx} cy={cy} fill={active ? "var(--curve-a)" : "var(--paper)"} stroke="var(--curve-a)" strokeWidth={2} initial={{ r: reduce ? 5 : 0 }} animate={{ r: active ? 7 : 5 }} transition={{ type: "spring", stiffness: 380, damping: 18, delay: reduce ? 0 : (0.55 + i * 0.26) * T }} />
                <text className="hidden sm:block" x={tx} y={ly + (up ? -2 : 8)} textAnchor={anchor} fill={active ? "var(--ink)" : "var(--ink-2)"} fontSize={14} fontFamily="var(--font-serif)" fontStyle="italic">
                  {s.title}
                </text>
                <text className="hidden sm:block" x={tx} y={ly + (up ? 14 : 24)} textAnchor={anchor} fill="var(--ink-3)" fontSize={11.5} fontFamily="var(--font-sans)">
                  {s.subtitle}
                </text>
                <text className="sm:hidden" x={cx} y={up ? cy - 16 : cy + 30} textAnchor="middle" fill="var(--ink)" fontSize={24} fontFamily="var(--font-serif)" fontStyle="italic">
                  {i + 1}
                </text>
              </motion.g>
            );
          })}
        </svg>
        <p className="mt-1 text-[13px] sm:hidden">
          <span className="fig-label block">y: systems built · x: systems understood</span>
          <span className="block whitespace-nowrap">
            <span className="text-curve-b">human</span> <span className="text-ink-2">→ software</span> <span className="text-curve-a">→ intelligent systems</span>
          </span>
        </p>

        {leader && ready && (
          <svg className="pointer-events-none absolute inset-0 hidden h-full w-full md:block" aria-hidden>
            <motion.line
              stroke="var(--ink-2)"
              strokeWidth={1}
              strokeDasharray="3 3"
              initial={{ x1: leader.x1, y1: leader.y1, x2: leader.x1, y2: leader.y1 }}
              animate={{ x1: leader.x1, y1: leader.y1, x2: leader.x2, y2: leader.y2 }}
              transition={{ type: "spring", stiffness: 120, damping: 20, delay: reduce ? 0 : 0.2 }}
            />
            <motion.circle r={2.5} fill="var(--ink-2)" animate={{ cx: leader.x1, cy: leader.y1 }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
          </svg>
        )}

        {/* The thesis sits on the figure: headline, offer, and the ask input, in the empty top-left of the plot. */}
        <div className="md:absolute md:left-[10%] md:top-[6%] md:w-[40%]">
          <h1 className="h-display text-[clamp(2.2rem,1rem+3vw,3.9rem)]">
            Don&apos;t read my resume.
            <br />
            <span className="relative inline-block">
              <motion.span
                aria-hidden
                className="absolute inset-0 -mx-[0.15em] origin-left bg-marker"
                style={{ top: "38%", height: "50%" }}
                initial={{ scaleX: reduce ? 1 : 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.7 * T, ease: EASE, delay: 1.1 * T }}
              />
              <span className="relative">Talk to it.</span>
            </span>
          </h1>
          <motion.form
            ref={plateRef}
            onSubmit={submit}
            className="plate mt-4 rounded-sm p-3 shadow-[var(--shadow)]"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, ease: EASE, delay: 1.5 * T }}
          >
            <div className="flex items-center gap-1 border-b border-ink transition-colors focus-within:border-curve-a">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask about any point on this curve" className="min-w-0 flex-1 bg-transparent py-1.5 text-[15px] outline-none placeholder:text-ink-3 focus-visible:outline-none" aria-label="Ask Priyanshu AI" />
              <button type="submit" className="p-1.5 text-ink hover:text-curve-a" aria-label="Ask">
                <ISend />
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {["Technical or business?", "What is readTrail?"].map((s) => (
                <button type="button" key={s} onClick={() => void ask(s)} className="chip">
                  {s}
                </button>
              ))}
            </div>
          </motion.form>
        </div>
      </div>

      {/* Notes to Fig. 1: the selected turning point, and the two doors. */}
      <div className="mt-2 grid gap-8 border-t border-ink pt-6 md:grid-cols-[1fr_1.3fr]">
        <div>
          <p className="fig-label text-[15px]">Fig. 1 · {data.profile.name}, {data.profile.location}. Notes.</p>
          <p className="mt-2 max-w-[44ch] text-[16px] leading-relaxed">{data.profile.hero.subtext}</p>
          <p className="mt-3 max-w-[44ch] text-[15px] leading-relaxed text-ink-2">Seven turning points, not seven job titles. Click any point on the curve and the note updates. The dip is real: building fell while he learned the commercial side, and the last point is the correction.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button onClick={() => void ask("Give me the 90-second version of his career.")} className="btn-ink">
              <IMic /> Talk to it
            </button>
            <a href="#relevance" className="btn-line">
              Why am I relevant to your role?
            </a>
          </div>
        </div>
        <aside className="plate relative overflow-hidden rounded-sm p-5" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={sel}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
              transition={{ duration: 0.28, ease: EASE }}
            >
              <h2 className="font-serif text-2xl">
                {cur.title} <span className="fig-label text-[0.6em]">· note {sel + 1} of {steps.length}</span>
              </h2>
              <div className="text-[14px] text-ink-2">{cur.subtitle}</div>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{NOTES[sel]}</p>
            </motion.div>
          </AnimatePresence>
          <div className="mt-4 flex items-center justify-between">
            <Link href={ref.href} className="text-[14px] text-curve-b hover:underline">
              Evidence: {ref.label}
            </Link>
            <div className="flex gap-1">
              <button onClick={() => setSel(Math.max(0, sel - 1))} disabled={sel === 0} className="chip disabled:opacity-30" aria-label="Previous point">
                <IArrow className="rotate-180" width={14} height={14} />
              </button>
              <button onClick={() => setSel(Math.min(steps.length - 1, sel + 1))} disabled={sel === steps.length - 1} className="chip disabled:opacity-30" aria-label="Next point">
                <IArrow width={14} height={14} />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
