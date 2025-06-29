'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/firebase/config';

export default function TestAuthPage() {
  const { 
    currentUser, 
    userProfile, 
    loading, 
    authError, 
    googleSignIn, 
    manualRedirectCheck, 
    clearPendingAuthState 
  } = useAuth();
  
  const [debugInfo, setDebugInfo] = useState({});
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const updateDebugInfo = () => {
      const info = {
        userAgent: navigator.userAgent,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        hostname: window.location.hostname,
        href: window.location.href,
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        firebaseAuthState: auth.currentUser ? 'logged in' : 'not logged in',
        authDomain: auth.config.authDomain,
        projectId: auth.config.projectId,
        sessionStorage: {
          googleAuthStarted: window.sessionStorage.getItem('googleAuthStarted'),
          authTimestamp: window.sessionStorage.getItem('authTimestamp')
        },
        localStorage: {
          firebaseAuthUser: window.localStorage.getItem('firebase:authUser:callmibro:[DEFAULT]'),
          firebaseAuthUserAuth: window.localStorage.getItem('firebase:authUser:callmibro:auth-default')
        }
      };
      setDebugInfo(info);
    };

    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 2000);
    return () => clearInterval(interval);
  }, []);

  const addLog = (message, data = null) => {
    const timestamp = new Date().toISOString();
    setLogs(prev => [...prev, { timestamp, message, data }]);
  };

  const testGoogleSignIn = async () => {
    try {
      addLog('Starting Google sign-in test');
      await googleSignIn();
      addLog('Google sign-in initiated');
    } catch (error) {
      addLog('Google sign-in failed', { error: error.message, code: error.code });
    }
  };

  const testRedirectCheck = async () => {
    try {
      addLog('Starting manual redirect check');
      const result = await manualRedirectCheck();
      addLog('Manual redirect check result', result);
    } catch (error) {
      addLog('Manual redirect check failed', { error: error.message });
    }
  };

  const testClearAuthState = async () => {
    try {
      addLog('Starting auth state clear');
      const result = await clearPendingAuthState();
      addLog('Auth state clear result', result);
    } catch (error) {
      addLog('Auth state clear failed', { error: error.message });
    }
  };

  const sendTestLog = async () => {
    try {
      const response = await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Test log from debug page',
          data: debugInfo,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        }),
      });
      
      if (response.ok) {
        addLog('Test log sent successfully');
      } else {
        addLog('Test log failed', { status: response.status });
      }
    } catch (error) {
      addLog('Test log error', { error: error.message });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Authentication Debug Page</h1>
        
        {/* Current State */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current State</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
              <p><strong>Current User:</strong> {currentUser ? currentUser.email : 'None'}</p>
              <p><strong>User Profile:</strong> {userProfile ? userProfile.name : 'None'}</p>
              <p><strong>Auth Error:</strong> {authError || 'None'}</p>
            </div>
            <div>
              <p><strong>Firebase Auth State:</strong> {debugInfo.firebaseAuthState}</p>
              <p><strong>Auth Domain:</strong> {debugInfo.authDomain}</p>
              <p><strong>Project ID:</strong> {debugInfo.projectId}</p>
              <p><strong>Is Mobile:</strong> {debugInfo.isMobile ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>

        {/* Debug Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={testGoogleSignIn}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Test Google Sign-In
            </button>
            <button
              onClick={testRedirectCheck}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Check Redirect Result
            </button>
            <button
              onClick={testClearAuthState}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Clear Auth State
            </button>
            <button
              onClick={sendTestLog}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Send Test Log
            </button>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Logs</h2>
          <div className="max-h-96 overflow-auto">
            {logs.map((log, index) => (
              <div key={index} className="border-b border-gray-200 py-2">
                <div className="text-sm text-gray-500">{log.timestamp}</div>
                <div className="font-medium">{log.message}</div>
                {log.data && (
                  <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                )}
              </div>
            ))}
            {logs.length === 0 && (
              <p className="text-gray-500">No logs yet. Try some actions above.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 