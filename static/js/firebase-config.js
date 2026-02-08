// Firebase Web SDK Configuration
// Initialize Firebase with the provided configuration

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC-hD5tXZqz-BkFV84xC0EAkW_j52xs_gw",
  authDomain: "hsbresearchprj.firebaseapp.com",
  projectId: "hsbresearchprj",
  storageBucket: "hsbresearchprj.firebasestorage.app",
  messagingSenderId: "18386030223",
  appId: "1:18386030223:web:5f0aeab28fc7d4ada1aafa",
  measurementId: "G-XFD2Y30CDD"
};

// Initialize Firebase (will be called after Firebase scripts load)
let app;
let analytics;

function initializeFirebase() {
  // Initialize Firebase app
  app = firebase.initializeApp(firebaseConfig);
  
  // Initialize Analytics if available
  if (typeof firebase.analytics !== 'undefined') {
    analytics = firebase.analytics();
    console.log('Firebase Analytics initialized');
  }
  
  console.log('Firebase initialized successfully');
}

// Auto-initialize when Firebase scripts are loaded
if (typeof firebase !== 'undefined') {
  initializeFirebase();
}

