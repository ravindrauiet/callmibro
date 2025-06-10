'use client'

import { useState, useEffect } from 'react'
import AuthModal from './AuthModal'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-hot-toast'

export default function Header({ activePage }) {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  
  const { currentUser, logout } = useAuth()

  // Handle scroll event for header shadow
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])
  
  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuOpen && !e.target.closest('#user-menu-container')) {
        setUserMenuOpen(false)
      }
    }
    
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [userMenuOpen])

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
      setUserMenuOpen(false)
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to log out')
    }
  }

  return (
    <>
      <header className={`sticky top-0 w-full bg-black flex items-center justify-between px-4 md:px-8 py-4 z-50 transition-all duration-300 ${scrolled ? 'shadow-md' : ''}`}>
        <div className="logo flex items-center">
          <span className="text-[#e60012] font-bold text-xl">●</span>
          <span className="ml-2 font-medium">CallMiBro</span>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8">
          <a 
            href="/" 
            className={`transition-colors ${activePage === 'home' ? 'text-[#e60012]' : 'hover:text-[#e60012]'}`}
          >
            Home
          </a>
          <a 
            href="/services" 
            className={`transition-colors ${activePage === 'services' ? 'text-[#e60012]' : 'hover:text-[#e60012]'}`}
          >
            Services
          </a>
          <a 
            href="/spare-parts" 
            className={`transition-colors ${activePage === 'spare-parts' ? 'text-[#e60012]' : 'hover:text-[#e60012]'}`}
          >
            Spare Parts
          </a>
          <a 
            href="/contact" 
            className={`transition-colors ${activePage === 'contact' ? 'text-[#e60012]' : 'hover:text-[#e60012]'}`}
          >
            Contact
          </a>
        </nav>
        
        <div className="flex items-center space-x-4">
          {/* Login button or User menu */}
          {currentUser ? (
            <div className="relative hidden md:block" id="user-menu-container">
              <button 
                className="flex items-center space-x-2 focus:outline-none"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="w-8 h-8 rounded-full bg-[#e60012] flex items-center justify-center text-white">
                  {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : currentUser.email.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium hidden lg:block">
                  {currentUser.displayName || currentUser.email.split('@')[0]}
                </span>
              </button>
              
              {/* User dropdown menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#111] border border-[#333] rounded-md shadow-lg z-10">
                  <div className="p-3 border-b border-[#333]">
                    <p className="text-sm font-medium">{currentUser.displayName || 'User'}</p>
                    <p className="text-xs text-gray-400 truncate">{currentUser.email}</p>
                  </div>
                  <div className="py-1">
                    <a href="/profile" className="block px-4 py-2 text-sm hover:bg-[#222]">Profile</a>
                    <a href="/orders" className="block px-4 py-2 text-sm hover:bg-[#222]">My Orders</a>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-[#222]"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button 
              className="hidden md:block bg-[#e60012] text-white px-4 py-2 rounded hover:bg-[#b3000f] transition-colors"
              onClick={() => setAuthModalOpen(true)}
            >
              Login / Signup
            </button>
          )}
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden text-white focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </header>
      
      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-[60px] left-0 right-0 bg-black border-t border-[#333] z-40 shadow-lg">
          <nav className="flex flex-col px-4 py-3">
            <a 
              href="/" 
              className={`py-3 border-b border-[#333] ${activePage === 'home' ? 'text-[#e60012]' : 'hover:text-[#e60012]'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </a>
            <a 
              href="/services" 
              className={`py-3 border-b border-[#333] ${activePage === 'services' ? 'text-[#e60012]' : 'hover:text-[#e60012]'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Services
            </a>
            <a 
              href="/spare-parts" 
              className={`py-3 border-b border-[#333] ${activePage === 'spare-parts' ? 'text-[#e60012]' : 'hover:text-[#e60012]'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Spare Parts
            </a>
            <a 
              href="/contact" 
              className={`py-3 border-b border-[#333] ${activePage === 'contact' ? 'text-[#e60012]' : 'hover:text-[#e60012]'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </a>
            
            {/* Mobile user menu or login button */}
            {currentUser ? (
              <>
                <div className="py-3 border-b border-[#333]">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-[#e60012] flex items-center justify-center text-white">
                      {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : currentUser.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{currentUser.displayName || 'User'}</p>
                      <p className="text-xs text-gray-400 truncate">{currentUser.email}</p>
                    </div>
                  </div>
                </div>
                <a 
                  href="/profile" 
                  className="py-3 border-b border-[#333]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </a>
                <a 
                  href="/orders" 
                  className="py-3 border-b border-[#333]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Orders
                </a>
                <button 
                  className="py-3 text-left text-red-500"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <button 
                className="mt-4 bg-[#e60012] text-white py-2 rounded hover:bg-[#b3000f] transition-colors text-center"
                onClick={() => {
                  setMobileMenuOpen(false)
                  setAuthModalOpen(true)
                }}
              >
                Login / Signup
              </button>
            )}
          </nav>
        </div>
      )}

      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
      />
    </>
  )
} 