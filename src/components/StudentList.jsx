import StudentCard from "../components/studentCard";

export default function StudentList({
  students,
  attendance,
  onStudentClick,
}) {
  return (
    <div className="student-list">
      {students.map((student) => (
        <StudentCard
          key={student.id}
          student={student}
          status={attendance[student.id]}
          onClick={() => onStudentClick(student.id)}
        />
      ))}
    </div>
  );
}