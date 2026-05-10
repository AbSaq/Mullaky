// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC-KPsMgraJo3YEyETRUmR2sqJOiJSJsR4",
  authDomain: "mullaky-9f58a.firebaseapp.com",
  databaseURL: "https://mullaky-9f58a-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "mullaky-9f58a",
  storageBucket: "mullaky-9f58a.firebasestorage.app",
  messagingSenderId: "30960551800",
  appId: "1:30960551800:web:f8482b94729dcd03bcea8d",
  measurementId: "G-PWQQGGXJQ6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);