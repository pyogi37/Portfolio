import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { featuredProjects, projectSlug, dimensions } from "@/lib/data";
import { AskAbout } from "@/components/AskAbout";
import { Notes } from "@/components/Figure";
import { IArrow, IArrowUpRight, IGithub } from "@/components/Icons";

export function generateStaticParams() {
  return featuredProjects.map((p) => ({ slug: projectSlug(p.id) }));
}

type Any = Record<string, unknown>;
const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

/* A case study is its own figure sheet: plates, numbered figures, a ledger of decisions, footnotes. */
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = featuredProjects.find((x) => projectSlug(x.id) === slug) as (typeof featuredProjects)[number] & Any;
  if (!p) notFound();

  const principles = arr<{ title: string; text: string }>(p.principles);
  const coreFlow = arr<{ step: string; text: string }>(p.coreFlow);
  const states = arr<{ name: string; text: string }>(p.states);
  const decisions = arr<{ decision: string; tradeoff: string }>(p.decisions);
  const notList = arr<string>(p.notList);
  const corePromise = arr<string>(p.corePromise);
  const shipped = arr<string>(p.shipped);
  const roadmap = arr<string>(p.roadmap);
  const openQuestions = arr<string>(p.openQuestions);
  const whatItShows = arr<string>(p.whatItShows);
  const screenshots = arr<{ src: string; alt: string; caption: string }>(p.screenshots);
  const arch = (p.architecture ?? {}) as { stack?: string[]; permissions?: string[]; modules?: { name: string; role: string }[]; dataModel?: string; keyIdeas?: string[] };
  const links = (p.links ?? {}) as Record<string, string>;
  let fig = 0;
  const next = () => ++fig;

  return (
    <main>
      <header className="sheet pt-10 sm:pt-14">
        <Link href="/#projects" className="inline-flex items-center gap-1.5 text-[14px] text-ink-2 hover:text-ink">
          <IArrow className="rotate-180" width={14} height={14} /> Table 2, all projects
        </Link>
        <div className="mt-6 grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-end">
          <div>
            <h1 className="h-display text-[clamp(2.8rem,1.6rem+4.4vw,5.2rem)]">{p.name}</h1>
            <p className="lede text-xl">{p.tagline}</p>
            <p className="fig-label mt-3 text-[15px]">Case study · {p.statusLabel}</p>
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            <a href="#experience" className="btn-ink !py-1.5 text-[14px]">
              Explore {p.name.split(" ")[0]}
            </a>
            <AskAbout name={p.name.split(" /")[0]} />
            <a href="#architecture" className="btn-line !py-1.5 text-[14px]">
              Architecture
            </a>
            {links.github && (
              <a href={links.github} target="_blank" rel="noreferrer" className="btn-line !py-1.5 text-[14px]">
                <IGithub /> GitHub <IArrowUpRight />
              </a>
            )}
          </div>
        </div>
      </header>

      {screenshots[0] && (
        <figure className="sheet mt-10">
          <div className="overflow-hidden border border-ink">
            <Image src={screenshots[0].src} alt={screenshots[0].alt} width={1920} height={1028} className="w-full" priority />
          </div>
          <figcaption className="fig-label mt-2 text-[14px]">
            Fig. {next()} · {screenshots[0].caption}
          </figcaption>
        </figure>
      )}

      {/* The idea */}
      <section className="figure grid gap-10 md:grid-cols-[1fr_1.4fr]">
        <div>
          <p className="fig-label text-[15px]">The idea</p>
          <h2 className="mt-2 font-serif text-3xl leading-snug">{String(p.idea)}</h2>
        </div>
        <div>
          <p className="fig-label text-[15px]">Why I wanted to build it</p>
          <p className="mt-2 text-[17px] leading-relaxed text-ink-2">{String(p.problem)}</p>
          {p.question ? <blockquote className="mt-5 border-t border-b border-ink py-4 font-serif text-2xl italic leading-snug">{String(p.question)}</blockquote> : null}
          {corePromise.length > 0 && (
            <ol className="mt-5 space-y-1.5">
              {corePromise.map((c, i) => (
                <li key={i} className="grid grid-cols-[1.6rem_1fr] gap-2 text-[16px] text-ink-2">
                  <span className="fig-label text-right">{i + 1}</span> <span>{c}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      {/* Philosophy */}
      {principles.length > 0 && (
        <section className="figure !pt-0">
          <h2 className="h-fig">Product philosophy</h2>
          <dl className="mt-8 grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {principles.map((pr) => (
              <div key={pr.title} className="border-t border-ink pt-3">
                <dt className="font-serif text-xl">{pr.title}</dt>
                <dd className="mt-1.5 text-[15.5px] leading-relaxed text-ink-2">{pr.text}</dd>
              </div>
            ))}
          </dl>
          {notList.length > 0 && (
            <p className="mt-8 max-w-[70ch] text-[15.5px] text-ink-2">
              <span className="fig-label">What it is not: </span>
              {notList.map((n, i) => (
                <span key={n}>
                  <s className="decoration-curve-a">{n}</s>
                  {i < notList.length - 1 ? ", " : "."}
                </span>
              ))}
            </p>
          )}
        </section>
      )}

      {/* Core experience */}
      {coreFlow.length > 0 && (
        <section id="experience" className="figure !pt-0">
          <h2 className="h-fig">
            <span className="fig-label mr-3 text-[0.55em] align-middle">Fig. {next()}</span>
            Activate, follow, pause, save, leave, come back.
          </h2>
          <ol className="mt-8 grid gap-x-6 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
            {coreFlow.map((f, i) => (
              <li key={f.step} className="relative border-t border-ink pt-3">
                <span className="fig-label text-[13px]">{i + 1}</span>
                <div className="font-serif text-lg">{f.step}</div>
                <p className="mt-1 text-[14px] leading-relaxed text-ink-2">{f.text}</p>
              </li>
            ))}
          </ol>
          {states.length > 0 && (
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {states.map((s) => (
                <div key={s.name}>
                  <TrailSwatch name={s.name} />
                  <div className="mt-3 font-serif text-xl">{s.name}</div>
                  <p className="text-[15px] text-ink-2">{s.text}</p>
                </div>
              ))}
            </div>
          )}
          {screenshots.length > 1 && (
            <div className="mt-10 grid items-start gap-6 md:grid-cols-3">
              {screenshots.slice(1).map((s) => (
                <figure key={s.src}>
                  <div className="overflow-hidden border border-rule">
                    <Image src={s.src} alt={s.alt} width={1200} height={800} className="w-full" />
                  </div>
                  <figcaption className="fig-label mt-2 text-[13px]">
                    Fig. {next()} · {s.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Product thinking */}
      {decisions.length > 0 && (
        <section className="figure !pt-0">
          <h2 className="h-fig">
            <span className="fig-label mr-3 text-[0.55em] align-middle">Table 1</span>
            Decisions, and what they cost.
          </h2>
          <div className="mt-8">
            <table className="ledger">
              <thead>
                <tr>
                  <th className="w-[34%]">Decision</th>
                  <th>Tradeoff accepted</th>
                </tr>
              </thead>
              <tbody>
                {decisions.map((d) => (
                  <tr key={d.decision}>
                    <td className="font-serif text-lg">{d.decision}</td>
                    <td data-label="Tradeoff accepted" className="text-[15.5px] leading-relaxed text-ink-2">{d.tradeoff}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {openQuestions.length > 0 && <Notes items={openQuestions.map((q, i) => ({ n: `q${i + 1}`, text: <>Still open: {q}</> }))} />}
        </section>
      )}

      {/* Architecture */}
      <section id="architecture" className="figure !pt-0">
        <h2 className="h-fig">
          <span className="fig-label mr-3 text-[0.55em] align-middle">Fig. {next()}</span>
          Technical architecture
        </h2>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
          <div className="min-w-0">
            <div className="fig-label text-[14px]">Stack</div>
            <ul className="mt-2 space-y-1 text-[15.5px] text-ink-2">
              {(arch.stack ?? []).map((s) => (
                <li key={s} className="border-b border-rule py-1.5">{s}</li>
              ))}
            </ul>
            {arch.permissions && (
              <>
                <div className="fig-label mt-5 text-[14px]">Permissions</div>
                <div className="mt-1.5 flex gap-1.5">
                  {arch.permissions.map((x) => (
                    <code key={x} className="chip font-mono">{x}</code>
                  ))}
                </div>
              </>
            )}
            {arch.dataModel && (
              <>
                <div className="fig-label mt-5 text-[14px]">Durable record</div>
                <pre className="mt-1.5 overflow-x-auto border border-rule bg-paper-2 p-3 font-mono text-[12px] leading-relaxed text-ink-2">{arch.dataModel}</pre>
              </>
            )}
          </div>
          <div className="min-w-0">
            <ModuleDiagram modules={arch.modules ?? []} />
            {arch.keyIdeas && (
              <div className="mt-6">
                <div className="fig-label text-[14px]">Design ideas worth noticing</div>
                <ol className="mt-2 space-y-1.5">
                  {arch.keyIdeas.map((k, i) => (
                    <li key={k} className="grid grid-cols-[1.6rem_1fr] gap-2 text-[15.5px] leading-relaxed text-ink-2">
                      <span className="fig-label text-right">{i + 1}</span>
                      <span>{k}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Where AI fits */}
      <section className="figure !pt-0">
        <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
          <h2 className="h-fig">Where AI fits</h2>
          <div className="prose-measure">
            <p className="text-[17px] leading-relaxed">{String(p.whereAIFits)}</p>
            {p.process ? (
              <>
                <div className="fig-label mt-6 text-[14px]">How it is built</div>
                <p className="mt-1 text-[15.5px] leading-relaxed text-ink-2">{String(p.process)}</p>
              </>
            ) : null}
          </div>
        </div>
      </section>

      {/* Shipped / roadmap */}
      {(shipped.length > 0 || roadmap.length > 0) && (
        <section className="figure grid gap-10 !pt-0 md:grid-cols-2">
          <div>
            <h3 className="h-fig text-[1.6rem]">Works today</h3>
            <ul className="mt-4 space-y-1.5 text-[15.5px] text-ink-2">
              {shipped.map((s) => (
                <li key={s} className="grid grid-cols-[1.4rem_1fr] gap-2">
                  <span className="text-curve-b">✓</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="h-fig text-[1.6rem]">Roadmap (planned, not claimed)</h3>
            <ul className="mt-4 space-y-1.5 text-[15.5px] text-ink-2">
              {roadmap.map((s) => (
                <li key={s} className="grid grid-cols-[1.4rem_1fr] gap-2">
                  <span className="text-ink-3">○</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {whatItShows.length > 0 && (
        <section className="figure !pt-0">
          <p className="fig-label text-[15px]">What it says, without saying it</p>
          <p className="mt-2 max-w-[70ch] text-[17px] leading-relaxed">
            {whatItShows.map((w, i) => (
              <span key={w}>
                <span className="mark">{w.split(":")[0]}</span>
                {w.includes(":") ? `:${w.split(":").slice(1).join(":")}` : ""}
                {i < whatItShows.length - 1 ? " " : ""}
              </span>
            ))}
          </p>
          <p className="mt-8 text-[14px] text-ink-3">
            Related tracks: {(p.dimensions as string[]).map((d) => dimensions.find((x) => x.id === d)?.label ?? d).join(", ")} ·{" "}
            <Link href="/#tracks" className="text-curve-b hover:underline">
              see Fig. 2
            </Link>
          </p>
        </section>
      )}
    </main>
  );
}

function TrailSwatch({ name }: { name: string }) {
  const stroke = name === "Saved" ? "var(--marker)" : "var(--curve-a)";
  const opacity = name === "Following" ? 0.35 : 1;
  return (
    <svg viewBox="0 0 200 40" className="w-full" aria-hidden>
      <line x1="0" y1="8" x2="200" y2="8" stroke="var(--rule)" />
      <line x1="0" y1="20" x2="200" y2="20" stroke={stroke} strokeOpacity={opacity} strokeWidth={name === "Following" ? 6 : 8} strokeLinecap="round" />
      <line x1="0" y1="32" x2="150" y2="32" stroke="var(--rule)" />
    </svg>
  );
}

/* The module map, drawn as a figure: content scripts on the page, the service worker as the trust boundary, storage areas beneath. */
function ModuleDiagram({ modules }: { modules: { name: string; role: string }[] }) {
  if (!modules.length) return null;
  return (
    <div>
      <ol className="space-y-2">
        {modules.map((m, i) => (
          <li key={m.name} className="grid grid-cols-[1.6rem_1fr] gap-2 border-b border-rule py-2">
            <span className="fig-label pt-0.5 text-right">{i + 1}</span>
            <div>
              <code className="font-mono text-[13.5px] text-curve-a">{m.name}</code>
              <p className="mt-0.5 text-[15px] leading-relaxed text-ink-2">{m.role}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
