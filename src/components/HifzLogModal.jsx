import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { SURAHS, HIFZ_GRADES } from "../data/hifzData";
import { saveHifzLog, getSettings } from "../services/indexedDB";
import { sendToGoogleSheet } from "../services/googleSheets";
import { t } from "../utils/i18n";

export default function HifzLogModal({ isOpen, onClose, student, onSaved }) {
  const [logData, setLogData] = useState({
    date: new Date().toISOString().split("T")[0],
    sabahSurah: "Al-Baqarah",
    sabahAyahs: "1-15",
    sabahGrade: "MUMTAZ",
    sabqiJuz: "Juz 1",
    sabqiGrade: "JAYYID_JIDDAN",
    manzilJuz: "Juz 1",
    manzilGrade: "JAYYID",
    teacherRemarks: ""
  });

  useEffect(() => {
    if (student) {
      setLogData((prev) => ({
        ...prev,
        sabahSurah: student.currentSurah || "Al-Baqarah",
        sabqiJuz: `Juz ${Math.max(1, (student.currentJuz || 1) - 1)}`
      }));
    }
  }, [student, isOpen]);

  if (!isOpen || !student) return null;

  async function handleSubmit(e) {
    e.preventDefault();

    const record = {
      id: `HIFZ-${student.id}-${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      ...logData
    };

    await saveHifzLog(record);

    getSettings().then((st) => {
      if (st.googleSheetUrl) {
        sendToGoogleSheet(st.googleSheetUrl, "SAVE_HIFZ_LOG", { hifzLog: record });
      }
    });

    if (onSaved) onSaved(record);
    onClose();
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container hifz-log-modal">
        <div className="modal-header">
          <div>
            <h2>{t("logDailyLesson")}</h2>
            <p className="modal-subtitle">{student.name} ({student.rollNo})</p>
          </div>
          <button className="icon-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>{t("date")}</label>
            <input
              type="date"
              value={logData.date}
              onChange={(e) => setLogData({ ...logData, date: e.target.value })}
              className="input-field"
            />
          </div>

          {/* Sabah */}
          <div className="hifz-triad-card triad-sabah">
            <div className="triad-header">
              <span className="triad-badge badge-sabah">{t("sabah")}</span>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Surah</label>
                <select
                  value={logData.sabahSurah}
                  onChange={(e) => setLogData({ ...logData, sabahSurah: e.target.value })}
                  className="input-field"
                >
                  {SURAHS.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.id}. {s.name} ({s.arabic})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Ayahs / Pages</label>
                <input
                  type="text"
                  placeholder="e.g. 1-15"
                  value={logData.sabahAyahs}
                  onChange={(e) => setLogData({ ...logData, sabahAyahs: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Rating</label>
              <select
                value={logData.sabahGrade}
                onChange={(e) => setLogData({ ...logData, sabahGrade: e.target.value })}
                className="input-field"
              >
                {Object.values(HIFZ_GRADES).map((g) => (
                  <option key={g.code} value={g.code}>
                    {g.badge}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sabqi */}
          <div className="hifz-triad-card triad-sabqi">
            <div className="triad-header">
              <span className="triad-badge badge-sabqi">{t("sabqi")}</span>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Juz</label>
                <input
                  type="text"
                  placeholder="e.g. Juz 17"
                  value={logData.sabqiJuz}
                  onChange={(e) => setLogData({ ...logData, sabqiJuz: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label>Rating</label>
                <select
                  value={logData.sabqiGrade}
                  onChange={(e) => setLogData({ ...logData, sabqiGrade: e.target.value })}
                  className="input-field"
                >
                  {Object.values(HIFZ_GRADES).map((g) => (
                    <option key={g.code} value={g.code}>
                      {g.badge}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Manzil */}
          <div className="hifz-triad-card triad-manzil">
            <div className="triad-header">
              <span className="triad-badge badge-manzil">{t("manzil")}</span>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Juz</label>
                <input
                  type="text"
                  placeholder="e.g. Juz 1 to 5"
                  value={logData.manzilJuz}
                  onChange={(e) => setLogData({ ...logData, manzilJuz: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label>Rating</label>
                <select
                  value={logData.manzilGrade}
                  onChange={(e) => setLogData({ ...logData, manzilGrade: e.target.value })}
                  className="input-field"
                >
                  {Object.values(HIFZ_GRADES).map((g) => (
                    <option key={g.code} value={g.code}>
                      {g.badge}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>{t("remarks")}</label>
            <input
              type="text"
              placeholder="Notes..."
              value={logData.teacherRemarks}
              onChange={(e) => setLogData({ ...logData, teacherRemarks: e.target.value })}
              className="input-field"
            />
          </div>

          <div className="modal-footer-row">
            <button type="button" className="secondary-button" onClick={onClose}>
              {t("cancel")}
            </button>
            <button type="submit" className="primary-button">
              <Save size={16} /> {t("saveDailyLesson")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
