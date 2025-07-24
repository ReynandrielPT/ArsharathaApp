import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { getAuth, confirmPasswordReset } from "firebase/auth";

const ResetPasswordPage: React.FC = () => {
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

  const useQuery = () => {
    return new URLSearchParams(location.search);
  };

  const query = useQuery();
  const actionCode = query.get("oobCode");

  const handleConfirmReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    if (!actionCode) {
      setError("Reset code is invalid or has expired.");
      setLoading(false);
      return;
    }

    const auth = getAuth();
    try {
      await confirmPasswordReset(auth, actionCode, newPassword);
      alert(
        "Password successfully changed! Please login with your new password."
      );
      navigate("/login");
    } catch (error: any) {
      console.error("Error resetting password:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Set your new password</h1>
        <form onSubmit={handleConfirmReset}>
          <div className="input-group">
            <label htmlFor="new-password">Enter new password</label>
            <input
              id="new-password"
              className="auth-input"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Your new password"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="confirm-password">Confirm password</label>
            <input
              id="confirm-password"
              className="auth-input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Retype your new password"
              required
            />
          </div>
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Saving..." : "Change Password"}
          </button>
        </form>
        <div className="auth-links">
          <Link to="/login">Back to Login</Link>
        </div>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
