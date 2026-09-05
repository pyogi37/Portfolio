export type AgentAction =
  | { type: "navigate"; section: string }
  | { type: "highlight_dimensions"; ids: string[] }
  | { type: "open_project"; slug: string };

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  actions?: AgentAction[];
};

export type RelevanceResult = {
  roleSummary: string;
  overall: string;
  strongMatches: { claim: string; evidence: string; ref: string }[];
  transferable: { claim: string; evidence: string; ref: string }[];
  gaps: { requirement: string; note: string }[];
  relevantProjects: { id: string; why: string }[];
  questionsToAsk: string[];
};
