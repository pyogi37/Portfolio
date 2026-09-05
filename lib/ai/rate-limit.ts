/*
 * A small in-memory limiter for the two model-backed routes.
 *
 * Both routes are public and run on a free-tier key with a fixed daily budget,
 * so without this they are an open proxy: one visitor with a loop can spend the
 * whole day's quota before anyone else gets to ask a question.
 *
 * Two things about where the counts live, because they decide the numbers:
 *
 * 1. Each route is built as its own function, so it gets its own copy of this
 *    module and its own counters. Nothing is shared between /api/chat and
 *    /api/relevance. That is why each route passes its own share of the daily
 *    budget rather than a single global cap: the shares have to add up to less
 *    than the provider allows, because nothing is there to add them up at
 *    runtime.
 * 2. State lives in the running instance, not in a store. On a site this size
 *    that is usually one warm function and the counts hold; if the platform runs
 *    several instances, each keeps its own tally, so the daily cap is a brake
 *    rather than a guarantee.
 *
 * Swap the map for a shared store (Vercel KV, Upstash) if this ever has to be
 * exact across routes and instances.
 */

const MINUTE = 60_000;
const DAY = 86_400_000;

export type LimitConfig = {
  /** Burst control for one visitor. */
  perIpPerMinute: number;
  /** One visitor's share for the day. */
  perIpPerDay: number;
  /** This route's share of the provider's daily budget, across everyone. */
  globalPerDay: number;
};

const MESSAGES = {
  burst: "That is quicker than the free model can answer. Give it a minute and ask again.",
  perIpDay: "That is today's questions used up on the free tier. Every figure and note on the sheet still works without the AI.",
  globalDay: "The AI has spent its budget for today. Everything else on the sheet still works, and it resets tomorrow.",
};

const GLOBAL_KEY = "*";
/** A flood of unique addresses must not grow the map without bound. */
const MAX_TRACKED = 5000;

const hits = new Map<string, number[]>();

export type RateVerdict = { ok: true } | { ok: false; retryAfter: number; message: string };

/** Timestamps are appended in order, so the list is already sorted. */
function countSince(list: number[], from: number) {
  let n = 0;
  for (let i = list.length - 1; i >= 0 && list[i] > from; i--) n++;
  return n;
}

function dropBefore(list: number[], cutoff: number) {
  let i = 0;
  while (i < list.length && list[i] <= cutoff) i++;
  if (i) list.splice(0, i);
}

function listFor(key: string) {
  let list = hits.get(key);
  if (!list) {
    list = [];
    hits.set(key, list);
  }
  return list;
}

/** Forget addresses whose entries have all aged out. */
function sweep(now: number) {
  if (hits.size <= MAX_TRACKED) return;
  for (const [key, list] of hits) {
    if (key === GLOBAL_KEY) continue;
    dropBefore(list, now - DAY);
    if (!list.length) hits.delete(key);
    if (hits.size <= MAX_TRACKED) break;
  }
}

function deny(list: number[], from: number, windowMs: number, message: string, now: number): RateVerdict {
  const oldest = list.find((t) => t > from) ?? now;
  return {
    ok: false,
    retryAfter: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
    message,
  };
}

/**
 * Records a request and says whether it is allowed. A refused request is not
 * recorded, so hammering a closed door does not extend the wait.
 */
export function rateLimit(ip: string, cfg: LimitConfig): RateVerdict {
  const now = Date.now();
  sweep(now);

  const mine = listFor(`ip:${ip}`);
  const everyone = listFor(GLOBAL_KEY);
  dropBefore(mine, now - DAY);
  dropBefore(everyone, now - DAY);

  const minuteFrom = now - MINUTE;
  if (countSince(mine, minuteFrom) >= cfg.perIpPerMinute) {
    return deny(mine, minuteFrom, MINUTE, MESSAGES.burst, now);
  }
  const dayFrom = now - DAY;
  if (countSince(mine, dayFrom) >= cfg.perIpPerDay) {
    return deny(mine, dayFrom, DAY, MESSAGES.perIpDay, now);
  }
  if (countSince(everyone, dayFrom) >= cfg.globalPerDay) {
    return deny(everyone, dayFrom, DAY, MESSAGES.globalDay, now);
  }

  mine.push(now);
  everyone.push(now);
  return { ok: true };
}

/** The caller's address as the platform reports it. Everything unattributable shares one bucket. */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

/** For tests and local checks. */
export function __reset() {
  hits.clear();
}
