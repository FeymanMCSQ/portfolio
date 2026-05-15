import GameCanvas from "@/components/game/GameCanvas";
import styles from "./play.module.css";

export default function PlayPage() {
  return (
    <main className={styles.playPage}>
      <GameCanvas />
    </main>
  );
}
