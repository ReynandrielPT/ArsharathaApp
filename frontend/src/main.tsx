import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { SettingsProvider } from './contexts/SettingsContext.tsx';

/**
 * The entry point of the React application.
 * It renders the main App component within a StrictMode, BrowserRouter, and SettingsProvider.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode> {/* Enables strict checks for potential problems in an application. */}
    <BrowserRouter> {/* Provides routing capabilities to the application. */}
      <SettingsProvider> {/* Provides global settings (e.g., language) to all components. */}
        <App /> {/* The root component of the application. */}
      </SettingsProvider>
    </BrowserRouter>
  </StrictMode>
);