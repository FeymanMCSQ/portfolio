import { skillCategories } from "@/content/portfolioContent";
import { SectionHeading } from "./SectionHeading";
import s from "./SkillsSection.module.css";

export function SkillsSection() {
  return (
    <section id="skills" className={s.section}>
      <div className={s.inner}>
        <SectionHeading
          label="Stack"
          title="Skills & Technologies"
          subtitle="[TODO: Short section subtitle — e.g. 'What I reach for and why']"
        />
        <div className={s.grid}>
          {skillCategories.map((cat) => (
            <div key={cat.label} className={s.card}>
              <span className={s.cardLabel}>{cat.label}</span>
              <p className={s.cardNote}>{cat.note}</p>
              <div className={s.skills} aria-label={`${cat.label} skills`}>
                {cat.skills.map((skill) => (
                  <span key={skill} className={s.skill}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
