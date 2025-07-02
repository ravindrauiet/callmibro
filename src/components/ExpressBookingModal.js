'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { toast } from 'react-hot-toast'

export default function ExpressBookingModal({ isOpen, onClose }) {
  const [mobileNumber, setMobileNumber] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  
  const { currentUser, login, signup } = useAuth()
  const { isDarkMode } = useTheme()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!mobileNumber.trim() || !description.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    if (!currentUser) {
      setShowLoginForm(true)
      return
    }

    setIsSubmitting(true)
    try {
      const bookingData = {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        mobileNumber: mobileNumber.trim(),
        description: description.trim(),
        isExpressBooking: true,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      await addDoc(collection(db, 'bookings'), bookingData)
      
      toast.success('Express booking submitted successfully!')
      onClose()
      setMobileNumber('')
      setDescription('')
    } catch (error) {
      console.error('Error submitting express booking:', error)
      toast.error('Failed to submit booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoggingIn(true)
    
    try {
      await login(loginEmail, loginPassword)
      setShowLoginForm(false)
      setLoginEmail('')
      setLoginPassword('')
      toast.success('Logged in successfully! Please submit your booking.')
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setIsLoggingIn(true)
    
    try {
      await signup(loginEmail, loginPassword, loginEmail.split('@')[0])
      setShowLoginForm(false)
      setLoginEmail('')
      setLoginPassword('')
      toast.success('Account created successfully! Please submit your booking.')
    } catch (error) {
      console.error('Signup error:', error)
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleClose = () => {
    onClose()
    setMobileNumber('')
    setDescription('')
    setShowLoginForm(false)
    setLoginEmail('')
    setLoginPassword('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className={`w-full max-w-md rounded-xl p-6 shadow-2xl transform transition-all ${
          isDarkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>
            Express Booking
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!showLoginForm ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>
                Mobile Number *
              </label>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-all ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="Enter your mobile number"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-all resize-none ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="Describe your repair issue..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[#e60012] to-[#ff6b6b] text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg hover:shadow-[#e60012]/20 transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Express Booking'}
            </button>

            {!currentUser && (
              <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
                You need to be logged in to submit an express booking
              </p>
            )}
          </form>
        ) : (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <p style={{ color: 'var(--text-secondary)' }}>
                Please log in or create an account to continue with express booking
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-all ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-all ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="flex-1 bg-gradient-to-r from-[#e60012] to-[#ff6b6b] text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg hover:shadow-[#e60012]/20 transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingIn ? 'Logging in...' : 'Login'}
                </button>
                <button
                  type="button"
                  onClick={handleSignup}
                  disabled={isLoggingIn}
                  className="flex-1 border border-[#e60012] text-[#e60012] py-2 px-4 rounded-lg font-medium hover:bg-[#e60012] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingIn ? 'Creating...' : 'Sign Up'}
                </button>
              </div>
            </form>

            <button
              onClick={() => setShowLoginForm(false)}
              className="w-full text-sm text-center" 
              style={{ color: 'var(--text-secondary)' }}
            >
              ← Back to booking form
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 