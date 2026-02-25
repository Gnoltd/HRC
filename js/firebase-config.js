/* =====================================================
   firebase-config.js — Firebase project configuration
   Replace the placeholder values below with your own
   Firebase project settings.

   Steps:
   1. Go to https://console.firebase.google.com/
   2. Create a project (or select an existing one)
   3. Add a Web app to the project
   4. Copy the firebaseConfig object shown and paste it here
   5. In the Firebase console, enable Realtime Database
      (Build → Realtime Database → Create database)
   6. Set the database rules to allow read/write as needed
   ===================================================== */
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC-hD5tXZqz-BkFV84xC0EAkW_j52xs_gw",
  authDomain: "hsbresearchprj.firebaseapp.com",
  databaseURL: "https://hsbresearchprj-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "hsbresearchprj",
  storageBucket: "hsbresearchprj.firebasestorage.app",
  messagingSenderId: "18386030223",
  appId: "1:18386030223:web:08eb677479445dc8a1aafa",
  measurementId: "G-26TMFKPF01"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
