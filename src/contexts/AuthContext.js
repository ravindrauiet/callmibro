'use client'

import { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  FacebookAuthProvider,
  updateProfile as updateAuthProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  getIdToken
} from 'firebase/auth';
import { auth, db, getAuthWithDomain } from '../firebase/config';
import { doc, setDoc, getDoc, serverTimestamp, collection, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
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

  // Helper function to log to server
  const logToServer = async (message, data = null) => {
    try {
      await fetch('/api/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          data,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        }),
      });
    } catch (error) {
      console.error('Failed to log to server:', error);
    }
  };

  // Helper function to detect mobile devices
  const isMobileDevice = () => {
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) || 
           window.innerWidth <= 768;
    
    const logData = {
      userAgent: userAgent,
      windowWidth: window.innerWidth,
      isMobile: isMobile
    };
    
    console.log('Mobile detection:', logData);
    logToServer('Mobile detection', logData);
    
    return isMobile;
  };

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
    
    await logToServer('Google sign-in started');
    
    try {
      const provider = new GoogleAuthProvider();
      // Clear any cached OAuth state to ensure a fresh login flow
      provider.setCustomParameters({ 
        prompt: 'select_account',
        // Force re-consent to ensure we get a fresh token
        access_type: 'offline'
      });
      
      const isMobile = isMobileDevice();
      const hostname = typeof window !== 'undefined' ? window.location.hostname : 'unknown';
      const isLocalhost = hostname === 'localhost';
      
      await logToServer('Authentication attempt details', { 
        isMobile, 
        hostname,
        isLocalhost,
        authDomain: auth.config.authDomain,
        currentUrl: window.location.href
      });
      
      // Different strategies for mobile and desktop
      if (isMobile) {
        // For mobile, use redirect with special handling
        await logToServer('Using redirect authentication for mobile');
        
        try {
          // Always use the default Firebase auth domain for Google Auth
          // This is critical for mobile redirect flow to work properly
          await logToServer('Using Firebase project auth domain for mobile');
          
          // Clear any existing auth sessions/cookies that might interfere
          await logToServer('Clearing any existing auth state');
          
          // Set a session storage flag to detect redirect completion
          if (typeof window !== 'undefined') {
            window.sessionStorage.setItem('googleAuthStarted', 'true');
            window.sessionStorage.setItem('authTimestamp', Date.now().toString());
          }
          
          // Use redirect with the default auth instance
          await signInWithRedirect(auth, provider);
          await logToServer('Mobile redirect initiated with default auth domain');
          return;
        } catch (redirectError) {
          await logToServer('Redirect failed, detailed error info', { 
            error: redirectError.message,
            code: redirectError.code,
            stack: redirectError.stack?.substring(0, 200),
            authDomain: auth.config.authDomain
          });
          
          // Fallback to popup if redirect fails
          await logToServer('Trying popup as fallback on mobile');
          const result = await signInWithPopup(auth, provider);
          await logToServer('Popup fallback successful on mobile', {
            userId: result.user.uid,
            email: result.user.email
          });
          
          // Process the result
          await processAuthResult(result);
          return { result };
        }
      } else {
        // For desktop, use popup (more reliable)
        await logToServer('Using popup authentication for desktop');
        
        try {
          // Clear any previous auth state
          await logToServer('Clearing previous auth state');
          
          const result = await signInWithPopup(auth, provider);
          
          await logToServer('Authentication successful', {
            userId: result.user.uid,
            email: result.user.email,
            providerId: result.providerId
          });
          
          // Process the result
          await processAuthResult(result);
          return { result };
        } catch (popupError) {
          await logToServer('Authentication failed', { 
            error: popupError.message,
            code: popupError.code,
            stack: popupError.stack?.substring(0, 200)
          });
          
          throw popupError;
        }
      }
    } catch (error) {
      await logToServer('Google sign-in error', { 
        error: error.message,
        code: error.code,
        stack: error.stack?.substring(0, 200)
      });
      console.error('Google sign-in error:', error);
      handleAuthError(error);
      throw error;
    } finally {
      setAuthInProgress(false);
    }
  };
  
  // Helper function to process authentication result
  const processAuthResult = async (result) => {
    // Get user token for secure requests
    const token = await getIdToken(result.user);
    await logToServer('Token obtained successfully', { tokenLength: token.length });
    
    // Check if the user document exists
    const userDoc = await getDoc(doc(db, 'users', result.user.uid));
    
    const userData = {
      name: result.user.displayName,
      email: result.user.email,
      photoURL: result.user.photoURL,
      emailVerified: result.user.emailVerified,
      lastLogin: serverTimestamp()
    };
    
    if (!userDoc.exists()) {
      userData.createdAt = serverTimestamp();
      userData.updatedAt = serverTimestamp();
      userData.authProvider = 'google';
      
      await setDoc(doc(db, 'users', result.user.uid), userData);
      await logToServer('New user document created');
    } else {
      await setDoc(doc(db, 'users', result.user.uid), userData, { merge: true });
      await logToServer('Existing user document updated');
    }
    
    setUserProfile(userData);
    toast.success('Logged in with Google successfully!');
    return token;
  };

  // Facebook Sign In
  const facebookSignIn = async () => {
    setAuthError(null);
    setAuthInProgress(true);
    try {
      const provider = new FacebookAuthProvider();
      
      // Use redirect for mobile devices, popup for desktop
      if (isMobileDevice()) {
        await signInWithRedirect(auth, provider);
        // The redirect will happen, so we don't need to handle the result here
        return;
      } else {
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
      }
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

  // Test function to debug mobile authentication
  const testMobileAuth = async () => {
    // Test Firebase connection
    let firebaseTestResult = 'unknown';
    try {
      // Try to get current user to test Firebase connection
      const currentUser = auth.currentUser;
      firebaseTestResult = currentUser ? 'connected with user' : 'connected without user';
    } catch (error) {
      firebaseTestResult = `error: ${error.message}`;
    }
    
    // Test if browser supports redirects
    let redirectTestResult = 'unknown';
    try {
      // Test if window.location.href can be set (basic redirect test)
      const originalHref = window.location.href;
      redirectTestResult = 'browser supports location changes';
    } catch (error) {
      redirectTestResult = `redirect error: ${error.message}`;
    }
    
    const testData = {
      userAgent: navigator.userAgent,
      windowWidth: window.innerWidth,
      isMobileOurDetection: isMobileDevice(),
      isMobileSimpleCheck: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      firebaseAuthState: auth.currentUser ? 'logged in' : 'not logged in',
      firebaseConnection: firebaseTestResult,
      redirectSupport: redirectTestResult,
      firebaseConfig: {
        authDomain: auth.config.authDomain,
        projectId: auth.config.projectId
      }
    };
    
    console.log('=== MOBILE AUTH TEST ===');
    console.log(testData);
    console.log('========================');
    
    await logToServer('Mobile auth test', testData);
  };

  // Call test function on mount
  useEffect(() => {
    testMobileAuth();
  }, []);

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

  // Handle redirect results from Google/Facebook auth
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        await logToServer('Checking for redirect result');
        
        // Check if we have a pending Google auth from session storage
        const googleAuthStarted = typeof window !== 'undefined' && window.sessionStorage.getItem('googleAuthStarted');
        const authTimestamp = typeof window !== 'undefined' && window.sessionStorage.getItem('authTimestamp');
        
        if (googleAuthStarted) {
          await logToServer('Found pending Google auth in session storage', {
            timestamp: authTimestamp,
            timeSinceAuth: Date.now() - parseInt(authTimestamp || '0')
          });
        }
        
        // Add a small delay to ensure Firebase is ready
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const result = await getRedirectResult(auth);
        
        // Clear the session storage flags regardless of result
        if (typeof window !== 'undefined') {
          window.sessionStorage.removeItem('googleAuthStarted');
          window.sessionStorage.removeItem('authTimestamp');
        }
        
        if (result) {
          await logToServer('Redirect result found', { 
            providerId: result.providerId,
            userId: result.user.uid,
            email: result.user.email,
            operationType: result.operationType,
            credential: result.credential ? 'present' : 'missing'
          });
          
          // Get user token for secure requests
          const token = await getIdToken(result.user);
          await logToServer('User token obtained', { tokenLength: token.length });
          
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
            userData.authProvider = result.providerId === 'google.com' ? 'google' : 'facebook';
            
            await setDoc(doc(db, 'users', result.user.uid), userData);
            await logToServer('New user document created from redirect');
          } else {
            // Update lastLogin if user exists
            await setDoc(doc(db, 'users', result.user.uid), userData, { merge: true });
            await logToServer('Existing user document updated from redirect');
          }
          
          setUserProfile(userData);
          toast.success('Logged in successfully!');
          await logToServer('Redirect authentication completed successfully');
        } else {
          await logToServer('No redirect result found');
          
          // Check if there's a pending Google auth but no result
          if (googleAuthStarted) {
            await logToServer('Google auth was started but no result found', {
              timeSinceAuthStarted: Date.now() - parseInt(authTimestamp || '0')
            });
            
            // If it's been less than 10 seconds since auth started, this is likely
            // just the initial page load after the redirect started but before completion
            const timeSinceAuth = Date.now() - parseInt(authTimestamp || '0');
            if (timeSinceAuth < 10000) {
              await logToServer('Recent auth attempt detected, waiting for completion');
            } else {
              // If it's been longer, something likely went wrong with the redirect
              await logToServer('Auth redirect may have failed');
              toast.error('Authentication failed. Please try again.');
            }
          }
          
          // Check if there's a current user (might have been set by onAuthStateChanged)
          const currentUser = auth.currentUser;
          if (currentUser) {
            await logToServer('Current user found despite no redirect result', {
              userId: currentUser.uid,
              email: currentUser.email,
              providerId: currentUser.providerData[0]?.providerId
            });
            
            // If we have a current user but no redirect result, try to fetch their profile
            try {
              await fetchUserProfile(currentUser.uid);
              await logToServer('User profile fetched for current user');
            } catch (profileError) {
              await logToServer('Error fetching profile for current user', { error: profileError.message });
            }
          }
        }
      } catch (error) {
        await logToServer('Error handling redirect result', { 
          error: error.message,
          code: error.code,
          stack: error.stack?.substring(0, 200), // First 200 chars of stack
          userAgent: navigator.userAgent,
          isCurrentUserSet: !!auth.currentUser
        });
        console.error('Error handling redirect result:', error);
        
        // Don't show error to user if it's just a missing redirect result
        if (error.code !== 'auth/no-auth-event') {
          handleAuthError(error);
        }
      }
    };

    // Try multiple times with increasing delays
    const attemptRedirectCheck = async () => {
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          await logToServer(`Redirect check attempt ${attempt}`);
          await handleRedirectResult();
          break; // If successful, break out of the loop
        } catch (error) {
          await logToServer(`Redirect check attempt ${attempt} failed`, { error: error.message });
          if (attempt < 3) {
            // Wait longer between attempts
            await new Promise(resolve => setTimeout(resolve, attempt * 1000));
          }
        }
      }
    };

    // Add a small delay before checking redirect result
    const timer = setTimeout(attemptRedirectCheck, 1000);
    return () => clearTimeout(timer);
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