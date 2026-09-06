const STORAGE_KEY = "student-attendance-data";

function getData() {
  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) {
    return {
      version: 1,
      attendance: [],
    };
  }

  return JSON.parse(data);
}

function saveData(data) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data)
  );
}

export function saveAttendance(record) {
  const data = getData();

  const existingIndex = data.attendance.findIndex(
    (item) => item.id === record.id
  );

  if (existingIndex >= 0) {
    data.attendance[existingIndex] = record;
  } else {
    data.attendance.push(record);
  }

  saveData(data);
}

export function getAttendanceRecords() {
  return getData().attendance;
}

export function getAttendanceById(id) {
  const data = getData();

  return (
    data.attendance.find((item) => item.id === id) ||
    null
  );
}