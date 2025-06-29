'use client'

import { Suspense, lazy, useState, useEffect } from 'react'
import Header from '../components/Header'
import Hero from '../components/Hero'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { getRedirectResult } from 'firebase/auth'
import { auth } from '@/firebase/config'

// Lazy load non-critical components
const Services = lazy(() => import('../components/Services'))
const BundleDeals = lazy(() => import('../components/BundleDeals'))
const Shop = lazy(() => import('../components/Shop'))
const Timeline = lazy(() => import('../components/Timeline'))
const Testimonial = lazy(() => import('../components/Testimonial'))
const Footer = lazy(() => import('../components/Footer'))

// Loading fallbacks
const ServicesSkeleton = () => (
  <section className="relative py-16 sm:py-20 px-4 sm:px-8 overflow-hidden">
    <div className="container mx-auto max-w-6xl">
      <div className="mb-10 md:mb-12 text-center">
        <div className="h-6 w-48 bg-gray-700 rounded animate-shimmer mx-auto mb-4"></div>
        <div className="h-10 w-3/4 bg-gray-700 rounded animate-shimmer mx-auto mb-4"></div>
        <div className="h-4 w-1/2 bg-gray-700 rounded animate-shimmer mx-auto"></div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border animate-shimmer" style={{ height: '200px', backgroundColor: 'var(--panel-dark)', borderColor: 'var(--border-color)' }}></div>
        ))}
      </div>
    </div>
  </section>
)

const GenericSkeleton = () => (
  <section className="py-16 sm:py-20 px-4">
    <div className="container mx-auto max-w-6xl">
      <div className="h-8 w-64 bg-gray-700 rounded animate-shimmer mx-auto mb-8"></div>
      <div className="h-64 bg-gray-800 rounded-lg animate-shimmer"></div>
    </div>
  </section>
)

export default function Home() {
  const { isDarkMode } = useTheme()
  const { currentUser } = useAuth()
  const [authDebug, setAuthDebug] = useState({
    redirectResult: null,
    redirectError: null,
    userAgent: '',
    isMobile: false,
    authDomain: '',
    hostname: ''
  })
  const [showDebug, setShowDebug] = useState(true)

  useEffect(() => {
    // Check for redirect result
    const checkRedirectResult = async () => {
      try {
        // Get user agent info
        const userAgent = navigator.userAgent
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
        const hostname = window.location.hostname

        // Try to get redirect result
        const result = await getRedirectResult(auth)
        
        setAuthDebug({
          redirectResult: result ? {
            providerId: result.providerId,
            userId: result.user?.uid,
            email: result.user?.email,
            operationType: result.operationType
          } : 'No redirect result found',
          redirectError: null,
          userAgent,
          isMobile,
          authDomain: auth.config.authDomain,
          hostname
        })
      } catch (error) {
        setAuthDebug(prev => ({
          ...prev,
          redirectResult: null,
          redirectError: {
            code: error.code,
            message: error.message
          },
          userAgent: navigator.userAgent,
          isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
          authDomain: auth.config?.authDomain || 'unknown',
          hostname: window.location.hostname
        }))
      }
    }

    checkRedirectResult()
  }, [])
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header activePage="home" />
      
      {/* Debug Panel - Always visible for testing */}
      <div className="fixed top-20 right-4 z-50">
        <div className="bg-black/90 text-white p-4 rounded-lg shadow-lg max-w-xs sm:max-w-md overflow-auto max-h-[80vh]">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-sm">Auth Debug</h3>
            <button 
              onClick={() => setShowDebug(!showDebug)}
              className="text-gray-400 hover:text-white"
            >
              {showDebug ? 'Hide' : 'Show'}
            </button>
          </div>
          {showDebug && (
            <div className="text-xs space-y-2">
              <div>
                <span className="text-gray-400">User:</span> {currentUser ? `${currentUser.email} (${currentUser.uid})` : 'Not logged in'}
              </div>
              <div>
                <span className="text-gray-400">Mobile:</span> {authDebug.isMobile ? 'Yes' : 'No'}
              </div>
              <div>
                <span className="text-gray-400">Auth Domain:</span> {authDebug.authDomain}
              </div>
              <div>
                <span className="text-gray-400">Hostname:</span> {authDebug.hostname}
              </div>
              <div>
                <span className="text-gray-400">Redirect Result:</span> 
                <pre className="whitespace-pre-wrap text-xs mt-1">
                  {authDebug.redirectResult ? JSON.stringify(authDebug.redirectResult, null, 2) : 'None'}
                </pre>
              </div>
              {authDebug.redirectError && (
                <div>
                  <span className="text-red-400">Error:</span> 
                  <pre className="whitespace-pre-wrap text-xs mt-1 text-red-300">
                    {JSON.stringify(authDebug.redirectError, null, 2)}
                  </pre>
                </div>
              )}
              <div>
                <span className="text-gray-400">User Agent:</span> 
                <div className="text-xs mt-1 break-words">
                  {authDebug.userAgent}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Hero />
      
      <Suspense fallback={<ServicesSkeleton />}>
        <Services />
      </Suspense>
      
      <Suspense fallback={<GenericSkeleton />}>
        <Timeline />
      </Suspense>
      
      <Suspense fallback={<GenericSkeleton />}>
        <BundleDeals />
      </Suspense>
      
      <Suspense fallback={<GenericSkeleton />}>
        <Shop />
      </Suspense>
      
      <Suspense fallback={<GenericSkeleton />}>
        <Testimonial />
      </Suspense>
      
      <Suspense fallback={<GenericSkeleton />}>
        <Footer />
      </Suspense>
    </div>
  )
}
