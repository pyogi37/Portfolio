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

/** Only let validated actions through to the UI. */
function sanitizeActions(raw: unknown): AgentAction[] {
  if (!Array.isArray(raw)) return [];
  const out: AgentAction[] = [];
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
    } else if (t === "open_project") {
      const slug = (a as { slug?: unknown }).slug;
      if (typeof slug === "string" && PROJECT_SLUGS.includes(slug)) out.push({ type: "open_project", slug });
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
    const raw = await chat([{ role: "system", content: chatSystemPrompt() }, ...msgs], { json: true });
    const parsed = extractJson<{ reply?: unknown; actions?: unknown }>(raw);
    const reply = parsed && typeof parsed.reply === "string" ? parsed.reply : raw.trim();
    return NextResponse.json({ reply, actions: sanitizeActions(parsed?.actions) });
  } catch (e) {
    const status = e instanceof LLMConfigError ? 503 : 502;
    return NextResponse.json({ error: e instanceof Error ? e.message : "Model error" }, { status });
  }
}
