import { useState, useEffect, useMemo } from "react";
import {
  Users, Plus, Search, Edit, Trash2, Phone,
  UserCheck, BookOpen, GraduationCap, Filter,
} from "lucide-react";
import Navbar from "../components/Navbar";
import SettingsModal from "../components/SettingsModal";
import StudentModal from "../components/StudentModal";
import { getAllStudents, deleteStudent, getSettings, getAttendanceLogs } from "../services/indexedDB";
import { sendToGoogleSheet } from "../services/googleSheets";
import { SECTION_TYPES } from "../data/students";
import { t } from "../utils/i18n";
import { useLang } from "../context/LanguageContext";

export default function StudentsPage() {
  useLang();
  const [students, setStudents] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sectionFilter, setSectionFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("active");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    const [list, logs] = await Promise.all([getAllStudents(), getAttendanceLogs()]);
    setStudents(list);
    setAttendanceLogs(logs);
  }

  // Compute attendance % per student
  const attendanceMap = useMemo(() => {
    const map = {};
    attendanceLogs.forEach((log) => {
      Object.entries(log.records || {}).forEach(([sid, status]) => {
        if (!map[sid]) map[sid] = { present: 0, total: 0 };
        map[sid].total++;
        if (status === "PRESENT" || status === "LATE") map[sid].present++;
      });
    });
    return map;
  }, [attendanceLogs]);

  const filteredStudents = useMemo(() =>
    students.filter((s) => {
      const matchSection = sectionFilter === "ALL" || s.section === sectionFilter;
      const matchStatus = statusFilter === "ALL" || s.status === statusFilter;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        s.name.toLowerCase().includes(q) ||
        s.rollNo.toLowerCase().includes(q) ||
        (s.phone && s.phone.includes(q));
      return matchSection && matchStatus && matchSearch;
    }),
    [students, sectionFilter, statusFilter, searchQuery]
  );

  const counts = useMemo(() => ({
    all:  students.length,
    hifz: students.filter((s) => s.section === "HIFZ").length,
    dars: students.filter((s) => s.section === "DARS").length,
  }), [students]);

  function handleAdd() {
    setEditingStudent(null);
    setIsStudentModalOpen(true);
  }

  function handleEdit(student) {
    setEditingStudent(student);
    setIsStudentModalOpen(true);
  }

  async function handleDelete(student) {
    if (!window.confirm(`Delete ${student.name}? This cannot be undone.`)) return;
    await deleteStudent(student.id);
    getSettings().then((st) => {
      if (st.googleSheetUrl) {
        sendToGoogleSheet(st.googleSheetUrl, "DELETE_STUDENT", { studentId: student.id });
      }
    });
    loadAll();
  }

  function attPct(studentId) {
    const d = attendanceMap[studentId];
    if (!d || d.total === 0) return null;
    return Math.round((d.present / d.total) * 100);
  }

  return (
    <div className="app-shell">
      <Navbar onOpenSettings={() => setIsSettingsOpen(true)} />

      <main className="main-content container">
        <div className="page-title-row">
          <div>
            <h2>{t("studentDirectory")}</h2>
            <p className="page-subtitle">{counts.all} total · {counts.hifz} Hifz · {counts.dars} Dars</p>
          </div>
          <button className="primary-button" onClick={handleAdd}>
            <Plus size={16} /> {t("addStudent")}
          </button>
        </div>

        <div className="filter-controls-card">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by name, roll no, or phone…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              aria-label="Search students"
            />
          </div>

          <div className="filter-tabs">
            {[["ALL", `All (${counts.all})`], ["HIFZ", `Hifz (${counts.hifz})`], ["DARS", `Dars (${counts.dars})`]].map(
              ([val, label]) => (
                <button
                  key={val}
                  className={`filter-btn ${sectionFilter === val ? "active" : ""}`}
                  onClick={() => setSectionFilter(val)}
                >
                  {label}
                </button>
              )
            )}
          </div>

          <div className="filter-tabs">
            {[["active", "Active"], ["inactive", "Inactive"], ["ALL", "All"]].map(([val, label]) => (
              <button
                key={val}
                className={`filter-btn filter-btn-sm ${statusFilter === val ? "active" : ""}`}
                onClick={() => setStatusFilter(val)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="empty-box">
            <Users size={36} color="#94a3b8" />
            <p>{t("noStudentsYet")}</p>
            <button className="primary-button" onClick={handleAdd}>
              <Plus size={16} /> {t("addStudent")}
            </button>
          </div>
        ) : (
          <div className="student-cards-grid">
            {filteredStudents.map((st) => {
              const pct = attPct(st.id);
              return (
                <div className="student-card-item" key={st.id}>
                  <div className="card-top-bar">
                    <span className={`section-badge badge-${st.section.toLowerCase()}`}>
                      {st.section === SECTION_TYPES.HIFZ ? <BookOpen size={11} /> : <GraduationCap size={11} />}
                      {st.section}
                    </span>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      {st.status === "inactive" && (
                        <span className="inactive-badge">Inactive</span>
                      )}
                      <span className="roll-badge">{st.rollNo}</span>
                    </div>
                  </div>

                  <h3 className="student-name-title">{st.name}</h3>
                  <p className="student-class-text">{st.classLevel || "Standard"}</p>

                  {st.section === SECTION_TYPES.HIFZ && (
                    <div className="hifz-mini-progress">
                      <div className="mini-progress-bar">
                        <div
                          className="mini-fill"
                          style={{ width: `${Math.round(((st.totalJuzMemorized || 0) / 30) * 100)}%` }}
                        />
                      </div>
                      <span>{st.totalJuzMemorized || 0}/30 {t("juzMemorized")}</span>
                    </div>
                  )}

                  {pct !== null && (
                    <div className="att-mini-bar">
                      <div
                        className={`att-mini-fill ${pct >= 75 ? "good" : pct >= 50 ? "warn" : "bad"}`}
                        style={{ width: `${pct}%` }}
                      />
                      <span className="att-mini-label">{pct}% attendance</span>
                    </div>
                  )}

                  <div className="student-contact-info">
                    <div><UserCheck size={13} /><span>{st.guardianName || "—"}</span></div>
                    <div><Phone size={13} /><span>{st.phone || "—"}</span></div>
                  </div>

                  <div className="card-action-footer">
                    <button className="secondary-button icon-text-btn" onClick={() => handleEdit(st)}>
                      <Edit size={13} /> Edit
                    </button>
                    <button className="danger-icon-btn" onClick={() => handleDelete(st)} title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        student={editingStudent}
        onSaved={loadAll}
      />
    </div>
  );
}
