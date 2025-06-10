// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCxgEegetMFGha1ZIcBdLRb0XI7lu5cYiA",
  authDomain: "callmibro.firebaseapp.com",
  projectId: "callmibro",
  storageBucket: "callmibro.firebasestorage.app",
  messagingSenderId: "411367076640",
  appId: "1:411367076640:web:0b654f87bb3d2b65ba5d45"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
export default app; 