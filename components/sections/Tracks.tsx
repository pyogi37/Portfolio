"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { dimensions, resolveRef } from "@/lib/data";
import { useAgent } from "@/components/agent/AgentProvider";
import { Figure } from "@/components/Figure";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EASE, listVariants, itemVariants } from "@/components/motion/Reveal";

/* Fig. 2: six overlapping regions drawn as ink rings with hatching, the way a textbook draws overlapping sets. */
const HATCH_ANGLES = [0, 30, 60, 90, 120, 150];

export function Tracks() {
  const { highlighted, setHighlighted, ask } = useAgent();
  const [active, setActive] = useState<string>("builder");
  const [hot, setHot] = useState<string | null>(null); // the region under the pointer
  const reduce = useReducedMotion();
  useEffect(() => {
    if (highlighted.length) setActive(highlighted[0]);
  }, [highlighted]);

  const dim = dimensions.find((d) => d.id === active)!;
  const n = dimensions.length;
  const R = 78;
  const r = 92;

  return (
    <Figure
      id="tracks"
      n={2}
      title="Experience that overlaps rather than stacks."
      lede={
        <>
          Six regions, one person. Click a region for its evidence, or ask the AI{" "}
          <button onClick={() => void ask("Is he primarily technical or business?")} className="text-curve-b underline underline-offset-4 hover:text-ink">
            “is he technical or business?”
          </button>{" "}
          and watch the relevant ones hatch.
        </>
      }
    >
      <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.1fr]">
        <svg viewBox="-245 -235 490 470" className="mx-auto w-full max-w-md" role="img" aria-label="Six overlapping regions: builder, agents, customer, product, business, humanities">
          <defs>
            {dimensions.map((d, i) => (
              <pattern key={d.id} id={`hatch-${d.id}`} patternUnits="userSpaceOnUse" width="7" height="7" patternTransform={`rotate(${HATCH_ANGLES[i]})`}>
                <line x1="0" y1="0" x2="0" y2="7" stroke={i % 2 ? "var(--curve-b)" : "var(--curve-a)"} strokeWidth="1.2" />
              </pattern>
            ))}
          </defs>
          {dimensions.map((d, i) => {
            const a = (i / n) * Math.PI * 2 - Math.PI / 2;
            const cx = Math.cos(a) * R;
            const cy = Math.sin(a) * R;
            const on = d.id === active || highlighted.includes(d.id);
            const isHot = d.id === hot;
            return (
              <g
                key={d.id}
                onClick={() => { setActive(d.id); setHighlighted([]); }}
                className="cursor-pointer"
                tabIndex={0}
                role="button"
                aria-label={d.label}
                aria-pressed={d.id === active}
                onMouseEnter={() => setHot(d.id)}
                onMouseLeave={() => setHot((h) => (h === d.id ? null : h))}
                onFocus={() => setHot(d.id)}
                onBlur={() => setHot((h) => (h === d.id ? null : h))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
                    e.preventDefault();
                    setActive(d.id);
                    setHighlighted([]);
                  }
                }}
              >
                {/* the pointer gets a preview of the selection: the hatch at a whisper, the ring inked */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill={on || isHot ? `url(#hatch-${d.id})` : "transparent"}
                  fillOpacity={on ? 0.55 : isHot ? 0.2 : 0}
                  stroke={isHot && !on ? "var(--curve-a)" : "var(--ink)"}
                  strokeOpacity={on ? 0.9 : isHot ? 0.85 : 0.45}
                  strokeWidth={on ? 1.6 : isHot ? 1.4 : 1}
                  style={{ transition: "all .3s ease" }}
                />
                <text x={Math.cos(a) * (R + r + 18)} y={Math.sin(a) * (R + r + 18)} textAnchor="middle" dominantBaseline="middle" fontSize="13" fontFamily="var(--font-serif)" fontStyle="italic" fill={on || isHot ? "var(--ink)" : "var(--ink-2)"}>
                  {d.label.split(" / ")[0]}
                </text>
              </g>
            );
          })}
        </svg>

        <div>
          <div className="flex flex-wrap gap-1.5">
            {dimensions.map((d) => (
              <button key={d.id} onClick={() => { setActive(d.id); setHighlighted([]); }} className={`chip ${d.id === active ? "!bg-ink !text-paper" : ""} ${highlighted.includes(d.id) && d.id !== active ? "!border-curve-a" : ""}`}>
                {d.label}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait" initial={false}>
          <motion.div key={dim.id} initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25, ease: EASE }}>
          <h3 className="mt-6 font-serif text-3xl">{dim.label}</h3>
          <p className="mt-1 text-[15px] text-ink-3">{dim.items.join(" · ")}</p>
          <motion.ol className="mt-5 space-y-3" variants={listVariants} initial={reduce ? "show" : "hidden"} animate="show">
            {dim.evidence.map((e, i) => {
              const ref = resolveRef(e.ref);
              return (
                <motion.li key={i} variants={itemVariants} className="grid grid-cols-[1.6rem_1fr] gap-2 text-[15.5px] leading-relaxed text-ink-2">
                  <span className="fig-label text-right">{i + 1}</span>
                  <span>
                    {e.text}{" "}
                    <Link href={ref.href} className="text-curve-b hover:underline">
                      {ref.label}
                    </Link>
                  </span>
                </motion.li>
              );
            })}
          </motion.ol>
          </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Figure>
  );
}
