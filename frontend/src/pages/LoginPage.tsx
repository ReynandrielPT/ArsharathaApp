import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { Link } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [resetEmail, setResetEmail] = useState<string>('');
  const [showReset, setShowReset] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // TODO: Setelah backend siap, modifikasi logika di bawah.
    // 1. Ganti `signInWithEmailAndPassword` dengan fetch call ke API login backend Anda.
    //    Contoh: const response = await fetch('/api/v1/users/login', ...);
    // 2. Backend harus mengembalikan token JWT dan field `firstLogin`.
    // 3. Simpan token JWT di localStorage atau state management.
    // 4. Jika response.firstLogin === true, navigasi ke '/assessment'.
    // 5. Jika tidak, navigasi ke '/'.

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!resetEmail) {
      setError("Please enter your email to reset password.");
      return;
    }
    setLoading(true);
    setError('');
    
    const actionCodeSettings = {
      url: `${window.location.origin}/reset-password`,
      handleCodeInApp: true,
    };

    try {
      await sendPasswordResetEmail(auth, resetEmail, actionCodeSettings);
      alert("Reset Password Link has been sent to your email.");
      setShowReset(false);
      setResetEmail('');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ marginTop: '20px' }}>
        <a href="#" onClick={() => setShowReset(!showReset)}>
          Lupa Password?
        </a>
      </div>

      {showReset && (
        <form onSubmit={handleRequestPasswordReset} style={{ marginTop: '10px' }}>
          <div>
            <label>Masukkan Email untuk Reset:</label>
            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Mengirim...' : 'Kirim Link Reset'}
          </button>
        </form>
      )}

      <p>
        Don't have an account?{' '}
        <Link to="/register">Register</Link>
      </p>
    </div>
  );
};

export default LoginPage;
