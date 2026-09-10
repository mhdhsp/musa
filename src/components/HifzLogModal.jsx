import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { SURAHS, HIFZ_GRADES } from "../data/hifzData";
import { saveHifzLog, saveStudent, getSettings } from "../services/indexedDB";
import { sendToGoogleSheet } from "../services/googleSheets";
import { t } from "../utils/i18n";
import { useLang } from "../context/LanguageContext";

export default function HifzLogModal({ isOpen, onClose, student, onSaved }) {
  useLang();

  const [logData, setLogData] = useState({
    date: new Date().toISOString().split("T")[0],
    sabahSurah: "Al-Baqarah",
    sabahAyahs: "1-15",
    sabahGrade: "MUMTAZ",
    sabqiJuz: "Juz 1",
    sabqiGrade: "JAYYID_JIDDAN",
    manzilJuz: "Juz 1",
    manzilGrade: "JAYYID",
    teacherRemarks: "",
    updateJuzCount: false,
    newJuzCount: 0,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (student && isOpen) {
      setLogData((prev) => ({
        ...prev,
        sabahSurah: student.currentSurah || "Al-Baqarah",
        sabqiJuz: `Juz ${Math.max(1, (student.currentJuz || 1) - 1)}`,
        newJuzCount: student.totalJuzMemorized || 0,
        updateJuzCount: false,
      }));
    }
  }, [student, isOpen]);

  if (!isOpen || !student) return null;

  function set(field, value) {
    setLogData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    const record = {
      id: `HIFZ-${student.id}-${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      date: logData.date,
      sabahSurah: logData.sabahSurah,
      sabahAyahs: logData.sabahAyahs,
      sabahGrade: logData.sabahGrade,
      sabqiJuz: logData.sabqiJuz,
      sabqiGrade: logData.sabqiGrade,
      manzilJuz: logData.manzilJuz,
      manzilGrade: logData.manzilGrade,
      teacherRemarks: logData.teacherRemarks,
    };

    await saveHifzLog(record);

    // Task #8 — optionally update student's totalJuzMemorized
    if (logData.updateJuzCount) {
      const updated = {
        ...student,
        totalJuzMemorized: Math.min(30, Math.max(0, logData.newJuzCount)),
        currentJuz: Math.min(30, Math.max(1, logData.newJuzCount + 1)),
      };
      await saveStudent(updated);
    }

    getSettings().then((st) => {
      if (st.googleSheetUrl) {
        sendToGoogleSheet(st.googleSheetUrl, "SAVE_HIFZ_LOG", { hifzLog: record });
      }
    });

    onSaved?.(record, logData.updateJuzCount ? { ...student, totalJuzMemorized: logData.newJuzCount } : null);
    onClose();
    setSaving(false);
  }

  const gradeOptions = Object.values(HIFZ_GRADES).map((g) => (
    <option key={g.code} value={g.code}>{g.badge}</option>
  ));

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container hifz-log-modal">
        <div className="modal-header">
          <div>
            <h2>{t("logDailyLesson")}</h2>
            <p className="modal-subtitle">{student.name} · {student.rollNo}</p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>{t("date")}</label>
            <input
              type="date"
              value={logData.date}
              onChange={(e) => set("date", e.target.value)}
              className="input-field"
            />
          </div>

          {/* ── Sabah ── */}
          <div className="hifz-triad-card triad-sabah">
            <div className="triad-header">
              <span className="triad-badge badge-sabah">{t("sabah")}</span>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Surah</label>
                <select value={logData.sabahSurah} onChange={(e) => set("sabahSurah", e.target.value)} className="input-field">
                  {SURAHS.map((s) => (
                    <option key={s.id} value={s.name}>{s.id}. {s.name} ({s.arabic})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Ayahs / Pages</label>
                <input type="text" placeholder="e.g. 1-15" value={logData.sabahAyahs} onChange={(e) => set("sabahAyahs", e.target.value)} className="input-field" />
              </div>
            </div>
            <div className="form-group">
              <label>Rating</label>
              <select value={logData.sabahGrade} onChange={(e) => set("sabahGrade", e.target.value)} className="input-field">
                {gradeOptions}
              </select>
            </div>
          </div>

          {/* ── Sabqi ── */}
          <div className="hifz-triad-card triad-sabqi">
            <div className="triad-header">
              <span className="triad-badge badge-sabqi">{t("sabqi")}</span>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Juz</label>
                <input type="text" placeholder="e.g. Juz 17" value={logData.sabqiJuz} onChange={(e) => set("sabqiJuz", e.target.value)} className="input-field" />
              </div>
              <div className="form-group">
                <label>Rating</label>
                <select value={logData.sabqiGrade} onChange={(e) => set("sabqiGrade", e.target.value)} className="input-field">
                  {gradeOptions}
                </select>
              </div>
            </div>
          </div>

          {/* ── Manzil ── */}
          <div className="hifz-triad-card triad-manzil">
            <div className="triad-header">
              <span className="triad-badge badge-manzil">{t("manzil")}</span>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Juz</label>
                <input type="text" placeholder="e.g. Juz 1 to 5" value={logData.manzilJuz} onChange={(e) => set("manzilJuz", e.target.value)} className="input-field" />
              </div>
              <div className="form-group">
                <label>Rating</label>
                <select value={logData.manzilGrade} onChange={(e) => set("manzilGrade", e.target.value)} className="input-field">
                  {gradeOptions}
                </select>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>{t("remarks")}</label>
            <input
              type="text"
              placeholder="Teacher notes…"
              value={logData.teacherRemarks}
              onChange={(e) => set("teacherRemarks", e.target.value)}
              className="input-field"
            />
          </div>

          {/* ── Task #8: Update juz counter ── */}
          <div className="update-juz-toggle">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={logData.updateJuzCount}
                onChange={(e) => set("updateJuzCount", e.target.checked)}
              />
              <span>Update Juz memorized count after saving</span>
            </label>
            {logData.updateJuzCount && (
              <div className="form-group" style={{ marginTop: 10 }}>
                <label>New Total Juz Memorized (0–30)</label>
                <input
                  type="number" min="0" max="30"
                  value={logData.newJuzCount}
                  onChange={(e) => set("newJuzCount", parseInt(e.target.value) || 0)}
                  className="input-field"
                />
              </div>
            )}
          </div>

          <div className="modal-footer-row">
            <button type="button" className="secondary-button" onClick={onClose}>
              {t("cancel")}
            </button>
            <button type="submit" className="primary-button" disabled={saving}>
              <Save size={15} />
              {saving ? "Saving…" : t("logDailyLesson")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
