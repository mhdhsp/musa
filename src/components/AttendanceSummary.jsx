export default function AttendanceSummary({
  total,
  present,
  absent,
}) {
  return (
    <div className="attendance-summary">
      <div>
        <span>Total</span>
        <strong>{total}</strong>
      </div>

      <div>
        <span>Present</span>
        <strong>{present}</strong>
      </div>

      <div>
        <span>Absent</span>
        <strong>{absent}</strong>
      </div>
    </div>
  );
}