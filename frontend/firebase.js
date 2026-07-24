import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Debug - Check if values are loading
console.log("🔍 Firebase Config Check:");
console.log("API Key:", import.meta.env.VITE_FIREBASE_APIKEY ? "✅ Loaded" : "❌ Missing");
console.log("Auth Domain:", import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? "✅ Loaded" : "❌ Missing");
console.log("Project ID:", import.meta.env.VITE_FIREBASE_PROJECT_ID ? "✅ Loaded" : "❌ Missing");

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

console.log("✅ Firebase initialized successfully!");

export { app, auth };