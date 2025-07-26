// src/components/PrivateRoute.js

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider'; // Import the useAuth hook

function PrivateRoute() {
  const { currentUser, loading } = useAuth(); // Get current user and loading state from context

  // While the auth state is being determined, you might show a loading spinner
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '20px' }}>
        Loading authentication...
      </div>
    );
  }

  // If there's a current user, render the protected content (Outlet)
  // Otherwise, redirect to the login page
  return currentUser ? <Outlet /> : <Navigate to="/login" replace />;
}

export default PrivateRoute;