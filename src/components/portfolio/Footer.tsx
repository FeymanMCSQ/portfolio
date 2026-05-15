import { contact, hero } from "@/content/portfolioContent";
import s from "./Footer.module.css";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={s.footer}>
      <div className={s.inner}>
        <div className={s.left}>
          <span className={s.name}>{hero.name}</span>
          <span className={s.tagline}>// Software Engineering · Runtime Rush</span>
        </div>

        <nav className={s.links} aria-label="Footer navigation">
          <a
            href={contact.github}
            className={s.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a
            href={contact.linkedin}
            className={s.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
          <a href={`mailto:${contact.email}`} className={s.link}>
            Email
          </a>
        </nav>

        <p className={s.copy}>© {year}</p>
      </div>
    </footer>
  );
}
