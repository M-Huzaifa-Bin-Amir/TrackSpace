// src/services/firebase.js

// 1. Import the specific functions we need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";        // <--- This was missing
import { getFirestore } from "firebase/firestore"; // <--- This was likely missing
import {  
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc,
  // Note: Firestore update functions are usually handled via setDoc or updateDoc
  // but for simplicity, we focus on C, R, D here.
} from "firebase/firestore"; 

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

// 1. CREATE: Add a new asset
export const addAssetToDB = async (assetData) => {
  try {
    const docRef = await addDoc(collection(db, "assets"), {
      ...assetData,
      createdAt: new Date(),
    });
    // Return the new document's ID along with the data for local state updates
    return { id: docRef.id, ...assetData, createdAt: new Date() };
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};

// 2. READ: Get all assets
export const getAssetsFromDB = async () => {
  const querySnapshot = await getDocs(collection(db, "assets"));
  // Convert Firebase data format into a clean Array
  return querySnapshot.docs.map(doc => ({
    id: doc.id, 
    ...doc.data()
  }));
};

// 3. DELETE: Remove an asset by ID
export const deleteAssetFromDB = async (id) => {
  await deleteDoc(doc(db, "assets", id));
};

// 3. Initialize Firebase
const app = initializeApp(firebaseConfig);

// 4. Export the services (This fixes your error!)

export const auth = getAuth(app);
export const db = getFirestore(app);