import Link from "next/link";
import GameCanvas from "@/components/game/GameCanvas";
import styles from "./play.module.css";

export default function PlayPage() {
  return (
    <main className={styles.playPage}>
      <Link href="/" className={styles.homeBtn} aria-label="Back to portfolio">
        ← Home
      </Link>
      <GameCanvas />
    </main>
  );
}
