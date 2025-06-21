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
  updateProfile as updateAuthProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  getIdToken
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

// Create auth context
const AuthContext = createContext();

// Error message mapping for better user experience
const authErrorMessages = {
  'auth/email-already-in-use': 'This email is already registered. Please use a different email or try logging in.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-not-found': 'No account found with this email. Please check your email or sign up.',
  'auth/wrong-password': 'Incorrect password. Please try again or reset your password.',
  'auth/weak-password': 'Password should be at least 6 characters long.',
  'auth/too-many-requests': 'Too many unsuccessful login attempts. Please try again later or reset your password.',
  'auth/popup-closed-by-user': 'Sign-in cancelled. Please try again.',
  'auth/account-exists-with-different-credential': 'An account already exists with the same email but different sign-in credentials.',
  'auth/network-request-failed': 'Network error. Please check your internet connection and try again.'
};

// Provider component
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [authInProgress, setAuthInProgress] = useState(false);

  // Helper function to handle auth errors
  const handleAuthError = (error) => {
    console.error("Auth error:", error);
    const errorMessage = authErrorMessages[error.code] || error.message || 'An error occurred during authentication';
    setAuthError(errorMessage);
    toast.error(errorMessage);
    return errorMessage;
  };

  // Helper function to fetch user profile data
  const fetchUserProfile = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  // Register with email and password
  const signup = async (email, password, name) => {
    setAuthError(null);
    setAuthInProgress(true);
    try {
      // Validate password strength
      if (password.length < 8) {
        throw { code: 'custom/weak-password', message: 'Password must be at least 8 characters long' };
      }
      
      // Check for at least one number and one letter
      if (!/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
        throw { code: 'custom/weak-password', message: 'Password must contain at least one letter and one number' };
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Update profile with displayName
      await updateAuthProfile(userCredential.user, {
        displayName: name
      });
      
      // Send email verification
      await sendEmailVerification(userCredential.user);
      
      // Create a user document in Firestore
      const userData = {
        name: name,
        email: email,
        emailVerified: userCredential.user.emailVerified,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      };
      
      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      
      setUserProfile(userData);
      toast.success('Account created successfully! Please verify your email.');
      return userCredential;
    } catch (error) {
      handleAuthError(error);
      throw error;
    } finally {
      setAuthInProgress(false);
    }
  };

  // Login with email and password
  const login = async (email, password) => {
    setAuthError(null);
    setAuthInProgress(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Get user token for secure requests
      const token = await getIdToken(userCredential.user);
      
      // Update lastLogin in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        lastLogin: serverTimestamp(),
        emailVerified: userCredential.user.emailVerified,
      }, { merge: true });
      
      // Fetch user profile
      await fetchUserProfile(userCredential.user.uid);
      
      toast.success('Logged in successfully!');
      return { userCredential, token };
    } catch (error) {
      handleAuthError(error);
      throw error;
    } finally {
      setAuthInProgress(false);
    }
  };

  // Logout
  const logout = async () => {
    setAuthError(null);
    try {
      await signOut(auth);
      setUserProfile(null);
      toast.success('Logged out successfully');
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  };

  // Password reset
  const resetPassword = async (email) => {
    setAuthError(null);
    setAuthInProgress(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent. Check your inbox.');
    } catch (error) {
      handleAuthError(error);
      throw error;
    } finally {
      setAuthInProgress(false);
    }
  };

  // Google Sign In
  const googleSignIn = async () => {
    setAuthError(null);
    setAuthInProgress(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      
      // Get user token for secure requests
      const token = await getIdToken(result.user);
      
      // Check if the user document exists
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      const userData = {
        name: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
        emailVerified: result.user.emailVerified,
        lastLogin: serverTimestamp()
      };
      
      // If not, create a new user document
      if (!userDoc.exists()) {
        userData.createdAt = serverTimestamp();
        userData.updatedAt = serverTimestamp();
        userData.authProvider = 'google';
        
        await setDoc(doc(db, 'users', result.user.uid), userData);
      } else {
        // Update lastLogin if user exists
        await setDoc(doc(db, 'users', result.user.uid), userData, { merge: true });
      }
      
      setUserProfile(userData);
      toast.success('Logged in with Google successfully!');
      return { result, token };
    } catch (error) {
      handleAuthError(error);
      throw error;
    } finally {
      setAuthInProgress(false);
    }
  };

  // Facebook Sign In
  const facebookSignIn = async () => {
    setAuthError(null);
    setAuthInProgress(true);
    try {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Get user token for secure requests
      const token = await getIdToken(result.user);
      
      // Check if the user document exists
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      const userData = {
        name: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
        emailVerified: result.user.emailVerified,
        lastLogin: serverTimestamp()
      };
      
      // If not, create a new user document
      if (!userDoc.exists()) {
        userData.createdAt = serverTimestamp();
        userData.updatedAt = serverTimestamp();
        userData.authProvider = 'facebook';
        
        await setDoc(doc(db, 'users', result.user.uid), userData);
      } else {
        // Update lastLogin if user exists
        await setDoc(doc(db, 'users', result.user.uid), userData, { merge: true });
      }
      
      setUserProfile(userData);
      toast.success('Logged in with Facebook successfully!');
      return { result, token };
    } catch (error) {
      handleAuthError(error);
      throw error;
    } finally {
      setAuthInProgress(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (data) => {
    setAuthError(null);
    setAuthInProgress(true);
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
      const updateData = {
        ...data,
        updatedAt: serverTimestamp()
      };
      
      await setDoc(userRef, updateData, { merge: true });
      
      // Update local state
      setUserProfile(prev => ({
        ...prev,
        ...data
      }));
      
      toast.success('Profile updated successfully!');
      return true;
    } catch (error) {
      handleAuthError(error);
      throw error;
    } finally {
      setAuthInProgress(false);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Context value
  const value = {
    user: currentUser,
    currentUser,
    userProfile,
    loading,
    authError,
    authInProgress,
    signup,
    login,
    logout,
    googleSignIn,
    facebookSignIn,
    resetPassword,
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