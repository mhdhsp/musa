import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, BookOpen, Calendar, Settings, Plus, ArrowRight, CheckCircle2, Award, UserPlus } from "lucide-react";
import Navbar from "../components/Navbar";
import SettingsModal from "../components/SettingsModal";
import StudentModal from "../components/StudentModal";
import { getAllStudents, getAttendanceLogs } from "../services/indexedDB";
import { SECTION_TYPES } from "../data/students";
import { t } from "../utils/i18n";

export default function Home() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [, setLangState] = useState(0);

  useEffect(() => {
    loadData();
    const handleLangChange = () => setLangState((prev) => prev + 1);
    window.addEventListener("languagechange", handleLangChange);
    return () => window.removeEventListener("languagechange", handleLangChange);
  }, []);

  async function loadData() {
    const stList = await getAllStudents();
    const attList = await getAttendanceLogs();

    setStudents(stList);
    setAttendanceRecords(attList);
  }

  const hifzStudents = students.filter((s) => s.section === SECTION_TYPES.HIFZ);
  const darsStudents = students.filter((s) => s.section === SECTION_TYPES.DARS);

  const todayStr = new Date().toISOString().split("T")[0];
  const todayRecord = attendanceRecords.find((r) => r.date === todayStr);

  let todayPresentCount = 0;
  let todayTotalMarked = 0;

  if (todayRecord && todayRecord.records) {
    const statuses = Object.values(todayRecord.records);
    todayTotalMarked = statuses.length;
    todayPresentCount = statuses.filter((st) => st === "PRESENT" || st === "LATE").length;
  }

  const attendancePercentage = todayTotalMarked > 0 ? Math.round((todayPresentCount / todayTotalMarked) * 100) : 100;

  return (
    <div className="app-shell">
      <Navbar onOpenSettings={() => setIsSettingsOpen(true)} />

      <main className="main-content container">
        {/* Minimal Banner */}
        <section className="dashboard-banner">
          <div>
            <h2>{t("welcome")}</h2>
            <p>{t("welcomeSub")}</p>
          </div>
          <div className="banner-actions">
            <button className="primary-button glass-btn" onClick={() => setIsStudentModalOpen(true)}>
              <Plus size={18} /> {t("addStudent")}
            </button>
            <button className="secondary-button glass-btn" onClick={() => navigate("/attendance/ALL")}>
              <Calendar size={18} /> {t("markAttendance")}
            </button>
          </div>
        </section>

        {/* Minimal KPI Cards */}
        <section className="kpi-grid">
          <div className="kpi-card" onClick={() => navigate("/students")}>
            <div className="kpi-icon icon-emerald">
              <Users size={24} />
            </div>
            <div className="kpi-info">
              <span className="kpi-label">{t("totalStudents")}</span>
              <strong className="kpi-value">{students.length}</strong>
              <span className="kpi-sub">{hifzStudents.length} Hifz · {darsStudents.length} Dars</span>
            </div>
          </div>

          <div className="kpi-card" onClick={() => navigate("/attendance/ALL")}>
            <div className="kpi-icon icon-gold">
              <CheckCircle2 size={24} />
            </div>
            <div className="kpi-info">
              <span className="kpi-label">{t("todayAttendance")}</span>
              <strong className="kpi-value">{attendancePercentage}%</strong>
              <span className="kpi-sub">{todayPresentCount} / {students.length || 0} {t("present")}</span>
            </div>
          </div>

          <div className="kpi-card" onClick={() => navigate("/hifz")}>
            <div className="kpi-icon icon-cyan">
              <BookOpen size={24} />
            </div>
            <div className="kpi-info">
              <span className="kpi-label">{t("hifzMemorizers")}</span>
              <strong className="kpi-value">{hifzStudents.length}</strong>
            </div>
          </div>

          <div className="kpi-card" onClick={() => navigate("/students?section=DARS")}>
            <div className="kpi-icon icon-purple">
              <Award size={24} />
            </div>
            <div className="kpi-info">
              <span className="kpi-label">{t("darsStudents")}</span>
              <strong className="kpi-value">{darsStudents.length}</strong>
            </div>
          </div>
        </section>

        {/* Quick Action Navigation Grid */}
        <section className="quick-actions-section">
          <h3>{t("quickActions")}</h3>
          <div className="action-tiles-grid">
            <div className="action-tile hifz-tile" onClick={() => navigate("/hifz")}>
              <div className="tile-header">
                <BookOpen size={22} />
                <ArrowRight size={18} className="tile-arrow" />
              </div>
              <h4>{t("hifzProgress")}</h4>
            </div>

            <div className="action-tile attendance-tile" onClick={() => navigate("/attendance/ALL")}>
              <div className="tile-header">
                <Calendar size={22} />
                <ArrowRight size={18} className="tile-arrow" />
              </div>
              <h4>{t("attendance")}</h4>
            </div>

            <div className="action-tile students-tile" onClick={() => navigate("/students")}>
              <div className="tile-header">
                <Users size={22} />
                <ArrowRight size={18} className="tile-arrow" />
              </div>
              <h4>{t("studentDirectory")}</h4>
            </div>

            <div className="action-tile settings-tile" onClick={() => setIsSettingsOpen(true)}>
              <div className="tile-header">
                <Settings size={22} />
                <ArrowRight size={18} className="tile-arrow" />
              </div>
              <h4>{t("sheetsAndBackups")}</h4>
            </div>
          </div>
        </section>

        {/* Empty state if 0 students exist */}
        {students.length === 0 && (
          <div className="empty-box">
            <UserPlus size={40} color="#94a3b8" />
            <p>{t("noStudentsYet")}</p>
            <button className="primary-button" onClick={() => setIsStudentModalOpen(true)}>
              <Plus size={18} /> {t("addStudent")}
            </button>
          </div>
        )}
      </main>

      {/* Modals */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        onSaved={loadData}
      />
    </div>
  );
}