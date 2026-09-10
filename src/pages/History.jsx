import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Download, Search, CheckCircle2, XCircle, Clock, UserX } from "lucide-react";
import Navbar from "../components/Navbar";
import SettingsModal from "../components/SettingsModal";
import { getAttendanceLogs } from "../services/indexedDB";
import { t } from "../utils/i18n";

export default function History() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [, setLangState] = useState(0);

  useEffect(() => {
    loadData();
    const handleLangChange = () => setLangState((prev) => prev + 1);
    window.addEventListener("languagechange", handleLangChange);
    return () => window.removeEventListener("languagechange", handleLangChange);
  }, []);

  async function loadData() {
    const records = await getAttendanceLogs();
    setLogs(records.sort((a, b) => b.date.localeCompare(a.date)));
  }

  const filteredLogs = logs.filter(
    (l) => l.date.includes(searchQuery) || l.scope.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function handleExportCSV() {
    if (logs.length === 0) return;
    const rows = [];
    rows.push(["ID", "Date", "Scope", "Present Count", "Absent Count", "Late Count", "Leave Count"]);

    logs.forEach((l) => {
      const records = l.records || {};
      const vals = Object.values(records);
      const present = vals.filter((v) => v === "PRESENT").length;
      const absent = vals.filter((v) => v === "ABSENT").length;
      const late = vals.filter((v) => v === "LATE").length;
      const leave = vals.filter((v) => v === "LEAVE").length;
      rows.push([l.id, l.date, l.scope, present, absent, late, leave]);
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((r) => r.map((cell) => `"${cell}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const a = document.createElement("a");
    a.href = encodedUri;
    a.download = `attendance_history_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  }

  return (
    <div className="app-shell">
      <Navbar onOpenSettings={() => setIsSettingsOpen(true)} />

      <main className="main-content container">
        <div className="page-title-row">
          <div>
            <h2>{t("attendanceHistory")}</h2>
          </div>
          <button className="secondary-button" onClick={handleExportCSV}>
            <Download size={18} /> {t("exportHistoryCsv")}
          </button>
        </div>

        <div className="filter-controls-card">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        <div className="history-cards-list">
          {filteredLogs.length === 0 ? (
            <div className="empty-box">
              <Calendar size={40} color="#94a3b8" />
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
              const absent = vals.filter((v) => v === "ABSENT").length;
              const late = vals.filter((v) => v === "LATE").length;
              const leave = vals.filter((v) => v === "LEAVE").length;

              const presentPercentage = total > 0 ? Math.round(((present + late) / total) * 100) : 100;

              return (
                <div className="history-log-card" key={record.id}>
                  <div className="card-log-header">
                    <div>
                      <span className="log-date">{record.date}</span>
                      <span className="log-scope-badge">{record.scope}</span>
                    </div>
                    <div className="percentage-pill">
                      <strong>{presentPercentage}%</strong> {t("presentRate")}
                    </div>
                  </div>

                  <div className="log-metrics-row">
                    <div className="metric-item item-present">
                      <CheckCircle2 size={16} />
                      <span>{present} {t("present")}</span>
                    </div>
                    <div className="metric-item item-absent">
                      <XCircle size={16} />
                      <span>{absent} {t("absent")}</span>
                    </div>
                    <div className="metric-item item-late">
                      <Clock size={16} />
                      <span>{late} {t("late")}</span>
                    </div>
                    <div className="metric-item item-leave">
                      <UserX size={16} />
                      <span>{leave} {t("leave")}</span>
                    </div>
                  </div>
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