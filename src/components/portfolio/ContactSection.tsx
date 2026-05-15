import { contact } from "@/content/portfolioContent";
import { SectionHeading } from "./SectionHeading";
import s from "./ContactSection.module.css";

export function ContactSection() {
  return (
    <section id="contact" className={s.section}>
      <div className={s.inner}>
        <SectionHeading label="Contact" title="Get In Touch" />
        <p className={s.cta}>{contact.cta}</p>

        <div className={s.links} role="list" aria-label="Contact links">
          <a
            href={`mailto:${contact.email}`}
            className={s.link}
            role="listitem"
          >
            <span className={s.linkIcon} aria-hidden="true">
              @
            </span>
            Email
          </a>
          <a
            href={contact.github}
            className={s.link}
            role="listitem"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className={s.linkIcon} aria-hidden="true">
              {"{"}
              {"}"}
            </span>
            GitHub
          </a>
          <a
            href={contact.linkedin}
            className={s.link}
            role="listitem"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className={s.linkIcon} aria-hidden="true">
              in
            </span>
            LinkedIn
          </a>
          <a href={contact.resume} className={s.link} role="listitem">
            <span className={s.linkIcon} aria-hidden="true">
              ↓
            </span>
            Resume
          </a>
        </div>

        <a href={`mailto:${contact.email}`} className={s.emailMain}>
          {contact.email}
        </a>
      </div>
    </section>
  );
}
