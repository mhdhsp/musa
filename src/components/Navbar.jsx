import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Settings, GraduationCap, BookOpen, Calendar, Users, Home, Globe } from "lucide-react";
import { getSettings } from "../services/indexedDB";
import { LANGUAGES, getLanguage, setLanguage, t } from "../utils/i18n";

export default function Navbar({ onOpenSettings }) {
  const location = useLocation();
  const [sheetConnected, setSheetConnected] = useState(false);
  const [currentLang, setCurrentLang] = useState(getLanguage());

  useEffect(() => {
    getSettings().then((st) => {
      setSheetConnected(!!st.googleSheetUrl);
    });

    const handleLangChange = () => {
      setCurrentLang(getLanguage());
    };

    window.addEventListener("languagechange", handleLangChange);
    return () => window.removeEventListener("languagechange", handleLangChange);
  }, [location]);

  function handleSelectLang(e) {
    setLanguage(e.target.value);
  }

  const navItems = [
    { path: "/", label: t("dashboard"), icon: Home },
    { path: "/hifz", label: t("hifzProgress"), icon: BookOpen },
    { path: "/attendance/ALL", label: t("attendance"), icon: Calendar },
    { path: "/students", label: t("students"), icon: Users },
    { path: "/history", label: t("history"), icon: GraduationCap }
  ];

  return (
    <header className="main-navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="brand-logo">
            <GraduationCap size={24} color="#065f46" />
          </div>
          <div>
            <h1 className="brand-title">{t("brandTitle")}</h1>
            <p className="brand-subtitle">{t("brandSubtitle")}</p>
          </div>
        </div>

        <nav className="navbar-links">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path.split("/")[1] ? `/${item.path.split("/")[1]}` : item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? "active" : ""}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="navbar-actions">
          {/* Language Selector */}
          <div className="language-selector-wrapper">
            <Globe size={16} className="lang-icon" />
            <select
              value={currentLang}
              onChange={handleSelectLang}
              className="language-select"
            >
              {Object.values(LANGUAGES).map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div
            className={`sheet-status-badge ${sheetConnected ? "connected" : "local"}`}
            onClick={onOpenSettings}
            title={sheetConnected ? t("sheetLive") : t("localMode")}
          >
            <span className="pulse-dot"></span>
            <span className="status-text">
              {sheetConnected ? t("sheetLive") : t("localMode")}
            </span>
          </div>

          <button
            className="icon-button settings-btn"
            onClick={onOpenSettings}
            title={t("settings")}
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="mobile-bottom-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.path.split("/")[1] ? `/${item.path.split("/")[1]}` : item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-nav-item ${isActive ? "active" : ""}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
