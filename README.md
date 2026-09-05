# Priyanshu Yogi — AI voice portfolio

"Don't read my resume. Talk to it."

A portfolio site where every section, and every answer the AI gives, derives from structured data in `/data/*.json`.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind v4
- Provider-agnostic LLM layer over the OpenAI-compatible chat API (`lib/ai/llm.ts`), default: Gemini free tier
- Structured JSON output for UI actions (navigate, highlight dimensions, open project); no vendor tool-calling
- Web Speech API for voice in/out (browser-native, no keys)
- d3-force for the Priyanshu Graph

## Run

```sh
npm install
cp .env.example .env.local   # add your LLM_API_KEY
npm run dev
```

Get a free Gemini key at https://aistudio.google.com/apikey. To use OpenCode Zen, Groq, OpenRouter or Ollama instead, change `LLM_BASE_URL` and `LLM_MODEL` in `.env.local` (examples in `.env.example`). The site renders fully without a key; only the AI panel and the job-fit analyser need one.

## Source of truth

| File | Drives |
|---|---|
| `data/profile.json` | hero, positioning, skills, the six "tracks" and their evidence, FAQ style answers |
| `data/education.json` | How I got here, The 90-second version |
| `data/experience.json` | experience timeline, About/career story |
| `data/projects.json` | project hierarchy, readTrail and Priyanshu OS case studies |
| `data/interests.json` | rabbit-hole constellation, /off-duty panel |
| `data/knowledge.json` | Priyanshu Graph nodes and links |

Edit the JSON, not the components. The AI system prompt is rebuilt from the same files on every request (`lib/ai/context.ts`).

## AI design notes

- Grounding: the full dataset (a few thousand tokens) is injected into the system prompt. No vector DB is needed at this size; the context builder is isolated so retrieval can be added if the corpus grows.
- Actions are validated server-side against known section ids, dimension ids and project slugs before the UI runs them (`app/api/chat/route.ts`).
- The job-fit analyser (`/api/relevance`) drops any match that does not cite a real dataset id and any project id that does not exist. A fit report with no gaps is treated as suspicious in the UI copy.
- Pasted job descriptions are wrapped as untrusted data and the prompt forbids following instructions inside them.
- Limits: no conversation persistence, browser-native voice quality, free-tier rate limits (surfaced as a friendly error).

## Honesty rules baked into the data

- readTrail is a working MVP (plain JavaScript, Manifest V3), described from `docs/PRODUCT-VISION.md` and the README in its repo.
- Experiments marked `exploring` or `planned` are not shipped work and the AI is told so.
- Nothing in the data comes from anywhere other than the resume, the readTrail repo and the GitHub profile. Update `data/*.json` as reality changes.

## How it was built

Designed and built by Priyanshu Yogi with Claude (Anthropic) doing much of the implementation, and the Impeccable design skill running the design process: product truth in `PRODUCT.md`, a direction round, a written direction contract, an independent finish review, and `DESIGN.md` recorded from the built code afterwards. The commit history reflects the real order of work. Content decisions, the data model, honesty rules (nothing shipped is claimed that is not shipped) and the final calls on design were his.

Practically, that meant Claude in Cowork and Claude Code doing the implementation. All site content lives in `data/*.json` — every page and every AI answer reads from those six files and nothing else. The AI features run on a free-tier LLM through an OpenAI-compatible endpoint; see `.env.example` for the settings and how to switch providers.

## Design system

The UI follows the world recorded in `DESIGN.md` ("the economist's figure sheet"): every section is a numbered Figure or Table, two renditions of one world (`data-theme="sheet"` light, `data-theme="board"` dark, toggled in the nav and remembered in localStorage). `PRODUCT.md` holds product truth. Both were produced with the [Impeccable](https://impeccable.style) skill, installed under `.claude/skills/impeccable` (run `/impeccable` in Claude Code inside this repo; `impeccable detect app components` runs the anti-pattern detector). Fonts are self-hosted OFL files in `app/fonts`.

## Keyboard

- `⌘K` / `Ctrl+K` opens Priyanshu AI
- Type `/off-duty` anywhere on the page for the personal panel
