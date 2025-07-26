import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, onAuthStateChanged } from '../firebase/config'; // Import auth and onAuthStateChanged

// Create an Auth Context
const AuthContext = createContext();

// Custom hook to use the Auth Context
export const useAuth = () => {
  return useContext(AuthContext);
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // To indicate if auth state is being checked

  useEffect(() => {
    // This listener is crucial. It updates currentUser whenever auth state changes
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      setLoading(false); // Auth state has been determined
    });

    // Clean up the subscription on unmount
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Only render children when the authentication state is loaded */}
      {!loading && children}
    </AuthContext.Provider>
  );
}