import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, BookOpen, Calendar, Settings, Plus, ArrowRight,
  CheckCircle2, Award, UserPlus, TrendingUp, Clock,
} from "lucide-react";
import Navbar from "../components/Navbar";
import SettingsModal from "../components/SettingsModal";
import StudentModal from "../components/StudentModal";
import { getAllStudents, getAttendanceLogs } from "../services/indexedDB";
import { SECTION_TYPES } from "../data/students";
import { t } from "../utils/i18n";
import { useLang } from "../context/LanguageContext";

export default function Home() {
  useLang();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const [stList, attList] = await Promise.all([getAllStudents(), getAttendanceLogs()]);
    setStudents(stList);
    setAttendanceRecords(attList);
  }

  const hifzStudents = useMemo(() => students.filter((s) => s.section === SECTION_TYPES.HIFZ), [students]);
  const darsStudents = useMemo(() => students.filter((s) => s.section === SECTION_TYPES.DARS), [students]);

  const todayStr = new Date().toISOString().split("T")[0];

  // Find today's most complete attendance record (could be ALL or HIFZ or DARS)
  const todayRecords = attendanceRecords.filter((r) => r.date === todayStr);
  const todayRecord = todayRecords.find((r) => r.scope === "ALL") || todayRecords[0];

  const { todayPresentCount, todayTotalMarked } = useMemo(() => {
    if (!todayRecord?.records) return { todayPresentCount: 0, todayTotalMarked: 0 };
    const vals = Object.values(todayRecord.records);
    return {
      todayTotalMarked: vals.length,
      todayPresentCount: vals.filter((s) => s === "PRESENT" || s === "LATE").length,
    };
  }, [todayRecord]);

  const attendancePercentage =
    todayTotalMarked > 0 ? Math.round((todayPresentCount / todayTotalMarked) * 100) : null;

  // Recent 5 attendance records for the mini-feed
  const recentAttendance = useMemo(
    () => [...attendanceRecords].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
    [attendanceRecords]
  );

  // Top Hifz student by juz memorized
  const topHifzStudent = useMemo(
    () => [...hifzStudents].sort((a, b) => (b.totalJuzMemorized || 0) - (a.totalJuzMemorized || 0))[0],
    [hifzStudents]
  );

  const kpis = [
    {
      label: t("totalStudents"),
      value: students.length,
      sub: `${hifzStudents.length} Hifz · ${darsStudents.length} Dars`,
      icon: Users,
      color: "icon-emerald",
      onClick: () => navigate("/students"),
    },
    {
      label: t("todayAttendance"),
      value: attendancePercentage !== null ? `${attendancePercentage}%` : "—",
      sub: attendancePercentage !== null
        ? `${todayPresentCount} / ${todayTotalMarked} ${t("present")}`
        : "Not marked yet",
      icon: CheckCircle2,
      color: "icon-gold",
      onClick: () => navigate("/attendance/ALL"),
    },
    {
      label: t("hifzMemorizers"),
      value: hifzStudents.length,
      sub: topHifzStudent ? `Best: ${topHifzStudent.name} (${topHifzStudent.totalJuzMemorized}/30)` : "No students yet",
      icon: BookOpen,
      color: "icon-cyan",
      onClick: () => navigate("/hifz"),
    },
    {
      label: t("darsStudents"),
      value: darsStudents.length,
      sub: `${attendanceRecords.length} total sessions logged`,
      icon: Award,
      color: "icon-purple",
      onClick: () => navigate("/students?section=DARS"),
    },
  ];

  return (
    <div className="app-shell">
      <Navbar onOpenSettings={() => setIsSettingsOpen(true)} />

      <main className="main-content container">
        {/* Hero Banner */}
        <section className="dashboard-banner">
          <div>
            <h2>{t("welcome")}</h2>
            <p>{t("welcomeSub")}</p>
          </div>
          <div className="banner-actions">
            <button className="primary-button glass-btn" onClick={() => setIsStudentModalOpen(true)}>
              <Plus size={16} /> {t("addStudent")}
            </button>
            <button className="secondary-button glass-btn" onClick={() => navigate("/attendance/ALL")}>
              <Calendar size={16} /> {t("markAttendance")}
            </button>
          </div>
        </section>

        {/* KPI Grid */}
        <section className="kpi-grid">
          {kpis.map(({ label, value, sub, icon: Icon, color, onClick }) => (
            <div className="kpi-card" key={label} onClick={onClick} role="button" tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onClick()}>
              <div className={`kpi-icon ${color}`}><Icon size={22} /></div>
              <div className="kpi-info">
                <span className="kpi-label">{label}</span>
                <strong className="kpi-value">{value}</strong>
                <span className="kpi-sub">{sub}</span>
              </div>
            </div>
          ))}
        </section>

        <div className="home-bottom-grid">
          {/* Quick Actions */}
          <section className="quick-actions-section">
            <h3 className="section-heading">{t("quickActions")}</h3>
            <div className="action-tiles-grid">
              {[
                { label: t("hifzProgress"), icon: BookOpen, path: "/hifz", cls: "hifz-tile" },
                { label: t("attendance"),   icon: Calendar, path: "/attendance/ALL", cls: "attendance-tile" },
                { label: t("studentDirectory"), icon: Users, path: "/students", cls: "students-tile" },
                { label: t("sheetsAndBackups"), icon: Settings, action: () => setIsSettingsOpen(true), cls: "settings-tile" },
              ].map(({ label, icon: Icon, path, action, cls }) => (
                <div
                  key={label}
                  className={`action-tile ${cls}`}
                  onClick={action || (() => navigate(path))}
                  role="button" tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && (action ? action() : navigate(path))}
                >
                  <div className="tile-header">
                    <Icon size={20} />
                    <ArrowRight size={16} className="tile-arrow" />
                  </div>
                  <h4>{label}</h4>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Attendance Feed */}
          {recentAttendance.length > 0 && (
            <section className="recent-feed-section">
              <h3 className="section-heading">
                <Clock size={16} /> Recent Sessions
              </h3>
              <div className="recent-feed-list">
                {recentAttendance.map((rec) => {
                  const vals = Object.values(rec.records || {});
                  const present = vals.filter((v) => v === "PRESENT" || v === "LATE").length;
                  const pct = vals.length ? Math.round((present / vals.length) * 100) : 100;
                  return (
                    <div className="feed-item" key={rec.id} onClick={() => navigate("/history")}>
                      <div className="feed-item-left">
                        <span className="feed-date">{rec.date}</span>
                        <span className="feed-scope-pill">{rec.scope}</span>
                      </div>
                      <div className="feed-item-right">
                        <div
                          className="feed-pct-bar"
                          style={{ "--pct": `${pct}%` }}
                        />
                        <span className="feed-pct-label">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {students.length === 0 && (
          <div className="empty-box">
            <UserPlus size={36} color="#94a3b8" />
            <p>{t("noStudentsYet")}</p>
            <button className="primary-button" onClick={() => setIsStudentModalOpen(true)}>
              <Plus size={16} /> {t("addStudent")}
            </button>
          </div>
        )}
      </main>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        onSaved={loadData}
      />
    </div>
  );
}
