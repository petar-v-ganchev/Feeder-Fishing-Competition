import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace with your app's Firebase project configuration
// You can find this in your Firebase project settings.
const firebaseConfig = {
  apiKey: "AIzaSyCSwOmegmXffvtvb8kLyLGlu_tUk8D1GKM",
  authDomain: "ffcma-5aefa.firebaseapp.com",
  projectId: "ffcma-5aefa",
  storageBucket: "ffcma-5aefa.firebasestorage.app",
  messagingSenderId: "40145167581",
  appId: "1:40145167581:web:18dd2a59868a6a99bee734",
  measurementId: "G-M1EJ64YHHL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };