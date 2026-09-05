"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { AgentAction, ChatMessage } from "@/lib/ai/types";

type AgentState = {
  open: boolean;
  setOpen: (v: boolean) => void;
  messages: ChatMessage[];
  busy: boolean;
  error: string | null;
  ask: (text: string) => Promise<void>;
  reset: () => void;
  highlighted: string[]; // dimension ids
  setHighlighted: (ids: string[]) => void;
  voiceOut: boolean;
  setVoiceOut: (v: boolean) => void;
};

const Ctx = createContext<AgentState | null>(null);

export function useAgent() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAgent outside AgentProvider");
  return v;
}

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highlighted, setHighlighted] = useState<string[]>([]);
  const [voiceOut, setVoiceOut] = useState(false);
  const voiceOutRef = useRef(voiceOut);
  voiceOutRef.current = voiceOut;

  const runActions = useCallback(
    (actions: AgentAction[]) => {
      for (const a of actions) {
        if (a.type === "navigate") {
          const el = document.getElementById(a.section);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
            el.classList.remove("flash");
            void el.offsetWidth;
            el.classList.add("flash");
          } else {
            router.push(`/#${a.section}`);
          }
        } else if (a.type === "highlight_dimensions") {
          setHighlighted(a.ids);
          const el = document.getElementById("tracks");
          el?.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (a.type === "open_project") {
          router.push(`/projects/${a.slug}`);
        }
      }
    },
    [router],
  );

  const speak = (text: string) => {
    if (!voiceOutRef.current || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.02;
    window.speechSynthesis.speak(u);
  };

  const ask = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || busy) return;
      setOpen(true);
      setError(null);
      const next: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
      setMessages(next);
      setBusy(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ messages: next.slice(-12) }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || `Request failed (${res.status})`);
        const reply: string = json.reply;
        const actions: AgentAction[] = json.actions ?? [];
        setMessages([...next, { role: "assistant", content: reply, actions }]);
        runActions(actions);
        speak(reply);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        setBusy(false);
      }
    },
    [busy, messages, runActions],
  );

  const reset = useCallback(() => {
    setMessages([]);
    setError(null);
    setHighlighted([]);
  }, []);

  const value = useMemo(
    () => ({ open, setOpen, messages, busy, error, ask, reset, highlighted, setHighlighted, voiceOut, setVoiceOut }),
    [open, messages, busy, error, ask, reset, highlighted, voiceOut],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
