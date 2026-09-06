/**
 * Provider-agnostic LLM client.
 * Talks the OpenAI-compatible chat-completions format over plain fetch, so it works with
 * Gemini (AI Studio's /openai endpoint), OpenCode Zen, Groq, OpenRouter, Ollama, etc.
 * Configure with LLM_BASE_URL, LLM_MODEL, LLM_API_KEY.
 */

export type LLMMessage = { role: "system" | "user" | "assistant"; content: string };

export class LLMConfigError extends Error {}

function config() {
  const baseUrl = (process.env.LLM_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai").replace(/\/$/, "");
  const model = process.env.LLM_MODEL || "gemini-2.5-flash";
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) {
    throw new LLMConfigError(
      "The AI is not configured yet. Set LLM_API_KEY (and optionally LLM_BASE_URL / LLM_MODEL) in .env.local.",
    );
  }
  return { baseUrl, model, apiKey };
}

export async function chat(
  messages: LLMMessage[],
  opts: { json?: boolean; temperature?: number; maxTokens?: number } = {},
): Promise<string> {
  const { baseUrl, model, apiKey } = config();
  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: opts.temperature ?? 0.3,
    max_tokens: opts.maxTokens ?? 1200,
  };
  if (opts.json) body.response_format = { type: "json_object" };

  const controller = new AbortController();
  // Sits just inside the routes' maxDuration, so a slow model aborts with our own
  // message rather than the platform killing the function first.
  const timer = setTimeout(() => controller.abort(), 55_000);
  let res: Response;
  try {
    res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    if (res.status === 429) throw new Error("The free-tier model is rate limited right now. Try again in a few seconds.");
    throw new Error(`Model request failed (${res.status}): ${text.slice(0, 200)}`);
  }
  const json = await res.json();
  const choice = json?.choices?.[0];
  const content = choice?.message?.content;
  if (typeof content !== "string") throw new Error("Model returned an empty response.");
  // A reply cut off at the token cap is not a parsing problem, and saying so saves
  // the reader from a "did not return a structured result" that blames the wrong thing.
  if (choice?.finish_reason === "length") {
    throw new Error("The model ran out of room before it finished the answer. Try a shorter job description.");
  }
  return content;
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
