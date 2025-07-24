import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdhdAssessmentPage from './pages/AdhdAssessmentPage';
import AssessmentResultPage from './pages/AssessmentResultPage';

const App: React.FC = () => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />
        <Route path="/reset-password" element={!user ? <ResetPasswordPage /> : <Navigate to="/" />} />
        <Route path="/assessment" element={user ? <AdhdAssessmentPage /> : <Navigate to="/login" />} />
        <Route path="/assessment/result" element={user ? <AssessmentResultPage /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
