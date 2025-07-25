import React, { useState } from "react";
import { Link } from "react-router-dom";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    const auth = getAuth();

    const actionCodeSettings = {
      // This URL must point to the page that handles the password change.
      url: `${window.location.origin}/reset-password`,
      handleCodeInApp: true,
    };

    try {
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      setMessage(
        "Password reset link has been sent to your email. Please check your inbox."
      );
    } catch (error: any) {
      setError(
        "Failed to send reset link. Please ensure the email is correct."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Reset your password</h1>
        <p
          style={{
            marginBottom: "2rem",
            fontSize: "0.9rem",
            color: "rgba(255,255,255,0.8)",
          }}
        >
          Enter your email address and we will send you a link to reset your
          password.
        </p>
        <form onSubmit={handlePasswordReset}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="auth-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              required
            />
          </div>
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        <div className="auth-links">
          <Link to="/login">Back to Login</Link>
        </div>
        {error && <p className="error-message">{error}</p>}
        {message && (
          <p
            style={{ color: "#ccffcc", marginTop: "1rem", fontSize: "0.9rem" }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
