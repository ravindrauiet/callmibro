// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence, CACHE_SIZE_UNLIMITED } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCxgEegetMFGha1ZIcBdLRb0XI7lu5cYiA",
  authDomain: "www.callmibro.com",
  projectId: "callmibro",
  storageBucket: "callmibro.appspot.com",
  messagingSenderId: "411367076640",
  appId: "1:411367076640:web:0b654f87bb3d2b65ba5d45"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Enable offline persistence
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db, {
    cacheSizeBytes: CACHE_SIZE_UNLIMITED
  }).catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time
      console.log('Persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      // The current browser does not support persistence
      console.log('Persistence not supported by this browser');
    }
  });
}

// Helper functions with caching
export const getCachedData = async (collection, queryFn) => {
  try {
    // The query function will use the cache first when available
    const result = await queryFn();
    return result;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export { app, db, auth, storage }; 