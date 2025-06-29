// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence, CACHE_SIZE_UNLIMITED } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Helper – decide authDomain without crashing on the server
function resolveAuthDomain() {
  // 1) Runtime env variable wins (set NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN)
  if (process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) {
    return process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  }

  // 2) When running in the browser use current hostname
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const userAgent = window.navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    // For localhost development, always use the Firebase project domain
    if (host === 'localhost') {
      return 'callmibro.firebaseapp.com';
    }
    
    // For production domains, use the current hostname for better auth flow
    if (host === 'callmibro.com' || host === 'www.callmibro.com') {
      // For mobile devices, use the current hostname to avoid third-party cookie issues
      if (isMobile) {
        console.log('Mobile device detected, using current hostname for authDomain:', host);
        return host;
      }
      
      // For desktop, either approach works, but using Firebase domain is more reliable
      return 'callmibro.firebaseapp.com';
    }
    
    // Fallback to Firebase project domain for any other host
    return 'callmibro.firebaseapp.com';
  }

  // 3) Fallback for server-side render (will be replaced on the client)
  return 'callmibro.firebaseapp.com';
}

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyCxgEegetMFGha1ZIcBdLRb0XI7lu5cYiA',
  authDomain: resolveAuthDomain(),
  projectId: 'callmibro',
  storageBucket: 'callmibro.appspot.com',
  messagingSenderId: '411367076640',
  appId: '1:411367076640:web:0b654f87bb3d2b65ba5d45',
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