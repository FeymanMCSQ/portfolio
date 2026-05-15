import Link from "next/link";
import { SectionHeading } from "./SectionHeading";
import s from "./RuntimeRushShowcase.module.css";

const bullets = [
  "Canvas game loop — RAF-driven, delta-time physics, no game engine",
  "Procedural terrain with risk/reward route branching and momentum system",
  "Power-ups: Overclock (speed burst), Focus Mode (slow-motion), Patch Pulse (area clear)",
  "Techno-Oasis visual direction — flat vector art, parallax layers, ambient audio",
];

export function RuntimeRushShowcase() {
  return (
    <section id="runtime-rush" className={s.section}>
      <div className={s.inner}>
        <SectionHeading
          label="Interactive"
          title="Runtime Rush"
        />

        <p className={s.description}>
          [TODO: 1–2 sentences for non-technical visitors — what the game is, what it feels
          like to play, and why you built it]
        </p>

        <div className={s.body}>
          {/* Preview / screenshot placeholder */}
          <div className={s.preview} aria-label="Game preview area">
            <div className={s.previewGlow} aria-hidden="true" />
            <span className={s.previewIcon} aria-hidden="true">
              ▶
            </span>
            <span className={s.previewNote}>
              // TODO: add screenshot or GIF here //
            </span>
            <Link href="/play" className={s.previewCta}>
              Play Now ↗
            </Link>
          </div>

          {/* Technical details */}
          <div className={s.details}>
            <div>
              <span className={s.detailsLabel}>What it demonstrates</span>
              <ul className={s.bulletList} aria-label="Technical highlights">
                {bullets.map((b) => (
                  <li key={b} className={s.bullet}>
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            <div className={s.actions}>
              <Link href="/play" className={s.btnPrimary}>
                Play Runtime Rush ↗
              </Link>
              <a
                href="#"
                className={s.btnSecondary}
                aria-label="Read Runtime Rush case study (coming soon)"
              >
                Read Case Study
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
