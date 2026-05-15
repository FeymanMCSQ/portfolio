import s from "./SectionHeading.module.css";

interface Props {
  label: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}

export function SectionHeading({ label, title, subtitle, align = "center" }: Props) {
  const centered = align === "center";

  return (
    <div className={s.heading} style={{ textAlign: align }}>
      <span className={s.label}>{label}</span>
      <h2 className={s.title}>{title}</h2>
      {subtitle && (
        <p
          className={s.subtitle}
          style={centered ? { marginInline: "auto" } : undefined}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
