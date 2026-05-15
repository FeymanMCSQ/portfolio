// Central content file — replace all [TODO] and placeholder text with real content.
// Do not hardcode content directly in components; edit here instead.

export const hero = {
  name: "[YOUR NAME]",
  role: "Software Engineering Student & Full-Stack Developer",
  tagline:
    "[TODO: One-line positioning statement — what you build and who you build it for]",
};

export const navLinks = [
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Runtime Rush", href: "#runtime-rush" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export type ProjectStatus = "LIVE" | "IN PROGRESS" | "CASE STUDY";

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  tech: string[];
  highlights: string[];
  liveUrl: string | null;
  githubUrl: string | null;
  caseStudyUrl: string | null;
}

export const projects: Project[] = [
  {
    id: "runtime-rush",
    title: "Runtime Rush",
    description:
      "Browser-based 2D momentum skating game with Canvas-rendered terrain, risk/reward routes, and power-ups. Built without a game engine.",
    status: "LIVE",
    tech: ["TypeScript", "Next.js 16", "Canvas API", "React 19"],
    highlights: [
      "Delta-time physics loop with speed-dependent jump arc",
      "Procedural terrain with multi-branch risk/reward routing",
      "Overclock, Focus Mode & Patch Pulse power-up systems",
      "Deterministic progress tracking and full audio pipeline",
    ],
    liveUrl: "/play",
    githubUrl: "#", // TODO: replace with real GitHub URL
    caseStudyUrl: "#", // TODO: replace with real case study URL
  },
  {
    id: "project-2",
    title: "[TODO: Project 2 Title]",
    description:
      "[TODO: 1–2 sentences — what it does and who it's for. Be specific, avoid words like 'powerful' or 'robust'.]",
    status: "LIVE",
    tech: ["[TODO]", "[TODO]", "[TODO]"],
    highlights: [
      "[TODO: Specific technical highlight]",
      "[TODO: Specific technical highlight]",
      "[TODO: Specific technical highlight]",
    ],
    liveUrl: "#", // TODO: real URL or null
    githubUrl: "#", // TODO: real URL or null
    caseStudyUrl: null,
  },
  {
    id: "project-3",
    title: "[TODO: Project 3 Title]",
    description: "[TODO: Short project description]",
    status: "IN PROGRESS",
    tech: ["[TODO]", "[TODO]"],
    highlights: ["[TODO: Key highlight]", "[TODO: Key highlight]"],
    liveUrl: null,
    githubUrl: "#",
    caseStudyUrl: null,
  },
  {
    id: "project-4",
    title: "[TODO: Project 4 Title]",
    description: "[TODO: Short project description]",
    status: "CASE STUDY",
    tech: ["[TODO]", "[TODO]", "[TODO]"],
    highlights: [
      "[TODO: Key highlight]",
      "[TODO: Key highlight]",
      "[TODO: Key highlight]",
    ],
    liveUrl: null,
    githubUrl: "#",
    caseStudyUrl: "#", // TODO: real URL
  },
];

export interface SkillCategory {
  label: string;
  note: string;
  skills: string[];
}

export const skillCategories: SkillCategory[] = [
  {
    label: "Frontend",
    note: "[TODO: Short practical note — e.g. 'Building responsive UIs and Canvas-rendered games']",
    skills: ["React", "Next.js", "TypeScript", "Canvas API", "CSS", "[TODO: add more]"],
  },
  {
    label: "Backend",
    note: "[TODO: Short practical note]",
    skills: ["Node.js", "Python", "[TODO: DB / ORM]", "[TODO: API tools]"],
  },
  {
    label: "AI / Data",
    note: "[TODO: Short practical note]",
    skills: ["[TODO]", "[TODO]", "[TODO]"],
  },
  {
    label: "Systems / CS",
    note: "[TODO: Short practical note]",
    skills: ["[TODO]", "[TODO]", "[TODO]"],
  },
  {
    label: "Tools / Workflow",
    note: "[TODO: Short practical note]",
    skills: ["Git", "GitHub", "[TODO]", "[TODO]"],
  },
];

export const about = {
  bio: "[TODO: 2–3 sentences. Concise professional bio — who you are, what you build, and what you care about. Avoid clichés.]",
  cards: [
    {
      label: "Builder",
      description:
        "[TODO: One-line — what you build or how you approach building]",
    },
    {
      label: "Product-minded",
      description:
        "[TODO: One-line — how you think about user value, not just code]",
    },
    {
      label: "Interactive Systems",
      description:
        "[TODO: One-line — interest in games, interfaces, or complex interactive systems]",
    },
  ],
};

export const contact = {
  email: "todo@example.com", // TODO: replace with real email
  github: "https://github.com/[TODO]", // TODO: replace with real GitHub URL
  linkedin: "https://linkedin.com/in/[TODO]", // TODO: replace with real LinkedIn URL
  resume: "#", // TODO: replace with resume link (PDF or Google Doc)
  cta: "Available for internships, co-ops, and freelance projects.",
};
