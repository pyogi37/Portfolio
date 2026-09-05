import Link from "next/link";
import { data, resolveRef } from "@/lib/data";

/* The reading between the figures: six moves, set as prose with marginal numbers. */
export function About() {
  const story = data.experience.careerStory;
  const { positioning } = data.profile;
  return (
    <section id="about" className="figure !pt-0" aria-labelledby="about-title">
      <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
        <h2 id="about-title" className="h-fig md:sticky md:top-24 md:self-start">
          A non-linear path, in six moves.
        </h2>
        <ol className="prose-measure space-y-7">
          {story.map((s, i) => (
            <li key={s.phase} className="grid grid-cols-[2.2rem_1fr] gap-3">
              <span className="fig-label pt-1 text-right text-lg">{i + 1}</span>
              <div>
                <h3 className="font-serif text-xl">{s.phase}</h3>
                <p className="mt-1 text-[16px] leading-relaxed text-ink-2">
                  {s.text}
                  {s.refs.map((r) => {
                    const x = resolveRef(r);
                    return (
                      <Link key={r} href={x.href} className="cite" title={x.label}>
                        †
                      </Link>
                    );
                  })}
                </p>
              </div>
            </li>
          ))}
          <li className="grid grid-cols-[2.2rem_1fr] gap-3">
            <span />
            <p className="text-[15px] text-ink-3">
              Roles he is looking at: {positioning.targetRoles.join(", ")}.
            </p>
          </li>
        </ol>
      </div>
    </section>
  );
}
