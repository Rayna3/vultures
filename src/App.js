import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider'; // Import AuthProvider
import PrivateRoute from './components/PrivateRoute'; // Import PrivateRoute
import AuthScreen from './auth/AuthScreen'; // Import AuthScreen
import HomePage from './home/HomePage'; // Import HomePage

function App() {
  return (
    <Router>
      <AuthProvider> {/* Wrap your entire app with AuthProvider */}
        <Routes>
          {/* Public Route for Login/Signup */}
          <Route path="/login" element={<AuthScreen />} />

          {/* Private Route for authenticated users */}
          {/* Everything inside this Route will be protected by PrivateRoute */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<HomePage />} />
            {/* Add more private routes here later, e.g., /upload, /browse */}
          </Route>

          {/* Optional: A catch-all for 404 pages or redirect if needed */}
          <Route path="*" element={<p>404 - Page Not Found</p>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;