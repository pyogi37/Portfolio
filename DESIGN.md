---
name: Priyanshu Yogi Portfolio
description: A resume drawn as an economics figure, in two renditions of one world (paper sheet, lecture board).
colors:
  # sheet rendition (light, default)
  paper: "#f6f7fa"
  paper-2: "#eef1f7"
  grid: "rgba(64, 104, 190, 0.1)"
  grid-major: "rgba(64, 104, 190, 0.2)"
  ink: "#141a2b"
  ink-2: "#3f4658"
  ink-3: "#7a8194"
  rule: "rgba(20, 26, 43, 0.16)"
  curve-a: "#a8222b"
  curve-b: "#1f4fd8"
  curve-a-soft: "rgba(168, 34, 43, 0.12)"
  curve-b-soft: "rgba(31, 79, 216, 0.12)"
  marker: "#ffe66d"
  marker-ink: "#141a2b"
  # board rendition (dark), same roles, swapped on [data-theme="board"]
  board-paper: "#172420"
  board-paper-2: "#1d2c27"
  board-grid: "rgba(220, 232, 226, 0.07)"
  board-grid-major: "rgba(220, 232, 226, 0.13)"
  board-ink: "#eef3ef"
  board-ink-2: "#c3cfc8"
  board-ink-3: "#8a9891"
  board-rule: "rgba(238, 243, 239, 0.18)"
  board-curve-a: "#ff8a80"
  board-curve-b: "#8fc3ff"
  board-curve-a-soft: "rgba(255, 138, 128, 0.16)"
  board-curve-b-soft: "rgba(143, 195, 255, 0.16)"
  board-marker: "#f7e07a"
  board-marker-ink: "#172420"
typography:
  display:
    fontFamily: "Libre Caslon Text, Iowan Old Style, Palatino Linotype, Georgia, serif"
    fontSize: "clamp(2.2rem, 1rem + 3vw, 3.9rem)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "Libre Caslon Text, Iowan Old Style, Palatino Linotype, Georgia, serif"
    fontSize: "clamp(1.9rem, 1.2rem + 2.4vw, 3rem)"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-0.012em"
  title:
    fontFamily: "Libre Caslon Text, Iowan Old Style, Palatino Linotype, Georgia, serif"
    fontSize: "1.875rem"
    fontWeight: 400
    lineHeight: 1.2
  title-sm:
    fontFamily: "Libre Caslon Text, Iowan Old Style, Palatino Linotype, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1.25
  body:
    fontFamily: "Atkinson Hyperlegible, Segoe UI, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.55
  body-sm:
    fontFamily: "Atkinson Hyperlegible, Segoe UI, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Libre Caslon Text, Iowan Old Style, Palatino Linotype, Georgia, serif"
    fontSize: "14px"
    fontWeight: 400
    fontStyle: italic
    lineHeight: 1.4
  value:
    fontFamily: "JetBrains Mono, ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.4
    fontFeature: "tnum"
rounded:
  none: "0"
  sm: "4px"
  full: "9999px"
spacing:
  grid: "8px"
  grid-major: "80px"
  xs: "6px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "32px"
  section-y: "80px"
  section-y-lg: "112px"
components:
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-line:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.sm}"
    padding: "4px 10px"
  chip-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    padding: "4px 10px"
  plate:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "20px"
  field-underline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.none}"
    padding: "6px 0"
  textarea:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.sm}"
    padding: "16px"
  nav:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-2}"
    height: "52px"
  mark:
    backgroundColor: "{colors.marker}"
    textColor: "{colors.marker-ink}"
    padding: "0 0.15em"
---

# Design System: Priyanshu Yogi Portfolio

## Overview

**Creative North Star: "The Economist's Figure Sheet"**

