import { useState } from "react";

import {
  createInitialAttendance,
  getAbsentStudents,
} from "../utils/attendance";

export function useAttendance(students) {
  const [attendance, setAttendance] = useState(
    () => createInitialAttendance(students)
  );

  function toggleStudent(studentId) {
    setAttendance((current) => ({
      ...current,
      [studentId]:
        current[studentId] === "ABSENT"
          ? "PRESENT"
          : "ABSENT",
    }));
  }

  function markEveryonePresent() {
    setAttendance(
      createInitialAttendance(students)
    );
  }

  const absentStudents = getAbsentStudents(
    students,
    attendance
  );

  const presentCount =
    students.length - absentStudents.length;

  return {
    attendance,
    absentStudents,
    presentCount,
    absentCount: absentStudents.length,
    toggleStudent,
    markEveryonePresent,
  };
}