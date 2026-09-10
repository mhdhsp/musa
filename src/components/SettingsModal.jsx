import { useState, useEffect } from "react";
import {
  X, Copy, Check, Cloud, Download, Upload, FileText,
  CheckCircle2, AlertCircle, Globe, PlayCircle, Trash2,
} from "lucide-react";
import {
  getSettings, saveSetting, exportFullBackup, importFullBackup,
  getAllStudents, getAttendanceLogs, clearAllData,
} from "../services/indexedDB";
import {
  testGoogleSheetConnection, GOOGLE_APPS_SCRIPT_TEMPLATE, sendToGoogleSheet,
} from "../services/googleSheets";
import { LANGUAGES, t } from "../utils/i18n";
import { useLang } from "../context/LanguageContext";

export default function SettingsModal({ isOpen, onClose }) {
  const { lang, changeLanguage } = useLang();
  const [url, setUrl] = useState("");
  const [statusMsg, setStatusMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("gsheets");

  useEffect(() => {
    if (isOpen) {
      getSettings().then((st) => setUrl(st.googleSheetUrl || ""));
      setStatusMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function handleSelectLanguage(code) {
    changeLanguage(code);
    setStatusMsg({ type: "success", text: `Language changed to ${LANGUAGES[code].name}` });
  }

  async function handleSaveUrl() {
    if (!url.trim()) {
      setStatusMsg({ type: "error", text: "Please paste your Google Web App URL." });
      return;
    }
    setLoading(true);
    setStatusMsg({ type: "info", text: "Connecting & sending test row…" });
    const result = await testGoogleSheetConnection(url);
    await saveSetting("googleSheetUrl", url.trim());
    setStatusMsg(result.success
      ? { type: "success", text: result.message }
      : { type: "warning", text: `URL saved. ${result.message}` }
    );
    setLoading(false);
  }

  async function handleFullSync() {
    if (!url.trim()) {
      setStatusMsg({ type: "error", text: "Please save a Google Web App URL first." });
      return;
    }
    setLoading(true);
    setStatusMsg({ type: "info", text: "Syncing all records to Google Sheet…" });
    const backup = await exportFullBackup();
    const ok = await sendToGoogleSheet(url, "FULL_SYNC", { payload: backup });
    setStatusMsg(ok
      ? { type: "success", text: "Full sync sent to Google Sheet!" }
      : { type: "error", text: "Failed to reach Google Sheet. Check your URL." }
    );
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
    URL.revokeObjectURL(a.href);
  }

  async function handleExportStudentsCSV() {
    const students = await getAllStudents();
    if (!students.length) return;
    const headers = Object.keys(students[0]);
    const rows = students.map((s) =>
      headers.map((h) => `"${(s[h] ?? "").toString().replace(/"/g, '""')}"`).join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = `students_roster_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  }

  async function handleExportAttendanceCSV() {
    const attendance = await getAttendanceLogs();
    if (!attendance.length) return;
    const rows = [["ID", "Date", "Scope", "Records"]];
    attendance.forEach((att) =>
      rows.push([att.id, att.date, att.scope, JSON.stringify(att.records)])
    );
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
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
        setStatusMsg({ type: "success", text: "Backup restored! Refreshing…" });
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        setStatusMsg({ type: "error", text: `Restore failed: ${err.message}` });
      }
    };
    reader.readAsText(file);
    // reset so same file can be re-imported
    e.target.value = "";
  }

  async function handleClearDatabase() {
    if (
      window.confirm(
        "This will permanently delete ALL students, attendance, and hifz records. Are you sure?"
      )
    ) {
      await clearAllData();
      setStatusMsg({ type: "success", text: "Database cleared. Refreshing…" });
      setTimeout(() => window.location.reload(), 1200);
    }
  }

  const TABS = [
    { id: "gsheets", label: "Google Sheets", icon: <Cloud size={15} /> },
    { id: "script",  label: "Script Code",   icon: <FileText size={15} /> },
    { id: "language",label: "Language",      icon: <Globe size={15} /> },
    { id: "backup",  label: "Export / Backup",icon: <Download size={15} /> },
  ];

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container settings-modal">
        <div className="modal-header">
          <h2>{t("databaseSettings")}</h2>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="settings-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {statusMsg && (
          <div className={`status-alert alert-${statusMsg.type}`}>
            {statusMsg.type === "success" && <CheckCircle2 size={16} />}
            {statusMsg.type === "error"   && <AlertCircle size={16} />}
            {statusMsg.type === "warning" && <AlertCircle size={16} />}
            <span>{statusMsg.text}</span>
            <button className="alert-dismiss" onClick={() => setStatusMsg(null)}>
              <X size={14} />
            </button>
          </div>
        )}

        <div className="modal-body">
          {/* ── Google Sheets ── */}
          {activeTab === "gsheets" && (
            <div className="setting-section">
              <div className="gsheet-setup-banner">
                <h3>Google Sheet Database Connection</h3>
                <p>Connect your Google Sheet for automatic background sync in 3 steps.</p>
              </div>

              <div className="setup-steps-cards">
                {[
                  {
                    n: 1, title: "Copy Script",
                    body: <>Go to the <strong>Script Code</strong> tab and click "Copy Code".</>,
                  },
                  {
                    n: 2, title: "Paste in Apps Script",
                    body: <>Open Google Sheets → Extensions → Apps Script. Paste into <code>Code.gs</code> and save.</>,
                  },
                  {
                    n: 3, title: "Deploy as Web App",
                    body: (
                      <>
                        Click Deploy → New deployment → Web app.
                        <div className="critical-badges" style={{ marginTop: 8 }}>
                          <span className="critical-badge">Execute as: <strong>Me</strong></span>
                          <span className="critical-badge">Access: <strong>Anyone</strong></span>
                        </div>
                      </>
                    ),
                  },
                ].map(({ n, title, body }) => (
                  <div className="setup-step-card" key={n}>
                    <span className="step-num">{n}</span>
                    <div>
                      <strong>{title}</strong>
                      <p>{body}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-group sheet-url-group">
                <label>Paste Your Google Web App URL</label>
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="input-field sheet-url-input"
                />
              </div>

              <div className="action-row">
                <button className="primary-button" onClick={handleSaveUrl} disabled={loading}>
                  <PlayCircle size={15} />
                  {loading ? "Connecting…" : "Save & Test Connection"}
                </button>
                <button className="secondary-button" onClick={handleFullSync} disabled={loading}>
                  Sync All Data Now
                </button>
              </div>
            </div>
          )}

          {/* ── Script Code ── */}
          {activeTab === "script" && (
            <div className="setting-section">
              <p className="setting-desc">
                Copy this code, open Google Sheets → Extensions → Apps Script, paste into <code>Code.gs</code>, then deploy.
              </p>
              <div className="code-block-wrapper">
                <button className="copy-code-btn" onClick={handleCopyScript}>
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                  {copied ? "Copied!" : "Copy Script Code"}
                </button>
                <pre className="code-snippet">{GOOGLE_APPS_SCRIPT_TEMPLATE}</pre>
              </div>
            </div>
          )}

          {/* ── Language ── */}
          {activeTab === "language" && (
            <div className="setting-section">
              <h3>Application Language</h3>
              <p className="setting-desc">Layout direction auto-adjusts for Arabic and Urdu.</p>
              <div className="language-grid">
                {Object.values(LANGUAGES).map((l) => (
                  <div
                    key={l.code}
                    className={`language-card ${lang === l.code ? "selected" : ""}`}
                    onClick={() => handleSelectLanguage(l.code)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && handleSelectLanguage(l.code)}
                  >
                    <span className="lang-flag">{l.flag}</span>
                    <div className="lang-info">
                      <strong>{l.name}</strong>
                      <span>{l.code.toUpperCase()} · {l.dir.toUpperCase()}</span>
                    </div>
                    {lang === l.code && <CheckCircle2 size={18} className="lang-check" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Backup ── */}
          {activeTab === "backup" && (
            <div className="setting-section">
              <h3>Export Data</h3>
              <div className="backup-action-grid">
                <button className="backup-action-card" onClick={handleExportJSON}>
                  <Download size={20} />
                  <strong>Full JSON Backup</strong>
                  <span>Students, attendance & hifz logs</span>
                </button>
                <button className="backup-action-card" onClick={handleExportStudentsCSV}>
                  <Download size={20} />
                  <strong>Students CSV</strong>
                  <span>Roster spreadsheet export</span>
                </button>
                <button className="backup-action-card" onClick={handleExportAttendanceCSV}>
                  <Download size={20} />
                  <strong>Attendance CSV</strong>
                  <span>Full attendance log</span>
                </button>
              </div>

              <div className="backup-divider" />

              <h3>Restore Backup</h3>
              <p className="setting-desc">Import a previously exported JSON backup file. Existing data will be merged.</p>
              <label className="import-file-btn">
                <Upload size={16} /> Choose JSON Backup File
                <input type="file" accept=".json" onChange={handleImportFile} hidden />
              </label>

              <div className="backup-divider" />

              <h3 style={{ color: "#dc2626" }}>Danger Zone</h3>
              <p className="setting-desc">Permanently deletes all local data. Cannot be undone.</p>
              <button className="danger-full-btn" onClick={handleClearDatabase}>
                <Trash2 size={16} /> Clear Entire Database
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
