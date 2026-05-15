// Central content file — all portfolio text lives here.

export const hero = {
  name: "Safi Ullah",
  role: "Software Engineering Student & Full-Stack Developer",
  tagline:
    "I build full-stack web apps, interactive tools, and polished browser-based experiences with a focus on clarity, systems thinking, and user experience.",
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
      "A browser-based 2D momentum skating game built as an interactive portfolio experience. It combines Canvas rendering, procedural terrain, risk/reward route design, power-ups, mobile controls, sound design, and a polished Techno-Oasis visual direction.",
    status: "LIVE",
    tech: ["TypeScript", "Next.js", "React", "Canvas API", "CSS", "Web Audio API"],
    highlights: [
      "Built a custom delta-time game loop without a game engine",
      "Implemented momentum-based skating, jumping, pumping, and speed-sensitive controls",
      "Designed procedural terrain with risk/reward routes, recovery sections, and score-based difficulty",
      "Added power-up systems: Overclock, Focus Mode, Score Surge, and Patch Pulse",
      "Shipped responsive desktop and mobile gameplay with landscape controls, audio feedback, and Techno-Oasis art direction",
    ],
    liveUrl: "/play",
    githubUrl: null,
    caseStudyUrl: null,
  },
  {
    id: "atlas",
    title: "Atlas Resonance Engine",
    description:
      "A distributed content intelligence pipeline that automatically discovers technical signals, synthesizes them into narrative drafts using AI, and publishes approved content to social platforms. Five decoupled microservices handle ingestion, transcription, synthesis, delivery, and orchestration independently — so failures in one layer never cascade to others.",
    status: "LIVE",
    tech: ["TypeScript", "Node.js", "Next.js", "Vercel AI SDK", "Deepgram", "Prisma", "Zod", "node-cron"],
    highlights: [
      "Five-service event-driven architecture — feed-ingestor, transcriber, content-brain, publisher, and orchestrator — where no service has direct knowledge of another",
      "AI at the ingestion layer: Zod-validated structured outputs force the LLM to classify and summarize raw feeds before they reach the database, treating AI as a deterministic pipeline stage",
      "Deepgram speech-to-text pipeline converts voice memos directly into transcripts that enter the synthesis queue, bridging unstructured physical capture and the structured content pipeline",
      "Fault-isolated publisher with zero AI dependencies — external API calls to X and LinkedIn are fully separated from core intelligence, enabling independent retry queues and rate-limit handling",
      "Pure event-router orchestrator with no database or external API dependencies — listens for events, sequences jobs, and keeps all other services completely decoupled",
    ],
    liveUrl: "https://atlas-frontend-sigma.vercel.app/",
    githubUrl: "https://github.com/FeymanMCSQ/atlas",
    caseStudyUrl: null,
  },
  {
    id: "archetype-learning-engine",
    title: "Archetype-Based Learning Engine",
    description:
      "A skill calibration engine that trains learners on targeted micro-skills through adaptive difficulty. Problems are served based on a live performance rating derived from an append-only attempt history, designed to keep learners at their exact edge of competence.",
    status: "LIVE",
    tech: ["TypeScript", "Next.js", "React 19", "Prisma", "Zod", "Vitest"],
    highlights: [
      "Append-only attempt system — skill rating is derived and recomputed from full history, no mutable state",
      "Clean Architecture enforced across all layers: UI → API → Domain → Data, with the domain layer forbidden from touching Prisma or environment variables",
      "Adaptive difficulty calibration that always serves problems at the learner's current performance edge",
      "Micro-interaction design following the Unmistakable Joy Doctrine — kinetic hover states, streak heat systems, and answer-reveal delays engineered for flow",
      "Strict TypeScript throughout with no any allowed; Zod used to make illegal API states unrepresentable",
    ],
    liveUrl: "https://ed-tech-v2-1.vercel.app/",
    githubUrl: "https://github.com/FeymanMCSQ/ed-tech-v2",
    caseStudyUrl: null,
  },
  {
    id: "reddit-sanitizer",
    title: "Reddit Sanitizer",
    description:
      "A Chrome extension that acts as a client-side firewall against Reddit's algorithmic attention mechanics. It restricts navigation to user-defined subreddits and surgically removes infinite feeds, sticky sidebars, and right-rail recommendations — turning Reddit into a focused reference tool.",
    status: "LIVE",
    tech: ["JavaScript", "Chrome Extension (MV3)", "MutationObserver", "History API", "DOM heuristics", "chrome.storage"],
    highlights: [
      "MutationObserver with batched flushing (MAX_BATCH_NODES = 60, FLUSH_DELAY_MS = 120ms) to sanitize Reddit's SPA DOM changes without blocking the main thread",
      "Capture-phase event listeners that preempt Reddit's React routing before it processes navigation clicks",
      "Spatial DOM heuristics using getBoundingClientRect() to identify and strip the right rail — resilient to Reddit's frequent class-name changes",
      "History API hooks (pushState / replaceState) enforcing subreddit boundaries across Reddit's client-side routing",
      "Immediate rule enforcement before chrome.storage.sync resolves, eliminating any flash of unrestricted content",
    ],
    liveUrl: null,
    githubUrl: "https://github.com/FeymanMCSQ/reddit-sanitizer",
    caseStudyUrl: null,
  },
  {
    id: "instagram-sanitizer",
    title: "Instagram Sanitizer",
    description:
      "A Chrome extension that strips Instagram's algorithmic content and enforces a chronological, followed-only feed. It operates across three interception layers — network (GraphQL payload scrubbing), DOM (MutationObserver heuristics), and navigation (History API patching) — to surgically remove Reels, Explore, Suggested Posts, and Sponsored Content.",
    status: "LIVE",
    tech: ["JavaScript (ES6+)", "Chrome Extension (MV3)", "Declarative Net Request", "MutationObserver", "fetch / XHR patching", "Service Workers", "chrome.storage"],
    highlights: [
      "Three-layer defense: intercepts GraphQL responses before they reach the DOM, removes injected elements via MutationObserver heuristics, and blocks SPA navigation to restricted routes",
      "Page context injection — overrides window.fetch and XMLHttpRequest inside Instagram's main world to bypass the Content Script isolated environment",
      "Algorithmic learning mechanism that silently parses GraphQL metadata as the user scrolls, building a persisted cache of followed accounts to improve filter accuracy over time",
      "Secure cross-context messaging pipeline between the isolated content script, injected page context, and extension popup via postMessage and chrome.runtime",
      "Debounced DOM observation to prevent performance bottlenecks from Instagram's frequent React re-renders",
    ],
    liveUrl: null,
    githubUrl: "https://github.com/FeymanMCSQ/insta-sanitize",
    caseStudyUrl: null,
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
    note: "Building responsive interfaces, interactive experiences, and Canvas-rendered browser games.",
    skills: [
      "React",
      "Next.js",
      "TypeScript",
      "JavaScript",
      "CSS",
      "HTML",
      "Canvas API",
      "Responsive UI",
      "Component architecture",
    ],
  },
  {
    label: "Backend",
    note: "Building APIs, server-side logic, validation flows, and application backends.",
    skills: [
      "Node.js",
      "Express",
      "Python",
      "Ruby",
      "Rust",
      "REST APIs",
      "Authentication",
      "Validation",
      "PostgreSQL",
      "Prisma",
    ],
  },
  {
    label: "AI / Data",
    note: "Working with data, machine learning workflows, model evaluation, and AI-assisted product features.",
    skills: [
      "Prompt engineering",
      "Machine learning",
      "Data mining",
      "Fine-tuning",
      "scikit-learn",
      "XGBoost",
      "Model evaluation",
      "Feature engineering",
      "Python",
    ],
  },
  {
    label: "Systems / CS",
    note: "Applying core CS through algorithms, low-level programming, search, and performance-focused problem solving.",
    skills: [
      "C",
      "Data structures",
      "Algorithms",
      "Graph algorithms",
      "A* / Dijkstra",
      "BFS / DFS",
      "MIPS Assembly",
      "Memory management",
      "Bitwise operations",
      "File I/O",
      "Complexity analysis",
    ],
  },
  {
    label: "Tools / Workflow",
    note: "Using practical engineering tools to build, debug, version, and ship software.",
    skills: [
      "Git",
      "GitHub",
      "Docker",
      "VS Code",
      "Linux",
      "npm / pnpm",
      "Browser DevTools",
      "CLI workflows",
      "Deployment",
      "AI-assisted dev",
    ],
  },
];

