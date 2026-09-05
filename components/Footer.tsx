"use client";

import { data } from "@/lib/data";
import { IGithub, IMail } from "./Icons";

export function Footer() {
  const { contact, name, brandIdea } = data.profile;
  return (
    <footer id="contact" className="border-t border-ink">
      <div className="sheet grid gap-8 py-16 md:grid-cols-[1.4fr_1fr]">
        <div>
          <h2 className="h-fig">Talk to the human version too.</h2>
          <div className="mt-6 flex flex-wrap gap-2">
            <a href={`mailto:${contact.email}`} className="btn-ink">
              <IMail /> {contact.email}
            </a>
            <a href={contact.github} target="_blank" rel="noreferrer" className="btn-line">
              <IGithub /> GitHub
            </a>
            <button onClick={() => window.dispatchEvent(new Event("open-off-duty"))} className="btn-line">
              Off duty
            </button>
          </div>
        </div>
        <div className="fig-label self-end text-[14px] leading-relaxed md:text-right">
          {name} · Jaipur.
          <br />
          {brandIdea}
          <br />
          <span className="not-italic font-sans text-ink-3">Every figure and every AI answer on this sheet derives from the same structured data.</span>
        </div>
      </div>
    </footer>
  );
}
