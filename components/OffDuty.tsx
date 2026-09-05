"use client";

import { useEffect, useState } from "react";
import { data } from "@/lib/data";
import { IBook, IBoot, ICamera, IClose, IGuitar, IMicStage, IPan } from "./Icons";

const ICON: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  Reading: IBook,
  Photography: ICamera,
  Trekking: IBoot,
  "Rock / grunge": IGuitar,
  Karaoke: IMicStage,
  Cooking: IPan,
};

/** Type "/off-duty" anywhere on the page (outside inputs) or use the footer button. */
export function OffDuty() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let buffer = "";
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "Escape") return setOpen(false);
      if (e.key.length !== 1) return;
      buffer = (buffer + e.key).slice(-9);
      if (buffer === "/off-duty") {
        setOpen(true);
        buffer = "";
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-off-duty", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-off-duty", onOpen);
    };
  }, []);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/40 p-4 sm:items-center" onClick={() => setOpen(false)} role="dialog" aria-modal="true" aria-label="Off duty">
      <div className="plate w-full max-w-sm rounded-sm p-6 shadow-[var(--shadow)]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <div className="fig-label text-[13px]">Marginal note</div>
            <h3 className="font-serif text-2xl">Off duty</h3>
          </div>
          <button onClick={() => setOpen(false)} className="chip !px-1.5" aria-label="Close">
            <IClose />
          </button>
        </div>
        <ul className="mt-4 grid grid-cols-2 gap-2">
          {data.interests.offDuty.map((i) => {
            const Ic = ICON[i.label] ?? IBook;
            return (
              <li key={i.label} className="flex items-center gap-2 border-b border-rule py-2 text-[15px]">
                <Ic className="text-curve-a" /> {i.label}
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-[14px] leading-relaxed text-ink-3">{data.interests.offDutyLine}</p>
      </div>
    </div>
  );
}
