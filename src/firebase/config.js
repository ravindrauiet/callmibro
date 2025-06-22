// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCxgEegetMFGha1ZIcBdLRb0XI7lu5cYiA",
  authDomain: "callmibro.firebaseapp.com",
  projectId: "callmibro",
  storageBucket: "callmibro.appspot.com",
  messagingSenderId: "411367076640",
  appId: "1:411367076640:web:0b654f87bb3d2b65ba5d45"
};

// Initialize Firebase with connection timeout settings
let auth = null;
let db = null;
let storage = null;
let app = null;

try {
  console.log('Initializing Firebase app...');
  app = initializeApp(firebaseConfig);

  // Initialize Firebase services with custom settings
  auth = getAuth(app);
  
  // Configure Firestore with cache settings and timeout
  db = getFirestore(app);
  
  // Configure storage
  storage = getStorage(app);
  
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  
  // Fallback to empty objects
  app = null;
  auth = null;
  db = {};
  storage = null;
}

export { auth, db, storage };
export default app; 