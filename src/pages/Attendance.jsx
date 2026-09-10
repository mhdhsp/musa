import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar, CheckCircle2, XCircle, Clock, UserX,
  Check, Save, Search, UserPlus,
} from "lucide-react";
import Navbar from "../components/Navbar";
import SettingsModal from "../components/SettingsModal";
import {
  getAllStudents,
  saveAttendanceLog,
  getAttendanceLogs,
  getSettings,
} from "../services/indexedDB";
import { sendToGoogleSheet } from "../services/googleSheets";
import { t } from "../utils/i18n";
import { useLang } from "../context/LanguageContext";

const STATUS_LIST = ["PRESENT", "ABSENT", "LATE", "LEAVE"];

export default function Attendance() {
  useLang(); // re-render on language change

  const { section: urlSection } = useParams();
  const navigate = useNavigate();

  const [section, setSection] = useState(urlSection || "ALL");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [allStudents, setAllStudents] = useState([]);
  const [students, setStudents] = useState([]);        // filtered by active + section
  const [attendance, setAttendance] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(true);

  // Keep a ref to isDirty for the beforeunload handler (avoids stale closure)
  const isDirtyRef = useRef(false);
  isDirtyRef.current = isDirty;

  // Warn if user closes/refreshes tab with unsaved changes
  useEffect(() => {
    function handleBeforeUnload(e) {
      if (isDirtyRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // ── Load students + restore existing record whenever section or date changes ──
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [all, logs] = await Promise.all([
          getAllStudents(),
          getAttendanceLogs(),
        ]);

        if (cancelled) return;

        setAllStudents(all);

        const active = all.filter((s) => s.status !== "inactive");
        const filtered =
          section === "ALL"
            ? active
            : active.filter((s) => s.section === section);

        setStudents(filtered);

        // Try to restore a previously saved record for this exact date + scope
        const existing = logs.find(
          (l) => l.date === date && l.scope === section
        );

        if (existing) {
          // Merge: existing record may not contain students added after saving
          const merged = {};
          filtered.forEach((s) => {
            merged[s.id] = existing.records[s.id] || "PRESENT";
          });
          setAttendance(merged);
        } else {
          const initial = {};
          filtered.forEach((s) => {
            initial[s.id] = "PRESENT";
          });
          setAttendance(initial);
        }

        setIsDirty(false);
      } catch (err) {
        console.error("Failed to load attendance data:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [section, date]); // re-runs on both section and date change

  // ── Filtered list for search ──────────────────────────────────────────────
  const filteredStudents = useMemo(
    () =>
      students.filter((s) => {
        const q = searchQuery.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.rollNo.toLowerCase().includes(q)
        );
      }),
    [students, searchQuery]
  );

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const vals = Object.values(attendance);
    return {
      present: vals.filter((v) => v === "PRESENT").length,
      absent:  vals.filter((v) => v === "ABSENT").length,
      late:    vals.filter((v) => v === "LATE").length,
      leave:   vals.filter((v) => v === "LEAVE").length,
    };
  }, [attendance]);

  // ── Actions ───────────────────────────────────────────────────────────────
  function setStatus(studentId, status) {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
    setIsDirty(true);
  }

  function markEveryone(status) {
    const updated = {};
    students.forEach((s) => { updated[s.id] = status; });
    setAttendance(updated);
    setIsDirty(true);
  }

  async function handleSave() {
    // Stable upsert key: date + scope — same session always overwrites itself
    const record = {
      id: `${date}-${section}`,
      date,
      scope: section,
      records: { ...attendance },
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveAttendanceLog(record);
      setIsDirty(false);

      // Fire-and-forget sync
      getSettings().then((st) => {
        if (st.googleSheetUrl) {
          sendToGoogleSheet(st.googleSheetUrl, "SAVE_ATTENDANCE", {
            attendance: record,
          });
        }
      });

      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        navigate("/history");
      }, 1000);
    } catch (err) {
      console.error("Failed to save attendance:", err);
      alert("Save failed. Please try again.");
    }
  }

  // ── In-app navigation guard (no useBlocker — use prompt via navigate guard) ─
  function handleSectionChange(newSection) {
    if (isDirty) {
      const ok = window.confirm(
        "You have unsaved changes. Switch section without saving?"
      );
      if (!ok) return;
    }
    setSection(newSection);
    setSearchQuery("");
  }

  // ── Render ────────────────────────────────────────────────────────────────
  const activeCount = allStudents.filter((s) => s.status !== "inactive").length;

  const statItems = [
    { key: "present", label: t("present"), cls: "pill-present", icon: <CheckCircle2 size={14} /> },
    { key: "absent",  label: t("absent"),  cls: "pill-absent",  icon: <XCircle size={14} /> },
    { key: "late",    label: t("late"),    cls: "pill-late",    icon: <Clock size={14} /> },
    { key: "leave",   label: t("leave"),   cls: "pill-leave",   icon: <UserX size={14} /> },
  ];

  return (
    <div className="app-shell">
      <Navbar onOpenSettings={() => setIsSettingsOpen(true)} />

      <main className="main-content container">
        {/* ── Header ── */}
        <div className="page-title-row">
          <div>
            <h2>{t("attendance")}</h2>
            <p className="page-subtitle">
              {date} · {students.length} students
            </p>
          </div>
          <div className="date-picker-wrapper">
            <Calendar size={16} />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field date-input"
              aria-label="Select attendance date"
            />
          </div>
        </div>

        {/* ── Section tabs ── */}
        <div className="section-tab-bar">
          {[
            { key: "ALL",  label: `${t("allStudents")} (${activeCount})` },
            { key: "HIFZ", label: "Hifz" },
            { key: "DARS", label: "Dars" },
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`tab-item ${section === key ? "active" : ""}`}
              onClick={() => handleSectionChange(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Stats bar ── */}
        <div className="attendance-stats-bar">
          {statItems.map(({ key, label, cls, icon }) => (
            <div className={`stat-pill ${cls}`} key={key}>
              {icon}
              <span>{label.toUpperCase()}</span>
              <strong>{stats[key]}</strong>
            </div>
          ))}
        </div>

        {/* ── Loading ── */}
        {loading ? (
          <div className="loading-box">
            <div className="loading-spinner" />
            <span>Loading students…</span>
          </div>
        ) : students.length === 0 ? (
          <div className="empty-box">
            <UserPlus size={36} color="#94a3b8" />
            <p>{t("noStudentsYet")}</p>
            <button
              className="primary-button"
              onClick={() => navigate("/students")}
            >
              {t("addStudent")}
            </button>
          </div>
        ) : (
          <>
            {/* ── Bulk actions + search ── */}
            <div className="bulk-action-bar">
              <div className="search-box compact-search">
                <Search size={15} />
                <input
                  type="text"
                  placeholder="Search student…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field"
                  aria-label="Search students"
                />
              </div>
              <div className="bulk-btn-group">
                <button
                  className="bulk-btn btn-all-present"
                  onClick={() => markEveryone("PRESENT")}
                >
                  <Check size={14} /> {t("markAllPresent")}
                </button>
                <button
                  className="bulk-btn btn-all-absent"
                  onClick={() => markEveryone("ABSENT")}
                >
                  <XCircle size={14} /> {t("markAllAbsent")}
                </button>
              </div>
            </div>

            {/* ── Student rows ── */}
            <div className="attendance-student-list">
              {filteredStudents.length === 0 ? (
                <div className="empty-box" style={{ margin: 0 }}>
                  <Search size={28} color="#94a3b8" />
                  <p>No students match "{searchQuery}"</p>
                </div>
              ) : (
                filteredStudents.map((st) => {
                  const currentStatus = attendance[st.id] || "PRESENT";
                  return (
                    <div
                      key={st.id}
                      className={`attendance-row status-${currentStatus.toLowerCase()}`}
                    >
                      <div className="row-left">
                        <span
                          className={`section-mini-badge badge-${st.section.toLowerCase()}`}
                        >
                          {st.section}
                        </span>
                        <span className="roll-badge">{st.rollNo}</span>
                        <div>
                          <h4 className="row-name">{st.name}</h4>
                          {st.classLevel && (
                            <p className="row-class">{st.classLevel}</p>
                          )}
                        </div>
                      </div>

                      <div className="row-status-buttons">
                        {STATUS_LIST.map((s) => (
                          <button
                            key={s}
                            className={`status-chip chip-${s.toLowerCase()} ${
                              currentStatus === s ? "active" : ""
                            }`}
                            onClick={() => setStatus(st.id, s)}
                            aria-pressed={currentStatus === s}
                            title={s}
                          >
                            {s === "PRESENT" && <CheckCircle2 size={13} />}
                            {s === "ABSENT"  && <XCircle size={13} />}
                            {s === "LATE"    && <Clock size={13} />}
                            {s === "LEAVE"   && <UserX size={13} />}
                            <span className="chip-label">
                              {t(s.toLowerCase())}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* ── Floating save bar ── */}
            <div className="save-floating-bar">
              {isDirty && !savedSuccess && (
                <span className="unsaved-indicator">● Unsaved changes</span>
              )}
              <button
                className={`primary-button save-attendance-btn ${
                  savedSuccess ? "saved" : ""
                }`}
                onClick={handleSave}
                disabled={savedSuccess}
              >
                <Save size={18} />
                {savedSuccess ? "Saved ✓" : t("saveAttendance")}
              </button>
            </div>
          </>
        )}
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