export const runtimeRushShowcase = {
  description:
    "Runtime Rush is an interactive browser game built to make the portfolio more memorable while also demonstrating real engineering decisions: game loops, procedural generation, input handling, responsive Canvas rendering, mobile controls, sound design, and visual polish.",
  bullets: [
    "Custom Canvas game loop with delta-time movement",
    "Momentum-based skating, jumping, pumping, and power-up systems",
    "Procedural terrain with safe routes, risky reward paths, and score-based difficulty",
    "Responsive desktop and landscape-mobile gameplay",
    "Audio feedback, background music, and polished game feel",
    "Techno-Oasis visual direction with soft sci-fi styling",
  ],
};

export const about = {
  bio: "I'm Safi Ullah, a software engineering student and full-stack developer interested in building software that is useful, clear, and enjoyable to use. My work sits across full-stack web development, interactive systems, AI/data projects, and systems-level problem solving. I like projects where engineering decisions directly shape the user experience.",
  cards: [
    {
      label: "Builder",
      description:
        "I build projects end-to-end — from interface and backend structure to interaction design, testing, and deployment.",
    },
    {
      label: "Product-minded",
      description:
        "I care about whether software solves a real problem, communicates clearly, and feels good to use.",
    },
    {
      label: "Interactive Systems",
      description:
        "I'm interested in games, tools, and interfaces where feedback loops and user experience directly matter.",
    },
  ],
};

export const contact = {
  email: "sssafiullahhh@gmail.com",
  github: "https://github.com/FeymanMCSQ",
  linkedin: "https://www.linkedin.com/in/safi-ullah-80a4912ba",
  resume: "/Safi_Ullah_Project_Based_Resume.pdf",
  cta: "Available for internships, software engineering opportunities, and selected freelance projects.",
};
