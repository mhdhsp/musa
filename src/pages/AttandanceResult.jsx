import { useLocation, useNavigate, useParams } from "react-router-dom";
import { CheckCircle, ArrowLeft } from "lucide-react";

import {
  saveAttendance,
} from "../services/attendanceStorage";

export default function AttendanceResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { section } = useParams();

  const {
    attendance,
    students,
    date,
  } = location.state;

  const absentStudents = students.filter(
    (student) =>
      attendance[student.id] === "ABSENT"
  );

  const presentCount =
    students.length - absentStudents.length;

  const record = {
    id: `${date}-${section}`,
    date,
    scope: section,
    records: attendance,
  };

  saveAttendance(record);

  return (
    <div className="page result-page">
      <CheckCircle className="success-icon" />

      <h1>Attendance Saved</h1>

      <p>
        {presentCount} present ·{" "}
        {absentStudents.length} absent
      </p>

      <section className="absent-section">
        <h3>ABSENT STUDENTS</h3>

        {absentStudents.length === 0 ? (
          <div className="all-present">
            Everyone is present 🎉
          </div>
        ) : (
          absentStudents.map((student) => (
            <div
              className="absent-student"
              key={student.id}
            >
              🔴 {student.name}
            </div>
          ))
        )}
      </section>

      <button
        className="save-button"
        onClick={() => navigate("/")}
      >
        DONE
      </button>

      <button
        className="secondary-button"
        onClick={() => navigate("/history")}
      >
        VIEW HISTORY
      </button>
    </div>
  );
}