'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import AuthModal from './AuthModal'

export default function ShopOwnerBanner() {
  const { currentUser } = useAuth()
  const { isDarkMode } = useTheme()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  
  return (
    <section className="py-10 px-4 sm:px-8 bg-gradient-to-r from-[#e60012] to-[#ff6b6b]">
      <div className="container mx-auto max-w-6xl">
        <div className="rounded-xl bg-white/10 backdrop-blur-sm p-6 md:p-8 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0 md:mr-8">
            <h2 className="text-white text-2xl md:text-3xl font-bold mb-3">
              Own a Repair Shop?
            </h2>
            <p className="text-white/90 text-lg mb-4">
              Partner with CallMiBro and grow your business. Register your shop today and get access to our network of customers.
            </p>
            <ul className="text-white/80 mb-6 space-y-2">
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Increase your customer reach
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Manage your inventory efficiently
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Get featured in our shop listings
              </li>
            </ul>
          </div>
          
          <div className="w-full md:w-auto">
            {currentUser ? (
              <Link 
                href="/shop-registration" 
                className="w-full md:w-auto bg-white text-[#e60012] hover:bg-white/90 transition-colors px-8 py-4 rounded-lg font-medium text-lg flex items-center justify-center"
              >
                Register Your Shop
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            ) : (
              <button 
                onClick={() => setAuthModalOpen(true)}
                className="w-full md:w-auto bg-white text-[#e60012] hover:bg-white/90 transition-colors px-8 py-4 rounded-lg font-medium text-lg flex items-center justify-center"
              >
                Sign In to Register
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Auth Modal for non-logged in users */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </section>
  )
} 