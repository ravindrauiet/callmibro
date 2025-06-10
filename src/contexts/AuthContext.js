'use client'

import { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup,
  FacebookAuthProvider,
  updateProfile as updateAuthProfile
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

// Create auth context
const AuthContext = createContext();

// Provider component
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Register with email and password
  const signup = async (email, password, name) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Update profile with displayName
      await updateAuthProfile(userCredential.user, {
        displayName: name
      });
      
      // Create a user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: name,
        email: email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return userCredential;
    } catch (error) {
      console.error("Error during signup:", error);
      throw error;
    }
  };

  // Login with email and password
  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // Update lastLogin in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      lastLogin: serverTimestamp()
    }, { merge: true });
    return userCredential;
  };

  // Logout
  const logout = () => {
    return signOut(auth);
  };

  // Google Sign In
  const googleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      // Check if the user document exists
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      // If not, create a new user document
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', result.user.uid), {
          name: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        });
      } else {
        // Update lastLogin if user exists
        await setDoc(doc(db, 'users', result.user.uid), {
          lastLogin: serverTimestamp()
        }, { merge: true });
      }
      return result;
    } catch (error) {
      console.error("Error during Google sign in:", error);
      throw error;
    }
  };

  // Facebook Sign In
  const facebookSignIn = async () => {
    try {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);
      // Check if the user document exists
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      // If not, create a new user document
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', result.user.uid), {
          name: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        });
      } else {
        // Update lastLogin if user exists
        await setDoc(doc(db, 'users', result.user.uid), {
          lastLogin: serverTimestamp()
        }, { merge: true });
      }
      return result;
    } catch (error) {
      console.error("Error during Facebook sign in:", error);
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (data) => {
    try {
      if (!currentUser) throw new Error('No user logged in');
      // Update auth profile
      if (data.displayName) {
        await updateAuthProfile(auth.currentUser, {
          displayName: data.displayName
        });
      }
      // Update Firestore user document
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp()
      }, { merge: true });
      // Update local state
      setCurrentUser(prev => ({
        ...prev,
        ...data
      }));
      return true;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  // Set current user on auth state change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Cleanup subscription
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    googleSignIn,
    facebookSignIn,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  return useContext(AuthContext);
} 