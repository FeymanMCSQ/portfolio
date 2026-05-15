import { about } from "@/content/portfolioContent";
import { SectionHeading } from "./SectionHeading";
import s from "./AboutSection.module.css";

export function AboutSection() {
  return (
    <section id="about" className={s.section}>
      <div className={s.inner}>
        <SectionHeading label="About" title="Who I Am" align="left" />
        <div className={s.body}>
          <p className={s.bio}>{about.bio}</p>
          <div className={s.cards}>
            {about.cards.map((card) => (
              <div key={card.label} className={s.card}>
                <span className={s.cardLabel}>{card.label}</span>
                <p className={s.cardDesc}>{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
