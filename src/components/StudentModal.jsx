import { useState, useEffect } from "react";
import { X, Save, Trash2 } from "lucide-react";
import { SECTION_TYPES } from "../data/students";
import { saveStudent, deleteStudent, getSettings, generateStudentId } from "../services/indexedDB";
import { sendToGoogleSheet } from "../services/googleSheets";
import { t } from "../utils/i18n";
import { useLang } from "../context/LanguageContext";

export default function StudentModal({ isOpen, onClose, student = null, onSaved }) {
  useLang(); // re-render on language change

  const blankForm = () => ({
    id: generateStudentId(),
    rollNo: `H-${String(Math.floor(10 + Math.random() * 90))}`,
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
    notes: "",
  });

  const [formData, setFormData] = useState(blankForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(student ? { ...student } : blankForm());
    }
  }, [student, isOpen]);

  if (!isOpen) return null;

  function set(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.name.trim() || !formData.rollNo.trim()) return;
    setSaving(true);
    await saveStudent(formData);
    getSettings().then((st) => {
      if (st.googleSheetUrl) {
        sendToGoogleSheet(st.googleSheetUrl, "SAVE_STUDENT", { student: formData });
      }
    });
    onSaved?.(formData);
    onClose();
    setSaving(false);
  }

  async function handleDelete() {
    if (!student) return;
    if (window.confirm(`${t("deleteStudent")} ${student.name}?`)) {
      await deleteStudent(student.id);
      getSettings().then((st) => {
        if (st.googleSheetUrl) {
          sendToGoogleSheet(st.googleSheetUrl, "DELETE_STUDENT", { studentId: student.id });
        }
      });
      onSaved?.();
      onClose();
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container student-modal">
        <div className="modal-header">
          <h2>{student ? t("editProfile") : t("addStudent")}</h2>
          <button className="icon-button" onClick={onClose} aria-label="Close">
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
                onChange={(e) => set("name", e.target.value)}
                className="input-field"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>{t("rollNo")} *</label>
              <input
                type="text"
                required
                placeholder="e.g. H-01"
                value={formData.rollNo}
                onChange={(e) => set("rollNo", e.target.value)}
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
                  setFormData((prev) => ({
                    ...prev,
                    section: e.target.value,
                    classLevel: e.target.value === SECTION_TYPES.HIFZ ? "Hifz" : "Dars",
                  }))
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
                onChange={(e) => set("classLevel", e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          {formData.section === SECTION_TYPES.HIFZ && (
            <div className="form-row highlight-box">
              <div className="form-group">
                <label>{t("juzMemorized")} (0–30)</label>
                <input
                  type="number" min="0" max="30"
                  value={formData.totalJuzMemorized}
                  onChange={(e) => set("totalJuzMemorized", parseInt(e.target.value) || 0)}
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <label>Current Juz</label>
                <input
                  type="number" min="1" max="30"
                  value={formData.currentJuz}
                  onChange={(e) => set("currentJuz", parseInt(e.target.value) || 1)}
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
                placeholder="Guardian name"
                value={formData.guardianName}
                onChange={(e) => set("guardianName", e.target.value)}
                className="input-field"
              />
            </div>
            <div className="form-group">
              <label>{t("phone")}</label>
              <input
                type="tel"
                placeholder="+91 …"
                value={formData.phone}
                onChange={(e) => set("phone", e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Joined Date</label>
              <input
                type="date"
                value={formData.joinedDate}
                onChange={(e) => set("joinedDate", e.target.value)}
                className="input-field"
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) => set("status", e.target.value)}
                className="input-field"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>{t("notes")}</label>
            <textarea
              rows={2}
              placeholder="Notes or observations…"
              value={formData.notes || ""}
              onChange={(e) => set("notes", e.target.value)}
              className="input-field"
            />
          </div>

          <div className="modal-footer-row">
            {student && (
              <button type="button" className="danger-icon-btn icon-text-btn" onClick={handleDelete}>
                <Trash2 size={15} /> {t("deleteStudent")}
              </button>
            )}
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button type="button" className="secondary-button" onClick={onClose}>
                {t("cancel")}
              </button>
              <button type="submit" className="primary-button" disabled={saving}>
                <Save size={15} />
                {saving ? "Saving…" : t("saveStudentProfile")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
