import { useState, useEffect } from "react";
import { X, Copy, Check, Cloud, Download, Upload, FileText, CheckCircle2, AlertCircle, Globe, PlayCircle } from "lucide-react";
import { getSettings, saveSetting, exportFullBackup, importFullBackup, getAllStudents, getAttendanceLogs, clearAllData } from "../services/indexedDB";
import { testGoogleSheetConnection, GOOGLE_APPS_SCRIPT_TEMPLATE, sendToGoogleSheet } from "../services/googleSheets";
import { LANGUAGES, getLanguage, setLanguage, t } from "../utils/i18n";

export default function SettingsModal({ isOpen, onClose }) {
  const [url, setUrl] = useState("");
  const [statusMsg, setStatusMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("gsheets");
  const [currentLang, setCurrentLang] = useState(getLanguage());

  useEffect(() => {
    if (isOpen) {
      getSettings().then((st) => {
        setUrl(st.googleSheetUrl || "");
      });
      setCurrentLang(getLanguage());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function handleSelectLanguage(code) {
    setLanguage(code);
    setCurrentLang(code);
    setStatusMsg({ type: "success", text: `Language changed to ${LANGUAGES[code].name}!` });
  }

  async function handleSaveUrl() {
    if (!url.trim()) {
      setStatusMsg({ type: "error", text: "Please paste your Google Web App URL." });
      return;
    }

    setLoading(true);
    setStatusMsg({ type: "info", text: "Connecting to Google Sheet & sending test row..." });

    const result = await testGoogleSheetConnection(url);
    await saveSetting("googleSheetUrl", url.trim());

    if (result.success) {
      setStatusMsg({ type: "success", text: result.message });
    } else {
      setStatusMsg({ type: "warning", text: `Saved URL! ${result.message}` });
    }
    setLoading(false);
  }

  async function handleFullSync() {
    if (!url.trim()) {
      setStatusMsg({ type: "error", text: "Please paste your Google Web App URL first." });
      return;
    }
    setLoading(true);
    setStatusMsg({ type: "info", text: "Syncing all student records to Google Sheet..." });

    const backup = await exportFullBackup();
    const ok = await sendToGoogleSheet(url, "FULL_SYNC", { payload: backup });

    if (ok) {
      setStatusMsg({ type: "success", text: "Full database sync sent to Google Sheet!" });
    } else {
      setStatusMsg({ type: "error", text: "Failed to connect to Google Sheet." });
    }
    setLoading(false);
  }

  function handleCopyScript() {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_TEMPLATE);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  async function handleExportJSON() {
    const backup = await exportFullBackup();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `college_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
  }

  async function handleExportStudentsCSV() {
    const students = await getAllStudents();
    if (students.length === 0) return;
    const headers = Object.keys(students[0]).join(",");
    const rows = students.map((s) => Object.values(s).map((v) => `"${v || ""}"`).join(","));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const a = document.createElement("a");
    a.href = encodedUri;
    a.download = `students_roster_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  }

  async function handleExportAttendanceCSV() {
    const attendance = await getAttendanceLogs();
    if (attendance.length === 0) return;
    const rows = [];
    rows.push(["ID", "Date", "Scope", "Records"]);
    attendance.forEach((att) => {
      rows.push([att.id, att.date, att.scope, JSON.stringify(att.records)]);
    });
    const csvContent = "data:text/csv;charset=utf-8," + rows.map((r) => r.map((cell) => `"${cell}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const a = document.createElement("a");
    a.href = encodedUri;
    a.download = `attendance_history_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  }

  function handleImportFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const json = JSON.parse(evt.target.result);
        await importFullBackup(json);
        setStatusMsg({ type: "success", text: "Backup restored! Refreshing..." });
        setTimeout(() => window.location.reload(), 1500);
      } catch (_err) {
        setStatusMsg({ type: "error", text: "Failed to parse JSON backup file." });
      }
    };
    reader.readAsText(file);
  }

  async function handleClearDatabase() {
    if (window.confirm("Are you sure you want to delete all local students and records? This action cannot be undone.")) {
      await clearAllData();
      setStatusMsg({ type: "success", text: "Database cleared completely! Refreshing..." });
      setTimeout(() => window.location.reload(), 1200);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container settings-modal">
        <div className="modal-header">
          <h2>{t("databaseSettings")}</h2>
          <button className="icon-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="settings-tabs">
          <button
            className={`tab-btn ${activeTab === "gsheets" ? "active" : ""}`}
            onClick={() => setActiveTab("gsheets")}
          >
            <Cloud size={16} /> Google Sheets Setup
          </button>
          <button
            className={`tab-btn ${activeTab === "script" ? "active" : ""}`}
            onClick={() => setActiveTab("script")}
          >
            <FileText size={16} /> Copy Script Code
          </button>
          <button
            className={`tab-btn ${activeTab === "language" ? "active" : ""}`}
            onClick={() => setActiveTab("language")}
          >
            <Globe size={16} /> Language
          </button>
          <button
            className={`tab-btn ${activeTab === "backup" ? "active" : ""}`}
            onClick={() => setActiveTab("backup")}
          >
            <Download size={16} /> Export / Backup
          </button>
        </div>

        {statusMsg && (
          <div className={`status-alert alert-${statusMsg.type}`}>
            {statusMsg.type === "success" && <CheckCircle2 size={18} />}
            {statusMsg.type === "error" && <AlertCircle size={18} />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <div className="modal-body">
          {/* Google Sheets Setup Tab */}
          {activeTab === "gsheets" && (
            <div className="setting-section">
              <div className="gsheet-setup-banner">
                <h3>Google Sheet Database Connection</h3>
                <p>Follow the 3 steps below to connect your Google Sheet for daily automatic background sync!</p>
              </div>

              <div className="setup-steps-cards">
                <div className="setup-step-card">
                  <span className="step-num">1</span>
                  <div>
                    <strong>Get Code Snippet</strong>
                    <p>Go to the <strong>Copy Script Code</strong> tab and click "Copy Code".</p>
                  </div>
                </div>

                <div className="setup-step-card">
                  <span className="step-num">2</span>
                  <div>
                    <strong>Paste in Google Sheet</strong>
                    <p>Open Google Sheets → Extensions → Apps Script. Paste code in <code>Code.gs</code>.</p>
                  </div>
                </div>

                <div className="setup-step-card">
                  <span className="step-num">3</span>
                  <div>
                    <strong>Deploy as Web App (Critical Settings!)</strong>
                    <p>Click Deploy → New deployment → Select type: <strong>Web app</strong></p>
                    <div className="critical-badges">
                      <span className="critical-badge">Execute as: <strong>Me</strong></span>
                      <span className="critical-badge">Who has access: <strong>Anyone</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group sheet-url-group">
                <label>Paste Your Google Web App URL Here:</label>
                <input
                  type="text"
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="input-field sheet-url-input"
                />
              </div>

              <div className="action-row">
                <button
                  className="primary-button"
                  onClick={handleSaveUrl}
                  disabled={loading}
                >
                  <PlayCircle size={16} /> {loading ? "Connecting..." : "Save & Send Test Row"}
                </button>

                <button
                  className="secondary-button"
                  onClick={handleFullSync}
                  disabled={loading}
                >
                  {t("syncNow")}
                </button>
              </div>
            </div>
          )}

          {/* Script Guide Tab */}
          {activeTab === "script" && (
            <div className="setting-section">
              <p className="setting-desc">
                Click <strong>"Copy Script Code"</strong> below, open Google Sheets → Extensions → Apps Script, paste into <code>Code.gs</code>, and deploy!
              </p>

              <div className="code-block-wrapper">
                <button className="copy-code-btn" onClick={handleCopyScript}>
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? "Copied!" : "Copy Script Code"}
                </button>
                <pre className="code-snippet">{GOOGLE_APPS_SCRIPT_TEMPLATE}</pre>
              </div>
            </div>
          )}

          {/* Language Tab */}
          {activeTab === "language" && (
            <div className="setting-section">
              <h3>Select Application Language</h3>
              <p className="setting-desc">Choose your preferred language. Layout direction automatically adjusts for Arabic and Urdu.</p>
              
              <div className="language-grid">
                {Object.values(LANGUAGES).map((lang) => {
                  const isSelected = currentLang === lang.code;
                  return (
                    <div
                      key={lang.code}
                      className={`language-card ${isSelected ? "selected" : ""}`}
                      onClick={() => handleSelectLanguage(lang.code)}
                    >
                      <span className="lang-flag">{lang.flag}</span>
                      <div className="lang-info">
                        <strong>{lang.name}</strong>
                        <span>{lang.code.toUpperCase()} · {lang.dir.toUpperCase()}</span>
                      </div>
                      {isSelected && <CheckCircle2 size={20} className="lang-check" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Backup Tab */}
          {activeTab === "backup" && (
            <div className="setting-section">
              <div className="backup-grid">
                <div className="backup-card">
                  <h4>{t("exportBackup")}</h4>
                  <button className="secondary-button" onClick={handleExportJSON}>
                    <Download size={16} /> Export JSON
                  </button>
                </div>

                <div className="backup-card">
                  <h4>{t("restoreBackup")}</h4>
                  <label className="secondary-button file-upload-label">
                    <Upload size={16} /> Select Backup
                    <input type="file" accept=".json" onChange={handleImportFile} hidden />
                  </label>
                </div>

                <div className="backup-card">
                  <h4>{t("exportRoster")}</h4>
                  <button className="secondary-button" onClick={handleExportStudentsCSV}>
                    <FileText size={16} /> Export CSV
                  </button>
                </div>

                <div className="backup-card">
                  <h4>Clear Database</h4>
                  <button className="danger-button" onClick={handleClearDatabase}>
                    Clear All Local Students
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
