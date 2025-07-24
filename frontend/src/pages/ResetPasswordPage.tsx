import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAuth, confirmPasswordReset } from 'firebase/auth';

const ResetPasswordPage: React.FC = () => {
  const [newPassword, setNewPassword] = useState<string>("");
  const navigate = useNavigate();
  const location = useLocation();

  const useQuery = () => {
    return new URLSearchParams(location.search);
  }

  const query = useQuery();
  const actionCode = query.get('oobCode');

  const handleConfirmReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!actionCode) {
        alert("Reset code invalid.");
        return;
    }
    const auth = getAuth();
    try {
      await confirmPasswordReset(auth, actionCode, newPassword);
      alert("Password successfully changed! Please login with your new password.");
      navigate("/login");
    } catch (error: any) {
      console.error("Error resetting password:", error);
      alert(error.message);
    }
  };

  return (
    <div>
      <h1>Change your password</h1>
      <form onSubmit={handleConfirmReset}>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Input New Password"
          required
        />
        <button type="submit">Save New Password</button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
