// src/firebase/config.js

// 1. Core Firebase App Initialization (from 'firebase/app')
import { initializeApp } from "firebase/app";

// 2. Individual Firebase Service Imports (from their specific paths)
import { getAnalytics } from "firebase/analytics";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// REPLACE WITH YOUR ACTUAL CONFIG FROM FIREBASE CONSOLE
const firebaseConfig = {
  apiKey: "AIzaSyA3m7LgXku-tY5PvtUwpNOxZF0m4fLuEwQ",
  authDomain: "vultures-b5e31.firebaseapp.com",
  projectId: "vultures-b5e31",
  storageBucket: "vultures-b5e31.firebasestorage.app",
  messagingSenderId: "427351340008",
  appId: "1:427351340008:web:862bec2891472a0c7e6a5d",
  measurementId: "G-WFPX298P5S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export the initialized services and relevant functions
export {
  app,                // The main Firebase app instance (less common to directly use, but good to have)
  analytics,          // The Analytics service instance
  auth,               // The Authentication service instance
  db,                 // The Firestore database service instance
  storage,            // The Storage service instance
  onAuthStateChanged  // The onAuthStateChanged listener function from 'firebase/auth'
};