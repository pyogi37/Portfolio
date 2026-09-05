import Link from "next/link";
import { resolveRef } from "@/lib/data";
import { Reveal, DrawnRule } from "@/components/motion/Reveal";

/**
 * Every section of the site is a numbered figure or table on the sheet.
 * The number carries information: the AI and the footnotes refer to figures by it.
 */
export function Figure({
  id,
  n,
  kind = "Fig.",
  title,
  lede,
  children,
  aside,
}: {
  id: string;
  n: number;
  kind?: "Fig." | "Table";
  title: React.ReactNode;
  lede?: React.ReactNode;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <section id={id} className="figure scroll-mt-20" aria-labelledby={`${id}-title`}>
      <DrawnRule className="mb-8" />
      <Reveal as="header" className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <h2 id={`${id}-title`} className="h-fig">
            <span className="fig-label mr-3 text-[0.55em] align-middle">
              {kind} {n}
            </span>
            {title}
          </h2>
          {lede && <p className="lede">{lede}</p>}
        </div>
        {aside && <div className="text-[15px] text-ink-2 md:max-w-xs md:text-right">{aside}</div>}
      </Reveal>
      <Reveal className="mt-10" delay={0.1}>{children}</Reveal>
    </section>
  );
}

/** Superscript citation to a dataset id, like a footnote marker. */
export function Cite({ refId, n }: { refId: string; n?: number | string }) {
  const r = resolveRef(refId);
  return (
    <Link href={r.href} className="cite" title={r.label}>
      {n ?? "†"}
    </Link>
  );
}

/** Footnotes block under a figure. */
export function Notes({ items }: { items: { n: number | string; text: React.ReactNode; refId?: string }[] }) {
  return (
    <ol className="mt-8 max-w-[68ch] space-y-1.5 border-t border-rule pt-4 text-[14px] leading-snug text-ink-2">
      {items.map((it) => (
        <li key={String(it.n)} className="flex gap-2">
          <span className="fig-label w-6 shrink-0 text-right">{it.n}</span>
          <span>
            {it.text}
            {it.refId && (
              <>
                {" "}
                <Link href={resolveRef(it.refId).href} className="text-curve-b hover:underline">
                  {resolveRef(it.refId).label}
                </Link>
              </>
            )}
          </span>
        </li>
      ))}
    </ol>
  );
}
