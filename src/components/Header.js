'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import AuthModal from './AuthModal'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { toast } from 'react-hot-toast'
import { db } from '../firebase/config'
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'

export default function Header({ activePage }) {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [shopOwnerData, setShopOwnerData] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  
  const { currentUser, logout, userProfile } = useAuth()
  const { isDarkMode, toggleTheme } = useTheme()
  
  const userMenuRef = useRef(null)
  const mobileMenuRef = useRef(null)

  // Check user roles (shop owner and admin)
  useEffect(() => {
    const checkUserRoles = async () => {
      if (!currentUser) return

      try {
        // Check if user is a shop owner
        const shopOwnersRef = collection(db, 'shopOwners')
        const shopQuery = query(shopOwnersRef, where('userId', '==', currentUser.uid))
        const shopSnapshot = await getDocs(shopQuery)
        
        if (!shopSnapshot.empty) {
          const shopData = shopSnapshot.docs[0].data()
          setShopOwnerData({
            id: shopSnapshot.docs[0].id,
            ...shopData
          })
        }

        // Check if user is admin
        if (userProfile?.isAdmin) {
          setIsAdmin(true)
        } else {
          // Also check admins collection
          const adminsRef = collection(db, 'admins')
          const adminQuery = query(adminsRef, where('email', '==', currentUser.email))
          const adminSnapshot = await getDocs(adminQuery)
          
          if (!adminSnapshot.empty) {
            setIsAdmin(true)
          }
        }
      } catch (error) {
        console.error('Error checking user roles:', error)
      }
    }

    checkUserRoles()
  }, [currentUser, userProfile])

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
        className={`sticky top-0 w-full backdrop-blur-sm flex items-center justify-between px-4 md:px-6 lg:px-8 py-3 z-50 transition-all duration-300 ${scrolled ? 'shadow-lg shadow-black/20' : ''}`}
        style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-main)' }}
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
                  className={`h-4 w-4 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* User dropdown menu */}
              {userMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 rounded-md shadow-lg z-10 animate-fadeIn"
                  style={{ 
                    backgroundColor: 'var(--panel-dark)', 
                    borderColor: 'var(--border-color)',
                    borderWidth: '1px'
                  }}
                  role="menu"
                >
                  {/* User Info Header */}
                  <div className="p-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#e60012] to-[#ff6b6b] flex items-center justify-center text-white font-medium text-lg">
                        {getUserInitials()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{userProfile?.name || currentUser.displayName || 'User'}</p>
                        <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{currentUser.email}</p>
                        {/* Role badges */}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {shopOwnerData && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                              Shop Owner
                            </span>
                          )}
                          {isAdmin && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100">
                              Admin
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="py-1">
                    {/* Profile */}
                    <Link 
                      href="/profile" 
                      className="flex items-center px-4 py-2 text-sm transition-colors"
                      style={{ 
                        color: 'var(--text-main)',
                        ':hover': { backgroundColor: 'var(--panel-charcoal)' }
                      }}
                      role="menuitem"
                      onClick={() => setUserMenuOpen(false)}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = isDarkMode ? 'var(--panel-charcoal)' : 'var(--panel-gray)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent'
                      }}
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Profile
                    </Link>
                    
                    {/* Orders */}
                    <Link 
                      href="/orders" 
                      className="flex items-center px-4 py-2 text-sm transition-colors"
                      style={{ 
                        color: 'var(--text-main)'
                      }}
                      role="menuitem"
                      onClick={() => setUserMenuOpen(false)}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = isDarkMode ? 'var(--panel-charcoal)' : 'var(--panel-gray)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent'
                      }}
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      My Orders
                    </Link>
                    
                    {/* Shop Owner Inventory - Only show if user is a shop owner */}
                    {shopOwnerData && shopOwnerData.status === 'approved' && (
                      <Link 
                        href={`/shop-inventory/${shopOwnerData.id}`}
                        className="flex items-center px-4 py-2 text-sm transition-colors"
                        style={{ 
                          color: 'var(--text-main)'
                        }}
                        role="menuitem"
                        onClick={() => setUserMenuOpen(false)}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = isDarkMode ? 'var(--panel-charcoal)' : 'var(--panel-gray)'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent'
                        }}
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        Manage Inventory
                      </Link>
                    )}
                    
                    {/* Admin Panel - Only show if user is admin */}
                    {isAdmin && (
                      <Link 
                        href="/admin"
                        className="flex items-center px-4 py-2 text-sm transition-colors"
                        style={{ 
                          color: 'var(--text-main)'
                        }}
                        role="menuitem"
                        onClick={() => setUserMenuOpen(false)}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = isDarkMode ? 'var(--panel-charcoal)' : 'var(--panel-gray)'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent'
                        }}
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Admin Panel
                      </Link>
                    )}
                    
                    {/* Divider */}
                    <div className="my-1" style={{ borderTop: '1px solid var(--border-color)' }}></div>
                    
                    {/* Logout */}
                    <button 
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-red-500 transition-colors"
                      role="menuitem"
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = isDarkMode ? 'var(--panel-charcoal)' : 'var(--panel-gray)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent'
                      }}
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            className="md:hidden p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:ring-offset-2 focus:ring-offset-black"
            style={{ color: 'var(--text-main)' }}
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
          className="md:hidden fixed inset-0 z-40 pt-[60px] overflow-y-auto animate-fadeIn"
          style={{ 
            backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.95)' : 'rgba(240, 240, 240, 0.95)',
            color: 'var(--text-main)'
          }}
          ref={mobileMenuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <nav className="flex flex-col px-4 py-3" aria-label="Mobile Navigation">
            <Link 
              href="/" 
              className={`flex items-center py-3 ${activePage === 'home' ? 'text-[#e60012]' : ''}`}
              style={{ borderBottom: '1px solid var(--border-color)' }}
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
              className={`flex items-center py-3 ${activePage === 'services' ? 'text-[#e60012]' : ''}`}
              style={{ borderBottom: '1px solid var(--border-color)' }}
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
              className={`flex items-center py-3 ${activePage === 'spare-parts' ? 'text-[#e60012]' : ''}`}
              style={{ borderBottom: '1px solid var(--border-color)' }}
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
              className={`flex items-center py-3 ${activePage === 'contact' ? 'text-[#e60012]' : ''}`}
              style={{ borderBottom: '1px solid var(--border-color)' }}
              onClick={() => setMobileMenuOpen(false)}
              aria-current={activePage === 'contact' ? 'page' : undefined}
            >
              <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact
            </Link>
            
            {/* Theme toggle in mobile menu */}
            <button
              onClick={() => {
                toggleTheme();
              }}
              className="flex items-center py-3"
              style={{ borderBottom: '1px solid var(--border-color)' }}
            >
              {isDarkMode ? (
                <>
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Switch to Light Mode
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  Switch to Dark Mode
                </>
              )}
            </button>
            
            {/* Mobile user menu or login button */}
            {currentUser ? (
              <>
                <div className="py-4 mt-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#e60012] to-[#ff6b6b] flex items-center justify-center text-white font-medium">
                      {getUserInitials()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{userProfile?.name || currentUser.displayName || 'User'}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{currentUser.email}</p>
                      {/* Role badges */}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {shopOwnerData && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                            Shop Owner
                          </span>
                        )}
                        {isAdmin && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100">
                            Admin
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <Link 
                  href="/profile" 
                  className="flex items-center py-3"
                  style={{ borderBottom: '1px solid var(--border-color)' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Profile
                </Link>
                
                <Link 
                  href="/orders" 
                  className="flex items-center py-3"
                  style={{ borderBottom: '1px solid var(--border-color)' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  My Orders
                </Link>
                
                {/* Shop Owner Inventory - Mobile */}
                {shopOwnerData && shopOwnerData.status === 'approved' && (
                  <Link 
                    href={`/shop-inventory/${shopOwnerData.id}`}
                    className="flex items-center py-3"
                    style={{ borderBottom: '1px solid var(--border-color)' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    Manage Inventory
                  </Link>
                )}
                
                {/* Admin Panel - Mobile */}
                {isAdmin && (
                  <Link 
                    href="/admin"
                    className="flex items-center py-3"
                    style={{ borderBottom: '1px solid var(--border-color)' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Admin Panel
                  </Link>
                )}
                
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