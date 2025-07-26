// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// 1. Import the Authentication module
import { getAuth, onAuthStateChanged } from "firebase/auth";
// Also import Firestore and Storage if you plan to use them as well
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// 2. Initialize the Authentication service
const auth = getAuth(app);

// Initialize Firestore and Storage services if you need them
const db = getFirestore(app);
const storage = getStorage(app);


// 3. Export the initialized services and onAuthStateChanged
export {
  app,
  analytics,
  auth, // Export the auth service
  db,   // Export Firestore
  storage, // Export Storage
  onAuthStateChanged // Export the onAuthStateChanged function for convenience
};