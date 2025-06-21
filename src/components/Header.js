'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import AuthModal from './AuthModal'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-hot-toast'

export default function Header({ activePage }) {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  
  const { currentUser, logout, userProfile } = useAuth()
  
  const userMenuRef = useRef(null)
  const mobileMenuRef = useRef(null)

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
      if (userMenuOpen && userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [userMenuOpen])
  
  // Close mobile menu on ESC key
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setUserMenuOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, []);
  
  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    try {
      await logout()
      setUserMenuOpen(false)
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to log out')
    }
  }
  
  // Get user's display name or first name
  const getUserDisplayName = () => {
    if (userProfile?.name) return userProfile.name.split(' ')[0];
    if (currentUser?.displayName) return currentUser.displayName.split(' ')[0];
    return currentUser?.email?.split('@')[0] || 'User';
  };
  
  // Get user's initials for avatar
  const getUserInitials = () => {
    if (userProfile?.name) {
      const nameParts = userProfile.name.split(' ');
      if (nameParts.length > 1) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return nameParts[0][0].toUpperCase();
    }
    
    if (currentUser?.displayName) {
      const nameParts = currentUser.displayName.split(' ');
      if (nameParts.length > 1) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return nameParts[0][0].toUpperCase();
    }
    
    return currentUser?.email?.[0].toUpperCase() || 'U';
  };

  return (
    <>
      <header 
        className={`sticky top-0 w-full bg-black/95 backdrop-blur-sm flex items-center justify-between px-4 md:px-6 lg:px-8 py-3 z-50 transition-all duration-300 ${scrolled ? 'shadow-lg shadow-black/20' : ''}`}
        role="banner"
      >
        <div className="logo flex items-center">
          <Link href="/" className="flex items-center focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:ring-offset-2 focus:ring-offset-black rounded">
            <span className="text-[#e60012] font-bold text-xl md:text-2xl">●</span>
            <span className="ml-2 font-medium text-base md:text-lg">CallMiBro</span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6 lg:gap-8" aria-label="Main Navigation">
          <Link 
            href="/" 
            className={`transition-colors hover:text-[#e60012] focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:ring-offset-2 focus:ring-offset-black rounded px-1 py-0.5 ${activePage === 'home' ? 'text-[#e60012]' : ''}`}
            aria-current={activePage === 'home' ? 'page' : undefined}
          >
            Home
          </Link>
          <Link 
            href="/services" 
            className={`transition-colors hover:text-[#e60012] focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:ring-offset-2 focus:ring-offset-black rounded px-1 py-0.5 ${activePage === 'services' ? 'text-[#e60012]' : ''}`}
            aria-current={activePage === 'services' ? 'page' : undefined}
          >
            Services
          </Link>
          <Link 
            href="/spare-parts" 
            className={`transition-colors hover:text-[#e60012] focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:ring-offset-2 focus:ring-offset-black rounded px-1 py-0.5 ${activePage === 'spare-parts' ? 'text-[#e60012]' : ''}`}
            aria-current={activePage === 'spare-parts' ? 'page' : undefined}
          >
            Spare Parts
          </Link>
          <Link 
            href="/contact" 
            className={`transition-colors hover:text-[#e60012] focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:ring-offset-2 focus:ring-offset-black rounded px-1 py-0.5 ${activePage === 'contact' ? 'text-[#e60012]' : ''}`}
            aria-current={activePage === 'contact' ? 'page' : undefined}
          >
            Contact
          </Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          {/* Login button or User menu */}
          {currentUser ? (
            <div className="relative hidden md:block" ref={userMenuRef}>
              <button 
                className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:ring-offset-2 focus:ring-offset-black rounded-full"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
                aria-label="User menu"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#e60012] to-[#ff6b6b] flex items-center justify-center text-white font-medium">
                  {getUserInitials()}
                </div>
                <span className="text-sm font-medium hidden lg:block">
                  {getUserDisplayName()}
                </span>
                <svg 
                  className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* User dropdown menu */}
              {userMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-[#111] border border-[#333] rounded-md shadow-lg z-10 animate-fadeIn"
                  role="menu"
                >
                  <div className="p-3 border-b border-[#333]">
                    <p className="text-sm font-medium">{userProfile?.name || currentUser.displayName || 'User'}</p>
                    <p className="text-xs text-gray-400 truncate">{currentUser.email}</p>
                  </div>
                  <div className="py-1">
                    <Link 
                      href="/profile" 
                      className="flex items-center px-4 py-2 text-sm hover:bg-[#222] focus:bg-[#222] focus:outline-none transition-colors"
                      role="menuitem"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile
                    </Link>
                    <Link 
                      href="/orders" 
                      className="flex items-center px-4 py-2 text-sm hover:bg-[#222] focus:bg-[#222] focus:outline-none transition-colors"
                      role="menuitem"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      My Orders
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-[#222] focus:bg-[#222] focus:outline-none transition-colors"
                      role="menuitem"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button 
              id="login-btn"
              className="hidden md:flex items-center bg-gradient-to-r from-[#e60012] to-[#ff6b6b] text-white px-4 py-2 rounded hover:from-[#d40010] hover:to-[#e55b5b] transition-all focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:ring-offset-2 focus:ring-offset-black"
              onClick={() => setAuthModalOpen(true)}
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Login / Signup
            </button>
          )}
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden text-white p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:ring-offset-2 focus:ring-offset-black"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
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
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black/95 pt-[60px] overflow-y-auto animate-fadeIn"
          ref={mobileMenuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <nav className="flex flex-col px-4 py-3" aria-label="Mobile Navigation">
            <Link 
              href="/" 
              className={`flex items-center py-3 border-b border-[#333] ${activePage === 'home' ? 'text-[#e60012]' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
              aria-current={activePage === 'home' ? 'page' : undefined}
            >
              <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </Link>
            <Link 
              href="/services" 
              className={`flex items-center py-3 border-b border-[#333] ${activePage === 'services' ? 'text-[#e60012]' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
              aria-current={activePage === 'services' ? 'page' : undefined}
            >
              <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Services
            </Link>
            <Link 
              href="/spare-parts" 
              className={`flex items-center py-3 border-b border-[#333] ${activePage === 'spare-parts' ? 'text-[#e60012]' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
              aria-current={activePage === 'spare-parts' ? 'page' : undefined}
            >
              <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Spare Parts
            </Link>
            <Link 
              href="/contact" 
              className={`flex items-center py-3 border-b border-[#333] ${activePage === 'contact' ? 'text-[#e60012]' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
              aria-current={activePage === 'contact' ? 'page' : undefined}
            >
              <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact
            </Link>
            
            {/* Mobile user menu or login button */}
            {currentUser ? (
              <>
                <div className="py-4 mt-2 border-b border-[#333]">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e60012] to-[#ff6b6b] flex items-center justify-center text-white font-medium">
                      {getUserInitials()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{userProfile?.name || currentUser.displayName || 'User'}</p>
                      <p className="text-xs text-gray-400 truncate">{currentUser.email}</p>
                    </div>
                  </div>
                </div>
                <Link 
                  href="/profile" 
                  className="flex items-center py-3 border-b border-[#333]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </Link>
                <Link 
                  href="/orders" 
                  className="flex items-center py-3 border-b border-[#333]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  My Orders
                </Link>
                <button 
                  className="flex items-center py-3 text-left text-red-500 w-full"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </>
            ) : (
              <button 
                className="mt-6 bg-gradient-to-r from-[#e60012] to-[#ff6b6b] text-white py-3 rounded-lg hover:from-[#d40010] hover:to-[#e55b5b] transition-all flex items-center justify-center"
                onClick={() => {
                  setMobileMenuOpen(false)
                  setAuthModalOpen(true)
                }}
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
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
      
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  )
} 