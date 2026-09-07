---
name: update-portfolio
description: Update the Priyanshu portfolio's content, evidence, projects, roles, education, interests, knowledge graph, and AI-visible facts while preserving its data-driven model and established product and visual constraints.
---

# Update the portfolio

The portfolio is a Next.js 15 app in the `priyanshu-portfolio` folder (connect it if it is not). Every section and every AI answer renders from six JSON files in `/data`. The visual world is recorded in `DESIGN.md`, product truth in `PRODUCT.md`. The rule that makes this site work: change the data, not the components, and never invent a fact.

## Step 1: Locate the change in the data model

| What changed                                                                                          | File                   | Notes                                                                                                                                                                                                                                                                                             |
| ----------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identity, headline, positioning, target roles, skills, the six tracks and their evidence, FAQ answers | `data/profile.json`    | Evidence items cite ids (`exp:...`, `project:...`, `edu:...`). Add evidence when a new role or project supports a track.                                                                                                                                                                          |
| Education, the 7 turning points on Fig. 1 (`storyView`), the journey line                             | `data/education.json`  | `storyView` must stay at exactly 7 entries; Fig. 1 plots them. Changing one means also updating `NOTES` in `components/sections/Hero.tsx` (the only copy that lives in a component).                                                                                                              |
| Roles, dates, bullets, tech, the six-move career story                                                | `data/experience.json` | `start`/`end` are `YYYY-MM` and drive the Fig. 3 time axis. If a new role ends after mid 2026, raise `T1` in `components/sections/Experience.tsx`. Keep metrics exactly as the resume states them.                                                                                                |
| Projects (featured / technical / experiments), case-study content, status labels                      | `data/projects.json`   | Tiers: `featured` gets a full case-study page at `/projects/<slug>`; `technical` is a ledger row; `experiments` is a footnote. Status values in use: `working-mvp`, `in-progress`, `shipped`, `shipped-internal`, `signed-off`, `exploring`, `planned`. Never mark something shipped that is not. |
| Interests, off-duty list, rabbit-hole notes                                                           | `data/interests.json`  | Rabbit-hole positions are seeded in `components/sections/RabbitHoles.tsx` by id; add a seed for a new id.                                                                                                                                                                                         |
| Knowledge graph nodes and links                                                                       | `data/knowledge.json`  | Add a node for any new project or role and at least two links; node `ref` should point at the dataset id.                                                                                                                                                                                         |

Case-study screenshots go in `public/<project>/` and are referenced from the project's `screenshots` array. Featured projects also need a route slug: the slug is the id without `project:`.

## Step 2: Apply the change honestly

- Ask Priyanshu for the facts if they are not in the request (dates, what shipped, metrics). Do not fill gaps.
- Keep his voice: concise, slightly informal, specific, no em dashes, no marketing adjectives.
- When a project is promoted (experiment to technical, technical to featured), also add or update: a knowledge-graph node and links, a track evidence item in `profile.json`, and the FAQ answer for "What is he building right now?".
- When a role is added or ended, also update: `careerStory` in `experience.json` if the narrative changes, the relevant track evidence, and `currentDirection` / `currentlyBuilding` in `profile.json` if they no longer hold.

## Step 3: Check the AI still knows

The agent's system prompt is rebuilt from the JSON on every request (`lib/ai/context.ts`), so no prompt edit is needed for content. Only touch `lib/ai/context.ts` if a new section id or dimension id is introduced (then also `SECTION_IDS` in `lib/data.ts` and the sanitiser in `app/api/chat/route.ts`). Never add a new project slug to `open_project` unless it has a featured page.

## Step 4: Verify

1. `npx tsc --noEmit` and `npm run build` must pass. JSON is imported with types, so a shape mistake fails here.
2. Run the dev server and check the sections the change touches at 1440 and 390 wide, both renditions (sheet and board). Featured project pages: open `/projects/<slug>`.
3. If the change added UI (a new figure, a new component) rather than data, use the Impeccable skill (`/impeccable polish` on the changed target, then `impeccable detect app components`) and follow `DESIGN.md`: figures are numbered, no eyebrow labels above headings, drawn icons from `components/Icons.tsx`, motion through `components/motion/Reveal.tsx` or `motion/react` with a reduced-motion path. Renumber figures if one is inserted; the agent's section guide in `lib/ai/context.ts` lists them.
4. With an `LLM_API_KEY` in `.env.local`, ask the agent one question about the changed fact and one job-description fit check that should cite it; confirm the citation ids resolve.

## Step 5: Ship

- One real commit per logical change, message says what changed and why ("Add Site-to-Spec as featured project; promote from experiments"). No backdating.
- If `DESIGN.md` or `PRODUCT.md` are affected (new surface, new constraint), update them in the same commit.
- Report what changed, what was verified, and anything still unverified (for example, no API key available).

## Do not

- Hard-code content in components.
- Add customer names, deal values, or anything from HawkVision customer data.
- Present `exploring` or `planned` work as shipped, or round metrics up.
- Change the visual world, fonts, or motion grammar as a side effect of a content update.
