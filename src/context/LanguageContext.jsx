import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('hi'); // default: Hindi

  const toggle = () => setLang((prev) => (prev === 'hi' ? 'en' : 'hi'));

  // t(obj) — pass { en: '...', hi: '...' } and get the right string
  const t = (obj) => (obj ? obj[lang] ?? obj['en'] : '');

  return (
    <LanguageContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
