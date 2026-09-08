#!/usr/bin/env node
/*
 * Races every configured provider against a realistic prompt and reports latency,
 * reliability and JSON compliance. This is the race the router does NOT run at
 * request time: firing every provider on every visit would burn quota on all of
 * them at once and drain the free daily caps that make them worth having.
 *
 * Run it when a provider misbehaves or a model is withdrawn, then order
 * LLM_* / LLM_*_2 / LLM_*_3 by what it tells you.
 *
 *   node scripts/bench-providers.mjs [runs]
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const RUNS = Number(process.argv[2] || 3);
const ENV_FILE = resolve(process.cwd(), ".env.local");

function loadEnv(path) {
  const out = {};
  let raw = "";
  try {
    raw = readFileSync(path, "utf8");
  } catch {
    console.error(`Could not read ${path}. Run this from the project root.`);
    process.exit(1);
  }
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!m) continue;
    out[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return out;
}

function collectProviders(env) {
  const list = [];
  for (const suffix of ["", "_2", "_3", "_4"]) {
    const baseUrl = env[`LLM_BASE_URL${suffix}`];
    const model = env[`LLM_MODEL${suffix}`];
    const apiKey = env[`LLM_API_KEY${suffix}`];
    if (!baseUrl || !model || !apiKey) continue;
    let name;
    try {
      name = new URL(baseUrl).hostname.replace(/^api\./, "").split(".")[0];
    } catch {
      name = `provider${suffix || "1"}`;
    }
    const maxOutput = Number(env[`LLM_MAX_OUTPUT${suffix}`]);
    list.push({
      slot: suffix || "(primary)",
      name,
      baseUrl: baseUrl.replace(/\/$/, ""),
      model,
      apiKey,
      // Mirrors what the app sends this provider. Benchmarking every provider with
      // the same oversized prompt would fail the ones the app deliberately asks less of.
      kbTier: env[`LLM_KB_TIER${suffix}`] === "lean" ? "lean" : "full",
      maxOutput: Number.isFinite(maxOutput) && maxOutput > 0 ? maxOutput : 400,
    });
  }
  return list;
}

/*
 * The real knowledge base, built the same way lib/ai/context.ts builds it. Synthetic
 * filler of the right length is not good enough: a provider's JSON mode can reject a
 * prompt of repeated nonsense that it would answer happily for real data, which makes
 * the benchmark report a working provider as dead.
 */
const CASE_STUDY_FIELDS = [
  "idea", "problem", "question", "corePromise", "principles", "notList", "coreFlow",
  "states", "decisions", "whereAIFits", "process", "openQuestions", "whatItShows", "architecture",
];

function knowledgeBase(tier) {
  const read = (n) => JSON.parse(readFileSync(resolve(process.cwd(), `data/${n}.json`), "utf8"));
  const [profile, education, experience, projects, interests] = ["profile", "education", "experience", "projects", "interests"].map(read);
  const shaped = projects.projects.map((p) => {
    const { screenshots, ...rest } = p;
    if (tier === "full") return rest;
    const lean = {};
    for (const [k, v] of Object.entries(rest)) if (!CASE_STUDY_FIELDS.includes(k)) lean[k] = v;
    if (rest.architecture?.stack) lean.stack = rest.architecture.stack;
    return lean;
  });
  return JSON.stringify({
    profile,
    education,
    experience,
    projects: { tiers: projects.tiers, projects: shaped },
    ...(tier === "full" ? { interests } : {}),
  });
}

const SYSTEM = {
  full: "You answer questions about this candidate using ONLY this JSON data.\n\nKNOWLEDGE BASE:\n" + knowledgeBase("full"),
  lean: "You answer questions about this candidate using ONLY this JSON data.\n\nKNOWLEDGE BASE:\n" + knowledgeBase("lean"),
};
const USER = 'Is he primarily technical or business? Respond with ONLY a JSON object: {"reply": string, "actions": []}';

