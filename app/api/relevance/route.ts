import { NextResponse } from "next/server";
import { chat, extractJson, LLMConfigError } from "@/lib/ai/llm";
import { relevanceSystemPrompt } from "@/lib/ai/context";
import { clientIp, rateLimit } from "@/lib/ai/rate-limit";
import { allProjects, roles } from "@/lib/data";
import type { RelevanceResult } from "@/lib/ai/types";

export const runtime = "nodejs";
/* A long assessment on a free-tier model takes its time; 20-25s is normal here. */
export const maxDuration = 60;

const KNOWN_REFS = new Set<string>([
  ...roles.map((r) => r.id),
  ...allProjects.map((p) => p.id),
  "edu:du",
  "edu:coding-ninjas",
  "edu:self",
]);
const PROJECT_IDS = new Set(allProjects.map((p) => p.id));

/*
 * A fit check is a heavier call than a chat turn and a visitor needs very few of
 * them, so this route takes the smaller share. Chat 30 plus this 12 stays under
 * the provider's 50 a day with room to spare.
 */
const LIMITS = { perIpPerMinute: 3, perIpPerDay: 5, globalPerDay: 12 };

const str = (v: unknown, max = 400) => (typeof v === "string" ? v.slice(0, max) : "");
const arr = (v: unknown) => (Array.isArray(v) ? v : []);

/** Drop anything that cites an id we do not have. A match without evidence is not a match. */
function sanitize(r: Partial<RelevanceResult> | null): RelevanceResult {
  const cited = (items: unknown) =>
    arr(items)
      .map((x) => ({ claim: str((x as { claim?: unknown })?.claim), evidence: str((x as { evidence?: unknown })?.evidence), ref: str((x as { ref?: unknown })?.ref, 80) }))
      .filter((x) => x.claim && KNOWN_REFS.has(x.ref))
      .slice(0, 8);
  return {
    roleSummary: str(r?.roleSummary),
    overall: str(r?.overall, 800),
    strongMatches: cited(r?.strongMatches),
    transferable: cited(r?.transferable),
    gaps: arr(r?.gaps)
      .map((g) => ({ requirement: str((g as { requirement?: unknown })?.requirement), note: str((g as { note?: unknown })?.note) }))
      .filter((g) => g.requirement)
      .slice(0, 10),
    relevantProjects: arr(r?.relevantProjects)
      .map((p) => ({ id: str((p as { id?: unknown })?.id, 80), why: str((p as { why?: unknown })?.why) }))
      .filter((p) => PROJECT_IDS.has(p.id))
      .slice(0, 5),
    questionsToAsk: arr(r?.questionsToAsk).map((q) => str(q)).filter(Boolean).slice(0, 6),
  };
}

export async function POST(req: Request) {
  const limit = rateLimit(clientIp(req), LIMITS);
  if (!limit.ok) {
    return NextResponse.json({ error: limit.message }, { status: 429, headers: { "retry-after": String(limit.retryAfter) } });
  }

  let jd = "";
  try {
    const body = await req.json();
    jd = typeof body.jobDescription === "string" ? body.jobDescription.trim() : "";
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (jd.length < 80) return NextResponse.json({ error: "Paste a fuller job description (at least a few sentences)." }, { status: 400 });
  jd = jd.slice(0, 8000);

  try {
    const raw = await chat(
      [
        { role: "system", content: relevanceSystemPrompt() },
        { role: "user", content: `<job_description>\n${jd}\n</job_description>\n\nReturn the JSON assessment.` },
      ],
      // A full assessment of a detailed job description runs past 1800 tokens and
      // used to come back cut in half, which read to the visitor as a parse failure.
      { json: true, maxTokens: 3000, temperature: 0.2 },
    );
    const parsed = extractJson<Partial<RelevanceResult>>(raw);
    if (!parsed) return NextResponse.json({ error: "The model did not return a structured result. Try again." }, { status: 502 });
    return NextResponse.json(sanitize(parsed));
  } catch (e) {
    const status = e instanceof LLMConfigError ? 503 : 502;
    return NextResponse.json({ error: e instanceof Error ? e.message : "Model error" }, { status });
  }
}
