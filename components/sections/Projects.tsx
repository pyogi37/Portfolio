"use client";

import Link from "next/link";
import Image from "next/image";
import { featuredProjects, technicalProjects, experimentProjects, projectSlug, roleById } from "@/lib/data";
import { useAgent } from "@/components/agent/AgentProvider";
import { Figure, Notes } from "@/components/Figure";
import { IArrowUpRight, IGithub } from "@/components/Icons";

/* Table 2: three tiers, three treatments. Featured products get a plate and a case study; technical projects are ledger rows; experiments are footnotes. */
export function Projects() {
  const { ask } = useAgent();
  const rt = featuredProjects[0] as (typeof featuredProjects)[number] & { screenshots?: { src: string; alt: string }[] };
  return (
    <Figure
      id="projects"
      n={2}
      kind="Table"
      title="Not all projects are equal, so they aren't shown equally."
      lede="Featured products get full case studies. Technical projects are shipped systems from professional work. Experiments are labelled as what they are."
    >
      {/* Featured */}
      <div className="grid gap-8 lg:grid-cols-2">
        {featuredProjects.map((p, i) => {
          const shots = (p as typeof rt).screenshots;
          return (
            <article key={p.id} className="plate rounded-sm p-5">
              {shots?.[0] ? (
                <Link href={`/projects/${projectSlug(p.id)}`} className="block overflow-hidden rounded-sm border border-rule">
                  <Image src={shots[0].src} alt={shots[0].alt} width={1600} height={860} className="w-full transition duration-500 hover:scale-[1.02]" />
                </Link>
              ) : (
                <SelfPlate />
              )}
              <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-serif text-3xl">{p.name}</h3>
                <span className="text-[13px] text-curve-a">{p.statusLabel}</span>
              </div>
              <p className="mt-2 text-ink-2">{p.tagline}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/projects/${projectSlug(p.id)}`} className="btn-ink !py-1.5 text-[14px]">
                  Explore {p.name.split(" ")[0]} <IArrowUpRight />
                </Link>
                <button onClick={() => void ask(`What is ${p.name.split(" /")[0]}?`)} className="btn-line !py-1.5 text-[14px]">
                  Ask Priyanshu AI
                </button>
                {p.links?.github && (
                  <a href={p.links.github} target="_blank" rel="noreferrer" className="btn-line !py-1.5 text-[14px]">
                    <IGithub /> GitHub
                  </a>
                )}
              </div>
              <span className="sr-only">{i}</span>
            </article>
          );
        })}
      </div>

      {/* Technical: ledger */}
      <div className="mt-12">
        <table className="ledger">
          <thead>
            <tr>
              <th className="w-[24%]">Technical project</th>
              <th>What it did</th>
              <th className="w-[22%]">Where</th>
              <th className="w-[16%]">Status</th>
            </tr>
          </thead>
          <tbody>
            {technicalProjects.map((p) => {
              const role = p.experienceRef ? roleById(p.experienceRef) : undefined;
              return (
                <tr key={p.id}>
                  <td>
                    <div className="font-serif text-lg">{p.name}</div>
                    <div className="mt-1 text-[13px] text-ink-3">{p.technologies.join(" · ")}</div>
                  </td>
                  <td data-label="What it did" className="text-[15px] text-ink-2">
                    {p.tagline}
                    {p.outcome && <span className="block text-ink-3">{p.outcome}</span>}
                  </td>
                  <td data-label="Where" className="text-[14px] text-ink-2">
                    {role ? (
                      <Link href={`/#experience`} className="hover:underline">
                        {role.organization}
                        <span className="block tnum text-ink-3">{role.period}</span>
                      </Link>
                    ) : null}
                  </td>
                  <td data-label="Status" className="text-[14px] text-ink-2">{p.statusLabel}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Experiments: footnotes */}
      <Notes
        items={experimentProjects.map((p, i) => ({
          n: `e${i + 1}`,
          text: (
            <>
              <span className="text-ink">{p.name}</span> <span className="text-curve-a">[{p.statusLabel.toLowerCase()}]</span> {p.tagline}
            </>
          ),
        }))}
      />
    </Figure>
  );
}

/* Plate for this site itself: a small drawing of the figure-sheet hero, not a screenshot. */
function SelfPlate() {
  return (
    <svg viewBox="0 0 400 215" className="w-full rounded-sm border border-rule bg-paper" role="img" aria-label="Diagram of this portfolio: a plotted curve with an annotation callout">
      <line x1="28" y1="16" x2="28" y2="180" stroke="var(--ink)" strokeWidth="1" />
      <line x1="28" y1="180" x2="385" y2="180" stroke="var(--ink)" strokeWidth="1" />
      <path d="M45 170 C 90 165, 110 150, 140 120 S 210 85, 240 95 S 300 110, 320 100 S 360 45, 375 35" fill="none" stroke="var(--curve-a)" strokeWidth="2" />
      {[
        [45, 170],
        [140, 120],
        [240, 95],
        [320, 100],
        [375, 35],
      ].map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r="3.5" fill="var(--paper)" stroke="var(--curve-a)" strokeWidth="1.6" />
      ))}
      <rect x="60" y="28" width="130" height="46" fill="var(--paper)" stroke="var(--rule)" />
      <line x1="70" y1="52" x2="180" y2="52" stroke="var(--ink)" strokeWidth="1" />
      <rect x="70" y="60" width="28" height="7" fill="none" stroke="var(--rule)" />
      <rect x="102" y="60" width="28" height="7" fill="none" stroke="var(--rule)" />
      <text x="70" y="44" fontSize="8" fontFamily="var(--font-serif)" fontStyle="italic" fill="var(--ink-2)">ask about any point</text>
      <text x="380" y="200" textAnchor="end" fontSize="8" fontFamily="var(--font-serif)" fontStyle="italic" fill="var(--ink-2)">systems understood</text>
    </svg>
  );
}
