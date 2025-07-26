import React, {useState, useEffect, CSSProperties, ReactElement} from 'react';
import { useAuth } from '../auth/AuthProvider';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import HomeGroceryPage from './grocery-pages';
import ChatBox from '../chatbot/chatbox';  // ← import your ChatBox

function FetchGroceryPage() {
  const [data, setData] = useState<ReactElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await HomeGroceryPage();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return data;
}

export default function HomePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout Error:', error);
      if (error instanceof Error) {
        alert('Failed to log out: ' + error.message);
      } else {
        alert('Failed to log out: An unknown error occurred.');
      }
    }
  };

  return (
    <div style={homePageStyles.container}>
      <div style={homePageStyles.header}>
        <h1>Welcome to Vultures!</h1>
        <button
          onClick={() => navigate('/recipes')}
          style={{ ...homePageStyles.logoutButton, backgroundColor: '#6C757D' }}
        >
          Go to Recipe Finder
        </button>
        {/* Changed text and navigation path for adding groceries */}
        <button onClick={() => navigate('/add-grocery')} style={{ ...homePageStyles.logoutButton, backgroundColor: '#28a745', marginLeft: '10px' }}>
            Add New Grocery
        </button>
        
        {currentUser && <p>Logged in as: <strong>{currentUser.email}</strong></p>}
        <button onClick={handleLogout} style={homePageStyles.logoutButton}>
          Logout
        </button>
      </div>

      <div style={homePageStyles.content}>
        <p>This is your home page. Here you'll be able to:</p>
        <ul>
          <li>Upload groceries you want to share</li>
          <li>Browse and claim available groceries</li>
          <li>Get recipe recommendations</li>
          <li>Manage your shared and claimed items</li>
        </ul>
      </div>

      {/* Grocery Page */}
      <div style={homePageStyles.section}>
        <h2>Available Groceries</h2>
        <FetchGroceryPage />
      </div>

      {/* ChatBox Section */}
      <div style={homePageStyles.chatSection}>
        <h2>Ask FridgeBot</h2>
        <ChatBox />
      </div>
    </div>
  );
}

const homePageStyles: { [key: string]: CSSProperties } = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: '#FFFFFF',
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
  section: {
    marginBottom: '40px',
  },
  chatSection: {
    borderTop: '1px solid #eee',
    paddingTop: '20px',
    marginBottom: '40px',
  },
};
