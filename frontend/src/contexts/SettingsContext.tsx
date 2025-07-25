
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

export type Language = 'id-ID' | 'en-US';

interface Settings {
  language: Language;
  setLanguage: (language: Language) => void;
}

const SettingsContext = createContext<Settings | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('vikaai-language') as Language) || 'id-ID';
  });

  useEffect(() => {
    localStorage.setItem('vikaai-language', language);
  }, [language]);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
  };

  return (
    <SettingsContext.Provider value={{ language, setLanguage }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): Settings => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
