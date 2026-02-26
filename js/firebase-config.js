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

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();
