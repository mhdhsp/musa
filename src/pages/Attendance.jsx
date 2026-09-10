import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, CheckCircle2, XCircle, Clock, UserX, Check, Save, Search, UserPlus } from "lucide-react";
import Navbar from "../components/Navbar";
import SettingsModal from "../components/SettingsModal";
import { getAllStudents, saveAttendanceLog, getSettings } from "../services/indexedDB";
import { sendToGoogleSheet } from "../services/googleSheets";
import { t } from "../utils/i18n";

export default function Attendance() {
  const { section: urlSection } = useParams();
  const navigate = useNavigate();
  const [section, setSection] = useState(urlSection || "ALL");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [attendance, setAttendance] = useState({});
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [, setLangState] = useState(0);

  useEffect(() => {
    loadStudents();
    const handleLangChange = () => setLangState((prev) => prev + 1);
    window.addEventListener("languagechange", handleLangChange);
    return () => window.removeEventListener("languagechange", handleLangChange);
  }, [section]);

  async function loadStudents() {
    const allSt = await getAllStudents();
    const active = allSt.filter((s) => s.status !== "inactive");
    const filtered = section === "ALL" ? active : active.filter((s) => s.section === section);

    setStudents(filtered);

    const initial = {};
    filtered.forEach((s) => {
      initial[s.id] = "PRESENT";
    });
    setAttendance(initial);
  }

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function setStatus(studentId, status) {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status
    }));
  }

  function markEveryone(status) {
    const updated = {};
    students.forEach((s) => {
      updated[s.id] = status;
    });
    setAttendance(updated);
  }

  async function handleSave() {
    const record = {
      id: `${date}-${section}`,
      date,
      scope: section,
      records: attendance,
      createdAt: new Date().toISOString()
    };

    await saveAttendanceLog(record);

    getSettings().then((st) => {
      if (st.googleSheetUrl) {
        sendToGoogleSheet(st.googleSheetUrl, "SAVE_ATTENDANCE", { attendance: record });
      }
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      navigate("/history");
    }, 1200);
  }

  const statuses = Object.values(attendance);
  const presentCount = statuses.filter((s) => s === "PRESENT").length;
  const absentCount = statuses.filter((s) => s === "ABSENT").length;
  const lateCount = statuses.filter((s) => s === "LATE").length;
  const leaveCount = statuses.filter((s) => s === "LEAVE").length;

  return (
    <div className="app-shell">
      <Navbar onOpenSettings={() => setIsSettingsOpen(true)} />

      <main className="main-content container">
        <div className="page-title-row">
          <div>
            <h2>{t("attendance")}</h2>
          </div>
          <div className="date-picker-wrapper">
            <Calendar size={18} />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field date-input"
            />
          </div>
        </div>

        <div className="section-tab-bar">
          <button
            className={`tab-item ${section === "ALL" ? "active" : ""}`}
            onClick={() => setSection("ALL")}
          >
            {t("allStudents")} ({students.length})
          </button>
          <button
            className={`tab-item ${section === "HIFZ" ? "active" : ""}`}
            onClick={() => setSection("HIFZ")}
          >
            Hifz
          </button>
          <button
            className={`tab-item ${section === "DARS" ? "active" : ""}`}
            onClick={() => setSection("DARS")}
          >
            Dars
          </button>
        </div>

        <div className="attendance-stats-bar">
          <div className="stat-pill pill-present">
            <span>{t("present").toUpperCase()}</span>
            <strong>{presentCount}</strong>
          </div>
          <div className="stat-pill pill-absent">
            <span>{t("absent").toUpperCase()}</span>
            <strong>{absentCount}</strong>
          </div>
          <div className="stat-pill pill-late">
            <span>{t("late").toUpperCase()}</span>
            <strong>{lateCount}</strong>
          </div>
          <div className="stat-pill pill-leave">
            <span>{t("leave").toUpperCase()}</span>
            <strong>{leaveCount}</strong>
          </div>
        </div>

        {students.length === 0 ? (
          <div className="empty-box">
            <UserPlus size={40} color="#94a3b8" />
            <p>{t("noStudentsYet")}</p>
            <button className="primary-button" onClick={() => navigate("/students")}>
              {t("addStudent")}
            </button>
          </div>
        ) : (
          <>
            <div className="bulk-action-bar">
              <div className="search-box compact-search">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search student..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="bulk-btn-group">
                <button className="bulk-btn btn-all-present" onClick={() => markEveryone("PRESENT")}>
                  <Check size={16} /> {t("markAllPresent")}
                </button>
                <button className="bulk-btn btn-all-absent" onClick={() => markEveryone("ABSENT")}>
                  <XCircle size={16} /> {t("markAllAbsent")}
                </button>
              </div>
            </div>

            <div className="attendance-student-list">
              {filteredStudents.map((st) => {
                const currentStatus = attendance[st.id] || "PRESENT";

                return (
                  <div className={`attendance-row status-${currentStatus.toLowerCase()}`} key={st.id}>
                    <div className="row-left">
                      <span className="roll-badge">{st.rollNo}</span>
                      <div>
                        <h4>{st.name}</h4>
                        <p>{st.section}</p>
                      </div>
                    </div>

                    <div className="row-status-buttons">
                      <button
                        className={`status-chip chip-present ${currentStatus === "PRESENT" ? "active" : ""}`}
                        onClick={() => setStatus(st.id, "PRESENT")}
                      >
                        <CheckCircle2 size={16} /> {t("present")}
                      </button>
                      <button
                        className={`status-chip chip-absent ${currentStatus === "ABSENT" ? "active" : ""}`}
                        onClick={() => setStatus(st.id, "ABSENT")}
                      >
                        <XCircle size={16} /> {t("absent")}
                      </button>
                      <button
                        className={`status-chip chip-late ${currentStatus === "LATE" ? "active" : ""}`}
                        onClick={() => setStatus(st.id, "LATE")}
                      >
                        <Clock size={16} /> {t("late")}
                      </button>
                      <button
                        className={`status-chip chip-leave ${currentStatus === "LEAVE" ? "active" : ""}`}
                        onClick={() => setStatus(st.id, "LEAVE")}
                      >
                        <UserX size={16} /> {t("leave")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="save-floating-bar">
              <button className="primary-button save-attendance-btn" onClick={handleSave}>
                <Save size={20} />
                {savedSuccess ? "Saved & Synced! 🎉" : t("saveAttendance")}
              </button>
            </div>
          </>
        )}
      </main>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}