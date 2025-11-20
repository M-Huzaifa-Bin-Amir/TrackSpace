// src/services/firebase.js

// 1. Import the specific functions we need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";        // <--- This was missing
import { getFirestore } from "firebase/firestore"; // <--- This was likely missing

// 2. Your web app's Firebase configuration
// (GO TO FIREBASE CONSOLE -> PROJECT SETTINGS TO GET THESE KEYS AGAIN IF YOU LOST THEM)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// 3. Initialize Firebase
const app = initializeApp(firebaseConfig);

// 4. Export the services (This fixes your error!)

export const auth = getAuth(app);
export const db = getFirestore(app);