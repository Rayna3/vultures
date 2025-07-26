import React, {CSSProperties} from 'react';
import { useAuth } from '../auth/AuthProvider'; // To access current user and logout
import { auth } from '../firebase/config'; // To perform logout
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'; // For programmatic navigation
import { getAvailableGroceries } from '../components/grocery-actions';

function HomePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login'); // Redirect to login after logout
    } catch (error) {
      console.error('Logout Error:', error);
      if (error instanceof Error) { // Type guard: check if 'error' is an instance of Error
        alert('Failed to log out: ' + error.message);
      } else {
        // If it's not an Error object, provide a generic message
        alert('Failed to log out: An unknown error occurred.');
      }
    }
  };

  return (
    <div style={homePageStyles.container}>
      <div style={homePageStyles.header}>
        <h1>Welcome to the Food Share!</h1>

        <button onClick={() => navigate('/recipes')} style={{ ...homePageStyles.logoutButton, backgroundColor: '#6c757d' }}>
            Go to Recipe Finder
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
        <p>Start by navigating to the "Upload" or "Browse" sections!</p>
      </div>
      {/* You'll add links to other features here later */}
    </div>
  );
}

const homePageStyles: { [key: string]: CSSProperties } = {
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
  },
  // Add more styles as you build out features
};

export default HomePage;