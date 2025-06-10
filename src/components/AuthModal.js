'use client'

import { useState } from 'react'
import Modal from './Modal'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-hot-toast'

export default function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const { signup, login, googleSignIn, facebookSignIn } = useAuth()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing again
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      if (isLogin) {
        // Login
        await login(formData.email, formData.password)
        toast.success('Logged in successfully!')
      } else {
        // Signup validation
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match')
          setIsLoading(false)
          return
        }
        
        // Register
        await signup(formData.email, formData.password, formData.name)
        toast.success('Account created successfully!')
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
        setError('Password should be at least 6 characters')
      } else {
        setError('An error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      await googleSignIn()
      toast.success('Logged in successfully with Google!')
      onClose()
    } catch (error) {
      console.error('Google sign-in error:', error)
      setError('Failed to sign in with Google')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFacebookSignIn = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      await facebookSignIn()
      toast.success('Logged in successfully with Facebook!')
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
    setError('')
    // Reset form data when switching modes
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    })
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isLogin ? 'Login' : 'Sign Up'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error message */}
        {error && (
          <div className="bg-red-900/20 border border-red-900/50 text-red-500 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}
        
        {/* Name field (only for signup) */}
        {!isLogin && (
          <div>
            <label htmlFor="name" className="block text-white text-sm font-medium mb-1.5">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-[#222] border border-[#333] rounded px-3 py-2 text-white focus:outline-none focus:border-[#e60012] text-sm sm:text-base"
              required
              disabled={isLoading}
            />
          </div>
        )}
        
        {/* Email field */}
        <div>
          <label htmlFor="email" className="block text-white text-sm font-medium mb-1.5">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-[#222] border border-[#333] rounded px-3 py-2 text-white focus:outline-none focus:border-[#e60012] text-sm sm:text-base"
            required
            disabled={isLoading}
          />
        </div>
        
        {/* Password field */}
        <div>
          <label htmlFor="password" className="block text-white text-sm font-medium mb-1.5">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full bg-[#222] border border-[#333] rounded px-3 py-2 text-white focus:outline-none focus:border-[#e60012] text-sm sm:text-base"
            required
            disabled={isLoading}
          />
        </div>
        
        {/* Confirm Password field (only for signup) */}
        {!isLogin && (
          <div>
            <label htmlFor="confirmPassword" className="block text-white text-sm font-medium mb-1.5">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full bg-[#222] border border-[#333] rounded px-3 py-2 text-white focus:outline-none focus:border-[#e60012] text-sm sm:text-base"
              required
              disabled={isLoading}
            />
          </div>
        )}
        
        {/* Submit button */}
        <button
          type="submit"
          className={`w-full bg-[#e60012] text-white py-2 rounded hover:bg-[#b3000f] transition-colors mt-2 text-sm sm:text-base flex items-center justify-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isLogin ? 'Logging in...' : 'Signing up...'}
            </>
          ) : (
            isLogin ? 'Login' : 'Sign Up'
          )}
        </button>
        
        {/* Toggle between login and signup */}
        <div className="text-center mt-4 text-gray-400 text-sm">
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
        
        {/* Social login options */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#333]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#111] text-gray-400 text-xs sm:text-sm">Or continue with</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              type="button"
              className="bg-[#222] hover:bg-[#333] text-white py-2 px-3 sm:px-4 rounded border border-[#333] transition-colors flex items-center justify-center text-xs sm:text-sm"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
              </svg>
              Google
            </button>
            <button
              type="button"
              className="bg-[#222] hover:bg-[#333] text-white py-2 px-3 sm:px-4 rounded border border-[#333] transition-colors flex items-center justify-center text-xs sm:text-sm"
              onClick={handleFacebookSignIn}
              disabled={isLoading}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z"/>
              </svg>
              Facebook
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
} 