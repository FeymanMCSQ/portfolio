import { projects } from "@/content/portfolioContent";
import { ProjectCard } from "./ProjectCard";
import { SectionHeading } from "./SectionHeading";
import s from "./ProjectsSection.module.css";

export function ProjectsSection() {
  return (
    <section id="projects" className={s.section}>
      <div className={s.inner}>
        <SectionHeading
          label="Work"
          title="Featured Projects"
          subtitle="[TODO: One-line section subtitle — e.g. 'Things I've built and shipped']"
        />
        <div className={s.grid}>
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
