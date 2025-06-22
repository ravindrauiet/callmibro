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
      // Update the Firestore document
      await setDoc(doc(db, 'users', currentUser.uid), {
        ...data,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      // Update user display name in Firebase Auth if provided
      if (data.displayName) {
        await updateAuthProfile(currentUser, {
          displayName: data.displayName
        });
      }
      
      // Update userProfile state
      setUserProfile(prev => ({
        ...prev,
        ...data
      }));
      
      return true;
    } catch (error) {
      handleAuthError(error);
      throw error;
    } finally {
      setAuthInProgress(false);
    }
  };

  // Add a function to save a new address for the user
  const saveUserAddress = async (addressData) => {
    setAuthError(null);
    setAuthInProgress(true);
    try {
      // Get current user data
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }
      
      const userData = userDoc.data();
      let savedAddresses = userData.savedAddresses || [];
      
      // Create a unique ID for this address
      const addressId = `addr_${Date.now()}`;
      
      // Format the new address
      const newAddress = {
        id: addressId,
        name: addressData.name || 'Home',
        fullAddress: addressData.fullAddress,
        coordinates: addressData.coordinates || null,
        isDefault: addressData.isDefault || false,
        createdAt: new Date().toISOString()
      };
      
      // If this is set as default, unset any other default addresses
      if (newAddress.isDefault) {
        savedAddresses = savedAddresses.map(addr => ({
          ...addr,
          isDefault: false
        }));
      }
      
      // If this is the first address, make it default
      if (savedAddresses.length === 0) {
        newAddress.isDefault = true;
      }
      
      // Add new address to the array
      savedAddresses.push(newAddress);
      
      // Update user profile with the new address
      await setDoc(doc(db, 'users', currentUser.uid), {
        savedAddresses,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      // Update local state
      setUserProfile(prev => ({
        ...prev,
        savedAddresses
      }));
      
      return addressId;
    } catch (error) {
      console.error('Error saving address:', error);
      handleAuthError(error);
      throw error;
    } finally {
      setAuthInProgress(false);
    }
  };

  // Function to update an existing address
  const updateUserAddress = async (addressId, addressData) => {
    setAuthError(null);
    setAuthInProgress(true);
    try {
      // Get current user data
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }
      
      const userData = userDoc.data();
      let savedAddresses = userData.savedAddresses || [];
      
      // Find the address to update
      const addressIndex = savedAddresses.findIndex(addr => addr.id === addressId);
      
      if (addressIndex === -1) {
        throw new Error('Address not found');
      }
      
      // If this is being set as default, unset any other default addresses
      if (addressData.isDefault) {
        savedAddresses = savedAddresses.map(addr => ({
          ...addr,
          isDefault: false
        }));
      }
      
      // Update the address
      savedAddresses[addressIndex] = {
        ...savedAddresses[addressIndex],
        ...addressData,
        updatedAt: new Date().toISOString()
      };
      
      // Update user profile with the updated address
      await setDoc(doc(db, 'users', currentUser.uid), {
        savedAddresses,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      // Update local state
      setUserProfile(prev => ({
        ...prev,
        savedAddresses
      }));
      
      return true;
    } catch (error) {
      console.error('Error updating address:', error);
      handleAuthError(error);
      throw error;
    } finally {
      setAuthInProgress(false);
    }
  };

  // Function to delete an address
  const deleteUserAddress = async (addressId) => {
    setAuthError(null);
    setAuthInProgress(true);
    try {
      // Get current user data
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }
      
      const userData = userDoc.data();
      let savedAddresses = userData.savedAddresses || [];
      
      // Filter out the address to delete
      savedAddresses = savedAddresses.filter(addr => addr.id !== addressId);
      
      // If we deleted the default address and have other addresses, make the first one default
      if (savedAddresses.length > 0 && !savedAddresses.some(addr => addr.isDefault)) {
        savedAddresses[0].isDefault = true;
      }
      
      // Update user profile with the filtered addresses
      await setDoc(doc(db, 'users', currentUser.uid), {
        savedAddresses,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      // Update local state
      setUserProfile(prev => ({
        ...prev,
        savedAddresses
      }));
      
      return true;
    } catch (error) {
      console.error('Error deleting address:', error);
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
    currentUser,
    userProfile,
    loading,
    authError,
    setAuthError,
    authInProgress,
    login,
    signup,
    logout,
    resetPassword,
    googleSignIn,
    facebookSignIn,
    updateUserProfile,
    saveUserAddress,
    updateUserAddress,
    deleteUserAddress,
    getIdToken: () => currentUser?.getIdToken()
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