The site is a resume drawn as an economics figure. The career is a plotted function on two axes, systems understood against systems built, and every other section is a numbered figure or table on the same sheet: Fig. 1 the curve, Table 1 the education ledger, Fig. 2 the overlapping regions, Fig. 3 the time axis, Table 2 the projects, Fig. 4 the force graph, Table 3 the fit check. Text labels are italic serif captions, evidence is a superscript footnote, the AI lives in the margin as marginalia. Nothing on the page is a "card" or a "hero"; it is a plate, a ledger, a note, or a callout.

One world, two renditions. The **sheet** is cool white paper with a faint blue quadrille grid, blue-black ink, and two curve inks (oxblood and cobalt) plus a highlighter-yellow marker. The **board** is the same drawing on a deep slate-green lecture board: chalk-white ink, chalk red and chalk blue, chalk yellow, a dusty grid. Every colour is a role token that swaps at `[data-theme]`; components never know which rendition they are in. The switch is labelled sheet / board, not light / dark.

The world refuses two defaults on purpose: the dark-glow developer hero and the cream-editorial resume. Density is that of a printed figure page: generous section breathing (80 to 112px), tight internal rhythm (8px grid), a 68ch reading measure, and a body quadrille grid that is always visible as a measurement surface, never blurred away.

**Key Characteristics:**
- Every section is a numbered Fig. or Table with an italic serif label; numbers are referenced by footnotes and by the AI.
- Two accent inks only: oxblood (the curve, status, gaps, errors) and cobalt (links, evidence, focus).
- Highlighter yellow appears as a marker swipe behind text and as text selection; it is never a fill.
- Plates are translucent paper over the grid, bordered with a hairline rule, never nested.
- Inputs are a baseline rule, not a box; the ask field sits inside an annotation callout on the figure.
- Motion is one grammar: strokes draw on, notes fade up, nothing bounces.
- Icons are single-stroke line drawings at 1.6 stroke width, sized 18px.

## Colors

A three-ink figure palette on paper: one text ink in three strengths, two curve inks for data and reference, one highlighter, all re-mixed as chalk on the board rendition.

### Primary
- **Oxblood curve ink** (`curve-a`, `#a8222b`; board: chalk red `#ff8a80`): the plotted career curve and its points, the hatch on odd regions, project status labels, the Gaps label in the fit check, error borders (with `curve-a-soft` as the wash), the hover colour on the send arrow, the caret. It is the colour of "this is the data".
- **Cobalt reference ink** (`curve-b`, `#1f4fd8`; board: chalk blue `#8fc3ff`): every in-text link and evidence reference, the superscript citation, "source:" lines, Strong matches, the hatch on even regions, the human-systems axis region, the focus ring, and `accent-color`. It is the colour of "here is where this comes from".

### Secondary
- **Highlighter marker** (`marker`, `#ffe66d`; board: chalk yellow `#f7e07a`): the marker swipe behind the second line of the headline ("Talk to it."), `::selection`, the interest node in the graph, and the one-shot `flash` ring when the AI lights something up. `marker-ink` is the text colour on top of it.

### Neutral
- **Paper** (`paper`, `#f6f7fa`; board `#172420`): the page ground, the nav (at 85% with blur), the agent panel, hollow circle fills, and the base of every plate.
- **Paper 2** (`paper-2`, `#eef1f7`; board `#1d2c27`): a whisper darker; row hover on the experience list at 60%.
- **Grid** (`grid`, `rgba(64,104,190,0.1)` every 8px) and **Grid major** (`grid-major`, `rgba(64,104,190,0.2)` every 80px): the quadrille drawn on `body`. A world material, not decoration.
- **Ink** (`ink`, `#141a2b`; board `#eef3ef`): body text, headings, axes, the solid button, the underline beneath fields, the heavy rule under ledger heads and section notes.
- **Ink 2** (`ink-2`, `#3f4658`; board `#c3cfc8`): figure labels, ledes, nav links, secondary body copy, axis labels, the "software systems" region.
- **Ink 3** (`ink-3`, `#7a8194`; board `#8a9891`): placeholders, footnote metadata, tick years, technology nodes, leader-line dashes, scrollbar thumb.
- **Rule** (`rule`, `rgba(20,26,43,0.16)`; board `rgba(238,243,239,0.18)`): hairline borders on plates, chips, line buttons, ledger rows, nav bottom, panel dividers.

