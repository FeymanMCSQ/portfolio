import Link from "next/link";
import { hero, contact } from "@/content/portfolioContent";
import s from "./Hero.module.css";

export function Hero() {
  return (
    <section className={s.hero} aria-label="Introduction">
      <div className={s.inner}>
        <div className={s.left}>
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
              href={contact.resume}
              className={s.ctaTertiary}
              target="_blank"
              rel="noopener noreferrer"
              download
            >
              Download Resume ↓
            </a>
          </div>
        </div>

        <Link href="/websites" className={s.businessCard} aria-label="Web design services for small businesses">
          <span className={s.businessCardLabel}>Web Design Services</span>
          <h2 className={s.businessCardTitle}>
            Need a website for your business?
          </h2>
          <p className={s.businessCardBody}>
            I design, build, launch, and support professional websites for small
            businesses — including responsive development, basic SEO setup,
            contact forms, deployment, and post-launch support.
          </p>
          <span className={s.businessCardCta}>
            View Web Design Services →
          </span>
        </Link>
      </div>

      <div className={s.scrollHint} aria-hidden="true">
        <div className={s.scrollLine} />
        <span className={s.scrollLabel}>Scroll</span>
      </div>
    </section>
  );
}
