"use client";

import { useState } from "react";
import Link from "next/link";
import type { RelevanceResult } from "@/lib/ai/types";
import { projectById, projectSlug, resolveRef } from "@/lib/data";
import { Figure } from "@/components/Figure";

export function Relevance() {
  const [jd, setJd] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RelevanceResult | null>(null);

  const run = async () => {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/relevance", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jobDescription: jd }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Request failed");
      setResult(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Figure
      id="relevance"
      n={3}
      kind="Table"
      title="Why am I relevant to your role?"
      lede="Paste a job description. The agent reads it against Priyanshu's structured experience and returns strong matches, transferable experience and the gaps. Every match cites its source row. A fit report with no gaps is not trustworthy, so gaps are the point."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <div className="plate rounded-sm p-4">
          <textarea
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            rows={14}
            placeholder="Paste the job description here…"
            className="w-full resize-y rounded-sm border border-rule bg-paper p-4 text-[15px] outline-none placeholder:text-ink-3 focus:border-ink"
          />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[13px] text-ink-3 tnum">{jd.length} characters · not stored</span>
            <button onClick={run} disabled={busy || jd.trim().length < 80} className="btn-ink !py-1.5 text-[14px] disabled:opacity-40">
              {busy ? "Analysing…" : "Analyse fit"}
            </button>
          </div>
          {error && <p className="mt-3 border border-curve-a bg-[var(--curve-a-soft)] p-3 text-[14px] text-ink">{error}</p>}
        </div>

        <div className="space-y-4">
          {!result && !busy && (
            <div className="plate rounded-sm p-5 text-[15px] text-ink-2">
              The ledger has five rows: strong matches, transferable experience, gaps, relevant projects, and questions worth asking him. Nothing is stored.
            </div>
          )}
          {busy && <div className="plate animate-pulse rounded-sm p-5 text-[15px] text-ink-3">Reading the role against the dataset…</div>}
          {result && (
            <>
              <div className="plate rounded-sm p-5">
                <div className="fig-label text-[14px]">The role, as read</div>
                <p className="mt-1 text-[15px] text-ink-2">{result.roleSummary}</p>
                <div className="fig-label mt-4 text-[14px]">Honest verdict</div>
                <p className="mt-1 text-[16px] leading-relaxed">{result.overall}</p>
              </div>
              <Block title="Strong matches" color="text-curve-b" items={result.strongMatches} />
              <Block title="Transferable experience" color="text-ink-2" items={result.transferable} />
              <div className="plate rounded-sm p-5">
                <div className="fig-label text-[14px] text-curve-a">Gaps</div>
                {result.gaps.length === 0 ? (
                  <p className="mt-2 text-[15px] text-ink-3">The model reported no gaps. Treat that with suspicion and ask anyway.</p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {result.gaps.map((g, i) => (
                      <li key={i} className="text-[15px]">
                        <span className="font-bold">{g.requirement}</span> <span className="text-ink-2">· {g.note}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {result.relevantProjects.length > 0 && (
                <div className="plate rounded-sm p-5">
                  <div className="fig-label text-[14px]">Relevant projects</div>
                  <ul className="mt-2 space-y-2">
                    {result.relevantProjects.map((p) => {
                      const proj = projectById(p.id);
                      if (!proj) return null;
                      const href = proj.tier === "featured" ? `/projects/${projectSlug(p.id)}` : "/#projects";
                      return (
                        <li key={p.id} className="text-[15px]">
                          <Link href={href} className="font-serif text-lg hover:underline">
                            {proj.name}
                          </Link>{" "}
                          <span className="ml-1 text-[13px] text-curve-a">{proj.statusLabel}</span>
                          <div className="text-ink-2">{p.why}</div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              {result.questionsToAsk.length > 0 && (
                <div className="plate rounded-sm p-5">
                  <div className="fig-label text-[14px]">Questions to ask Priyanshu</div>
                  <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-[15px] text-ink-2">
                    {result.questionsToAsk.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ol>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Figure>
  );
}

function Block({ title, color, items }: { title: string; color: string; items: { claim: string; evidence: string; ref: string }[] }) {
  return (
    <div className="plate rounded-sm p-5">
      <div className={`fig-label text-[14px] ${color}`}>{title}</div>
      {items.length === 0 ? (
        <p className="mt-2 text-[15px] text-ink-3">Nothing the dataset can back up.</p>
      ) : (
        <ul className="mt-2 space-y-3">
          {items.map((m, i) => {
            const r = resolveRef(m.ref);
            return (
              <li key={i} className="text-[15px]">
                <div className="font-bold">{m.claim}</div>
                <div className="text-ink-2">{m.evidence}</div>
                <Link href={r.href} className="text-[13px] text-curve-b hover:underline">
                  source: {r.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