### Named Rules
**The Two Inks Rule.** Oxblood means data (the curve, what is claimed, what is missing). Cobalt means reference (where the claim comes from, where focus is). No third accent; new state is expressed with ink weight, hatch, or the marker, never a new hue.

**The Role Token Rule.** Components use only role tokens (`--ink`, `--paper`, `--curve-a` ...). No component reads `[data-theme]` or hardcodes a rendition colour. The board is a re-inking, not a second design.

**The Marker Rule.** Highlighter is a swipe behind words (gradient from 38% to 88% of the line box) or a selection, at most once per viewport as emphasis. It is never a button fill, badge, or panel background.

## Typography

**Display Font:** Libre Caslon Text, variable 400 to 700, roman and italic (self-hosted; fallback Iowan Old Style, Palatino Linotype, Georgia, serif)
**Body Font:** Atkinson Hyperlegible 400 and 700, roman and italic (self-hosted; fallback Segoe UI, system-ui, sans-serif)
**Label/Mono Font:** JetBrains Mono, variable (self-hosted; fallback ui-monospace, SF Mono, Menlo, monospace), for years, periods, character counts, and the ⌘K kbd

**Character:** A textbook pairing. Caslon draws the figure titles and every caption in italic, the way a figure label is set in a journal; Atkinson carries the reading at a comfortable 17px because the visitor is skimming a dense page in two minutes; JetBrains Mono appears only where a value is a value. Weight is almost always 400: hierarchy comes from size, italic, and colour strength, not boldness. Bold (700) is reserved for the selected organisation name and claim lines inside the fit check.

### Hierarchy
- **Display** (400, `clamp(2.2rem, 1rem + 3vw, 3.9rem)`, 1.02, -0.015em, balanced): the h1 only, sitting on Fig. 1 in the empty top-left of the plot. Second line carries the marker swipe.
- **Headline** (400, `clamp(1.9rem, 1.2rem + 2.4vw, 3rem)`, 1.08, -0.012em, balanced): every Figure and Table title and the footer question. Preceded by the figure label at 0.55em, italic, `ink-2`, aligned middle.
- **Title** (400, 30px): a selected item's name inside a figure (role title, dimension name, featured project name). **Title small** (400, 24px): note headings inside plates and dialogs; the "Marginalia" panel header at 20px italic.
- **Body** (400, 17px, 1.55): the page default. Reading blocks cap at 68ch (`prose-measure`), ledes at 62ch and 18px in `ink-2`, hero notes at 44ch.
- **Body small** (400, 15px or 15.5px, relaxed): plate copy, evidence lists, buttons, nav links, field text. 14px for footnotes, chips labels sit at 13px.
- **Label** (400 italic Caslon, 14 to 15px, `ink-2`): the `fig-label`. Figure numbers, plate headings ("Honest verdict", "Connected to", "Marginal note"), footnote numerals, ledger column heads, axis labels inside SVG (15px axis, 14px points and regions, 13px region names).
- **Value** (JetBrains Mono, 11 to 12px, `tabular-nums`): year ticks, period ranges, character counts, kbd.
- **Citation** (`cite`: italic Caslon at 0.72em, superscript, `curve-b`): a footnote marker after a claim, underlined on hover.

### Named Rules
**The Italic Label Rule.** Anything that names a thing rather than says a thing is set in italic Caslon at 13 to 15px in `ink-2`. There are no uppercase tracked labels anywhere on the sheet; a caption is the label.

**The Weight-Is-Rare Rule.** Titles are regular weight. Bold appears only inside lists to mark the selected row or the claim in a claim/evidence pair.

**The Hyperlegible Value Rule.** Numbers that are read as data (years, periods, counts) are mono with tabular figures; numbers inside prose stay in Atkinson.

## Layout

