'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { toast } from 'react-hot-toast'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkingAuth, setCheckingAuth] = useState(true)
  
  const router = useRouter()
  const { login, user } = useAuth()

  // Check if user is already logged in and is an admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        try {
          const adminQuery = query(
            collection(db, 'admins'),
            where('email', '==', user.email)
          )
          
          const querySnapshot = await getDocs(adminQuery)
          
          if (!querySnapshot.empty) {
            // User is already logged in and is an admin, redirect to admin dashboard
            router.push('/admin')
            return
          }
        } catch (error) {
          console.error('Error checking admin status:', error)
        }
      }
      setCheckingAuth(false)
    }

    checkAdminStatus()
  }, [user, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      // First authenticate the user
      const { userCredential } = await login(email, password)
      
      // Then check if the user is an admin
      const adminQuery = query(
        collection(db, 'admins'),
        where('email', '==', userCredential.user.email)
      )
      
      const querySnapshot = await getDocs(adminQuery)
      
      if (querySnapshot.empty) {
        setError('Access denied. You do not have admin privileges.')
        toast.error('Access denied. You do not have admin privileges.')
        return
      }
      
      // Redirect to admin dashboard
      toast.success('Login successful!')
      router.push('/admin')
    } catch (error) {
      console.error('Admin login error:', error)
      setError(error.message || 'Failed to login. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#111]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e60012]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111] px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center">
            <span className="text-[#e60012] font-bold text-3xl">●</span>
            <span className="ml-2 font-medium text-xl text-white">CallMiBro</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-white">Admin Login</h2>
          <p className="mt-2 text-sm text-gray-400">
            Sign in to access the admin dashboard
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-900/20 border border-red-900/50 text-red-500 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-[#333] placeholder-gray-500 text-white bg-[#1a1a1a] rounded-t-md focus:outline-none focus:ring-[#e60012] focus:border-[#e60012] focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-[#333] placeholder-gray-500 text-white bg-[#1a1a1a] rounded-b-md focus:outline-none focus:ring-[#e60012] focus:border-[#e60012] focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-[#e60012] to-[#ff6b6b] hover:from-[#d40010] hover:to-[#e55b5b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e60012] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
          
          <div className="text-center">
            <a href="/" className="font-medium text-[#e60012] hover:text-[#ff6b6b]">
              Return to website
            </a>
          </div>
        </form>
      </div>
    </div>
  )
} 