import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC-KPsMgraJo3YEyETRUmR2sqJOiJSJsR4",
  authDomain: "mullaky-9f58a.firebaseapp.com",
  databaseURL: "https://mullaky-9f58a-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "mullaky-9f58a",
  storageBucket: "mullaky-9f58a.firebasestorage.app",
  messagingSenderId: "30960551800",
  appId: "1:30960551800:web:f8482b94729dcd03bcea8d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const firestore = getFirestore(app);