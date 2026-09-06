import { useNavigate } from "react-router-dom";
import { CalendarDays, Settings } from "lucide-react";

import ClassCard from "../components/ClassCard";
import { students } from "../data/students";
import { SECTION_TYPES } from "../data/students";

export default function Home() {
  const navigate = useNavigate();

  const activeStudents = students.filter(
    (student) => student.active
  );

  const hifzStudents = activeStudents.filter(
    (student) =>
      student.section === SECTION_TYPES.HIFZ
  );

  const darsStudents = activeStudents.filter(
    (student) =>
      student.section === SECTION_TYPES.DARS
  );

  return (
    <div className="page">
      <header className="app-header">
        <div>
          <h1>Student Attendance</h1>
          <p>Today's attendance</p>
        </div>

        <button className="icon-button">
          <Settings />
        </button>
      </header>

      <main>
        <section className="today-section">
          <h3>ATTENDANCE</h3>

          <ClassCard
            title="All Students"
            count={activeStudents.length}
            description="Take attendance for everyone"
            large
            onClick={() =>
              navigate("/attendance/ALL")
            }
          />
        </section>

        <section>
          <h3>SECTIONS</h3>

          <div className="section-grid">
            <ClassCard
              title="Hifz"
              count={hifzStudents.length}
              onClick={() =>
                navigate("/attendance/HIFZ")
              }
            />

            <ClassCard
              title="Dars"
              count={darsStudents.length}
              onClick={() =>
                navigate("/attendance/DARS")
              }
            />
          </div>
        </section>

        <button
          className="history-button"
          onClick={() => navigate("/history")}
        >
          <CalendarDays />
          Attendance History
        </button>
      </main>
    </div>
  );
}