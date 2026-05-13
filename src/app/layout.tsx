import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Runtime Rush",
  description: "A 2D browser skating game",
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
