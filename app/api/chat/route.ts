import { NextResponse } from "next/server";
import { chat, extractJson, LLMConfigError } from "@/lib/ai/llm";
import { chatSystemPrompt, DIMENSION_IDS, PROJECT_SLUGS } from "@/lib/ai/context";
import { clientIp, rateLimit } from "@/lib/ai/rate-limit";
import { SECTION_IDS } from "@/lib/data";
import type { AgentAction, ChatMessage } from "@/lib/ai/types";

export const runtime = "nodejs";

const MAX_MESSAGES = 12;
const MAX_CHARS = 2000;

/* Chat is the primary action, so it takes the larger share of the provider's daily free budget. */
const LIMITS = { perIpPerMinute: 5, perIpPerDay: 20, globalPerDay: 30 };

const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * Only let validated actions through to the UI.
 *
 * open_project is the only action that leaves the page, which makes it the one
 * worth gating hardest. Asked "what is he building right now?", the model
 * answered about three projects and returned an open_project for two of them;
 * the client ran both, so the visitor was navigated to one project and then
 * immediately to another, away from the answer they were reading.
 *
 * So it now has to be asked for: at most one, and only when the visitor's own
 * message names that project. A prompt rule would be a request. This is a gate.
 */
function sanitizeActions(raw: unknown, lastUserMessage: string): AgentAction[] {
  if (!Array.isArray(raw)) return [];
  const asked = normalise(lastUserMessage);
  const out: AgentAction[] = [];
  let opened = false;
  for (const a of raw) {
    if (!a || typeof a !== "object") continue;
    const t = (a as { type?: unknown }).type;
    if (t === "navigate") {
      const s = (a as { section?: unknown }).section;
      if (typeof s === "string" && (SECTION_IDS as readonly string[]).includes(s)) out.push({ type: "navigate", section: s });
    } else if (t === "highlight_dimensions") {
      const ids = (a as { ids?: unknown }).ids;
      if (Array.isArray(ids)) {
        const ok = ids.filter((i): i is string => typeof i === "string" && DIMENSION_IDS.includes(i));
        if (ok.length) out.push({ type: "highlight_dimensions", ids: ok });
      }
    } else if (t === "open_project" && !opened) {
      const slug = (a as { slug?: unknown }).slug;
      if (typeof slug === "string" && PROJECT_SLUGS.includes(slug) && asked.includes(normalise(slug))) {
        out.push({ type: "open_project", slug });
        opened = true;
      }
    }
    if (out.length >= 2) break;
  }
  return out;
}

export async function POST(req: Request) {
  const limit = rateLimit(clientIp(req), LIMITS);
  if (!limit.ok) {
    return NextResponse.json({ error: limit.message }, { status: 429, headers: { "retry-after": String(limit.retryAfter) } });
  }

  let body: { messages?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const msgs = (body.messages ?? [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
  if (!msgs.length || msgs[msgs.length - 1].role !== "user") {
    return NextResponse.json({ error: "Last message must be from the user" }, { status: 400 });
  }

  try {
    // Built per provider: one with a small token allowance gets the lean knowledge base.
    const { text: raw, provider, ms } = await chat((tier) => [{ role: "system", content: chatSystemPrompt(tier) }, ...msgs], { json: true });
    const parsed = extractJson<{ reply?: unknown; actions?: unknown }>(raw);
    const reply = parsed && typeof parsed.reply === "string" ? parsed.reply : raw.trim();
    // Which provider answered, so a fallback is visible rather than silent.
    return NextResponse.json({ reply, actions: sanitizeActions(parsed?.actions, msgs[msgs.length - 1].content), servedBy: provider, ms });
  } catch (e) {
    const status = e instanceof LLMConfigError ? 503 : 502;
    return NextResponse.json({ error: e instanceof Error ? e.message : "Model error" }, { status });
  }
}
