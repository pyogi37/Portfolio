import profile from "@/data/profile.json";
import education from "@/data/education.json";
import experience from "@/data/experience.json";
import projects from "@/data/projects.json";
import interests from "@/data/interests.json";
import knowledge from "@/data/knowledge.json";

export type Evidence = { text: string; ref: string };
export type Dimension = {
  id: string;
  label: string;
  items: string[];
  evidence: Evidence[];
};

export type Role = (typeof experience.roles)[number];
export type Project = (typeof projects.projects)[number] & {
  problem?: string;
  outcome?: string;
  experienceRef?: string;
  links?: Record<string, string>;
};
export type GraphNode = (typeof knowledge.nodes)[number];
export type GraphLink = (typeof knowledge.links)[number];

export const data = { profile, education, experience, projects, interests, knowledge };

export const dimensions = profile.dimensions as Dimension[];
export const roles = experience.roles as Role[];
export const allProjects = projects.projects as Project[];

export const featuredProjects = allProjects.filter((p) => p.tier === "featured");
export const technicalProjects = allProjects.filter((p) => p.tier === "technical");
export const experimentProjects = allProjects.filter((p) => p.tier === "experiments");

export function projectById(id: string) {
  return allProjects.find((p) => p.id === id);
}
export function roleById(id: string) {
  return roles.find((r) => r.id === id);
}
export function projectSlug(id: string) {
  return id.replace(/^project:/, "");
}

/** Resolve a dataset ref like "exp:edviron" into a human label + anchor. */
export function resolveRef(ref: string): { label: string; href: string } {
  if (ref.startsWith("exp:")) {
    const r = roleById(ref);
    return { label: r ? `${r.role}, ${r.organization}` : ref, href: `/#experience` };
  }
  if (ref.startsWith("project:")) {
    const p = projectById(ref);
    return {
      label: p ? p.name : ref,
      href: p?.tier === "featured" ? `/projects/${projectSlug(ref)}` : `/#projects`,
    };
  }
  if (ref.startsWith("edu:")) return { label: "Education", href: `/#how-i-got-here` };
  return { label: ref, href: "/" };
}

/** Section ids the AI agent is allowed to navigate to. */
export const SECTION_IDS = [
  "top",
  "how-i-got-here",
  "tracks",
  "experience",
  "projects",
  "graph",
  "rabbit-holes",
  "relevance",
  "contact",
] as const;
export type SectionId = (typeof SECTION_IDS)[number];
