"use client";

import Link from "next/link";
import { useState } from "react";
import { hero, navLinks } from "@/content/portfolioContent";
import s from "./Navbar.module.css";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className={s.nav} role="navigation" aria-label="Main navigation">
      <div className={s.inner}>
        <Link href="/" className={s.logo} aria-label="Home">
          {hero.name}
          <span className={s.logoAccent}>//</span>
        </Link>

        <ul className={s.links} role="list">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href} className={s.link}>
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <Link href="/play" className={s.playBtn}>
              Play Game ↗
            </Link>
          </li>
        </ul>

        <button
          className={s.hamburger}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </div>

      <div
        id="mobile-menu"
        className={`${s.mobileMenu} ${open ? s.open : ""}`}
        aria-hidden={!open}
      >
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={s.mobileLink}
            onClick={() => setOpen(false)}
          >
            {link.label}
          </a>
        ))}
        <Link
          href="/play"
          className={s.mobilePlayBtn}
          onClick={() => setOpen(false)}
        >
          Play Runtime Rush →
        </Link>
      </div>
    </nav>
  );
}
