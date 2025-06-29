'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, getRedirectResult } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, getAuthWithDomain } from '@/firebase/config';

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState('Checking authentication...');
  
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        console.log('Auth callback page loaded, checking for redirect result...');
        
        // Try with default auth first
        const auth = getAuth();
        let result = await getRedirectResult(auth);
        
        // If no result, try with custom auth using current hostname
        if (!result) {
          console.log('No result with default auth, trying with custom auth...');
          const hostname = window.location.hostname;
          const customAuth = getAuthWithDomain(hostname);
          result = await getRedirectResult(customAuth);
        }
        
        if (result) {
          console.log('Redirect result found:', result.user.email);
          setStatus('Authentication successful! Processing...');
          
          try {
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
              console.log('New user document created');
            } else {
              await setDoc(doc(db, 'users', result.user.uid), userData, { merge: true });
              console.log('Existing user document updated');
            }
            
            setStatus('Login successful! Redirecting...');
            
            // Redirect to home page or dashboard
            setTimeout(() => {
              router.push('/');
            }, 1000);
          } catch (dbError) {
            console.error('Error updating user document:', dbError);
            setStatus('Authentication successful, but there was an error updating your profile.');
            
            // Still redirect to home page after a delay
            setTimeout(() => {
              router.push('/');
            }, 2000);
          }
        } else {
          console.log('No redirect result found, redirecting to home');
          setStatus('No authentication data found. Redirecting...');
          
          // No result found, redirect to home page
          setTimeout(() => {
            router.push('/');
          }, 1500);
        }
      } catch (error) {
        console.error('Error handling redirect:', error);
        setStatus(`Authentication error: ${error.message}`);
        
        // Redirect to home page with error after a delay
        setTimeout(() => {
          router.push('/?auth_error=' + encodeURIComponent(error.message));
        }, 2000);
      }
    };
    
    handleRedirect();
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-6 bg-white rounded-lg shadow-lg max-w-md">
        <h1 className="text-2xl font-bold mb-4">Authentication</h1>
        <p className="mb-4">{status}</p>
        <div className="animate-pulse flex justify-center">
          <div className="h-2 w-24 bg-gray-300 rounded"></div>
        </div>
      </div>
    </div>
  );
} 