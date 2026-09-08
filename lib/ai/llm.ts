/**
 * Provider-agnostic LLM client.
 * Talks the OpenAI-compatible chat-completions format over plain fetch, so it works with
 * Cerebras, Gemini (AI Studio's /openai endpoint), OpenRouter, Groq, Mistral, Ollama, etc.
 *
 * Configure the primary with LLM_BASE_URL / LLM_MODEL / LLM_API_KEY, and fallbacks with
 * the same names suffixed _2, _3, _4. They are tried in order; see lib/ai/providers.ts.
 */

import { bench, isBenched, providers, unbench, type Provider } from "./providers";

export type LLMMessage = { role: "system" | "user" | "assistant"; content: string };

export class LLMConfigError extends Error {}

/** The answer, and who actually produced it. */
export type LLMResult = { text: string; provider: string; ms: number };

/**
 * One attempt's failure. `retryable` decides whether the next provider is worth
 * trying: a provider being out of capacity is, a malformed request is not, because
 * every provider would reject it identically.
 */
class AttemptError extends Error {
  constructor(
    message: string,
    readonly retryable: boolean,
    readonly status?: number,
  ) {
    super(message);
  }
}

/*
 * Per attempt, not per request. A provider that hangs must fail over long before
 * the route's own 60s ceiling, or the fallback never gets a turn.
 */
const ATTEMPT_TIMEOUT_MS = 20_000;

async function attempt(p: Provider, messages: LLMMessage[], opts: ChatOpts): Promise<string> {
  const wanted = opts.maxTokens ?? 1200;
  const body: Record<string, unknown> = {
    model: p.model,
    messages,
    temperature: opts.temperature ?? 0.3,
    // A provider whose allowance counts input and output together needs the reply
    // capped too, or a prompt that fits still overruns the budget on the way back.
    max_tokens: p.maxOutput ? Math.min(wanted, p.maxOutput) : wanted,
  };
  if (opts.json) body.response_format = { type: "json_object" };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ATTEMPT_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${p.baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${p.apiKey}` },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (e) {
    // Aborted or the network failed: the next provider may well be fine.
    const aborted = e instanceof Error && e.name === "AbortError";
    throw new AttemptError(aborted ? `${p.name} timed out` : `${p.name} unreachable`, true);
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    /*
     * Every HTTP failure is somebody else's turn. It is tempting to treat 4xx as
     * "the request is wrong, so everyone will reject it", but that is not true of
     * real providers: Google answers 400 to a bad API key, Groq answers 413 to a
     * prompt that Cerebras accepts happily. Status codes describe this provider's
     * opinion, not the request's validity.
     *
     * The cost of being wrong the other way is one wasted call on a fallback; the
     * cost of stopping early is an outage. If they all refuse, the log says why.
     */
    throw new AttemptError(`${p.name} failed (${res.status}): ${text.slice(0, 160)}`, true, res.status);
  }

  const json = await res.json();
  const choice = json?.choices?.[0];
  const content = choice?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new AttemptError(`${p.name} returned an empty response`, true);
  }
  // A reply cut off at the token cap is not a parsing problem, and saying so saves
  // the reader from a "did not return a structured result" that blames the wrong thing.
  // Another provider would truncate at the same cap, so this one is not retryable.
  if (choice?.finish_reason === "length") {
    throw new AttemptError("The model ran out of room before it finished the answer. Try a shorter job description.", false);
  }
  return content;
}

type ChatOpts = { json?: boolean; temperature?: number; maxTokens?: number };

/**
 * Either a fixed set of messages, or a builder that is handed the provider's
 * knowledge-base tier. The builder form lets a smaller provider be asked a smaller
 * prompt without every provider paying for the smallest one's limits.
 */
export type MessagesFor = LLMMessage[] | ((tier: Provider["kbTier"]) => LLMMessage[]);

/**
 * Asks each configured provider in turn until one answers. Providers that failed
 * recently are skipped for a cooldown, so a dead primary costs one visitor a
 * timeout rather than every visitor.
 */
export async function chat(build: MessagesFor, opts: ChatOpts = {}): Promise<LLMResult> {
  const all = providers();
  if (!all.length) {
    throw new LLMConfigError(
      "The AI is not configured yet. Set LLM_API_KEY, LLM_BASE_URL and LLM_MODEL (and optionally the _2 / _3 fallbacks) in .env.local.",
    );
  }

  // Benched providers go last rather than being dropped: if every provider is
  // benched, the least-recently-failed is still better than refusing to answer.
  const ready = all.filter((p) => !isBenched(p.name));
  const order = ready.length ? [...ready, ...all.filter((p) => isBenched(p.name))] : all;

  const failures: string[] = [];
  for (const p of order) {
    const started = Date.now();
    try {
      const messages = typeof build === "function" ? build(p.kbTier) : build;
      const text = await attempt(p, messages, opts);
      unbench(p.name);
      if (failures.length) console.warn(`[llm] ${p.name} served after ${failures.length} failure(s): ${failures.join(" | ")}`);
      return { text, provider: p.name, ms: Date.now() - started };
    } catch (e) {
      if (e instanceof AttemptError && !e.retryable) {
        // Nothing to fall back to: every provider would reject this identically.
        console.error(`[llm] ${p.name} rejected the request: ${e.message}`);
        throw new Error(e.status ? "The model could not accept that request. Try a shorter message." : e.message);
      }
      failures.push(e instanceof Error ? e.message : String(e));
      bench(p.name);
    }
  }

  // The visitor gets a plain sentence; the detail belongs in the server log.
  console.error(`[llm] all ${order.length} provider(s) failed: ${failures.join(" | ")}`);
  throw new Error("Every model provider is unavailable right now. Try again in a moment.");
}

/** Extract the first JSON object from a model reply, tolerating code fences and prose. */
export function extractJson<T = unknown>(text: string): T | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidates = [fenced?.[1], text];
  for (const c of candidates) {
    if (!c) continue;
    const start = c.indexOf("{");
    const end = c.lastIndexOf("}");
    if (start === -1 || end <= start) continue;
    try {
      return JSON.parse(c.slice(start, end + 1)) as T;
    } catch {
      /* try next */
    }
  }
  return null;
}
