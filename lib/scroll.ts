/*
 * Programmatic scrolling that honours the reader's motion preference.
 *
 * globals.css already sets `scroll-behavior: auto` under prefers-reduced-motion,
 * but an explicit `behavior` in scrollIntoView options overrides the CSS property,
 * so every call that hardcoded "smooth" was quietly defeating it. Passing "auto"
 * instead defers to the stylesheet, and works for the agent panel's own scroll
 * container, which never inherited the rule in the first place.
 */
export function scrollIntoViewRespectingMotion(el: Element, opts: Omit<ScrollIntoViewOptions, "behavior"> = {}) {
  const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ ...opts, behavior: reduce ? "auto" : "smooth" });
}
