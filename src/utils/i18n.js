// Lightweight i18n translation dictionary for English, Arabic, Urdu, and Malayalam

export const LANGUAGES = {
  en: { code: "en", name: "English", dir: "ltr", flag: "🇬🇧" },
  ar: { code: "ar", name: "العربية", dir: "rtl", flag: "🇸🇦" },
  ur: { code: "ur", name: "اردو", dir: "rtl", flag: "🇵🇰" },
  ml: { code: "ml", name: "മലയാളം", dir: "ltr", flag: "🇮🇳" }
};

export const translations = {
  en: {
    brandTitle: "Al-College Portal",
    brandSubtitle: "Hifz & Dars System",
    dashboard: "Dashboard",
    hifzProgress: "Hifz Progress",
    attendance: "Attendance",
    students: "Students",
    history: "History",
    settings: "Settings",
    localMode: "Local Mode",
    sheetLive: "Sheet Connected",

    // Dashboard
    welcome: "College Portal",
    welcomeSub: "Zero-backend Hifz & Dars management system.",
    addStudent: "Add Student",
    markAttendance: "Mark Attendance",
    totalStudents: "Total Students",
    todayAttendance: "Today's Attendance",
    hifzMemorizers: "Hifz Students",
    darsStudents: "Dars Students",
    quickActions: "Quick Actions",
    logHifz: "Log Hifz Lesson",
    studentDirectory: "Student Directory",
    sheetsAndBackups: "Google Sheets & Backups",

    // Student Roster & Modal
    allStudents: "All Students",
    rollNo: "Roll No",
    fullName: "Full Name",
    section: "Section",
    classLevel: "Class / Level",
    guardianName: "Guardian Name",
    phone: "Phone Number",
    actions: "Actions",
    editProfile: "Edit Profile",
    deleteStudent: "Delete Student",
    cancel: "Cancel",
    saveStudentProfile: "Save Student Profile",
    noStudentsYet: "No students added yet. Click 'Add Student' to get started.",
    notes: "Notes & Observations",

    // Attendance
    date: "Date",
    present: "Present",
    absent: "Absent",
    late: "Late",
    leave: "Leave",
    markAllPresent: "Mark All Present",
    markAllAbsent: "Mark All Absent",
    saveAttendance: "Save Attendance",
    attendanceHistory: "Attendance Log History",
    exportHistoryCsv: "Export History CSV",
    noHistoryYet: "No attendance history records found.",
    presentRate: "Present Rate",

    // Hifz
    hifzDept: "Hifz Quran Department",
    juzMemorized: "Juz Memorized",
    currentSurah: "Current Surah",
    sabah: "SABAH (New)",
    sabqi: "SABQI (Recent)",
    manzil: "MANZIL (Old)",
    logDailyLesson: "Log Daily Lesson",
    remarks: "Teacher Remarks",
    printCard: "Print Progress Card",

    // Settings
    databaseSettings: "Google Sheets & Settings",
    scriptGuide: "1-Click Apps Script",
    exportBackup: "Export Backup",
    saveAndTest: "Save & Test",
    syncNow: "Sync Now to Sheet",
    restoreBackup: "Restore Backup",
    exportRoster: "Export Student Roster"
  },

  ar: {
    brandTitle: "بوابة الكلية الإسلامية",
    brandSubtitle: "نظام تحفيظ القرآن والدراسات الإسلامية",
    dashboard: "الرئيسية",
    hifzProgress: "تقدم الحفظ",
    attendance: "الحضور والغياب",
    students: "الطلاب",
    history: "السجل",
    settings: "الإعدادات",
    localMode: "وضع محلي",
    sheetLive: "متصل بجداول جوجل",

    // Dashboard
    welcome: "لوحة التحكم",
    welcomeSub: "نظام إدارة طلاب الحفظ والدراسات بدون خادم خلفي.",
    addStudent: "إضافة طالب",
    markAttendance: "تسجيل الحضور",
    totalStudents: "إجمالي الطلاب",
    todayAttendance: "حضور اليوم",
    hifzMemorizers: "طلاب الحفظ",
    darsStudents: "طلاب الدرس",
    quickActions: "إجراءات سريعة",
    logHifz: "تسجيل درس الحفظ",
    studentDirectory: "دليل الطلاب",
    sheetsAndBackups: "مزامنة جوجل والنسخ",

    // Student Roster & Modal
    allStudents: "جميع الطلاب",
    rollNo: "رقم القيد",
    fullName: "الاسم الكامل",
    section: "القسم",
    classLevel: "الصف / المستوى",
    guardianName: "اسم ولي الأمر",
    phone: "رقم الهاتف",
    actions: "الإجراءات",
    editProfile: "تعديل الملف",
    deleteStudent: "حذف الطالب",
    cancel: "إلغاء",
    saveStudentProfile: "حفظ بيانات الطالب",
    noStudentsYet: "لا يوجد طلاب مضافون حتى الآن. انقر على 'إضافة طالب' للبدء.",
    notes: "ملاحظات وتوصيات",

    // Attendance
    date: "التاريخ",
    present: "حاضر",
    absent: "غائب",
    late: "متأخر",
    leave: "إجازة",
    markAllPresent: "تحديد الجميع كـ حاضر",
    markAllAbsent: "تحديد الجميع كـ غائب",
    saveAttendance: "حفظ كشف الحضور",
    attendanceHistory: "سجل الحضور والغياب",
    exportHistoryCsv: "تصدير السجل CSV",
    noHistoryYet: "لا توجد سجلات حضور مسجلة بعد.",
    presentRate: "نسبة الحضور",

    // Hifz
    hifzDept: "قسم تحفيظ القرآن الكريم",
    juzMemorized: "الأجزاء المحفوظة",
    currentSurah: "السورة الحالية",
    sabah: "السبق (الدرس الجديد)",
    sabqi: "السبقي (المراجعة القريبة)",
    manzil: "المنزل (المراجعة البعيدة)",
    logDailyLesson: "تسجيل الدرس اليومي",
    remarks: "ملاحظات المعلم",
    printCard: "طباعة بطاقة التقدم",

    // Settings
    databaseSettings: "إعدادات جوجل شيت والنسخ",
    scriptGuide: "كود الإعداد السريع",
    exportBackup: "تصدير نسخة احتياطية",
    saveAndTest: "حفظ واختبار الربط",
    syncNow: "مزامنة الآن إلى جوجل شيت",
    restoreBackup: "استعادة نسخة احتياطية",
    exportRoster: "تصدير قائمة الطلاب"
  },

  ur: {
    brandTitle: "الکلیہ پورٹل",
    brandSubtitle: "شعبہ حفظ و درس نظامی",
    dashboard: "ڈیش بورڈ",
    hifzProgress: "حفظ کی پیش رفت",
    attendance: "حاضری",
    students: "طلبا",
    history: "ہسٹری",
    settings: "سیٹنگز",
    localMode: "لوکل موڈ",
    sheetLive: "گوگل شیٹ منسلک ہے",

    // Dashboard
    welcome: "ڈیش بورڈ",
    welcomeSub: "حفظ اور درس کے طلبا کا آسان ڈیجیٹل نظام۔",
    addStudent: "نیا طالب علم",
    markAttendance: "حاضری لگائیں",
    totalStudents: "کل طلبا",
    todayAttendance: "آج کی حاضری",
    hifzMemorizers: "حفاظ طلبا",
    darsStudents: "درس کے طلبا",
    quickActions: "فوری اقدامات",
    logHifz: "سبق درج کریں",
    studentDirectory: "طلبا کی لسٹ",
    sheetsAndBackups: "گوگل شیٹ و بیک اپ",

    // Student Roster & Modal
    allStudents: "تمام طلبا",
    rollNo: "رول نمبر",
    fullName: "مکمل نام",
    section: "شعبہ",
    classLevel: "کلاس / درجہ",
    guardianName: "سرپرست کا نام",
    phone: "فون نمبر",
    actions: "آپشنز",
    editProfile: "پروفائل تبدیل کریں",
    deleteStudent: "طالب علم ختم کریں",
    cancel: "منسوخ",
    saveStudentProfile: "محفوظ کریں",
    noStudentsYet: "ابھی تک کوئی طالب علم شامل نہیں کیا گیا۔ 'نیا طالب علم' پر کلک کریں۔",
    notes: "خصوصی نوٹس",

    // Attendance
    date: "تاریخ",
    present: "حاضر",
    absent: "غیر حاضر",
    late: "تاخیر",
    leave: "رخصت",
    markAllPresent: "سب کو حاضر کریں",
    markAllAbsent: "سب کو غیر حاضر کریں",
    saveAttendance: "حاضری محفوظ کریں",
    attendanceHistory: "حاضری ہسٹری",
    exportHistoryCsv: "ہسٹری فائل (CSV)",
    noHistoryYet: "حاضری کے پچھلے ریکارڈ موجود نہیں ہیں۔",
    presentRate: "حاضری کا تناسب",

    // Hifz
    hifzDept: "شعبہ تحفیظ القرآن",
    juzMemorized: "حفظ کردہ پارے",
    currentSurah: "موجودہ سورہ",
    sabah: "سبق (نیا درس)",
    sabqi: "سبقی (حالیہ دہرائی)",
    manzil: "منزل (قدیم دہرائی)",
    logDailyLesson: "روزانہ کا سبق درج کریں",
    remarks: "استاد کے تاثرات",
    printCard: "پرنٹ کارڈ",

    // Settings
    databaseSettings: "گوگل شیٹ و سیٹنگز",
    scriptGuide: "ایپس اسکرپٹ کوڈ",
    exportBackup: "بیک اپ ڈاون لوڈ کریں",
    saveAndTest: "سیو و ٹیسٹ کریں",
    syncNow: "گوگل شیٹ پر ہم آہنگ کریں",
    restoreBackup: "بیک اپ ری سٹور کریں",
    exportRoster: "طلبا لسٹ ڈاؤن لوڈ"
  },

  ml: {
    brandTitle: "അൽ-കോളേജ് പോർട്ടൽ",
    brandSubtitle: "ഹിഫ്ള് & ദർസ് ലേണിംഗ് സിസ്റ്റം",
    dashboard: "ഡാഷ്‌ബോർഡ്",
    hifzProgress: "ഹിഫ്ള് പുരോഗതി",
    attendance: "ഹാജർ",
    students: "വിദ്യാർത്ഥികൾ",
    history: "ഹിസ്റ്ററി",
    settings: "സെറ്റിംഗ്സ്",
    localMode: "ലോക്കൽ മോഡ്",
    sheetLive: "ഗൂഗിൾ ഷീറ്റ് കണക്റ്റഡ്",

    // Dashboard
    welcome: "കോളേജ് പോർട്ടൽ",
    welcomeSub: "ഹിഫ്ള് & ദർസ് വിദ്യാർത്ഥികൾക്കായുള്ള ഡിജിറ്റൽ റെക്കോർഡ് സിസ്റ്റം.",
    addStudent: "വിദ്യാർത്ഥിയെ ചേർക്കുക",
    markAttendance: "ഹാജർ അടയാളപ്പെടുത്തുക",
    totalStudents: "ആകെ വിദ്യാർത്ഥികൾ",
    todayAttendance: "ഇന്നത്തെ ഹാജർ",
    hifzMemorizers: "ഹിഫ്ള് വിദ്യാർത്ഥികൾ",
    darsStudents: "ദർസ് വിദ്യാർത്ഥികൾ",
    quickActions: "പ്രധാന പ്രവർത്തനങ്ങൾ",
    logHifz: "പാഠം രേഖപ്പെടുത്തുക",
    studentDirectory: "വിദ്യാർത്ഥി ലിസ്റ്റ്",
    sheetsAndBackups: "ഗൂഗിൾ ഷീറ്റ് & ബാക്കപ്പ്",

    // Student Roster & Modal
    allStudents: "എല്ലാ വിദ്യാർത്ഥികളും",
    rollNo: "റോൾ നമ്പർ",
    fullName: "പൂർണ്ണ നാമം",
    section: "വിഭാഗം",
    classLevel: "ക്ലാസ് / ലെവൽ",
    guardianName: "രക്ഷാകർത്താവ്",
    phone: "ഫോൺ നമ്പർ",
    actions: "ഓപ്ഷനുകൾ",
    editProfile: "എഡിറ്റ് ചെയ്യുക",
    deleteStudent: "ഡിലീറ്റ് ചെയ്യുക",
    cancel: "ക്യാൻസൽ",
    saveStudentProfile: "പ്രൊഫൈൽ സേവ് ചെയ്യുക",
    noStudentsYet: "വിദ്യാർത്ഥികളെയൊന്നും ചേർത്തിട്ടില്ല. 'വിദ്യാർത്ഥിയെ ചേർക്കുക' ക്ലിക്ക് ചെയ്യുക.",
    notes: "കുറിപ്പുകൾ",

    // Attendance
    date: "തീയതി",
    present: "ഹാജർ",
    absent: "ആബ്സന്റ്",
    late: "വൈകി",
    leave: "ലീവ്",
    markAllPresent: "എല്ലാവരും ഹാജർ",
    markAllAbsent: "എല്ലാവരും ആബ്സന്റ്",
    saveAttendance: "ഹാജർ സേവ് ചെയ്യുക",
    attendanceHistory: "ഹാജർ റെക്കോർഡുകൾ",
    exportHistoryCsv: "CSV ഫയലായി ഡൗൺലോഡ്",
    noHistoryYet: "ഹാജർ റെക്കോർഡുകളൊന്നും ഇതുവരെ ചേർത്തിട്ടില്ല.",
    presentRate: "ഹാജർ ശതമാനം",

    // Hifz
    hifzDept: "ഹിഫ്ളുൽ ഖുർആൻ വിഭാഗം",
    juzMemorized: "മനഃപാഠമാക്കിയ ജുസ്അ്",
    currentSurah: "ഇപ്പോഴത്തെ സൂറത്ത്",
    sabah: "സബഖ് (പുതിയ പാഠം)",
    sabqi: "സബ്ഖി (സമീപകാല റിവിഷൻ)",
    manzil: "മൻസിൽ (പഴയ റിവിഷൻ)",
    logDailyLesson: "ദിവസേനയുള്ള പാഠം ചേർക്കുക",
    remarks: "ഉസ്താദിന്റെ കുറിപ്പ്",
    printCard: "പ്രിന്റ് പ്രോഗ്രസ് കാർഡ്",

    // Settings
    databaseSettings: "ഗൂഗിൾ ഷീറ്റ് സെറ്റിംഗ്സ്",
    scriptGuide: "ആപ്സ് സ്ക്രിപ്റ്റ് കോഡ്",
    exportBackup: "ബാക്കപ്പ് ഡൗൺലോഡ്",
    saveAndTest: "സേവ് ചെയ്ത് ടെസ്റ്റ് ചെയ്യുക",
    syncNow: "ഗൂഗിൾ ഷീറ്റിലേക്ക് സിങ്ക് ചെയ്യുക",
    restoreBackup: "ബാക്കപ്പ് റീസ്റ്റോർ",
    exportRoster: "ലിസ്റ്റ് ഡൗൺലോഡ്"
  }
};

export function getLanguage() {
  return localStorage.getItem("appLanguage") || "en";
}

export function setLanguage(langCode) {
  localStorage.setItem("appLanguage", langCode);
  const langObj = LANGUAGES[langCode] || LANGUAGES.en;
  document.documentElement.dir = langObj.dir;
  document.documentElement.lang = langCode;
  window.dispatchEvent(new Event("languagechange"));
}

export function t(key) {
  const currentLang = getLanguage();
  const dict = translations[currentLang] || translations.en;
  return dict[key] || translations.en[key] || key;
}
