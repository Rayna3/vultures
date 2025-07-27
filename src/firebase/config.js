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
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
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