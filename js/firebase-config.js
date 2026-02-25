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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
