import React, { createContext, useState, useContext, ReactNode } from 'react';

export type VarkMode = 'V' | 'A' | 'R' | 'K';

interface Settings {
  varkMode: VarkMode;
  setVarkMode: (mode: VarkMode) => void;
  speechEnabled: boolean;
  setSpeechEnabled: (enabled: boolean) => void;
  adhdEnabled: boolean;
  setAdhdEnabled: (enabled: boolean) => void;
}

const SettingsContext = createContext<Settings | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [varkMode, setVarkMode] = useState<VarkMode>('R');
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [adhdEnabled, setAdhdEnabled] = useState(false);

  return (
    <SettingsContext.Provider value={{ varkMode, setVarkMode, speechEnabled, setSpeechEnabled, adhdEnabled, setAdhdEnabled }}>
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
