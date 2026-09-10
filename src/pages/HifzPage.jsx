import { useState, useEffect } from "react";
import { BookOpen, Plus, Search, Printer, Calendar } from "lucide-react";
import Navbar from "../components/Navbar";
import SettingsModal from "../components/SettingsModal";
import HifzLogModal from "../components/HifzLogModal";
import HifzJuzGrid from "../components/HifzJuzGrid";
import PrintableCard from "../components/PrintableCard";
import { getAllStudents, getHifzLogs } from "../services/indexedDB";
import { SECTION_TYPES } from "../data/students";
import { HIFZ_GRADES } from "../data/hifzData";
import { t } from "../utils/i18n";

export default function HifzPage() {
  const [students, setStudents] = useState([]);
  const [hifzLogs, setHifzLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [studentToLog, setStudentToLog] = useState(null);
  const [, setLangState] = useState(0);

  useEffect(() => {
    loadData();
    const handleLangChange = () => setLangState((prev) => prev + 1);
    window.addEventListener("languagechange", handleLangChange);
    return () => window.removeEventListener("languagechange", handleLangChange);
  }, []);

  async function loadData() {
    const allSt = await getAllStudents();
    const hSt = allSt.filter((s) => s.section === SECTION_TYPES.HIFZ);
    const logs = await getHifzLogs();

    setStudents(hSt);
    setHifzLogs(logs);

    if (hSt.length > 0 && !selectedStudent) {
      setSelectedStudent(hSt[0]);
    }
  }

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const studentLogs = selectedStudent ? hifzLogs.filter((l) => l.studentId === selectedStudent.id) : [];

  function handleOpenLogModal(student, e) {
    if (e) e.stopPropagation();
    setStudentToLog(student);
    setIsLogModalOpen(true);
  }

  return (
    <div className="app-shell">
      <Navbar onOpenSettings={() => setIsSettingsOpen(true)} />

      <main className="main-content container">
        <div className="page-title-row">
          <div>
            <h2>{t("hifzDept")}</h2>
          </div>
          {selectedStudent && (
            <button className="secondary-button" onClick={() => window.print()}>
              <Printer size={18} /> Print
            </button>
          )}
        </div>

        <div className="hifz-layout-grid">
          {/* Left Column: Hifz Roster */}
          <div className="hifz-roster-column">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field"
              />
            </div>

            {filteredStudents.length === 0 ? (
              <div className="empty-box">
                <BookOpen size={32} color="#94a3b8" />
                <p>{t("noStudentsYet")}</p>
              </div>
            ) : (
              <div className="hifz-student-list">
                {filteredStudents.map((st) => {
                  const isSelected = selectedStudent && selectedStudent.id === st.id;
                  const percentage = Math.round(((st.totalJuzMemorized || 0) / 30) * 100);

                  return (
                    <div
                      key={st.id}
                      className={`hifz-student-item ${isSelected ? "selected" : ""}`}
                      onClick={() => setSelectedStudent(st)}
                    >
                      <div className="item-header">
                        <span className="roll-badge">{st.rollNo}</span>
                        <h4>{st.name}</h4>
                      </div>

                      <div className="item-meta">
                        <span>{st.totalJuzMemorized || 0} / 30 Juz ({percentage}%)</span>
                      </div>

                      <div className="item-actions">
                        <button
                          className="small-primary-btn"
                          onClick={(e) => handleOpenLogModal(st, e)}
                        >
                          <Plus size={14} /> {t("logHifz")}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Details & 30 Juz Grid */}
          <div className="hifz-details-column">
            {selectedStudent ? (
              <div className="student-hifz-profile">
                <div className="profile-header-card">
                  <div>
                    <span className="roll-pill">{selectedStudent.rollNo}</span>
                    <h3>{selectedStudent.name}</h3>
                    <p>{selectedStudent.classLevel || "Hifz"}</p>
                  </div>
                  <button
                    className="primary-button"
                    onClick={(e) => handleOpenLogModal(selectedStudent, e)}
                  >
                    <Plus size={18} /> {t("logDailyLesson")}
                  </button>
                </div>

                <HifzJuzGrid
                  totalMemorized={selectedStudent.totalJuzMemorized || 0}
                  currentJuz={selectedStudent.currentJuz || 1}
                />

                <div className="hifz-logs-history">
                  <h3>Recent Progress Logs</h3>
                  {studentLogs.length === 0 ? (
                    <div className="empty-box">
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
                          <div className="log-date-badge">
                            <Calendar size={14} />
                            <span>{log.date}</span>
                          </div>

                          <div className="log-triad-grid">
                            <div className="log-triad-col">
                              <span className="triad-label">{t("sabah")}</span>
                              <strong>{log.sabahSurah} ({log.sabahAyahs})</strong>
                              <span className="grade-tag">{HIFZ_GRADES[log.sabahGrade]?.badge || log.sabahGrade}</span>
                            </div>

                            <div className="log-triad-col">
                              <span className="triad-label">{t("sabqi")}</span>
                              <strong>{log.sabqiJuz}</strong>
                              <span className="grade-tag">{HIFZ_GRADES[log.sabqiGrade]?.badge || log.sabqiGrade}</span>
                            </div>

                            <div className="log-triad-col">
                              <span className="triad-label">{t("manzil")}</span>
                              <strong>{log.manzilJuz}</strong>
                              <span className="grade-tag">{HIFZ_GRADES[log.manzilGrade]?.badge || log.manzilGrade}</span>
                            </div>
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
                <BookOpen size={40} color="#94a3b8" />
                <p>Select a student to view progress.</p>
              </div>
            )}
          </div>
        </div>

        {selectedStudent && (
          <div className="print-only-container">
            <PrintableCard student={selectedStudent} hifzLogs={studentLogs} />
          </div>
        )}
      </main>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <HifzLogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        student={studentToLog}
        onSaved={loadData}
      />
    </div>
  );
}
