import { initializeApp } from "firebase/app"
import { connectAuthEmulator, getAuth } from "firebase/auth"
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore"

// Initialize Firebase
// Use hardcoded Firebase config to avoid JSON parsing issues
const firebaseConfig = {
  apiKey: "AIzaSyCG0Bi5SWD_tVbkb4FdZy0knjJsR1Q_9Q0",
  authDomain: "awardwiz-bc5c3.firebaseapp.com",
  projectId: "awardwiz-bc5c3",
  storageBucket: "awardwiz-bc5c3.firebasestorage.app",
  messagingSenderId: "70972338690",
  appId: "1:70972338690:web:49a4c3deada76429d12d1b",
  measurementId: "G-NDNSFF15PN"
}
export const firebaseApp = initializeApp(firebaseConfig)
export const firebaseAuth = getAuth(firebaseApp)
export const firestore = getFirestore(firebaseApp)

if (import.meta.env.VITE_USE_FIREBASE_EMULATORS === "true") {
  connectAuthEmulator(firebaseAuth, "http://localhost:9099")
  connectFirestoreEmulator(firestore, "localhost", 8080)
}
