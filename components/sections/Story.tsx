"use client";

import { useState } from "react";
import Link from "next/link";
import { data, resolveRef } from "@/lib/data";

export function Story() {
  const steps = data.education.storyView;
  const [i, setI] = useState(0);
  const cur = steps[i];
  const ref = resolveRef(cur.ref);
  return (
    <section id="story" className="section">
      <p className="eyebrow">The 90-second version</p>
      <h2 className="h2">Turning points, not dates.</h2>
      <p className="lede">An intentional evolution, not a perfectly planned one. Click through.</p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <ol className="relative space-y-1 border-l border-line pl-6">
          {steps.map((s, idx) => (
            <li key={s.title}>
              <button
                onClick={() => setI(idx)}
                className={`group relative w-full rounded-xl px-3 py-2.5 text-left transition ${idx === i ? "bg-bg-3" : "hover:bg-bg-2"}`}
              >
                <span
                  className={`absolute -left-[31px] top-4 h-3 w-3 rounded-full border-2 transition ${
                    idx <= i ? "border-accent bg-accent" : "border-line bg-bg"
                  }`}
                />
                <div className={`text-sm font-medium ${idx === i ? "text-ink" : "text-ink-2"}`}>{s.title}</div>
                <div className="text-xs text-ink-3">{s.subtitle}</div>
              </button>
            </li>
          ))}
        </ol>

        <div className="card flex flex-col justify-between">
          <div>
            <div className="font-mono text-xs text-ink-3">
              {String(i + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
            </div>
            <h3 className="mt-2 text-2xl font-semibold">{cur.title}</h3>
            <p className="mt-1 text-accent">{cur.subtitle}</p>
            <p className="mt-4 leading-relaxed text-ink-2">{storyBlurb(i)}</p>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <Link href={ref.href} className="text-sm text-accent-2 hover:underline">
              Evidence: {ref.label} →
            </Link>
            <div className="flex gap-2">
              <button onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0} className="btn-ghost !px-3 !py-1.5 text-xs disabled:opacity-30">
                ←
              </button>
              <button onClick={() => setI(Math.min(steps.length - 1, i + 1))} disabled={i === steps.length - 1} className="btn-primary !px-3 !py-1.5 text-xs disabled:opacity-30">
                next →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function storyBlurb(i: number) {
  const story = data.experience.careerStory;
  // Map the seven turning points onto the six career-story phases.
  const map = [0, 1, 2, 3, 3, 3, 4];
  const extra = [
    "",
    "",
    "Edviron first: a payment system moving 50+ lakh INR a month, and the kind of query-performance problems you only meet in production. Then Project Dark Horse, leading five engineers to ship two products from an ambiguous brief.",
    "Joined HawkVision's core engineering team: dashboards, APIs, computer-vision pipeline integrations, Terraform for deployments.",
    "Owned discovery, feasibility, camera placement, architecture and deployment planning for 12 concurrent enterprise PoCs. Once redrew a customer's relay wiring on site to rescue a failed deployment.",
    "Built the India pipeline from scratch, priced deals, wrote 10+ RFP responses scoped at 1,000+ cameras, supported the CEO on international partnerships. 50+ opportunities across 7 countries.",
    "readTrail is a working MVP. This site is an agent grounded in structured data. The experiments are labelled as experiments.",
  ];
  return extra[i] || story[map[i]].text;
}
