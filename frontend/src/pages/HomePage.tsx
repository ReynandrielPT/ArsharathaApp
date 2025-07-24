import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const HomePage: React.FC = () => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div>
      <h1>Login Sukses</h1>
      <button onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default HomePage;
