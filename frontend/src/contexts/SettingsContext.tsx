
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { getAssessmentStatus, toggleADHDMode } from '../services/assessmentService';

export type Language = 'id-ID' | 'en-US';

interface Settings {
  language: Language;
  setLanguage: (language: Language) => void;
  isADHD: boolean;
  adhdMode: boolean;
  setAdhdStatus: (isADHD: boolean) => void;
  setAdhdMode: (enabled: boolean) => void;
  toggleAdhdFeature: () => Promise<void>;
}

const SettingsContext = createContext<Settings | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('vikaai-language') as Language) || 'en-US';
  });
  const [isADHD, setIsADHD] = useState(false);
  const [adhdMode, setAdhdModeState] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const status = await getAssessmentStatus();
          setIsADHD(status.isADHD);
          setAdhdModeState(status.adhdMode);
        }
      } catch (error) {
        console.error("Failed to fetch assessment status on load:", error);
      }
    };
    fetchStatus();
  }, []);
  
  useEffect(() => {
    localStorage.setItem('vikaai-language', language);
  }, [language]);

  useEffect(() => {
    if (adhdMode) {
      document.body.classList.add('adhd-mode');
    } else {
      document.body.classList.remove('adhd-mode');
    }
  }, [adhdMode]);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
  };

  const setAdhdStatus = (isADHD: boolean) => {
    setIsADHD(isADHD);
  };

  const setAdhdMode = (enabled: boolean) => {
    setAdhdModeState(enabled);
  };

  const toggleAdhdFeature = async () => {
    const newMode = !adhdMode;
    await toggleADHDMode(newMode);
    setAdhdMode(newMode);
  };

  return (
    <SettingsContext.Provider value={{ language, setLanguage, isADHD, adhdMode, setAdhdStatus, setAdhdMode, toggleAdhdFeature }}>
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
