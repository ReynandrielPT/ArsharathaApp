import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return <HomePage />;
  }

  return (
    <div>
      {showRegister ? (
        <RegisterPage onSwitchToLogin={() => setShowRegister(false)} />
      ) : (
        <LoginPage onSwitchToRegister={() => setShowRegister(true)} />
      )}
    </div>
  );
}

export default App;
