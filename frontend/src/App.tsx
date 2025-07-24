import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import { AnimatePresence } from "framer-motion";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AdhdAssessmentPage from "./pages/AdhdAssessmentPage";
import AssessmentResultPage from "./pages/AssessmentResultPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

const AppRoutes = () => {
  const [user, loading] = useAuthState(auth);
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={user ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={!user ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/register"
          element={!user ? <RegisterPage /> : <Navigate to="/" />}
        />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/assessment"
          element={user ? <AdhdAssessmentPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/assessment/result"
          element={user ? <AssessmentResultPage /> : <Navigate to="/login" />}
        />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Routes>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default App;
