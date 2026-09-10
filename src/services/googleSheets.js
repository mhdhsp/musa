// Google Sheets sync service — triple-redundant (GET, POST, hidden form)

export const GOOGLE_APPS_SCRIPT_TEMPLATE = `/**
 * ====================================================================
 * AL-COLLEGE GOOGLE SHEETS BACKEND SCRIPT
 * ====================================================================
 * INSTRUCTIONS:
 * 1. Open your Google Sheet -> Extensions -> Apps Script
 * 2. Delete all existing code in Code.gs and PASTE THIS ENTIRE CODE.
 * 3. Click "Deploy" (top right) -> "New deployment"
 * 4. Click the gear icon (Select type) -> "Web app"
 * 5. Set:
 *    - Description: College Web App Sync
 *    - Execute as: "Me (your email)"   <-- CRITICAL!
 *    - Who has access: "Anyone"        <-- CRITICAL!
 * 6. Click "Deploy", authorize access, choose your Google account,
 *    click "Advanced" -> "Go to project (unsafe)" -> "Allow".
 * 7. COPY THE WEB APP URL and paste it into the app Settings.
 * ====================================================================
 */

function doGet(e) { return handleAllRequests(e); }
function doPost(e) { return handleAllRequests(e); }

function handleAllRequests(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var studentsSheet  = getOrCreateSheet(ss, 'Students');
  var attendanceSheet = getOrCreateSheet(ss, 'Attendance');
  var hifzSheet      = getOrCreateSheet(ss, 'Hifz_Logs');

  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : '';

  if (action === 'get_all') {
    return createJsonResponse({
      status: 'success',
      students:   sheetToJson(studentsSheet),
      attendance: sheetToJson(attendanceSheet),
      hifzLogs:   sheetToJson(hifzSheet)
    });
  }

  if (action === 'PING') {
    return createJsonResponse({ status: 'success', message: 'Google Sheet Web App is active!' });
  }

  var rawPayload = '';
  if (e && e.parameter && e.parameter.data) {
    rawPayload = e.parameter.data;
  } else if (e && e.postData && e.postData.contents) {
    rawPayload = e.postData.contents;
  }

  if (!rawPayload) {
    return createJsonResponse({ status: 'active', message: 'Google Sheet API Ready.' });
  }

  try {
    var data = JSON.parse(rawPayload);
    var reqAction = data.action || action;

    if      (reqAction === 'SAVE_STUDENT')   { saveStudentRow(ss, data.student); }
    else if (reqAction === 'DELETE_STUDENT') { deleteStudentRow(ss, data.studentId); }
    else if (reqAction === 'SAVE_ATTENDANCE'){ saveAttendanceRow(ss, data.attendance); }
    else if (reqAction === 'SAVE_HIFZ_LOG') { saveHifzLogRow(ss, data.hifzLog); }
    else if (reqAction === 'FULL_SYNC')      { fullSync(ss, data.payload); }
    else if (reqAction === 'TEST_ROW') {
      saveStudentRow(ss, {
        id: 'TEST-999', rollNo: 'TEST-01', name: 'Connection Test Student',
        section: 'HIFZ', classLevel: 'Test', guardianName: 'Test Parent',
        phone: '1234567890', joinedDate: new Date().toISOString().split('T')[0],
        status: 'active', totalJuzMemorized: 0, currentJuz: 1, currentSurah: 'Al-Fatiha'
      });
    }

    return createJsonResponse({ status: 'success', message: 'Action processed!' });
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  }
}

function getOrCreateSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (name === 'Students') {
      sheet.appendRow(['id','rollNo','name','section','classLevel','guardianName','phone','joinedDate','status','totalJuzMemorized','currentJuz','currentSurah']);
    } else if (name === 'Attendance') {
      sheet.appendRow(['id','date','scope','recordsJson','updatedAt']);
    } else if (name === 'Hifz_Logs') {
      sheet.appendRow(['id','studentId','studentName','date','sabahSurah','sabahAyahs','sabahGrade','sabqiJuz','sabqiGrade','manzilJuz','manzilGrade','teacherRemarks']);
    }
  }
  return sheet;
}

function saveStudentRow(ss, student) {
  if (!student) return;
  var sheet = getOrCreateSheet(ss, 'Students');
  var data = sheet.getDataRange().getValues();
  var rowIndex = -1;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(student.id)) { rowIndex = i + 1; break; }
  }
  var row = [student.id, student.rollNo, student.name, student.section,
    student.classLevel||'', student.guardianName||'', student.phone||'',
    student.joinedDate||'', student.status||'active',
    student.totalJuzMemorized||0, student.currentJuz||1, student.currentSurah||''];
  if (rowIndex > 0) sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
  else sheet.appendRow(row);
}

function deleteStudentRow(ss, studentId) {
  if (!studentId) return;
  var sheet = getOrCreateSheet(ss, 'Students');
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(studentId)) { sheet.deleteRow(i + 1); break; }
  }
}

function saveAttendanceRow(ss, record) {
  if (!record) return;
  var sheet = getOrCreateSheet(ss, 'Attendance');
  var data = sheet.getDataRange().getValues();
  var rowIndex = -1;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(record.id)) { rowIndex = i + 1; break; }
  }
  var row = [record.id, record.date, record.scope, JSON.stringify(record.records), new Date().toISOString()];
  if (rowIndex > 0) sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
  else sheet.appendRow(row);
}

function saveHifzLogRow(ss, log) {
  if (!log) return;
  var sheet = getOrCreateSheet(ss, 'Hifz_Logs');
  sheet.appendRow([log.id, log.studentId, log.studentName, log.date,
    log.sabahSurah, log.sabahAyahs, log.sabahGrade,
    log.sabqiJuz, log.sabqiGrade,
    log.manzilJuz, log.manzilGrade, log.teacherRemarks||'']);
}

function fullSync(ss, payload) {
  if (!payload) return;
  if (payload.students) {
    var stSheet = getOrCreateSheet(ss, 'Students');
    stSheet.clearContents();
    stSheet.appendRow(['id','rollNo','name','section','classLevel','guardianName','phone','joinedDate','status','totalJuzMemorized','currentJuz','currentSurah']);
    payload.students.forEach(function(s) { saveStudentRow(ss, s); });
  }
  if (Array.isArray(payload.attendance)) {
    payload.attendance.forEach(function(a) { saveAttendanceRow(ss, a); });
  }
  if (Array.isArray(payload.hifzLogs)) {
    payload.hifzLogs.forEach(function(h) { saveHifzLogRow(ss, h); });
  }
}

function sheetToJson(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  var headers = data[0];
  return data.slice(1).map(function(row) {
    var obj = {};
    headers.forEach(function(h, i) { obj[h] = row[i]; });
    return obj;
  });
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;

/**
 * Tests the Google Sheet connection.
 * Because all fetch calls use no-cors (opaque responses), we can't read the
 * response body — we instead consider the request "sent" if no network error
 * is thrown and clearly communicate that to the user.
 */
export async function testGoogleSheetConnection(webAppUrl) {
  if (!webAppUrl?.trim()) {
    return { success: false, message: "Please paste your Google Web App URL." };
  }
  const cleanUrl = webAppUrl.trim();

  if (!cleanUrl.startsWith("https://script.google.com/")) {
    return {
      success: false,
      message: "URL doesn't look like a Google Apps Script URL. Check and try again.",
    };
  }

  try {
    const testPayload = JSON.stringify({ action: "TEST_ROW" });
    const pingUrl = `${cleanUrl}?action=TEST_ROW&data=${encodeURIComponent(testPayload)}`;

    // Fire-and-forget GET (no-cors — response will be opaque)
    fetch(pingUrl, { method: "GET", mode: "no-cors" }).catch(() => {});

    // Hidden-form fallback for environments that block cross-origin fetch
    submitViaHiddenForm(cleanUrl, { action: "TEST_ROW" });

    return {
      success: true,
      message:
        "Request sent! Open your Google Sheet in a few seconds — a 'Connection Test Student' row should appear in the Students sheet.",
    };
  } catch (err) {
    return {
      success: false,
      message: `Network error: ${err.message}. Please verify your Web App URL.`,
    };
  }
}

export async function sendToGoogleSheet(webAppUrl, action, data) {
  if (!webAppUrl?.trim()) return false;
  const cleanUrl = webAppUrl.trim();

  try {
    const payload = { action, ...data };
    const jsonString = JSON.stringify(payload);

    // 1. GET request (works in most CORS-restricted environments)
    const getUrl = `${cleanUrl}?action=${encodeURIComponent(action)}&data=${encodeURIComponent(jsonString)}`;
    fetch(getUrl, { method: "GET", mode: "no-cors" }).catch(() => {});

    // 2. POST request
    fetch(cleanUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain" },
      body: jsonString,
    }).catch(() => {});

    // 3. Hidden form fallback
    submitViaHiddenForm(cleanUrl, payload);

    return true;
  } catch (err) {
    console.warn("Google Sheet sync notice:", err);
    return false;
  }
}

function submitViaHiddenForm(url, payload) {
  try {
    let iframe = document.getElementById("gsheet_sync_iframe");
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.id = "gsheet_sync_iframe";
      iframe.name = "gsheet_sync_iframe";
      iframe.style.cssText = "display:none;position:absolute;width:0;height:0;border:0";
      document.body.appendChild(iframe);
    }

    const form = document.createElement("form");
    form.method = "POST";
    form.action = url;
    form.target = "gsheet_sync_iframe";

    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "data";
    input.value = JSON.stringify(payload);

    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();

    setTimeout(() => {
      if (document.body.contains(form)) document.body.removeChild(form);
    }, 1500);
  } catch (e) {
    console.warn("Hidden-form sync fallback:", e);
  }
}
