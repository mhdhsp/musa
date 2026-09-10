// IndexedDB service for zero-backend persistent storage with high capacity

const DB_NAME = "CollegeManagementDB";
const DB_VERSION = 2; // Incremented version to purge legacy cached data

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains("students")) {
        const studentStore = db.createObjectStore("students", { keyPath: "id" });
        studentStore.createIndex("section", "section", { unique: false });
      }

      if (!db.objectStoreNames.contains("attendance")) {
        const attendanceStore = db.createObjectStore("attendance", { keyPath: "id" });
        attendanceStore.createIndex("date", "date", { unique: false });
        attendanceStore.createIndex("scope", "scope", { unique: false });
      }

      if (!db.objectStoreNames.contains("hifzLogs")) {
        const hifzStore = db.createObjectStore("hifzLogs", { keyPath: "id" });
        hifzStore.createIndex("studentId", "studentId", { unique: false });
        hifzStore.createIndex("date", "date", { unique: false });
      }

      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", { keyPath: "key" });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

// Student operations
export async function getAllStudents() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("students", "readonly");
    const store = tx.objectStore("students");
    const request = store.getAll();

    request.onsuccess = () => {
      const results = request.result || [];
      // Filter out legacy hardcoded sample student IDs (STU-101 to STU-204)
      const legacyIds = ["STU-101", "STU-102", "STU-103", "STU-104", "STU-201", "STU-202", "STU-203", "STU-204"];
      const cleanStudents = results.filter((s) => !legacyIds.includes(s.id));
      
      // If legacy students exist in IDB, purge them asynchronously
      if (results.length !== cleanStudents.length) {
        purgeLegacyStudents(legacyIds);
      }

      resolve(cleanStudents);
    };
    request.onerror = () => reject(request.error);
  });
}

async function purgeLegacyStudents(legacyIds) {
  try {
    const db = await openDB();
    const tx = db.transaction("students", "readwrite");
    const store = tx.objectStore("students");
    for (const id of legacyIds) {
      store.delete(id);
    }
  } catch (e) {
    console.warn("Purge legacy students warning:", e);
  }
}

export async function saveStudent(student) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("students", "readwrite");
    const store = tx.objectStore("students");
    const request = store.put(student);
    request.onsuccess = () => resolve(student);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteStudent(studentId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("students", "readwrite");
    const store = tx.objectStore("students");
    const request = store.delete(studentId);
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}

export async function clearAllData() {
  const db = await openDB();
  const tx = db.transaction(["students", "attendance", "hifzLogs"], "readwrite");
  tx.objectStore("students").clear();
  tx.objectStore("attendance").clear();
  tx.objectStore("hifzLogs").clear();
  return true;
}

// Attendance operations
export async function getAttendanceLogs() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("attendance", "readonly");
    const store = tx.objectStore("attendance");
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function saveAttendanceLog(record) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("attendance", "readwrite");
    const store = tx.objectStore("attendance");
    const request = store.put(record);
    request.onsuccess = () => resolve(record);
    request.onerror = () => reject(request.error);
  });
}

// Hifz Logs operations
export async function getHifzLogs(studentId = null) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("hifzLogs", "readonly");
    const store = tx.objectStore("hifzLogs");
    const request = store.getAll();
    request.onsuccess = () => {
      const logs = request.result || [];
      if (studentId) {
        resolve(logs.filter((l) => l.studentId === studentId));
      } else {
        resolve(logs);
      }
    };
    request.onerror = () => reject(request.error);
  });
}

export async function saveHifzLog(hifzLog) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("hifzLogs", "readwrite");
    const store = tx.objectStore("hifzLogs");
    const request = store.put(hifzLog);
    request.onsuccess = () => resolve(hifzLog);
    request.onerror = () => reject(request.error);
  });
}

// Settings & Sync operations
export async function getSettings() {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction("settings", "readonly");
    const store = tx.objectStore("settings");
    const request = store.getAll();
    request.onsuccess = () => {
      const result = {};
      (request.result || []).forEach((item) => {
        result[item.key] = item.value;
      });
      if (!result.googleSheetUrl) {
        result.googleSheetUrl = localStorage.getItem("googleSheetUrl") || "";
      }
      resolve(result);
    };
    request.onerror = () => resolve({ googleSheetUrl: localStorage.getItem("googleSheetUrl") || "" });
  });
}

export async function saveSetting(key, value) {
  const db = await openDB();
  localStorage.setItem(key, value);
  return new Promise((resolve, reject) => {
    const tx = db.transaction("settings", "readwrite");
    const store = tx.objectStore("settings");
    const request = store.put({ key, value });
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}

export async function exportFullBackup() {
  const students = await getAllStudents();
  const attendance = await getAttendanceLogs();
  const hifzLogs = await getHifzLogs();
  const settings = await getSettings();

  return {
    exportDate: new Date().toISOString(),
    version: 1,
    students,
    attendance,
    hifzLogs,
    settings
  };
}

export async function importFullBackup(data) {
  if (!data || !data.students) {
    throw new Error("Invalid backup data format.");
  }
  const db = await openDB();

  const stTx = db.transaction("students", "readwrite");
  const stStore = stTx.objectStore("students");
  for (const s of data.students) {
    stStore.put(s);
  }

  if (Array.isArray(data.attendance)) {
    const attTx = db.transaction("attendance", "readwrite");
    const attStore = attTx.objectStore("attendance");
    for (const a of data.attendance) {
      attStore.put(a);
    }
  }

  if (Array.isArray(data.hifzLogs)) {
    const hfTx = db.transaction("hifzLogs", "readwrite");
    const hfStore = hfTx.objectStore("hifzLogs");
    for (const h of data.hifzLogs) {
      hfStore.put(h);
    }
  }

  return true;
}
