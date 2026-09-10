import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar, Download, Search, CheckCircle2, XCircle,
  Clock, UserX, ChevronDown, ChevronUp, Users,
} from "lucide-react";
import Navbar from "../components/Navbar";
import SettingsModal from "../components/SettingsModal";
import { getAttendanceLogs, getAllStudents } from "../services/indexedDB";
import { t } from "../utils/i18n";
import { useLang } from "../context/LanguageContext";

export default function History() {
  useLang();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  // Task #12 — per-student view
  const [selectedStudentId, setSelectedStudentId] = useState("ALL");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const [records, stList] = await Promise.all([getAttendanceLogs(), getAllStudents()]);
    setLogs(records.sort((a, b) => b.date.localeCompare(a.date)));
    setStudents(stList);
  }

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const matchSearch =
        l.date.includes(searchQuery) ||
        l.scope.toLowerCase().includes(searchQuery.toLowerCase());

      // Per-student filter: show only logs where this student was marked
      const matchStudent =
        selectedStudentId === "ALL" ||
        (l.records && l.records[selectedStudentId] !== undefined);

      return matchSearch && matchStudent;
    });
  }, [logs, searchQuery, selectedStudentId]);

  function handleExportCSV() {
    if (!logs.length) return;
    const rows = [["ID", "Date", "Scope", "Present", "Absent", "Late", "Leave"]];
    logs.forEach((l) => {
      const vals = Object.values(l.records || {});
      rows.push([
        l.id, l.date, l.scope,
        vals.filter((v) => v === "PRESENT").length,
        vals.filter((v) => v === "ABSENT").length,
        vals.filter((v) => v === "LATE").length,
        vals.filter((v) => v === "LEAVE").length,
      ]);
    });
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = `attendance_history_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  }

  // Summary stats for selected student
  const studentSummary = useMemo(() => {
    if (selectedStudentId === "ALL") return null;
    let present = 0, absent = 0, late = 0, leave = 0, total = 0;
    logs.forEach((l) => {
      const status = l.records?.[selectedStudentId];
      if (!status) return;
      total++;
      if (status === "PRESENT") present++;
      else if (status === "ABSENT") absent++;
      else if (status === "LATE") late++;
      else if (status === "LEAVE") leave++;
    });
    const pct = total > 0 ? Math.round(((present + late) / total) * 100) : 100;
    return { present, absent, late, leave, total, pct };
  }, [selectedStudentId, logs]);

  const selectedStudentName = students.find((s) => s.id === selectedStudentId)?.name;

  return (
    <div className="app-shell">
      <Navbar onOpenSettings={() => setIsSettingsOpen(true)} />

      <main className="main-content container">
        <div className="page-title-row">
          <div>
            <h2>{t("attendanceHistory")}</h2>
            <p className="page-subtitle">{logs.length} sessions recorded</p>
          </div>
          <button className="secondary-button" onClick={handleExportCSV}>
            <Download size={16} /> {t("exportHistoryCsv")}
          </button>
        </div>

        {/* Filter bar */}
        <div className="filter-controls-card" style={{ gap: 12 }}>
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by date or scope…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              aria-label="Search history"
            />
          </div>

          {/* Task #12 — per-student filter */}
          <div className="student-filter-wrapper">
            <Users size={15} />
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="student-filter-select"
              aria-label="Filter by student"
            >
              <option value="ALL">All Students</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.rollNo})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Per-student summary card (Task #12) */}
        {studentSummary && (
          <div className="student-att-summary-card">
            <div className="summary-name">
              <strong>{selectedStudentName}</strong>
              <span>Overall Attendance</span>
            </div>
            <div className="summary-stats">
              <div className="summary-stat"><CheckCircle2 size={14} color="#047857" /><span>{studentSummary.present} Present</span></div>
              <div className="summary-stat"><XCircle size={14} color="#dc2626" /><span>{studentSummary.absent} Absent</span></div>
              <div className="summary-stat"><Clock size={14} color="#d97706" /><span>{studentSummary.late} Late</span></div>
              <div className="summary-stat"><UserX size={14} color="#2563eb" /><span>{studentSummary.leave} Leave</span></div>
            </div>
            <div className="summary-pct-block">
              <strong>{studentSummary.pct}%</strong>
              <span>of {studentSummary.total} sessions</span>
            </div>
          </div>
        )}

        <div className="history-cards-list">
          {filteredLogs.length === 0 ? (
            <div className="empty-box">
              <Calendar size={36} color="#94a3b8" />
              <p>{t("noHistoryYet")}</p>
              <button className="primary-button" onClick={() => navigate("/attendance/ALL")}>
                {t("markAttendance")}
              </button>
            </div>
          ) : (
            filteredLogs.map((record) => {
              const vals = Object.values(record.records || {});
              const total = vals.length;
              const present = vals.filter((v) => v === "PRESENT").length;
              const absent  = vals.filter((v) => v === "ABSENT").length;
              const late    = vals.filter((v) => v === "LATE").length;
              const leave   = vals.filter((v) => v === "LEAVE").length;
              const pct = total > 0 ? Math.round(((present + late) / total) * 100) : 100;
              const isExpanded = expandedId === record.id;

              // For per-student view, highlight this student's status
              const studentStatus =
                selectedStudentId !== "ALL"
                  ? record.records?.[selectedStudentId]
                  : null;

              return (
                <div className="history-log-card" key={record.id}>
                  <div
                    className="card-log-header"
                    onClick={() => setExpandedId(isExpanded ? null : record.id)}
                    role="button" tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && setExpandedId(isExpanded ? null : record.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="log-header-left">
                      <span className="log-date">{record.date}</span>
                      <span className="log-scope-badge">{record.scope}</span>
                      {studentStatus && (
                        <span className={`student-status-chip status-${studentStatus.toLowerCase()}`}>
                          {studentStatus}
                        </span>
                      )}
                    </div>
                    <div className="log-header-right">
                      <div className="percentage-pill">
                        <strong>{pct}%</strong>
                        <span>{t("presentRate")}</span>
                      </div>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>

                  <div className="log-metrics-row">
                    <div className="metric-item item-present"><CheckCircle2 size={14} /><span>{present} {t("present")}</span></div>
                    <div className="metric-item item-absent"><XCircle size={14} /><span>{absent} {t("absent")}</span></div>
                    <div className="metric-item item-late"><Clock size={14} /><span>{late} {t("late")}</span></div>
                    <div className="metric-item item-leave"><UserX size={14} /><span>{leave} {t("leave")}</span></div>
                  </div>

                  {/* Expanded: show individual student breakdown */}
                  {isExpanded && record.records && (
                    <div className="log-detail-table">
                      {students
                        .filter((s) => record.records[s.id] !== undefined)
                        .map((s) => (
                          <div
                            className={`log-detail-row status-${(record.records[s.id] || "").toLowerCase()}`}
                            key={s.id}
                          >
                            <span className="roll-badge">{s.rollNo}</span>
                            <span className="detail-name">{s.name}</span>
                            <span className={`detail-status-chip ${record.records[s.id]?.toLowerCase()}`}>
                              {record.records[s.id]}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
