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

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
