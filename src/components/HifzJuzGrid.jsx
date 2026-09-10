import { JUZ_LIST } from "../data/hifzData";

export default function HifzJuzGrid({ totalMemorized = 0, currentJuz = 1 }) {
  return (
    <div className="juz-grid-container">
      <div className="juz-grid-header">
        <h4>30 Juz Quran Memorization Map</h4>
        <div className="juz-legend">
          <span className="legend-item"><span className="legend-box completed"></span> Memorized ({totalMemorized})</span>
          <span className="legend-item"><span className="legend-box current"></span> Current (Juz {currentJuz})</span>
          <span className="legend-item"><span className="legend-box remaining"></span> Remaining ({30 - totalMemorized})</span>
        </div>
      </div>

      <div className="juz-blocks-grid">
        {JUZ_LIST.map((juz) => {
          const isCompleted = juz.number <= totalMemorized;
          const isCurrent = juz.number === currentJuz;

          let statusClass = "remaining";
          if (isCompleted) statusClass = "completed";
          else if (isCurrent) statusClass = "current";

          return (
            <div
              key={juz.number}
              className={`juz-block ${statusClass}`}
              title={`${juz.name} (${juz.arabicName}) - ${isCompleted ? "Memorized" : isCurrent ? "Current Reading" : "Pending"}`}
            >
              <span className="juz-num">{juz.number}</span>
              <span className="juz-label">Juz</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
