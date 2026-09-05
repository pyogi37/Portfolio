"use client";

import { useAgent } from "@/components/agent/AgentProvider";

export function AskAbout({ name }: { name: string }) {
  const { ask } = useAgent();
  return (
    <button onClick={() => void ask(`What is ${name}?`)} className="btn-line !py-1.5 text-[14px]">
      Ask Priyanshu AI about {name}
    </button>
  );
}
