// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence, CACHE_SIZE_UNLIMITED } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";
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
    
    // For production domains, use the Firebase project domain for better auth flow
    // This is critical for mobile authentication to work properly
    if (host === 'callmibro.com' || host === 'www.callmibro.com') {
      // Always use the Firebase project domain for authentication
      // This ensures consistent behavior across all devices
      console.log('Using Firebase project domain for auth:', 'callmibro.firebaseapp.com');
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

// Get auth with a specific domain (for mobile authentication)
export const getAuthWithDomain = (domain) => {
  // Create a new config with the specified domain
  const customConfig = {
    ...firebaseConfig,
    authDomain: domain || firebaseConfig.authDomain
  };
  
  // Initialize a new app with the custom config
  const customApp = initializeApp(customConfig, 'auth-' + (domain || 'default'));
  
  // Get auth from the custom app
  return getAuth(customApp);
};

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