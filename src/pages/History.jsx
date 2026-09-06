import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import {
  getAttendanceRecords,
} from "../services/attendanceStorage";

export default function History() {
  const navigate = useNavigate();

  const records = getAttendanceRecords();

  const sortedRecords = [...records].sort(
    (a, b) =>
      b.date.localeCompare(a.date)
  );

  return (
    <div className="page">
      <header className="page-header">
        <button
          className="icon-button"
          onClick={() => navigate("/")}
        >
          <ArrowLeft />
        </button>

        <h1>Attendance History</h1>
      </header>

      {sortedRecords.length === 0 ? (
        <div className="empty-state">
          No attendance records yet.
        </div>
      ) : (
        <div className="history-list">
          {sortedRecords.map((record) => {
            const statuses =
              Object.values(record.records);

            const present = statuses.filter(
              (status) => status === "PRESENT"
            ).length;

            const absent = statuses.length - present;

            return (
              <div
                className="history-card"
                key={record.id}
              >
                <strong>{record.date}</strong>

                <span>
                  {record.scope}
                </span>

                <span>
                  {present} present ·{" "}
                  {absent} absent
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}