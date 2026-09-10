import { useState, useEffect } from "react";
import { X, Save, Trash2 } from "lucide-react";
import { SECTION_TYPES } from "../data/students";
import { saveStudent, deleteStudent, getSettings } from "../services/indexedDB";
import { sendToGoogleSheet } from "../services/googleSheets";
import { t } from "../utils/i18n";

export default function StudentModal({ isOpen, onClose, student = null, onSaved }) {
  const [formData, setFormData] = useState({
    id: "",
    rollNo: "",
    name: "",
    section: SECTION_TYPES.HIFZ,
    classLevel: "Hifz",
    guardianName: "",
    phone: "",
    joinedDate: new Date().toISOString().split("T")[0],
    status: "active",
    currentJuz: 1,
    totalJuzMemorized: 0,
    currentSurah: "Al-Fatiha",
    notes: ""
  });

  useEffect(() => {
    if (student) {
      setFormData({ ...student });
    } else {
      setFormData({
        id: `STU-${Date.now().toString().slice(-4)}`,
        rollNo: `H-${Math.floor(10 + Math.random() * 90)}`,
        name: "",
        section: SECTION_TYPES.HIFZ,
        classLevel: "Hifz",
        guardianName: "",
        phone: "",
        joinedDate: new Date().toISOString().split("T")[0],
        status: "active",
        currentJuz: 1,
        totalJuzMemorized: 0,
        currentSurah: "Al-Fatiha",
        notes: ""
      });
    }
  }, [student, isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.name.trim() || !formData.rollNo.trim()) return;

    await saveStudent(formData);

    getSettings().then((st) => {
      if (st.googleSheetUrl) {
        sendToGoogleSheet(st.googleSheetUrl, "SAVE_STUDENT", { student: formData });
      }
    });

    if (onSaved) onSaved(formData);
    onClose();
  }

  async function handleDelete() {
    if (!student) return;
    if (window.confirm(`${t("deleteStudent")} ${student.name}?`)) {
      await deleteStudent(student.id);

      // Webhook sync to Google Sheet
      getSettings().then((st) => {
        if (st.googleSheetUrl) {
          sendToGoogleSheet(st.googleSheetUrl, "DELETE_STUDENT", { studentId: student.id });
        }
      });

      if (onSaved) onSaved();
      onClose();
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container student-modal">
        <div className="modal-header">
          <h2>{student ? t("editProfile") : t("addStudent")}</h2>
          <button className="icon-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label>{t("fullName")} *</label>
              <input
                type="text"
                required
                placeholder="e.g. Abdul Rahman"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label>{t("rollNo")} *</label>
              <input
                type="text"
                required
                placeholder="e.g. H-01 or D-05"
                value={formData.rollNo}
                onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{t("section")} *</label>
              <select
                value={formData.section}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    section: e.target.value,
                    classLevel: e.target.value === SECTION_TYPES.HIFZ ? "Hifz" : "Dars"
                  })
                }
                className="input-field"
              >
                <option value={SECTION_TYPES.HIFZ}>HIFZ (Quran Memorization)</option>
                <option value={SECTION_TYPES.DARS}>DARS (Academic / College)</option>
              </select>
            </div>

            <div className="form-group">
              <label>{t("classLevel")}</label>
              <input
                type="text"
                placeholder="e.g. Year 1 or Senior"
                value={formData.classLevel}
                onChange={(e) => setFormData({ ...formData, classLevel: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          {formData.section === SECTION_TYPES.HIFZ && (
            <div className="form-row highlight-box">
              <div className="form-group">
                <label>{t("juzMemorized")} (0 - 30)</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={formData.totalJuzMemorized}
                  onChange={(e) => setFormData({ ...formData, totalJuzMemorized: parseInt(e.target.value) || 0 })}
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label>Current Juz</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={formData.currentJuz}
                  onChange={(e) => setFormData({ ...formData, currentJuz: parseInt(e.target.value) || 1 })}
                  className="input-field"
                />
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>{t("guardianName")}</label>
              <input
                type="text"
                placeholder="e.g. Guardian Name"
                value={formData.guardianName}
                onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label>{t("phone")}</label>
              <input
                type="text"
                placeholder="+91..."
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="form-group">
            <label>{t("notes")}</label>
            <textarea
              rows="2"
              placeholder="Notes..."
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input-field"
            ></textarea>
          </div>

          <div className="modal-footer-row">
            {student && (
              <button type="button" className="danger-button" onClick={handleDelete}>
                <Trash2 size={16} /> {t("deleteStudent")}
              </button>
            )}
            <div className="footer-right">
              <button type="button" className="secondary-button" onClick={onClose}>
                {t("cancel")}
              </button>
              <button type="submit" className="primary-button">
                <Save size={16} /> {t("saveStudentProfile")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
