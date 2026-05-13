import Link from "next/link";

export default function Home() {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: "1rem",
      }}
    >
      <h1 style={{ fontSize: "2rem", color: "#5577ff", letterSpacing: "0.1em" }}>
        RUNTIME RUSH
      </h1>
      <Link
        href="/play"
        style={{
          fontSize: "1rem",
          color: "#88aaff",
          border: "1px solid #334",
          padding: "0.5rem 1.5rem",
        }}
      >
        → play
      </Link>
    </main>
  );
}
