import { ArrowRight } from "lucide-react";

export default function ClassCard({
  title,
  count,
  description,
  onClick,
  large = false,
}) {
  return (
    <button
      className={`class-card ${
        large ? "large" : ""
      }`}
      onClick={onClick}
    >
      <div>
        <h2>{title}</h2>

        <p>{count} students</p>

        {description && (
          <span>{description}</span>
        )}
      </div>

      <ArrowRight />
    </button>
  );
}