import Link from "next/link";
import type { Project } from "@/content/portfolioContent";
import s from "./ProjectCard.module.css";

const statusClass: Record<string, string> = {
  LIVE: s.statusLive,
  "IN PROGRESS": s.statusInProgress,
  "CASE STUDY": s.statusCaseStudy,
};

export function ProjectCard({ project }: { project: Project }) {
  const { title, status, description, tech, highlights, liveUrl, githubUrl, caseStudyUrl } =
    project;

  const isInternalLink = (url: string) => url.startsWith("/");

  return (
    <article className={s.card}>
      <div className={s.header}>
        <h3 className={s.title}>{title}</h3>
        <span className={`${s.status} ${statusClass[status] ?? ""}`}>{status}</span>
      </div>

      <p className={s.description}>{description}</p>

      <div className={s.tags} aria-label="Tech stack">
        {tech.map((t) => (
          <span key={t} className={s.tag}>
            {t}
          </span>
        ))}
      </div>

      <ul className={s.highlights} aria-label="Highlights">
        {highlights.map((h) => (
          <li key={h} className={s.highlight}>
            {h}
          </li>
        ))}
      </ul>

      <div className={s.links}>
        {liveUrl &&
          (isInternalLink(liveUrl) ? (
            <Link href={liveUrl} className={`${s.linkBtn} ${s.linkPrimary}`}>
              Live Demo ↗
            </Link>
          ) : (
            <a
              href={liveUrl}
              className={`${s.linkBtn} ${s.linkPrimary}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Live Demo ↗
            </a>
          ))}
        {githubUrl && githubUrl !== "#" && (
          <a
            href={githubUrl}
            className={`${s.linkBtn} ${s.linkSecondary}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        )}
        {caseStudyUrl && (
          <a href={caseStudyUrl} className={`${s.linkBtn} ${s.linkSecondary}`}>
            Case Study
          </a>
        )}
      </div>
    </article>
  );
}
