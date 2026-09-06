import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";

import { students, SECTION_TYPES } from "../data/students";
import {
  getAllActiveStudents,
  getStudentsBySection,
} from "../utils/attendance";

import { getTodayDate, formatDisplayDate } from "../utils/date";

import { useAttendance } from "../hooks/useAttendance";

import StudentList from "../components/studentList";
import AttendanceSummary from "../components/AttendanceSummary";

export default function Attendance() {
  const { section } = useParams();
  const navigate = useNavigate();

  const activeStudents = getAllActiveStudents(students);

  const sectionStudents =
    section === "ALL"
      ? activeStudents
      : getStudentsBySection(
          students,
          section
        );

  const {
    attendance,
    presentCount,
    absentCount,
    toggleStudent,
    markEveryonePresent,
  } = useAttendance(sectionStudents);

  function handleSave() {
    navigate(
      `/attendance/result/${section}`,
      {
        state: {
          attendance,
          students: sectionStudents,
          date: getTodayDate(),
        },
      }
    );
  }

  const title =
    section === "ALL"
      ? "All Students"
      : section === SECTION_TYPES.HIFZ
      ? "Hifz"
      : "Dars";

  return (
    <div className="page">
      <header className="page-header">
        <button
          className="icon-button"
          onClick={() => navigate("/")}
        >
          <ArrowLeft />
        </button>

        <div>
          <h1>{title}</h1>
          <p>{formatDisplayDate(getTodayDate())}</p>
        </div>
      </header>

      <AttendanceSummary
        total={sectionStudents.length}
        present={presentCount}
        absent={absentCount}
      />

      <button
        className="everyone-present"
        onClick={markEveryonePresent}
      >
        <Check />
        Everyone Present
      </button>

      <h3>WHO IS ABSENT?</h3>

      <StudentList
        students={sectionStudents}
        attendance={attendance}
        onStudentClick={toggleStudent}
      />

      <button
        className="save-button"
        onClick={handleSave}
      >
        SAVE ATTENDANCE
      </button>
    </div>
  );
}