The page is a single sheet: a `max-w-6xl` (72rem) container with 20px gutters on mobile and 32px from `sm`. Each Figure is a `<section>` with 80px vertical padding, 112px from `sm`, opening with a header that puts the title and lede on the left and an optional aside on the right (`md:grid-cols-[1fr_auto]`, items aligned to the baseline end), then a 40px gap before the figure body.

Two-column figure bodies use asymmetric grids that favour the drawing or the reading, never 50/50 by default: `1fr 1.3fr` (hero notes, fit check), `1fr 1.1fr` (regions), `1.6fr 1fr` (graph, experience detail), `1.4fr 1fr` (footer). Featured project plates are the exception at `lg:grid-cols-2`. Columns collapse to a single stack below `md` (768px) or `lg` (1024px) depending on the figure.

The 8px quadrille is the rhythm: gaps are 6, 8, 12, 16, 20, 32, 40px; plate padding is 20px (12 to 16px for compact plates); chip gap is 6px; button gap is 8px. A heavy `ink` rule (1px) separates a figure's notes from its body; hairline `rule` separates rows.

Fig. 1 is the first viewport: an SVG at `viewBox 0 0 1000 560` (padding l70 r40 t40 b86), capped at 76vh on `md`+, with the headline, the ask callout, and a dashed leader line absolutely positioned at `left 10%, top 6%, width 40%` over the empty top-left of the plot. On mobile the callout stacks above the figure (`flex-col-reverse`), SVG labels hide and numbered points take over with a one-line legend beneath.

Ledgers (`table.ledger`) restack below `md`: `thead` hides, each cell becomes a block preceded by its `data-label` in italic Caslon. Fixed-gutter grids (`md:grid-cols-[230px_1fr]`) keep labels from truncating on the time axis. The agent panel is a fixed right column at `max-w-md` (28rem), full width on mobile; the floating "Talk to it" pill is `md`+ only. The nav is sticky at 52px with `scroll-padding-top: 72px`.

## Elevation & Depth

Flat by default, with depth expressed as paper over grid. A plate is `paper` at 88% over the quadrille with a 1px `rule` border and a 2px backdrop blur, so the grid shows faintly through it: the region is bounded, not lifted. The nav is `paper` at 85% with blur. One shadow token exists and is used in exactly three places where a thing sits on the sheet rather than in it: the solid ink button, the hero ask callout, and the off-duty dialog. There is no hover elevation; hover is a 1px lift on the ink button and a border darkening on line controls.

### Shadow Vocabulary
- **Sheet shadow** (`--shadow: 0 10px 30px -12px rgba(20,26,43,0.25)`; board: `0 12px 34px -12px rgba(0,0,0,0.6)`): the ink button, the annotation callout on Fig. 1, and modal plates. Nowhere else.
- **Marker flash** (`box-shadow: 0 0 0 0 var(--marker)` to `0 0 0 18px transparent`, 1.4s ease-out, once): the AI lighting up a target. A pulse, not a state.

### Named Rules
**The Plate Rule.** A plate is never nested inside another plate. Inside a plate, structure comes from italic labels, hairline rules, and spacing.

**The Grid Shows Through Rule.** Nothing on the sheet is opaque enough to erase the quadrille except the nav bar, the agent panel, the textarea, and image plates. The grid is the measurement surface the figures sit on.

## Shapes

Drafting geometry. Corners are square or barely eased: `rounded-sm` (4px) on plates, buttons, chips, textarea, and image frames; `0` on fields, ledgers, hatched regions, and the panel; `rounded-full` only on the floating "Talk to it" pill and graph legend dots; 8px on the scrollbar thumb. Borders are 1px hairlines in `rule`, promoted to 1px `ink` when they carry meaning (the underline of a field, the head of a ledger, the note separator, the panel edge, the footer top).

