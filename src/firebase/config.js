// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
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