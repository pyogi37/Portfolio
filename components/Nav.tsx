"use client";

import Link from "next/link";
import { useAgent } from "./agent/AgentProvider";
import { useTheme } from "./ThemeProvider";
import { IMoon, ISun } from "./Icons";

const LINKS = [
  ["/#how-i-got-here", "Education"],
  ["/#tracks", "Tracks"],
  ["/#experience", "Experience"],
  ["/#projects", "Projects"],
  ["/#graph", "Graph"],
  ["/#relevance", "Fit check"],
];

export function Nav() {
  const { setOpen } = useAgent();
  const { theme, setTheme } = useTheme();
  return (
    <nav className="sticky top-0 z-30 border-b border-rule bg-paper/85 backdrop-blur">
      <div className="sheet flex items-center justify-between py-2.5">
        <Link href="/" className="font-serif text-[17px] italic text-ink">
          Priyanshu Yogi
        </Link>
        <div className="hidden items-center gap-5 text-[15px] text-ink-2 md:flex">
          {LINKS.map(([href, label]) => (
            <Link key={href} href={href} className="hover:text-ink">
              {label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(theme === "sheet" ? "board" : "sheet")}
            className="chip !px-2 !py-1.5"
            aria-label={theme === "sheet" ? "Switch to the chalkboard rendition" : "Switch to the paper rendition"}
            title={theme === "sheet" ? "Board" : "Sheet"}
          >
            {theme === "sheet" ? <IMoon /> : <ISun />}
            <span className="ml-1.5 hidden sm:inline">{theme === "sheet" ? "board" : "sheet"}</span>
          </button>
          <button onClick={() => setOpen(true)} className="btn-ink !py-1.5 text-[14px]">
            Talk to it
          </button>
        </div>
      </div>
    </nav>
  );
}
