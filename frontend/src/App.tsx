import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation, useParams, BrowserRouter as Router } from 'react-router-dom';
import NavigationBar from './components/NavigationBar';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdhdAssessmentPage from './pages/AdhdAssessmentPage';
import AssessmentResultPage from './pages/AssessmentResultPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { SettingsProvider } from './contexts/SettingsContext';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';

interface Session {
  _id: string;
  title: string;
  updatedAt: string;
}

const AppRoutes = () => {
  const [user, loading] = useAuthState(auth);
  const [sessions, setSessions] = useState<Session[]>([]);
  const navigate = useNavigate();

  const fetchSessions = async () => {
    const token = await auth.currentUser?.getIdToken();
    if (!token) return;

    try {
      const response = await fetch('/api/sessions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      } else {
        console.error('Failed to fetch sessions');
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const handleLogout = () => {
    auth.signOut();
    navigate('/login');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {user && <NavigationBar sessions={sessions} onStartSession={() => navigate('/session/new')} onLogout={handleLogout} />}
      <main className={user ? 'ml-80' : ''}>
        <Routes>
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/" element={user ? <DashboardPage /> : <Navigate to="/login" />} />
          <Route path="/session/:sessionId" element={user ? <ChatPage onSessionCreated={fetchSessions} /> : <Navigate to="/login" />} />
          <Route path="/settings" element={user ? <SettingsPage onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/assessment" element={user ? <AdhdAssessmentPage /> : <Navigate to="/login" />} />
          <Route path="/assessment/result" element={user ? <AssessmentResultPage /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <SettingsProvider>
      <Router>
        <AppRoutes />
      </Router>
    </SettingsProvider>
  );
}

export default App;