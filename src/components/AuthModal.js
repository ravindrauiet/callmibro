'use client'

import { useState, useEffect } from 'react'
import Modal from './Modal'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { toast } from 'react-hot-toast'

export default function AuthModal({ isOpen, onClose }) {
  const { login, signup, resetPassword, googleSignIn, facebookSignIn, manualRedirectCheck, clearPendingAuthState } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, message: '' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false)
  const { isDarkMode } = useTheme()

  // Check password strength
  const checkPasswordStrength = (password) => {
    if (!password) {
      return { score: 0, message: '' };
    }
    
    let score = 0;
    let message = '';
    
    // Length check
    if (password.length >= 8) score += 1;
    
    // Contains number
    if (/\d/.test(password)) score += 1;
    
    // Contains lowercase letter
    if (/[a-z]/.test(password)) score += 1;
    
    // Contains uppercase letter
    if (/[A-Z]/.test(password)) score += 1;
    
    // Contains special character
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    // Set message based on score
    if (score === 0) message = '';
    else if (score <= 2) message = 'Weak password';
    else if (score <= 4) message = 'Good password';
    else message = 'Strong password';
    
    return { score, message };
  };

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Check password strength for signup
    if (name === 'password' && !isLogin) {
      setPasswordStrength(checkPasswordStrength(value));
    }
    
    // Clear error when user starts typing again
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (forgotPassword) {
      handlePasswordReset();
      return;
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      if (isLogin) {
        // Login
        await login(formData.email, formData.password)
      } else {
        // Signup validation
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match')
          setIsLoading(false)
          return
        }
        
        // Password strength validation
        if (passwordStrength.score < 3) {
          setError('Please use a stronger password with at least 8 characters, including numbers and letters')
          setIsLoading(false)
          return
        }
        
        // Register
        await signup(formData.email, formData.password, formData.name)
      }
      
      // Close the modal after successful authentication
      onClose()
    } catch (error) {
      console.error('Authentication error:', error)
      
      // Handle different error codes
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/invalid-email') {
        setError('Invalid email or password')
      } else if (error.code === 'auth/email-already-in-use') {
        setError('Email is already in use')
      } else if (error.code === 'auth/weak-password') {
        setError('Password should be at least 8 characters')
      } else {
        setError(error.message || 'An error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    setIsLoading(true)
    setError('')
    
    if (!formData.email) {
      setError('Please enter your email address')
      setIsLoading(false)
      return
    }
    
    try {
      await resetPassword(formData.email)
      toast.success('Password reset email sent! Check your inbox.')
      setForgotPassword(false)
    } catch (error) {
      console.error('Password reset error:', error)
      setError(error.message || 'Failed to send reset email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      console.log('Google sign-in button clicked');
      console.log('Current user agent:', navigator.userAgent);
      console.log('Window width:', window.innerWidth);
      console.log('Is mobile:', /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
      
      await googleSignIn()
      onClose()
    } catch (error) {
      console.error('Google sign-in error in modal:', error)
      setError('Failed to sign in with Google: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFacebookSignIn = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      await facebookSignIn()
      onClose()
    } catch (error) {
      console.error('Facebook sign-in error:', error)
      setError('Failed to sign in with Facebook')
    } finally {
      setIsLoading(false)
    }
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    setForgotPassword(false)
    setError('')
    // Reset form data when switching modes
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    })
    setPasswordStrength({ score: 0, message: '' })
  }

  // Update loading state from auth context
  useEffect(() => {
    setIsLoading(authInProgress)
  }, [authInProgress])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setError('')
      setForgotPassword(false)
    }
  }, [isOpen])

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={forgotPassword ? 'Reset Password' : isLogin ? 'Login' : 'Sign Up'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error message */}
        {error && (
          <div className="bg-red-900/20 border border-red-900/50 text-red-500 px-3 py-2 rounded text-sm" role="alert">
            {error}
          </div>
        )}
        
        {!forgotPassword && (
          <>
            {/* Name field (only for signup) */}
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded px-3 py-2 focus:outline-none focus:border-[#e60012] focus:ring-1 focus:ring-[#e60012] text-sm sm:text-base"
                  style={{ 
                    backgroundColor: 'var(--panel-gray)',
                    color: 'var(--text-main)',
                    borderColor: 'var(--border-color)',
                    borderWidth: '1px'
                  }}
                  required
                  disabled={isLoading}
                  autoComplete="name"
                  aria-required="true"
                />
              </div>
            )}
          </>
        )}
        
        {/* Email field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded px-3 py-2 focus:outline-none focus:border-[#e60012] focus:ring-1 focus:ring-[#e60012] text-sm sm:text-base"
            style={{ 
              backgroundColor: 'var(--panel-gray)',
              color: 'var(--text-main)',
              borderColor: 'var(--border-color)',
              borderWidth: '1px'
            }}
            required
            disabled={isLoading}
            autoComplete={isLogin ? "email" : "new-email"}
            aria-required="true"
          />
        </div>
        
        {!forgotPassword && (
          <>
            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded px-3 py-2 focus:outline-none focus:border-[#e60012] focus:ring-1 focus:ring-[#e60012] text-sm sm:text-base pr-10"
                  style={{ 
                    backgroundColor: 'var(--panel-gray)',
                    color: 'var(--text-main)',
                    borderColor: 'var(--border-color)',
                    borderWidth: '1px'
                  }}
                  required
                  disabled={isLoading}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  aria-required="true"
                  minLength={isLogin ? undefined : 8}
                />
                <button 
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-[#e60012]"
                  style={{ color: 'var(--text-secondary)' }}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex="-1"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              
              {/* Password strength indicator (only for signup) */}
              {!isLogin && formData.password && (
                <div className="mt-1">
                  <div className="h-1 w-full rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border-color)' }}>
                    <div 
                      className={`h-full ${
                        passwordStrength.score <= 2 ? 'bg-red-500' : 
                        passwordStrength.score <= 4 ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`}
                      style={{ width: `${passwordStrength.score * 20}%` }}
                    ></div>
                  </div>
                  <p className={`text-xs mt-1 ${
                    passwordStrength.score <= 2 ? 'text-red-500' : 
                    passwordStrength.score <= 4 ? 'text-yellow-500' : 
                    'text-green-500'
                  }`}>
                    {passwordStrength.message}
                  </p>
                </div>
              )}
            </div>
            
            {/* Confirm Password field (only for signup) */}
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full rounded px-3 py-2 focus:outline-none focus:border-[#e60012] focus:ring-1 focus:ring-[#e60012] text-sm sm:text-base"
                  style={{ 
                    backgroundColor: 'var(--panel-gray)',
                    color: 'var(--text-main)',
                    borderColor: 'var(--border-color)',
                    borderWidth: '1px'
                  }}
                  required
                  disabled={isLoading}
                  autoComplete="new-password"
                  aria-required="true"
                />
              </div>
            )}
          </>
        )}
        
        {/* Submit button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-[#e60012] to-[#ff6b6b] text-white py-2.5 rounded hover:from-[#d40010] hover:to-[#e55b5b] transition-colors mt-2 text-sm sm:text-base flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:ring-offset-2"
          style={{ 
            boxShadow: '0 4px 6px rgba(230, 0, 18, 0.25)',
            '--tw-ring-offset-color': 'var(--panel-dark)'
          }}
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {forgotPassword ? 'Sending...' : isLogin ? 'Logging in...' : 'Signing up...'}
            </>
          ) : (
            forgotPassword ? 'Reset Password' : isLogin ? 'Login' : 'Sign Up'
          )}
        </button>
        
        {/* Forgot password link (only for login) */}
        {isLogin && !forgotPassword && (
          <div className="text-center mt-2">
            <button
              type="button"
              onClick={() => setForgotPassword(true)}
              className="text-[#e60012] hover:underline focus:outline-none text-sm"
              disabled={isLoading}
            >
              Forgot password?
            </button>
          </div>
        )}
        
        {/* Back to login link (only for forgot password) */}
        {forgotPassword && (
          <div className="text-center mt-2">
            <button
              type="button"
              onClick={() => setForgotPassword(false)}
              className="text-[#e60012] hover:underline focus:outline-none text-sm"
              disabled={isLoading}
            >
              Back to login
            </button>
          </div>
        )}
        
        {/* Toggle between login and signup */}
        {!forgotPassword && (
          <div className="text-center mt-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={switchMode}
              className="text-[#e60012] hover:underline focus:outline-none"
              disabled={isLoading}
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </div>
        )}
        
        {/* Social login options */}
        {!forgotPassword && (
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full" style={{ borderTopWidth: '1px', borderColor: 'var(--border-color)' }}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-xs sm:text-sm" style={{ 
                  backgroundColor: 'var(--panel-dark)',
                  color: 'var(--text-secondary)'
                }}>Or continue with</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                type="button"
                className="py-2 px-3 sm:px-4 rounded border transition-colors flex items-center justify-center text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:ring-offset-2"
                style={{ 
                  backgroundColor: 'var(--panel-gray)',
                  color: 'var(--text-main)',
                  borderColor: 'var(--border-color)',
                  '--tw-ring-offset-color': 'var(--panel-dark)'
                }}
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                aria-label="Sign in with Google"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                </svg>
                Google
              </button>
              
              <button
                type="button"
                className="py-2 px-3 sm:px-4 rounded border transition-colors flex items-center justify-center text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:ring-offset-2"
                style={{ 
                  backgroundColor: 'var(--panel-gray)',
                  color: 'var(--text-main)',
                  borderColor: 'var(--border-color)',
                  '--tw-ring-offset-color': 'var(--panel-dark)'
                }}
                onClick={handleFacebookSignIn}
                disabled={isLoading}
                aria-label="Sign in with Facebook"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="currentColor" d="M20.007,3H3.993C3.445,3,3,3.445,3,3.993v16.013C3,20.555,3.445,21,3.993,21h8.621v-6.971h-2.346v-2.717h2.346V9.31 c0-2.325,1.42-3.591,3.494-3.591c0.993,0,1.847,0.074,2.096,0.107v2.43l-1.438,0.001c-1.128,0-1.346,0.536-1.346,1.323v1.734h2.69 l-0.35,2.717h-2.34V21h4.587C20.555,21,21,20.555,21,20.007V3.993C21,3.445,20.555,3,20.007,3z"/>
                </svg>
                Facebook
              </button>
            </div>
            
            {/* Debug button for testing */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await fetch('/api/log', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        message: 'Debug test',
                        data: {
                          test: 'manual test',
                          timestamp: new Date().toISOString()
                        },
                        timestamp: new Date().toISOString(),
                        userAgent: navigator.userAgent,
                        url: window.location.href
                      }),
                    });
                    alert('Debug test sent to server');
                  } catch (error) {
                    alert('Debug test failed: ' + error.message);
                  }
                }}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
                disabled={isLoading}
              >
                Debug Test
              </button>
              
              <button
                type="button"
                onClick={async () => {
                  try {
                    const result = await manualRedirectCheck();
                    if (result.success) {
                      alert(`Redirect result found!\nUser: ${result.result.user.email}\nProvider: ${result.result.providerId}`);
                    } else {
                      alert('No redirect result found: ' + (result.message || result.error));
                    }
                  } catch (error) {
                    alert('Redirect check failed: ' + error.message);
                  }
                }}
                className="text-xs text-gray-500 hover:text-gray-700 underline ml-4"
                disabled={isLoading}
              >
                Check Redirect
              </button>
              
              <button
                type="button"
                onClick={async () => {
                  try {
                    const result = await clearPendingAuthState();
                    if (result.success) {
                      alert('Auth state cleared successfully');
                    } else {
                      alert('Failed to clear auth state: ' + result.error);
                    }
                  } catch (error) {
                    alert('Clear auth state failed: ' + error.message);
                  }
                }}
                className="text-xs text-gray-500 hover:text-gray-700 underline ml-4"
                disabled={isLoading}
              >
                Clear Auth State
              </button>
            </div>
          </div>
        )}
        
        {/* Privacy notice */}
        <p className="text-xs mt-6 text-center" style={{ color: 'var(--text-secondary)' }}>
          By continuing, you agree to our <a href="#" className="text-[#e60012] hover:underline">Terms of Service</a> and <a href="#" className="text-[#e60012] hover:underline">Privacy Policy</a>
        </p>
      </form>
    </Modal>
  )
} 