Drawn forms follow figure conventions: axes are 1.2px `ink` lines with open arrowheads; the curve is a 2.4px `curve-a` Catmull-Rom path; points are 5px circles (7px selected) filled `paper` with a 2px `curve-a` stroke, filled solid when selected; leader lines are 0.8 to 1px dashed (`2 3` or `3 3`) in `ink-3` or `ink-2`; regions are 1px `ink` circles filled with a 7px hatch pattern rotated in 30 degree steps; time spans are 20px tall `rounded-sm` bars, `ink` when selected and hollow `paper` with a 60% ink border otherwise. Graph nodes are 6/8/10px by type, hollow for technology and domain.

## Components

Character: drafted, quiet, evidenced. Controls look like things drawn on the sheet with the same pen as the figures.

### Buttons
- **Shape:** barely eased (4px); the floating pill is fully round.
- **Ink (primary, `btn-ink`):** solid `ink` on `paper` text, 8px 16px padding, 15px medium, 8px icon gap, carries the sheet shadow. Compact variant `!py-1.5 text-[14px]` in nav and plates. Hover lifts 1px. Disabled at 30 to 40% opacity.
- **Line (secondary, `btn-line`):** transparent (80% paper mix) with a 1px `rule` border, `ink` text, same padding. Hover darkens the border to `ink-2`. Used for GitHub, "Off duty", "Ask Priyanshu AI", "Why am I relevant to your role?".
- **Icon-only:** bare `p-1.5` buttons inside fields (send, mic); colour is `ink` or `ink-2`, turning `curve-a` when active or hovered.
- **Focus:** 2px `curve-b` outline, 3px offset, 2px radius, everywhere.

### Chips
- **Style:** 1px `rule` border, `ink-2` text at 13px, 4px 10px padding, 70% paper mix, 4px radius. Hover darkens border and text to `ink`.
- **State:** selected is inverted (`ink` fill, `paper` text). A chip highlighted by the AI but not selected gets a `curve-a` border. Chips serve as filters (graph types, dimensions), suggested questions, technology tags, related links, and icon-only controls (`!px-1.5`) in panel headers. Action receipts in the chat use `!py-0.5 text-[12px]`.

### Cards / Containers
- **Plate (`plate`):** the only container. 1px `rule` border, `paper` at 88% with 2px blur, 4px radius, 20px padding (12 to 16px compact). Never nested; never shadowed except the hero callout and dialogs. Opens with an italic label, then a serif title.
- **Ledger (`ledger`):** full-width collapsed table. Heads are italic Caslon 400 in `ink-2` with a 1px `ink` bottom rule; cells pad 0.8rem 0.75rem, top aligned, hairline `rule` between rows. Restacks with `data-label` captions below `md`.
- **Notes:** a footnote list under a figure, 14px `ink-2`, hairline top rule, 68ch, numerals in italic Caslon right-aligned in a 1.5rem column; citations link in `curve-b`.

