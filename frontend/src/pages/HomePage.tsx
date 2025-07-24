import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const HomePage: React.FC = () => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error("Error signing out:", error);
    }
  };

  const UserIcon = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
        fill="white"
      />
    </svg>
  );
  const LogoutIcon = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17 7L15.59 8.41L18.17 11H8V13H18.17L15.59 15.59L17 17L22 12L17 7ZM4 5H12V3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H12V19H4V5Z"
        fill="white"
      />
    </svg>
  );
  const SendIcon = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="white" />
    </svg>
  );

  return (
    <div className="home-container">
      <aside className="sidebar">
        <div className="sidebar-header">CogniFlow</div>
        <button className="new-chat-button">+ Start new chat</button>
        <input
          type="search"
          className="search-chats"
          placeholder="Search for chats..."
        />
        <div className="chats-section">
          <p>Chats</p>
        </div>
        <div className="sidebar-footer">
          <div className="footer-item">
            <UserIcon />
            <span>Profile</span>
          </div>
          <div className="footer-item" onClick={handleLogout}>
            <LogoutIcon />
            <span>Logout</span>
          </div>
        </div>
      </aside>
      <main className="main-content">
        <header className="main-header">
          <p>Pages / CogniFlow</p>
        </header>
        <div className="chat-input-container">
          <input
            type="text"
            className="chat-input"
            placeholder="Apa takok opo?"
          />
          <button className="send-button">
            <SendIcon />
          </button>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
