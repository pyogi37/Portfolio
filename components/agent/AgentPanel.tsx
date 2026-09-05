"use client";

import { useEffect, useRef, useState } from "react";
import { useAgent } from "./AgentProvider";
import { IClose, IMic, ISend, ISpeaker, ISpeakerOff } from "@/components/Icons";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EASE } from "@/components/motion/Reveal";

const SUGGESTED = [
  "Is he primarily technical or business?",
  "How did he get into coding without a CS degree?",
  "What is readTrail?",
  "What is he building right now?",
  "What connects economics and engineering for him?",
  "What does Priyanshu do outside work?",
  "What kind of problems does he enjoy?",
  "Tell me something not on his resume.",
];

type Recognition = {
  start: () => void;
  stop: () => void;
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

function getRecognition(): Recognition | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
  const R = w.SpeechRecognition || w.webkitSpeechRecognition;
  return R ? new R() : null;
}

/* The agent lives in the margin of the sheet: a marginalia column, not a chat bubble app. */
export function AgentPanel() {
  const { open, setOpen, messages, busy, error, ask, reset, voiceOut, setVoiceOut } = useAgent();
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recRef = useRef<Recognition | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => setVoiceSupported(!!getRecognition()), []);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy, open]);
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 250);
  }, [open]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const toggleListening = () => {
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      return;
    }
    const rec = getRecognition();
    if (!rec) return;
    rec.lang = "en-IN";
    rec.interimResults = true;
    rec.continuous = false;
    let finalText = "";
    rec.onresult = (e) => {
      let t = "";
      for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
      finalText = t;
      setInput(t);
    };
    rec.onend = () => {
      setListening(false);
      if (finalText.trim()) {
        setVoiceOut(true);
        void ask(finalText);
        setInput("");
      }
    };
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    rec.start();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    void ask(input);
    setInput("");
  };

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)} className="btn-ink fixed bottom-5 right-5 z-40 hidden !rounded-full !px-4 !py-3 md:inline-flex" aria-label="Open Priyanshu AI">
          <IMic /> Talk to it
          <kbd className="ml-1 hidden font-mono text-[11px] opacity-70 sm:inline">⌘K</kbd>
        </button>
      )}

      <motion.aside
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-ink bg-paper"
        initial={false}
        animate={{ x: open ? "0%" : "100%" }}
        transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 260, damping: 30 }}
        aria-hidden={!open}
        aria-label="Priyanshu AI"
      >
        <header className="flex items-start justify-between border-b border-rule px-5 py-4">
          <div>
            <div className="font-serif text-xl italic">Marginalia</div>
            <p className="text-[13px] text-ink-3">Priyanshu AI. Answers only from his structured data, and says when it doesn&apos;t know.</p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setVoiceOut(!voiceOut)} className={`chip !px-1.5 ${voiceOut ? "!bg-ink !text-paper" : ""}`} title={voiceOut ? "Voice replies on" : "Voice replies off"} aria-pressed={voiceOut} aria-label="Read answers aloud">
              {voiceOut ? <ISpeaker /> : <ISpeakerOff />}
            </button>
            <button onClick={reset} className="chip" title="Clear conversation">
              clear
            </button>
            <button onClick={() => setOpen(false)} className="chip !px-1.5" aria-label="Close">
              <IClose />
            </button>
          </div>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          {messages.length === 0 && (
            <div>
              <p className="fig-label text-[14px]">Try one of these, or ask anything.</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {SUGGESTED.map((s) => (
                  <button key={s} onClick={() => void ask(s)} className="chip">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <motion.div
              key={i}
              className={m.role === "user" ? "pl-8" : "pr-4"}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6, filter: m.role === "assistant" ? "blur(4px)" : "blur(0px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              <div className="fig-label text-[12px]">{m.role === "user" ? "You" : "Priyanshu AI"}</div>
              <div className={`mt-1 whitespace-pre-wrap text-[15.5px] leading-relaxed ${m.role === "user" ? "border-l border-ink pl-3 text-ink-2" : "text-ink"}`}>{m.content}</div>
              {m.actions && m.actions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {m.actions.map((a, j) => (
                    <span key={j} className="chip !py-0.5 text-[12px]">
                      {a.type === "navigate" && `→ ${a.section}`}
                      {a.type === "highlight_dimensions" && `hatch: ${a.ids.join(", ")}`}
                      {a.type === "open_project" && `open: ${a.slug}`}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
          {busy && (
            <motion.div className="fig-label text-[14px] text-ink-3" initial={{ opacity: 0 }} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.4, repeat: Infinity }}>
              writing…
            </motion.div>
          )}
          {error && <div className="border border-curve-a bg-[var(--curve-a-soft)] p-3 text-[14px]">{error}</div>}
          <div ref={endRef} />
        </div>

        <form onSubmit={submit} className="border-t border-rule p-4">
          <div className="flex items-center gap-1 border-b border-ink transition-colors focus-within:border-curve-a">
            {voiceSupported && (
              <button type="button" onClick={toggleListening} className={`p-1.5 ${listening ? "text-curve-a" : "text-ink-2 hover:text-ink"}`} title={listening ? "Stop listening" : "Speak your question"} aria-pressed={listening} aria-label="Speak your question">
                <IMic />
              </button>
            )}
            <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder={listening ? "Listening…" : "Ask about his background, projects, or fit…"} className="min-w-0 flex-1 bg-transparent px-1 py-2 text-[15px] outline-none placeholder:text-ink-3 focus-visible:outline-none" disabled={busy} aria-label="Your question" />
            <button type="submit" disabled={busy || !input.trim()} className="p-1.5 text-ink disabled:opacity-30" aria-label="Send">
              <ISend />
            </button>
          </div>
          <p className="mt-2 text-[12px] text-ink-3">Voice uses your browser&apos;s speech engine. Conversations are not stored.</p>
        </form>
      </motion.aside>
    </>
  );
}