### Inputs / Fields
- **Underline field:** the ask input and the panel composer. No box: transparent background, a 1px `ink` bottom rule shared with its adjacent icon buttons, 15px text, `ink-3` placeholder, `outline-none` (the wrapper's rule is the affordance; focus ring on the button).
- **Textarea:** the one boxed field (fit check). `paper` fill, 1px `rule` border becoming `ink` on focus, 4px radius, 16px padding, resizable vertically. A mono character count with "not stored" sits beneath.
- **Error:** a plate-like block with a 1px `curve-a` border and `curve-a-soft` wash, 14px text. Disabled: 30 to 40% opacity.

### Navigation
- **Style:** sticky, 1px `rule` bottom border, `paper` at 85% with backdrop blur, 10px vertical padding. Wordmark is italic Caslon 17px in `ink`; links are 15px Atkinson in `ink-2`, hover `ink`, hidden below `md`. Right cluster: the rendition switch as a chip (moon/sun icon plus "board"/"sheet" text from `sm`) and a compact ink button "Talk to it".

### Figure (signature)
Every section is `<Figure n kind title lede aside>`: a numbered heading where the label "Fig. 4" or "Table 2" is set at 0.55em italic `ink-2` before the Caslon title, a `lede` at 18px `ink-2` capped at 62ch, and an optional right aside at 15px. Section ids are stable anchors the nav and the AI navigate to.

### Annotation callout (signature)
The Fig. 1 ask input: a plate with the sheet shadow placed on the plot, connected to the selected data point by a dashed leader (`ink-2`, 1px, `3 3`) ending in a 2.5px dot at the plate edge nearest the point. Under it, chips carry suggested questions. This is the primary action of the site and it is drawn as an annotation, not a form.

### Marginalia panel (signature)
The agent is a fixed right-hand column with a 1px `ink` left edge on solid `paper`, sliding in over 300ms. Header: "Marginalia" in italic Caslon 20px with a 13px `ink-3` honesty line. Messages are labelled with italic 12px captions ("You", "Priyanshu AI"); user turns are indented 32px with a 1px `ink` left rule in `ink-2`; answers are 15.5px `ink`. Actions the agent took render as small chips. The composer is an underline field.

### Marker (signature)
`.mark` paints a highlighter band behind inline text using a gradient from 38% to 88% of the line box, `marker-ink` text, cloned across line breaks. On the board it becomes a solid chalk-yellow inline block, since a chalk swipe sits on the board rather than under the ink.

### Citation and footnote (signature)
`<Cite>` renders a superscript italic Caslon numeral or dagger in `curve-b` after a claim, linking to the dataset row. `<Notes>` renders the matching footnotes under the figure. Experiments in Table 2 are footnotes by design: the tier is expressed by the typographic form.

## Do's and Don'ts

### Do:
- **Do** express every new section as a numbered Figure or Table with an italic Caslon label, a lede in `ink-2`, and footnotes for evidence.
- **Do** use only role tokens (`--paper`, `--ink`, `--curve-a`, `--curve-b`, `--marker`, `--rule`) so the board rendition inherits the change for free.
- **Do** keep `curve-a` for data and status and `curve-b` for links, evidence, and focus; if a colour is needed for a new state, use ink weight, a hatch pattern, or the marker first.
- **Do** draw controls with hairlines: 1px `rule` at rest, 1px `ink` when the line carries meaning (a field's baseline, a ledger head).
- **Do** keep type weight at 400 and build hierarchy from size, italic, and `ink` / `ink-2` / `ink-3`.
- **Do** set data numbers (years, periods, counts) in JetBrains Mono with `tabular-nums`.
- **Do** animate with the one grammar: `draw` for strokes (2.2s, `cubic-bezier(0.16, 1, 0.3, 1)`), `fade-up` for notes (0.7s, 6px), `flash` once for AI highlights; honour `prefers-reduced-motion`.
- **Do** restack ledgers and fixed-gutter grids below 768px so nothing truncates; hide SVG labels on small screens and replace them with numbered points and a legend line.
- **Do** keep inline SVG icons single-stroke at 1.6 width, 18px, `currentColor`.

### Don't:
- **Don't** add a third accent hue, gradients, or glows; the world is three inks on paper.
- **Don't** nest a plate inside a plate, or give plates hover shadows; the sheet shadow belongs to the ink button, the hero callout, and dialogs only.
- **Don't** hide or blur away the body quadrille under sections; opaque panels are limited to the nav, the agent column, the textarea, and image frames.
- **Don't** use uppercase tracked labels or kickers above headings; the italic figure label is the caption device.
- **Don't** box an input; fields are a baseline rule (the fit-check textarea is the single bordered exception).
- **Don't** use the highlighter as a fill for buttons, badges, or backgrounds; it is a swipe behind words and the selection colour.
- **Don't** round corners beyond 4px except the floating pill and legend dots.
- **Don't** hardcode a rendition value or branch on `[data-theme]` inside a component; the only rendition-specific rule that exists is the chalk variant of `.mark`.
- **Don't** replace the drawn hero with a photo, a video, or a dark-glow banner; Fig. 1 is the identity.
