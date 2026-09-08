"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { scrollIntoViewRespectingMotion } from "@/lib/scroll";
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
            scrollIntoViewRespectingMotion(el, { block: "start" });
            el.classList.remove("flash");
            void el.offsetWidth;
            el.classList.add("flash");
          } else {
            router.push(`/#${a.section}`);
          }
        } else if (a.type === "highlight_dimensions") {
          /*
           * Marks the regions and nothing else. This used to scroll to Fig. 2 as
           * well, so an answer about one project could hatch three dimensions and
           * carry the reader off to a different figure mid-sentence. Moving the
           * page is what navigate is for; if the agent wants both it asks for both.
           */
          setHighlighted(a.ids);
        } else if (a.type === "open_project") {
          router.push(`/projects/${a.slug}`);
        }
      }
    },
    [router],
  );

  /*
   * Speech has to be stoppable from every control that implies stopping it.
   * cancel() used to be called only when a new answer started speaking, so muting,
   * clearing or closing left the current utterance talking to the end of itself.
   */
  const stopSpeaking = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
  }, []);

  const speak = (text: string) => {
    if (!voiceOutRef.current || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.02;
    window.speechSynthesis.speak(u);
  };

  /** Muting is a request for silence now, not only for the next answer. */
  const setVoiceOutAndHush = useCallback(
    (v: boolean) => {
      voiceOutRef.current = v;
      setVoiceOut(v);
      if (!v) stopSpeaking();
    },
    [stopSpeaking],
  );

  /** Closing the panel puts the agent away, so it stops talking too. */
  const setOpenAndHush = useCallback(
    (v: boolean) => {
      setOpen(v);
      if (!v) stopSpeaking();
    },
    [stopSpeaking],
  );

  // Speech survives React unmounting and route changes; it has to be cancelled explicitly.
  useEffect(() => stopSpeaking, [stopSpeaking]);

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
    stopSpeaking(); // clearing the conversation clears what is being read from it
    setMessages([]);
    setError(null);
    setHighlighted([]);
  }, [stopSpeaking]);

  const value = useMemo(
    () => ({
      open,
      setOpen: setOpenAndHush,
      messages,
      busy,
      error,
      ask,
      reset,
      highlighted,
      setHighlighted,
      voiceOut,
      setVoiceOut: setVoiceOutAndHush,
    }),
    [open, setOpenAndHush, messages, busy, error, ask, reset, highlighted, voiceOut, setVoiceOutAndHush],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
