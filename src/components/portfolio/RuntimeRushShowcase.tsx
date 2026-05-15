import Image from "next/image";
import Link from "next/link";
import { runtimeRushShowcase } from "@/content/portfolioContent";
import { SectionHeading } from "./SectionHeading";
import s from "./RuntimeRushShowcase.module.css";

export function RuntimeRushShowcase() {
  const { description, bullets } = runtimeRushShowcase;

  return (
    <section id="runtime-rush" className={s.section}>
      <div className={s.inner}>
        <SectionHeading label="Interactive" title="Runtime Rush" />

        <p className={s.description}>{description}</p>

        <div className={s.body}>
          {/* Screenshot with play button overlay */}
          <div className={s.preview}>
            <Image
              src="/game_shot.png"
              alt="Runtime Rush gameplay — a skater navigating procedural terrain with power-ups and HUD visible"
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className={s.previewOverlay} aria-hidden="true" />
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
