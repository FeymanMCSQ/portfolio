import Link from "next/link";
import { hero } from "@/content/portfolioContent";
import s from "./Hero.module.css";

export function Hero() {
  return (
    <section className={s.hero} aria-label="Introduction">
      <div className={s.inner}>
        <span className={s.eyebrow} aria-hidden="true">
          Portfolio
        </span>
        <h1 className={s.name}>{hero.name}</h1>
        <p className={s.role}>{hero.role}</p>
        <p className={s.tagline}>{hero.tagline}</p>

        <div className={s.ctas}>
          <a href="#projects" className={s.ctaPrimary}>
            View Projects
          </a>
          <Link href="/play" className={s.ctaSecondary}>
            Play Runtime Rush ↗
          </Link>
          <a
            href="#"
            className={s.ctaTertiary}
            aria-label="Download resume (link coming soon)"
          >
            Download Resume ↓
          </a>
        </div>
      </div>

      <div className={s.scrollHint} aria-hidden="true">
        <div className={s.scrollLine} />
        <span className={s.scrollLabel}>Scroll</span>
      </div>
    </section>
  );
}
