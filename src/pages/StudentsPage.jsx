import { useState, useEffect } from "react";
import { Users, Plus, Search, Edit, Trash2, Phone, UserCheck, BookOpen, GraduationCap } from "lucide-react";
import Navbar from "../components/Navbar";
import SettingsModal from "../components/SettingsModal";
import StudentModal from "../components/StudentModal";
import { getAllStudents, deleteStudent, getSettings } from "../services/indexedDB";
import { sendToGoogleSheet } from "../services/googleSheets";
import { SECTION_TYPES } from "../data/students";
import { t } from "../utils/i18n";

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sectionFilter, setSectionFilter] = useState("ALL");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [, setLangState] = useState(0);

  useEffect(() => {
    loadStudents();
    const handleLangChange = () => setLangState((prev) => prev + 1);
    window.addEventListener("languagechange", handleLangChange);
    return () => window.removeEventListener("languagechange", handleLangChange);
  }, []);

  async function loadStudents() {
    const list = await getAllStudents();
    setStudents(list);
  }

  const filteredStudents = students.filter((s) => {
    const matchesSection = sectionFilter === "ALL" || s.section === sectionFilter;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.phone && s.phone.includes(searchQuery));
    return matchesSection && matchesSearch;
  });

  function handleAddStudent() {
    setEditingStudent(null);
    setIsStudentModalOpen(true);
  }

  function handleEditStudent(student) {
    setEditingStudent(student);
    setIsStudentModalOpen(true);
  }

  async function handleDelete(student) {
    if (window.confirm(`Delete ${student.name}?`)) {
      await deleteStudent(student.id);

      getSettings().then((st) => {
        if (st.googleSheetUrl) {
          sendToGoogleSheet(st.googleSheetUrl, "DELETE_STUDENT", { studentId: student.id });
        }
      });

      loadStudents();
    }
  }

  return (
    <div className="app-shell">
      <Navbar onOpenSettings={() => setIsSettingsOpen(true)} />

      <main className="main-content container">
        <div className="page-title-row">
          <div>
            <h2>{t("studentDirectory")}</h2>
          </div>
          <button className="primary-button" onClick={handleAddStudent}>
            <Plus size={18} /> {t("addStudent")}
          </button>
        </div>

        <div className="filter-controls-card">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search student..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="filter-tabs">
            <button
              className={`filter-btn ${sectionFilter === "ALL" ? "active" : ""}`}
              onClick={() => setSectionFilter("ALL")}
            >
              {t("allStudents")} ({students.length})
            </button>
            <button
              className={`filter-btn ${sectionFilter === "HIFZ" ? "active" : ""}`}
              onClick={() => setSectionFilter("HIFZ")}
            >
              Hifz ({students.filter((s) => s.section === "HIFZ").length})
            </button>
            <button
              className={`filter-btn ${sectionFilter === "DARS" ? "active" : ""}`}
              onClick={() => setSectionFilter("DARS")}
            >
              Dars ({students.filter((s) => s.section === "DARS").length})
            </button>
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="empty-box">
            <Users size={40} color="#94a3b8" />
            <p>{t("noStudentsYet")}</p>
            <button className="primary-button" onClick={handleAddStudent}>
              <Plus size={18} /> {t("addStudent")}
            </button>
          </div>
        ) : (
          <div className="student-cards-grid">
            {filteredStudents.map((st) => (
              <div className="student-card-item" key={st.id}>
                <div className="card-top-bar">
                  <span className={`section-badge badge-${st.section.toLowerCase()}`}>
                    {st.section === SECTION_TYPES.HIFZ ? <BookOpen size={12} /> : <GraduationCap size={12} />}
                    {st.section}
                  </span>
                  <span className="roll-badge">{st.rollNo}</span>
                </div>

                <h3 className="student-name-title">{st.name}</h3>
                <p className="student-class-text">{st.classLevel || "Standard"}</p>

                {st.section === SECTION_TYPES.HIFZ && (
                  <div className="hifz-mini-progress">
                    <div className="mini-progress-bar">
                      <div
                        className="mini-fill"
                        style={{ width: `${Math.round(((st.totalJuzMemorized || 0) / 30) * 100)}%` }}
                      ></div>
                    </div>
                    <span>{st.totalJuzMemorized || 0} / 30 {t("juzMemorized")}</span>
                  </div>
                )}

                <div className="student-contact-info">
                  <div>
                    <UserCheck size={14} />
                    <span>{st.guardianName || "N/A"}</span>
                  </div>
                  <div>
                    <Phone size={14} />
                    <span>{st.phone || "N/A"}</span>
                  </div>
                </div>

                <div className="card-action-footer">
                  <button className="secondary-button icon-text-btn" onClick={() => handleEditStudent(st)}>
                    <Edit size={14} /> Edit
                  </button>
                  <button className="danger-icon-btn" onClick={() => handleDelete(st)} title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        student={editingStudent}
        onSaved={loadStudents}
      />
    </div>
  );
}
