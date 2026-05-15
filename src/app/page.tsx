import { Navbar } from "@/components/portfolio/Navbar";
import { Hero } from "@/components/portfolio/Hero";
import { ProjectsSection } from "@/components/portfolio/ProjectsSection";
import { SkillsSection } from "@/components/portfolio/SkillsSection";
import { RuntimeRushShowcase } from "@/components/portfolio/RuntimeRushShowcase";
import { AboutSection } from "@/components/portfolio/AboutSection";
import { ContactSection } from "@/components/portfolio/ContactSection";
import { Footer } from "@/components/portfolio/Footer";
import s from "./page.module.css";

export default function Home() {
  return (
    <div className={s.portfolio}>
      <Navbar />
      <main id="main-content">
        <Hero />
        <ProjectsSection />
        <SkillsSection />
        <RuntimeRushShowcase />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
