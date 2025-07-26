// src/features/auth/AuthScreen.js

import React, { useState } from 'react';
import { auth } from '../firebase/config'; // Import auth from your Firebase config
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider, // <--- Import GoogleAuthProvider
  signInWithRedirect,    // <--- Import signInWithRedirect
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate("/");
    } catch (err) {
      console.error('Email/Password Auth Error:', err);
      // More user-friendly error messages
      switch (err.code) {
        case 'auth/invalid-email': setError('Invalid email address format.'); break;
        case 'auth/user-disabled': setError('This account has been disabled.'); break;
        case 'auth/user-not-found':
        case 'auth/wrong-password': setError('Invalid email or password.'); break;
        case 'auth/email-already-in-use': setError('Email already in use. Try logging in or resetting password.'); break;
        case 'auth/weak-password': setError('Password should be at least 6 characters.'); break;
        default: setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- NEW: Handle Google Sign-In ---
  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider(); // Create a new Google Auth provider instance
      await signInWithRedirect(auth, provider); // Open Google sign-in popup
      // User will be redirected by AuthProvider/PrivateRoute upon successful sign-in
    } catch (err) {
      console.error('Google Auth Error:', err);
      // Handle specific Google Auth errors
      switch (err.code) {
        case 'auth/popup-closed-by-user':
          setError('Google sign-in window closed. Please try again.');
          break;
        case 'auth/cancelled-popup-request':
          setError('Another sign-in request is already in progress.');
          break;
        case 'auth/operation-not-allowed':
          setError('Google sign-in is not enabled for this project.');
          break;
        // Add more specific Google Auth error handling if needed
        default:
          setError('Failed to sign in with Google. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  // --- END NEW ---

  return (
    <div style={styles.container}>
      <div style={styles.formCard}>
        <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
        {error && <p style={styles.errorText}>{error}</p>}

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>

        <p style={styles.orDivider}>OR</p> {/* Separator */}

        {/* Google Sign-In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{ ...styles.button, ...styles.googleButton }} // Apply Google-specific styles
        >
          {loading ? 'Processing...' : 'Sign In with Google'}
        </button>

        <p style={styles.toggleText}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => setIsLogin(!isLogin)} style={styles.toggleLink}>
            {isLogin ? 'Sign Up' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f4f7f6',
  },
  formCard: {
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    width: '350px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginBottom: '20px',
  },
  input: {
    padding: '12px',
    borderRadius: '5px',
    border: '1px solid #ddd',
    fontSize: '16px',
  },
  button: {
    padding: '12px 20px',
    borderRadius: '5px',
    border: 'none',
    backgroundColor: '#007bff',
    color: 'white',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  // New styles for Google button and divider
  googleButton: {
    backgroundColor: '#DB4437', // Google Red
    marginBottom: '20px',
  },
  orDivider: {
    margin: '15px 0',
    fontSize: '14px',
    color: '#888',
    position: 'relative',
  },
  errorText: {
    color: '#dc3545',
    marginBottom: '15px',
    fontSize: '14px',
  },
  toggleText: {
    fontSize: '14px',
    color: '#555',
  },
  toggleLink: {
    color: '#007bff',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};

export default AuthScreen;