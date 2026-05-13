import GameCanvas from "@/components/game/GameCanvas";

export default function PlayPage() {
  return (
    <main
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#050508",
      }}
    >
      <GameCanvas />
    </main>
  );
}
