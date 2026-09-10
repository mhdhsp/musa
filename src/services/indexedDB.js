// IndexedDB service — connection cached at module level for performance

const DB_NAME = "CollegeManagementDB";
const DB_VERSION = 2;

// Module-level cached promise so we only ever open the DB once
let _dbPromise = null;

function openDB() {
  if (_dbPromise) return _dbPromise;

  _dbPromise = new Promise((resolve, reject) => {
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
    request.onerror = (event) => {
      _dbPromise = null; // allow retry on error
      reject(event.target.error);
    };
  });

  return _dbPromise;
}

// ─── Student operations ──────────────────────────────────────────────────────

export async function getAllStudents() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("students", "readonly");
    const store = tx.objectStore("students");
    const request = store.getAll();

    request.onsuccess = () => {
      const results = request.result || [];
      // Purge legacy hardcoded sample IDs from old versions
      const legacyIds = [
        "STU-101", "STU-102", "STU-103", "STU-104",
        "STU-201", "STU-202", "STU-203", "STU-204",
      ];
      const cleanStudents = results.filter((s) => !legacyIds.includes(s.id));

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
    for (const id of legacyIds) store.delete(id);
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

// ─── Attendance operations ───────────────────────────────────────────────────

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

// ─── Hifz Log operations ─────────────────────────────────────────────────────

export async function getHifzLogs(studentId = null) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("hifzLogs", "readonly");
    const store = tx.objectStore("hifzLogs");

    if (studentId) {
      // Use the studentId index instead of full scan + in-memory filter
      const index = store.index("studentId");
      const request = index.getAll(studentId);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    } else {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    }
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

export async function deleteHifzLog(logId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("hifzLogs", "readwrite");
    const store = tx.objectStore("hifzLogs");
    const request = store.delete(logId);
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}

// ─── Settings ────────────────────────────────────────────────────────────────

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
    request.onerror = () =>
      resolve({ googleSheetUrl: localStorage.getItem("googleSheetUrl") || "" });
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

// ─── ID generators ───────────────────────────────────────────────────────────

/**
 * Generates a collision-resistant student ID using timestamp + 4-char random hex.
 * e.g. "STU-1718200000000-a3f2"
 */
export function generateStudentId() {
  const rand = Math.floor(Math.random() * 0xffff)
    .toString(16)
    .padStart(4, "0");
  return `STU-${Date.now()}-${rand}`;
}

/**
 * Attendance record ID — unique per date + section + timestamp so that
 * ALL and HIFZ sessions on the same day never collide.
 * The canonical record for a date+scope is looked up by date+scope, not by id.
 */
export function generateAttendanceId(date, section) {
  return `${date}-${section}-${Date.now()}`;
}

// ─── Backup / Restore ────────────────────────────────────────────────────────

export async function exportFullBackup() {
  const [students, attendance, hifzLogs, settings] = await Promise.all([
    getAllStudents(),
    getAttendanceLogs(),
    getHifzLogs(),
    getSettings(),
  ]);

  return {
    exportDate: new Date().toISOString(),
    version: 2,
    students,
    attendance,
    hifzLogs,
    settings,
  };
}

/**
 * Atomic import: all three stores are written in a single transaction so that
 * a mid-import failure doesn't leave the DB in a partial state.
 */
export async function importFullBackup(data) {
  if (!data || !Array.isArray(data.students)) {
    throw new Error("Invalid backup data format.");
  }

  const db = await openDB();

  return new Promise((resolve, reject) => {
    const storeNames = ["students", "attendance", "hifzLogs"];
    const tx = db.transaction(storeNames, "readwrite");

    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(new Error("Import transaction aborted."));
    tx.oncomplete = () => resolve(true);

    const studentStore = tx.objectStore("students");
    for (const s of data.students) studentStore.put(s);

    if (Array.isArray(data.attendance)) {
      const attStore = tx.objectStore("attendance");
      for (const a of data.attendance) attStore.put(a);
    }

    if (Array.isArray(data.hifzLogs)) {
      const hfStore = tx.objectStore("hifzLogs");
      for (const h of data.hifzLogs) hfStore.put(h);
    }
  });
}
