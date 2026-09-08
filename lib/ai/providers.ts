/*
 * The site talks to several OpenAI-compatible providers in order, because every
 * free tier is individually unreliable: one withdrew a model mid-week, one rate
 * limits on every call, one answers 200 and then 503 a minute later. Any single
 * one of them takes the AI down; together they stay up.
 *
 * Ordering is deliberate, not raced per request. Racing every request would burn
 * quota on all providers at once and drain the daily caps that make them useful.
 * `npm run bench:providers` measures latency and JSON compliance against a real
 * prompt, and that is what the order is based on.
 */

export type Provider = {
  name: string;
  baseUrl: string;
  model: string;
  apiKey: string;
};

/** LLM_BASE_URL is the primary; _2 and _3 are the fallbacks, tried in that order. */
const SLOTS = ["", "_2", "_3", "_4"] as const;

function slot(suffix: string): Provider | null {
  const baseUrl = process.env[`LLM_BASE_URL${suffix}`]?.trim();
  const model = process.env[`LLM_MODEL${suffix}`]?.trim();
  const apiKey = process.env[`LLM_API_KEY${suffix}`]?.trim();
  if (!baseUrl || !model || !apiKey) return null;
  return {
    // The host is enough to tell providers apart in a log or a response.
    name: (() => {
      try {
        return new URL(baseUrl).hostname.replace(/^api\./, "").split(".")[0];
      } catch {
        return `provider${suffix || "1"}`;
      }
    })(),
    baseUrl: baseUrl.replace(/\/$/, ""),
    model,
    apiKey,
  };
}

export function providers(): Provider[] {
  return SLOTS.map(slot).filter((p): p is Provider => p !== null);
}

/*
 * A provider that just failed is skipped for a cooldown rather than retried on
 * every request. Without this, a dead primary costs every visitor its timeout
 * before they get an answer from the one that works.
 *
 * State is per instance, like the rate limiter. That is fine here: the worst case
 * is a cold instance paying one timeout to rediscover what a warm one knows.
 */
const BENCH_MS = 5 * 60_000;
const benched = new Map<string, number>();

export function isBenched(name: string, now = Date.now()) {
  const until = benched.get(name);
  if (until === undefined) return false;
  if (until <= now) {
    benched.delete(name);
    return false;
  }
  return true;
}

export function bench(name: string, now = Date.now()) {
  benched.set(name, now + BENCH_MS);
}

export function unbench(name: string) {
  benched.delete(name);
}

/** For tests. */
export function __clearBenches() {
  benched.clear();
}
