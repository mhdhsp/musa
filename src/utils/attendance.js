export function getStudentsBySection(students, section) {
  return students.filter(
    (student) =>
      student.active && student.section === section
  );
}

export function getAllActiveStudents(students) {
  return students.filter((student) => student.active);
}

export function createInitialAttendance(students) {
  return students.reduce((result, student) => {
    result[student.id] = "PRESENT";
    return result;
  }, {});
}

export function getAbsentStudents(students, attendance) {
  return students.filter(
    (student) => attendance[student.id] === "ABSENT"
  );
}