import React from "react";
import { GraduationCap } from "lucide-react";
import { HIFZ_GRADES } from "../data/hifzData";

export default function PrintableCard({ student, hifzLogs = [], attendancePercentage = 100 }) {
  if (!student) return null;

  const latestLog = hifzLogs[0] || null;

  return (
    <div className="printable-report-card">
      <div className="print-header">
        <div className="print-brand">
          <GraduationCap size={40} color="#065f46" />
          <div>
            <h1>Al-College Student Report</h1>
            <p>Hifz & Academic Progress Summary</p>
          </div>
        </div>
        <div className="print-meta">
          <span className="print-date">Date: {new Date().toLocaleDateString()}</span>
          <span className="print-roll">Roll No: {student.rollNo}</span>
        </div>
      </div>

      <hr className="print-divider" />

      {/* Student Profile Block */}
      <div className="print-profile-grid">
        <div>
          <label>Student Name:</label>
          <strong>{student.name}</strong>
        </div>
        <div>
          <label>Department:</label>
          <strong>{student.section}</strong>
        </div>
        <div>
          <label>Class / Level:</label>
          <strong>{student.classLevel || "N/A"}</strong>
        </div>
        <div>
          <label>Guardian Name:</label>
          <strong>{student.guardianName || "N/A"}</strong>
        </div>
        <div>
          <label>Contact Phone:</label>
          <strong>{student.phone || "N/A"}</strong>
        </div>
        <div>
          <label>Attendance Record:</label>
          <strong>{attendancePercentage}% Present</strong>
        </div>
      </div>

      {student.section === "HIFZ" && (
        <div className="print-hifz-section">
          <h3>Quran Memorization Progress</h3>
          <div className="print-kpi-row">
            <div className="print-kpi">
              <span>Juz Memorized</span>
              <strong>{student.totalJuzMemorized || 0} / 30</strong>
            </div>
            <div className="print-kpi">
              <span>Current Surah</span>
              <strong>{student.currentSurah || "Al-Baqarah"}</strong>
            </div>
            <div className="print-kpi">
              <span>Completion Rate</span>
              <strong>{Math.round(((student.totalJuzMemorized || 0) / 30) * 100)}%</strong>
            </div>
          </div>

          {latestLog && (
            <div className="print-recent-log">
              <h4>Latest Hifz Lesson ({latestLog.date})</h4>
              <div className="log-detail-grid">
                <div>
                  <strong>Sabah (New):</strong> {latestLog.sabahSurah} ({latestLog.sabahAyahs}) - {HIFZ_GRADES[latestLog.sabahGrade]?.label || latestLog.sabahGrade}
                </div>
                <div>
                  <strong>Sabqi (Revision):</strong> {latestLog.sabqiJuz} - {HIFZ_GRADES[latestLog.sabqiGrade]?.label || latestLog.sabqiGrade}
                </div>
                <div>
                  <strong>Manzil (Old):</strong> {latestLog.manzilJuz} - {HIFZ_GRADES[latestLog.manzilGrade]?.label || latestLog.manzilGrade}
                </div>
              </div>
              {latestLog.teacherRemarks && (
                <p className="teacher-remarks">
                  <em>Remarks: "{latestLog.teacherRemarks}"</em>
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="print-signatures">
        <div className="sig-block">
          <div className="sig-line"></div>
          <span>Class Teacher Signature</span>
        </div>
        <div className="sig-block">
          <div className="sig-line"></div>
          <span>Head of College / Principal</span>
        </div>
      </div>
    </div>
  );
}
