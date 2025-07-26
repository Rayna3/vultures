// src/home/HomePage.jsx
import React from 'react';
import { useAuth } from '../auth/AuthProvider';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

import ChatBox from '../chatbot/chatbox';      // 👈 NEW import

function HomePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout Error:', error);
      alert('Failed to log out: ' + error.message);
    }
  };

  return (
    <div style={styles.container}>
      {/* ---------- Header ---------- */}
      <div style={styles.header}>
        <h1>Welcome to the Food Share!</h1>
        {currentUser && (
          <p>
            Logged in as: <strong>{currentUser.email}</strong>
          </p>
        )}
        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
      </div>

      {/* ---------- Main Content ---------- */}
      <div style={styles.content}>
        <p>This is your home page. Here you can:</p>
        <ul>
          <li>Upload groceries you want to share</li>
          <li>Browse and claim available groceries</li>
          <li>Get recipe recommendations</li>
          <li>Manage your shared and claimed items</li>
        </ul>
        <p>Start by navigating to the “Upload” or “Browse” sections!</p>
      </div>

      {/* ---------- ChatBox Section ---------- */}
      <div style={styles.chatSection}>
        <h2>Ask FridgeBot</h2>
        <ChatBox />        {/* 👈 NEW component */}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
    marginTop: '40px',
  },
  header: {
    borderBottom: '1px solid #eee',
    paddingBottom: '20px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  logoutButton: {
    padding: '8px 15px',
    borderRadius: '5px',
    border: '1px solid #dc3545',
    backgroundColor: '#dc3545',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    marginTop: '15px',
  },
  content: {
    lineHeight: '1.6',
    color: '#333',
    marginBottom: '40px',
  },
  /* ---------- NEW styles for chat ---------- */
  chatSection: {
    borderTop: '1px solid #eee',
    paddingTop: '20px',
  },
};

export default HomePage;
