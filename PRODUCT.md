# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: technical hiring managers and engineering leads screening candidates for Forward Deployed Engineer, AI Engineer, AI Solutions Engineer, Solutions Architect and technical product roles. They arrive from a resume, a LinkedIn message or a referral, give the page two to three minutes, and decide whether to interview. They are skeptical of AI-generated polish and want evidence: what was actually built, deployed, sold, and what the person can explain.

Secondary: recruiters and talent teams matching a job description against the profile. They need the fit answer fast and are the main users of the job-description analyser.

Tertiary: founders and small AI teams hiring a first customer-facing engineer who must both build and sell. (Confirmed as "mix, weighted to technical leads".)

## Product Purpose

An interactive portfolio for Priyanshu Yogi that replaces the static resume with something a visitor can interrogate. Every section and every AI answer derives from structured data in `/data/*.json`. Success: a technical lead leaves believing Priyanshu can understand a messy real-world problem, design and build a working system, deploy it with customers, and explain the tradeoffs; and they book a conversation.

## Positioning

"Don't read my resume. Talk to it." A voice-capable agent grounded strictly in Priyanshu's structured experience, which can navigate the site, light up evidence, and analyse a pasted job description while reporting gaps honestly. The differentiating claim is a non-linear path: Economics and Political Science at Delhi University, self-taught software engineering, enterprise computer-vision solutioning across 50+ opportunities in 7 countries, and now agents, RAG and voice. Internal storytelling principle (not a slogan to plaster): "I like understanding systems, then building them." Motif: human systems → software systems → intelligent systems.

## Operating Context

Visitors open it on a laptop from an email or LinkedIn, often alongside the PDF resume. Some open on a phone from a chat message. The AI runs on free-tier models (Gemini by default, OpenAI-compatible endpoint), so latency is a few seconds and rate limits happen; the site must be complete and credible with the AI panel closed. Voice uses the browser's Web Speech API.

## Capabilities and Constraints

- Sections: hero, "The 90-second version" (turning points), "How I got here" (humanities vs self-taught education), "More than one track" (six overlapping dimensions with cited evidence), About in six moves, experience timeline (Edviron, Project Dark Horse, HawkVision x2), three-tier project hierarchy (featured / technical / experiments), readTrail case study page, Priyanshu OS case study page, Priyanshu Graph (force-directed, draggable), rabbit-hole constellation, `/off-duty` panel, "Why am I relevant to your role?" job-description analyser, contact.
- Priyanshu AI: chat + voice, grounded in `/data/*.json`, returns validated UI actions (navigate, highlight dimensions, open project). No conversation persistence.
- Stack: Next.js 15 App Router, TypeScript, Tailwind v4, d3-force. No CMS. Content edits happen in JSON.
- Honesty constraints: projects marked `exploring` or `planned` are never presented as shipped. readTrail is a working MVP in plain JavaScript (Manifest V3). No invented metrics, employers, or personal facts. No phone number on the public site.
- Terminology: "tracks" or "dimensions" for the six overlapping areas; "Priyanshu AI" for the agent; "readTrail" (lower-case r, capital T) for the product.
- Undecided: final domain; whether Framer-generated visuals will be added later (owner said "Framer for visuals only, later").

## Brand Commitments

- Name: Priyanshu Yogi. GitHub handle pyogi37. Location: Jaipur, India.
- Voice: concise, slightly informal, candid, specific. Third person when the AI speaks about him. No em dashes. No marketing fluff, no "passionate about".
- Headline is fixed: "Don't read my resume. Talk to it."
- The site should feel curious, technical, product-minded, comfortable with people, self-directed, multi-disciplinary; not a generic "AI engineer" template.

## Evidence on Hand

- Resume PDF (source of all experience facts, metrics and dates).
- readTrail repository: `docs/PRODUCT-VISION.md`, README, sprint docs, four real screenshots in `public/readtrail/`.
- GitHub profile bio and philosophy line: "The best technical solution is not merely the most sophisticated one. It is the one that survives contact with users, infrastructure, commercial constraints, and deployment reality."
- Absent, must not be fabricated: testimonials, logos of customers (HawkVision customers are not named), photos of Priyanshu, live demo videos, code for the "exploring/planned" experiments.

## Product Principles

1. Evidence over adjectives: every claim links to a dated role or a repository artifact.
2. The agent is a demonstration, not a gimmick: grounding, validation and honest gaps are the point.
3. The non-linear path is an advantage to be shown, not a gap to be explained.
4. Complete without the AI: the page must persuade with the panel closed and on a phone.
5. Personality in small doses: scattered, specific, never a bio dump.

## Accessibility & Inclusion

Keyboard access to every interactive element (graph nodes, constellation, panel). Reduced-motion respected for drift, force layout and transitions. Voice is optional; every voice path has a text equivalent. Colour is never the only carrier of state.
