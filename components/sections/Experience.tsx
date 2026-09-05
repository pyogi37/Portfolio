"use client";

import { useState } from "react";
import Link from "next/link";
import { roles, projectById, projectSlug } from "@/lib/data";
import { Figure, Notes } from "@/components/Figure";
import { IArrowUpRight } from "@/components/Icons";

/* Fig. 3: roles as spans on a time axis, 2019 to 2026, the way a figure shades periods. */
const T0 = 2019;
const T1 = 2026.75;
const tx = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  return ((y + (m - 1) / 12 - T0) / (T1 - T0)) * 100;
};

export function Experience() {
  const [openId, setOpenId] = useState<string>(roles[0].id);
  const rows = [...roles].reverse(); // chronological, oldest first
  const open = roles.find((r) => r.id === openId)!;
  return (
    <Figure
      id="experience"
      n={3}
      title="Four roles, three companies, one direction."
      lede="Backend under real load, then 0→1 product leadership, then inside an enterprise computer-vision company from engineering to global solutions. HawkVision is the deepest chapter, not the only one."
    >
      {/* time axis: a fixed label gutter on the left, the span drawn to its right. Nothing truncates. */}
      <div className="select-none">
        <div className="grid md:grid-cols-[230px_1fr]">
          <div />
          <div className="flex justify-between border-b border-ink pb-1 font-mono text-[12px] text-ink-3">
            {Array.from({ length: 8 }, (_, i) => T0 + i).map((y) => (
              <span key={y} className="tnum">{y}</span>
            ))}
          </div>
        </div>
        <ul className="mt-2 divide-y divide-rule">
          {rows.map((r) => {
            const l = tx(r.start);
            const w = Math.max(2.5, tx(r.end) - l);
            const on = r.id === openId;
            return (
              <li key={r.id}>
                <button
                  onClick={() => setOpenId(r.id)}
                  className={`grid w-full items-center gap-2 py-2.5 text-left transition md:grid-cols-[230px_1fr] ${on ? "" : "hover:bg-paper-2/60"}`}
                  aria-pressed={on}
                  aria-label={`${r.role}, ${r.organization}, ${r.period}`}
                >
                  <span className="pr-3 leading-tight">
                    <span className={`block text-[15px] ${on ? "font-bold" : ""}`}>{r.organization}</span>
                    <span className="block text-[13px] text-ink-2">{r.role}</span>
                  </span>
                  <span className="relative block h-5">
                    <span className="absolute inset-y-0 left-0 right-0 top-1/2 h-px bg-rule" />
                    <span
                      className={`absolute top-0 h-5 rounded-sm border transition ${on ? "border-ink bg-ink" : "border-ink/60 bg-paper"}`}
                      style={{ left: `${l}%`, width: `${w}%` }}
                    />
                    <span className={`absolute top-0 hidden whitespace-nowrap font-mono text-[11px] leading-5 md:block ${l + w > 82 ? "text-right" : ""}`} style={l + w > 82 ? { right: `${100 - l + 1}%` } : { left: `calc(${l + w}% + 8px)` }}>
                      <span className="tnum text-ink-3">{r.period}</span>
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* detail: the reading for the selected span */}
      <article className="mt-10 grid gap-8 border-t border-rule pt-8 md:grid-cols-[1.6fr_1fr]" id={open.id.replace(":", "-")} aria-live="polite">
        <div>
          <div className="fig-label text-[14px] tnum">{open.period} · {open.location}</div>
          <h3 className="mt-1 font-serif text-3xl">{open.role}</h3>
          <div className="text-lg text-ink-2">{open.organization}</div>
          <p className="mt-3 text-[15px] italic text-ink-3">{open.context}</p>
          <ol className="mt-4 space-y-2.5">
            {open.workedOn.map((w, i) => (
              <li key={i} className="grid grid-cols-[1.6rem_1fr] gap-2 text-[15.5px] leading-relaxed text-ink-2">
                <span className="fig-label text-right">{i + 1}</span>
                <span>{w}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="space-y-5 text-[15px]">
          <div>
            <div className="fig-label">What it taught him</div>
            <p className="mt-1 text-ink-2">{open.learned}</p>
          </div>
          <div>
            <div className="fig-label">Technologies</div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {open.technologies.map((t) => (
                <span key={t} className="chip">{t}</span>
              ))}
            </div>
          </div>
          {open.relatedProjects.length > 0 && (
            <div>
              <div className="fig-label">Related</div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {open.relatedProjects.map((id) => {
                  const p = projectById(id);
                  if (!p) return null;
                  const href = p.tier === "featured" ? `/projects/${projectSlug(id)}` : `/#projects`;
                  return (
                    <Link key={id} href={href} className="chip">
                      {p.name} <IArrowUpRight width={13} height={13} />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </article>
      <Notes items={[{ n: "a", text: "All figures (camera counts, deal sizes, PoC counts, query timings) are as stated on the resume; none are rounded up here." }]} />
    </Figure>
  );
}
