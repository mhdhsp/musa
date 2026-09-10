import { useState, useEffect, useRef, useMemo } from "react";
import { BookOpen, Plus, Search, Printer, Calendar, Trash2 } from "lucide-react";
import Navbar from "../components/Navbar";
import SettingsModal from "../components/SettingsModal";
import HifzLogModal from "../components/HifzLogModal";
import HifzJuzGrid from "../components/HifzJuzGrid";
import PrintableCard from "../components/PrintableCard";
import { getAllStudents, getHifzLogs, deleteHifzLog } from "../services/indexedDB";
import { SECTION_TYPES } from "../data/students";
import { HIFZ_GRADES } from "../data/hifzData";
import { t } from "../utils/i18n";
import { useLang } from "../context/LanguageContext";

export default function HifzPage() {
  useLang();
  const [students, setStudents] = useState([]);
  const [hifzLogs, setHifzLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [studentToLog, setStudentToLog] = useState(null);
  const printRef = useRef(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const allSt = await getAllStudents();
    const hSt = allSt.filter((s) => s.section === SECTION_TYPES.HIFZ);
    const logs = await getHifzLogs();
    setStudents(hSt);
    setHifzLogs(logs);
    if (hSt.length > 0 && !selectedStudent) setSelectedStudent(hSt[0]);
  }

  // Refresh the selected student object after edits
  async function refreshStudent(updatedStudent) {
    const allSt = await getAllStudents();
    const hSt = allSt.filter((s) => s.section === SECTION_TYPES.HIFZ);
    setStudents(hSt);
    if (updatedStudent) {
      setSelectedStudent(updatedStudent);
    } else if (selectedStudent) {
      const refreshed = hSt.find((s) => s.id === selectedStudent.id);
      if (refreshed) setSelectedStudent(refreshed);
    }
  }

  async function handleLogSaved(log, updatedStudent) {
    const logs = await getHifzLogs();
    setHifzLogs(logs);
    if (updatedStudent) await refreshStudent(updatedStudent);
    else await refreshStudent(null);
  }

  async function handleDeleteLog(logId) {
    if (!window.confirm("Delete this hifz log entry?")) return;
    await deleteHifzLog(logId);
    const logs = await getHifzLogs();
    setHifzLogs(logs);
  }

  function handleOpenLogModal(student, e) {
    if (e) e.stopPropagation();
    setStudentToLog(student);
    setIsLogModalOpen(true);
  }

  // Task #10 — print only the PrintableCard, not the whole page
  function handlePrint() {
    const el = printRef.current;
    if (!el) return;
    const original = document.body.innerHTML;
    document.body.innerHTML = el.innerHTML;
    window.print();
    document.body.innerHTML = original;
    window.location.reload();
  }

  const filteredStudents = useMemo(
    () => students.filter(
      (s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [students, searchQuery]
  );

  const studentLogs = useMemo(
    () => selectedStudent
      ? [...hifzLogs.filter((l) => l.studentId === selectedStudent.id)]
          .sort((a, b) => b.date.localeCompare(a.date))
      : [],
    [hifzLogs, selectedStudent]
  );

  // Hidden printable card kept in DOM at all times
  const printableStudentLogs = selectedStudent
    ? hifzLogs.filter((l) => l.studentId === selectedStudent.id)
    : [];

  return (
    <div className="app-shell">
      <Navbar onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* Hidden print target — always in DOM (Task #10) */}
      <div ref={printRef} style={{ display: "none" }}>
        <PrintableCard student={selectedStudent} hifzLogs={printableStudentLogs} />
      </div>

      <main className="main-content container">
        <div className="page-title-row">
          <div>
            <h2>{t("hifzDept")}</h2>
            <p className="page-subtitle">{students.length} students</p>
          </div>
          {selectedStudent && (
            <button className="secondary-button" onClick={handlePrint}>
              <Printer size={16} /> Print Card
            </button>
          )}
        </div>

        <div className="hifz-layout-grid">
          {/* Left: Roster */}
          <div className="hifz-roster-column">
            <div className="search-box" style={{ marginBottom: 12 }}>
              <Search size={16} />
              <input
                type="text"
                placeholder="Search student…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field"
                aria-label="Search hifz students"
              />
            </div>

            {filteredStudents.length === 0 ? (
              <div className="empty-box">
                <BookOpen size={28} color="#94a3b8" />
                <p>{t("noStudentsYet")}</p>
              </div>
            ) : (
              <div className="hifz-student-list">
                {filteredStudents.map((st) => {
                  const isSelected = selectedStudent?.id === st.id;
                  const pct = Math.round(((st.totalJuzMemorized || 0) / 30) * 100);
                  return (
                    <div
                      key={st.id}
                      className={`hifz-student-item ${isSelected ? "selected" : ""}`}
                      onClick={() => setSelectedStudent(st)}
                      role="button" tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && setSelectedStudent(st)}
                    >
                      <div className="item-header">
                        <span className="roll-badge">{st.rollNo}</span>
                        <h4>{st.name}</h4>
                      </div>
                      <div className="hifz-roster-progress">
                        <div className="roster-bar">
                          <div className="roster-fill" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="item-meta">{st.totalJuzMemorized || 0}/30 Juz</span>
                      </div>
                      <button
                        className="small-primary-btn"
                        onClick={(e) => handleOpenLogModal(st, e)}
                      >
                        <Plus size={12} /> {t("logHifz")}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Detail panel */}
          <div className="hifz-details-column">
            {selectedStudent ? (
              <div className="student-hifz-profile">
                <div className="profile-header-card">
                  <div>
                    <span className="roll-pill">{selectedStudent.rollNo}</span>
                    <h3>{selectedStudent.name}</h3>
                    <p className="profile-class">{selectedStudent.classLevel || "Hifz"}</p>
                  </div>
                  <button
                    className="primary-button"
                    onClick={() => handleOpenLogModal(selectedStudent)}
                  >
                    <Plus size={16} /> {t("logDailyLesson")}
                  </button>
                </div>

                <HifzJuzGrid
                  totalMemorized={selectedStudent.totalJuzMemorized || 0}
                  currentJuz={selectedStudent.currentJuz || 1}
                />

                <div className="hifz-logs-history">
                  <div className="logs-history-header">
                    <h3>Progress Logs</h3>
                    <span className="logs-count">{studentLogs.length} entries</span>
                  </div>

                  {studentLogs.length === 0 ? (
                    <div className="empty-box" style={{ padding: "24px 16px" }}>
                      <p>No daily progress logged yet.</p>
                      <button
                        className="secondary-button"
                        onClick={() => handleOpenLogModal(selectedStudent)}
                      >
                        {t("logDailyLesson")}
                      </button>
                    </div>
                  ) : (
                    <div className="logs-timeline">
                      {studentLogs.map((log) => (
                        <div className="log-timeline-card" key={log.id}>
                          <div className="log-card-header">
                            <div className="log-date-badge">
                              <Calendar size={13} />
                              <span>{log.date}</span>
                            </div>
                            <button
                              className="log-delete-btn"
                              onClick={() => handleDeleteLog(log.id)}
                              title="Delete log"
                              aria-label="Delete log"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          <div className="log-triad-grid">
                            {[
                              { label: t("sabah"),  main: `${log.sabahSurah} (${log.sabahAyahs})`, grade: log.sabahGrade },
                              { label: t("sabqi"),  main: log.sabqiJuz, grade: log.sabqiGrade },
                              { label: t("manzil"), main: log.manzilJuz, grade: log.manzilGrade },
                            ].map(({ label, main, grade }) => (
                              <div className="log-triad-col" key={label}>
                                <span className="triad-label">{label}</span>
                                <strong className="triad-main">{main}</strong>
                                <span
                                  className="grade-tag"
                                  style={{ color: HIFZ_GRADES[grade]?.color || "#64748b" }}
                                >
                                  {HIFZ_GRADES[grade]?.badge || grade}
                                </span>
                              </div>
                            ))}
                          </div>

                          {log.teacherRemarks && (
                            <p className="log-remarks">
                              <strong>{t("remarks")}:</strong> {log.teacherRemarks}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="empty-box">
                <BookOpen size={36} color="#94a3b8" />
                <p>Select a student to view their progress.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <HifzLogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        student={studentToLog}
        onSaved={handleLogSaved}
      />
    </div>
  );
}
