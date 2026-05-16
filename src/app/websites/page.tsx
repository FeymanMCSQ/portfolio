import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/portfolio/Navbar";
import { Footer } from "@/components/portfolio/Footer";
import { contact, websiteServices } from "@/content/portfolioContent";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "Web Design Services — Safi Ullah",
  description:
    "Professional websites for small businesses. I design, build, launch, and support clean business websites that help customers understand, trust, and contact you.",
};

export default function WebsitesPage() {
  const { demos, audiences, included, process, pricing, faq } = websiteServices;
  const bookingHref = `mailto:${contact.email}?subject=Website%20Enquiry`;

  return (
    <div className={s.page}>
      <Navbar />
      <main>
        {/* Hero */}
        <section className={s.hero}>
          <div className={s.heroInner}>
            <span className={s.eyebrow}>Web Design Services</span>
            <h1 className={s.heroTitle}>
              Professional websites for small businesses.
            </h1>
            <p className={s.heroSub}>
              I design, build, launch, and support clean business websites that
              help customers understand, trust, and contact you.
            </p>
            <div className={s.heroCtas}>
              <a href={bookingHref} className={s.ctaPrimary}>
                Book a Website Call
              </a>
              <a href="#demos" className={s.ctaSecondary}>
                View Demo Websites
              </a>
            </div>
          </div>
        </section>

        {/* Who It's For */}
        <section className={s.sectionAlt}>
          <div className={s.inner}>
            <h2 className={s.sectionTitle}>Who it&apos;s for</h2>
            <div className={s.audienceGrid}>
              {audiences.map((audience) => (
                <div key={audience.label} className={s.audienceCard}>
                  <h3 className={s.audienceLabel}>{audience.label}</h3>
                  <p className={s.audienceDesc}>{audience.description}</p>
                </div>
              ))}
            </div>
            <p className={s.audienceNote}>
              Not for: complex web applications, SaaS platforms, dashboards, or
              startup software products.
            </p>
          </div>
        </section>

        {/* What's Included */}
        <section className={s.section}>
          <div className={s.inner}>
            <h2 className={s.sectionTitle}>What&apos;s included</h2>
            <ul className={s.includedList} role="list">
              {included.map((item) => (
                <li key={item} className={s.includedItem}>
                  <span className={s.includedCheck} aria-hidden="true">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Demo Websites */}
        <section id="demos" className={s.sectionAlt}>
          <div className={s.inner}>
            <h2 className={s.sectionTitle}>Demo websites</h2>
            <p className={s.sectionSub}>
              Examples built to show what a complete small-business website
              looks like.
            </p>
            <div className={s.demoGrid}>
              {demos.map((demo) => (
                <div key={demo.id} className={s.demoCard}>
                  <h3 className={s.demoName}>{demo.name}</h3>
                  <p className={s.demoDesc}>{demo.description}</p>
                  <a
                    href={demo.url}
                    className={s.demoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Demo ↗
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process */}
        <section className={s.section}>
          <div className={s.inner}>
            <h2 className={s.sectionTitle}>How it works</h2>
            <ol className={s.processList}>
              {process.map((item) => (
                <li key={item.step} className={s.processItem}>
                  <span className={s.processNum} aria-hidden="true">
                    {item.step}
                  </span>
                  <div>
                    <h3 className={s.processTitle}>{item.title}</h3>
                    <p className={s.processDesc}>{item.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Pricing */}
        <section className={s.sectionAlt}>
          <div className={s.inner}>
            <h2 className={s.sectionTitle}>Pricing</h2>
            <div className={s.pricingBox}>
              <p className={s.pricingStarter}>{pricing.starter}</p>
              <p className={s.pricingRange}>{pricing.range}</p>
              <p className={s.pricingNote}>{pricing.note}</p>
              <p className={s.pricingTimeline}>
                <span className={s.pricingTimelineLabel}>Timeline: </span>
                {pricing.timeline}
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={s.section}>
          <div className={s.inner}>
            <h2 className={s.sectionTitle}>Common questions</h2>
            <div className={s.faqList}>
              {faq.map((item) => (
                <details key={item.q} className={s.faqItem}>
                  <summary className={s.faqQ}>{item.q}</summary>
                  <p className={s.faqA}>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className={s.finalCta}>
          <div className={s.finalCtaInner}>
            <h2 className={s.finalCtaTitle}>
              Need a professional website without managing the technical mess?
            </h2>
            <div className={s.finalCtaBtns}>
              <a href={bookingHref} className={s.ctaPrimary}>
                Book a Website Call
              </a>
              <a href={`mailto:${contact.email}`} className={s.ctaSecondary}>
                Contact Me
              </a>
            </div>
            <p className={s.finalCtaBack}>
              <Link href="/">← Back to software portfolio</Link>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
