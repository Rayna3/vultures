import React, { useState, useEffect, CSSProperties, ReactElement } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

import HomeGroceryPage from './grocery-pages';
import ChatBox from '../chatbot/chatbox';

// Async loader for grocery page component
function FetchGroceryPage(): ReactElement | null {
  const [data, setData] = useState<ReactElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any | null >(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await HomeGroceryPage();
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div>Loading groceries...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return data;
}

export default function HomePage(): ReactElement {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async (): Promise<void> => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error('Logout Error:', err);
      if (err instanceof Error) {
        alert('Failed to log out: ' + err.message);
      } else {
        alert('Failed to log out: An unknown error occurred.');
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Welcome to Vultures!</h1>
        <button
          onClick={() => navigate('/recipes')}
          style={{ ...styles.logoutButton, backgroundColor: '#6c757d' }}
        >
          Go to Recipe Finder
        </button>
        {currentUser && (
          <p>
            Logged in as: <strong>{currentUser.email}</strong>
          </p>
        )}
        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
      </div>

      <div style={styles.content}>
        <p>This is your home page. Here you'll be able to:</p>
        <ul>
          <li>Upload groceries you want to share</li>
          <li>Browse and claim available groceries</li>
          <li>Get recipe recommendations</li>
          <li>Manage your shared and claimed items</li>
        </ul>
      </div>

      {/* Grocery Page */}
      <div style={styles.section}>
        <h2>Available Groceries</h2>
        <FetchGroceryPage />
      </div>

      {/* ChatBox Section */}
      <div style={styles.section}>
        <h2>Ask FridgeBot</h2>
        <ChatBox />
      </div>
    </div>
  );
}

const styles: { [key: string]: CSSProperties } = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '800px',
    margin: '40px auto',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
  },
  header: {
    borderBottom: '1px solid #eee',
    paddingBottom: '20px',
    marginBottom: '20px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  logoutButton: {
    padding: '8px 15px',
    borderRadius: '5px',
    border: '1px solid #dc3545',
    backgroundColor: '#dc3545',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    marginTop: '10px',
  },
  content: {
    lineHeight: '1.6',
    color: '#333',
    marginBottom: '40px',
  },
  section: {
    marginBottom: '40px',
  },
};
