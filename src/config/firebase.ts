import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCuVaMt-soqDI5ocMtwTlBflKLNZg2vLFM",
  authDomain: "zerowait-d2955.firebaseapp.com",
  projectId: "zerowait-d2955",
  storageBucket: "zerowait-d2955.firebasestorage.app",
  messagingSenderId: "63338124641",
  appId: "1:63338124641:web:d515294234967f3a18e120"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app)

export default app
