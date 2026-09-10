import { createContext, useContext, useState, useCallback } from "react";
import { getLanguage, setLanguage, LANGUAGES } from "../utils/i18n";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(getLanguage);

  const changeLanguage = useCallback((code) => {
    setLanguage(code);
    setLang(code);
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
}
