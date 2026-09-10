import { Link, useLocation } from "react-router-dom";
import { Settings, GraduationCap, BookOpen, Calendar, Users, Home, Globe, Wifi, WifiOff } from "lucide-react";
import { useState, useEffect } from "react";
import { getSettings } from "../services/indexedDB";
import { useLang } from "../context/LanguageContext";
import { LANGUAGES, t } from "../utils/i18n";

export default function Navbar({ onOpenSettings }) {
  const location = useLocation();
  const { lang, changeLanguage } = useLang();
  const [sheetConnected, setSheetConnected] = useState(false);

  useEffect(() => {
    getSettings().then((st) => setSheetConnected(!!st.googleSheetUrl));
  }, [location]);

  const navItems = [
    { path: "/", label: t("dashboard"), icon: Home },
    { path: "/hifz", label: t("hifzProgress"), icon: BookOpen },
    { path: "/attendance/ALL", label: t("attendance"), icon: Calendar },
    { path: "/students", label: t("students"), icon: Users },
    { path: "/history", label: t("history"), icon: GraduationCap },
  ];

  function isActive(path) {
    if (path === "/") return location.pathname === "/";
    const segment = path.split("/")[1];
    return location.pathname.startsWith(`/${segment}`);
  }

  return (
    <header className="main-navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="brand-logo">
            <GraduationCap size={22} color="#065f46" />
          </div>
          <div>
            <h1 className="brand-title">{t("brandTitle")}</h1>
            <p className="brand-subtitle">{t("brandSubtitle")}</p>
          </div>
        </div>

        <nav className="navbar-links">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive(item.path) ? "active" : ""}`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="navbar-actions">
          <div className="language-selector-wrapper">
            <Globe size={14} className="lang-icon" />
            <select
              value={lang}
              onChange={(e) => changeLanguage(e.target.value)}
              className="language-select"
              aria-label="Select language"
            >
              {Object.values(LANGUAGES).map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name}
                </option>
              ))}
            </select>
          </div>

          <button
            className={`sheet-status-badge ${sheetConnected ? "connected" : "local"}`}
            onClick={onOpenSettings}
            title={sheetConnected ? t("sheetLive") : t("localMode")}
          >
            <span className="pulse-dot" />
            <span className="status-text">
              {sheetConnected ? t("sheetLive") : t("localMode")}
            </span>
          </button>

          <button
            className="icon-button settings-btn"
            onClick={onOpenSettings}
            title={t("settings")}
            aria-label={t("settings")}
          >
            <Settings size={19} />
          </button>
        </div>
      </div>

      {/* Mobile bottom bar */}
      <div className="mobile-bottom-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-nav-item ${isActive(item.path) ? "active" : ""}`}
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
