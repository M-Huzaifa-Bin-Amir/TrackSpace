// src/services/firebase.js

// 1. Import the specific functions we need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";        // <--- This was missing
import { getFirestore } from "firebase/firestore"; // <--- This was likely missing

// 2. Your web app's Firebase configuration
// (GO TO FIREBASE CONSOLE -> PROJECT SETTINGS TO GET THESE KEYS AGAIN IF YOU LOST THEM)
const firebaseConfig = {
  apiKey: "AIzaSyDvqvQpE9WxzTCxcJNmNmtwWQXK6lzyYes",
  authDomain: "tracksphere-a1099.firebaseapp.com",
  projectId: "tracksphere-a1099",
  storageBucket: "tracksphere-a1099.firebasestorage.app",
  messagingSenderId: "996298261432",
  appId: "1:996298261432:web:5c8aa546ddcf4cb04bc54d"
};

// 3. Initialize Firebase
const app = initializeApp(firebaseConfig);

// 4. Export the services (This fixes your error!)

export const auth = getAuth(app);
export const db = getFirestore(app);