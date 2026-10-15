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

// ✅ Debug - Check if values are loading
console.log("🔍 Firebase Config Check:");
console.log("API Key:", import.meta.env.VITE_FIREBASE_APIKEY ? "✅ Loaded" : "❌ Missing");
console.log("Auth Domain:", import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? "✅ Loaded" : "❌ Missing");
console.log("Project ID:", import.meta.env.VITE_FIREBASE_PROJECT_ID ? "✅ Loaded" : "❌ Missing");
console.log("Storage Bucket:", import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ? "✅ Loaded" : "❌ Missing");
console.log("Messaging Sender ID:", import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ? "✅ Loaded" : "❌ Missing");
console.log("App ID:", import.meta.env.VITE_FIREBASE_APP_ID ? "✅ Loaded" : "❌ Missing");

// ✅ Validate all required config values
const missingConfig = Object.entries(firebaseConfig)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingConfig.length > 0) {
  console.error(`❌ Firebase config missing: ${missingConfig.join(', ')}`);
  console.error('Please check your .env file and ensure all VITE_FIREBASE_* variables are set.');
}

// ✅ Initialize Firebase only if config is valid
let app;
let auth;

try {
  // Check if all required config values exist
  const hasAllConfig = Object.values(firebaseConfig).every(value => value && value !== '');
  
  if (!hasAllConfig) {
    throw new Error('Firebase configuration is incomplete. Check your .env file.');
  }

  // Initialize Firebase
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);

  console.log("✅ Firebase initialized successfully!");
} catch (error) {
  console.error("❌ Firebase initialization failed:", error.message);
  // ✅ Create dummy auth to prevent app crash (development only)
  if (import.meta.env.DEV) {
    console.warn("⚠️ Running in development mode with limited Firebase functionality.");
    // Create a dummy auth object for development
    app = null;
    auth = null;
  } else {
    throw error;
  }
}

export { app, auth };