import { Check, X } from "lucide-react";

export default function StudentCard({
  student,
  status,
  onClick,
}) {
  const isAbsent = status === "ABSENT";

  return (
    <button
      className={`student-card ${
        isAbsent ? "absent" : "present"
      }`}
      onClick={onClick}
    >
      <div>
        <div className="student-name">
          {student.name}
        </div>

        <div className="student-status">
          {isAbsent ? "ABSENT" : "PRESENT"}
        </div>
      </div>

      <div className="status-icon">
        {isAbsent ? <X /> : <Check />}
      </div>
    </button>
  );
}