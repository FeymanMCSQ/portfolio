import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "[YOUR NAME] — Software Engineering & Full-Stack Development",
  description:
    "Portfolio of [YOUR NAME], a software engineering student and full-stack developer. View projects, skills, and Runtime Rush — a browser-based 2D game built from scratch.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