async function once(p) {
  const started = Date.now();
  try {
    const res = await fetch(`${p.baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${p.apiKey}` },
      body: JSON.stringify({
        model: p.model,
        messages: [
          { role: "system", content: SYSTEM[p.kbTier] },
          { role: "user", content: USER },
        ],
        temperature: 0.3,
        max_tokens: p.maxOutput,
        response_format: { type: "json_object" },
      }),
      signal: AbortSignal.timeout(30_000),
    });
    const ms = Date.now() - started;
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, ms, status: res.status, note: body.slice(0, 70).replace(/\s+/g, " ") };
    }
    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content ?? "";
    let validJson = true;
    try {
      JSON.parse(content);
    } catch {
      validJson = false;
    }
    return { ok: true, ms, status: 200, validJson, inTokens: json?.usage?.prompt_tokens ?? null };
  } catch (e) {
    return { ok: false, ms: Date.now() - started, status: 0, note: e?.name === "TimeoutError" ? "timeout" : "unreachable" };
  }
}

const median = (xs) => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};

const env = loadEnv(ENV_FILE);
const list = collectProviders(env);
if (!list.length) {
  console.error("No providers found in .env.local (need LLM_BASE_URL, LLM_MODEL, LLM_API_KEY).");
  process.exit(1);
}

console.log(`Benchmarking ${list.length} provider(s), ${RUNS} run(s) each, against the real knowledge base.`);
console.log(`  full = ${SYSTEM.full.length.toLocaleString()} chars   lean = ${SYSTEM.lean.length.toLocaleString()} chars\n`);
const rows = [];
for (const p of list) {
  const results = [];
  for (let i = 0; i < RUNS; i++) results.push(await once(p));
  const okRuns = results.filter((r) => r.ok);
  rows.push({
    slot: p.slot,
    name: p.name,
    tier: p.kbTier,
    model: p.model,
    success: `${okRuns.length}/${RUNS}`,
    medianMs: median(okRuns.map((r) => r.ms)),
    json: okRuns.length ? (okRuns.every((r) => r.validJson) ? "yes" : "partial") : "-",
    inTokens: okRuns[0]?.inTokens ?? null,
    note: results.find((r) => !r.ok) ? `${results.find((r) => !r.ok).status || ""} ${results.find((r) => !r.ok).note || ""}`.trim() : "",
  });
}

const w = {
  slot: Math.max(6, ...rows.map((r) => r.slot.length)) + 2,
  name: Math.max(8, ...rows.map((r) => r.name.length)) + 2,
  model: Math.max(5, ...rows.map((r) => r.model.length)) + 2,
};
const pad = (s, n) => String(s ?? "-").padEnd(n);
const header = pad("slot", w.slot) + pad("provider", w.name) + pad("model", w.model) + pad("kb", 6) + pad("ok", 6) + pad("median", 9) + pad("json", 9) + "note";
console.log(header);
console.log("-".repeat(header.length + 10));
for (const r of rows) {
  console.log(
    pad(r.slot, w.slot) + pad(r.name, w.name) + pad(r.model, w.model) + pad(r.tier, 6) + pad(r.success, 6) + pad(r.medianMs ? `${r.medianMs}ms` : "-", 9) + pad(r.json, 9) + r.note,
  );
}

/* "partial" means the reply was not bare JSON on every run. That is still usable:
   extractJson() in lib/ai/llm.ts pulls the object out of code fences and prose.
   Only a provider that never answered is unusable. */
const usable = rows.filter((r) => r.medianMs !== null).sort((a, b) => a.medianMs - b.medianMs);
console.log("\nSuggested order (fastest first; partial JSON is fine, extractJson handles fences):");
if (!usable.length) console.log("  none answered at all");
usable.forEach((r, i) => {
  const slotName = i === 0 ? "LLM_*" : `LLM_*_${i + 1}`;
  console.log(`  ${slotName.padEnd(8)} ${r.name} / ${r.model}  ${r.medianMs}ms  json=${r.json}  ok=${r.success}`);
});
const dead = rows.filter((r) => r.medianMs === null);
if (dead.length) console.log("\nNot answering: " + dead.map((r) => `${r.name} (${r.note})`).join(", "));
