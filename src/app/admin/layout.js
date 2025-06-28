'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { toast } from 'react-hot-toast'
import { useTheme } from '@/contexts/ThemeContext'

export default function AdminLayout({ children }) {
  const { currentUser, loading: authLoading } = useAuth()
  const { isDarkMode, toggleTheme } = useTheme()
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminLoading, setAdminLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!currentUser) {
        setAdminLoading(false)
        return
      }

      try {
        const adminsRef = collection(db, 'admins')
        const q = query(adminsRef, where('email', '==', currentUser.email))
        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
          setIsAdmin(true)
          // If user is admin and on login page, redirect to admin dashboard
          if (pathname === '/admin/login') {
            router.push('/admin')
          }
        } else {
          // Only redirect to login if not already on login page
          if (pathname !== '/admin/login') {
            toast.error('You do not have admin access')
            router.push('/admin/login')
          }
        }
      } catch (error) {
        console.error('Error checking admin status:', error)
      } finally {
        setAdminLoading(false)
      }
    }

    if (!authLoading) {
      checkAdmin()
    }
  }, [currentUser, authLoading, router, pathname])

  // If not logged in, redirect to login
  useEffect(() => {
    if (!authLoading && !currentUser && pathname !== '/admin/login') {
      router.push('/admin/login')
    }
  }, [currentUser, authLoading, pathname, router])

  // Skip layout on login page
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  // Show loading while checking admin status
  if (authLoading || adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e60012]"></div>
      </div>
    )
  }

  // If not admin, don't render the admin layout
  if (!isAdmin && pathname !== '/admin/login') {
    return null
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Services', href: '/admin/services', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
    { name: 'Bookings', href: '/admin/bookings', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { name: 'Express Bookings', href: '/admin/express-bookings', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { name: 'Products', href: '/admin/products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { name: 'Spare Parts', href: '/admin/spare-parts', icon: 'M15 9a2 2 0 10-4 0v5a2 2 0 104 0V9z M12 4.5a.5.5 0 00-1 0V6H9.5a.5.5 0 000 1H11v1.5a.5.5 0 001 0V7h1.5a.5.5 0 000-1H12V4.5z M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0-11V3' },
    { name: 'Bundle Deals', href: '/admin/bundle-deals', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { name: 'Orders', href: '/admin/orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { name: 'Users', href: '/admin/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { name: 'Technicians', href: '/admin/technicians', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { name: 'Brands', href: '/admin/brands', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
    { name: 'Models', href: '/admin/models', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
    { name: 'Admins', href: '/admin/admins', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { name: 'Settings', href: '/admin/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ]

  return (
    <div className="flex h-screen" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-main)' }}>
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 border-r flex flex-col`} 
        style={{ backgroundColor: 'var(--panel-charcoal)', borderColor: 'var(--border-color)' }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          {isSidebarOpen ? (
            <Link href="/" className="text-xl font-bold text-[#e60012]">CallMiBro Admin</Link>
          ) : (
            <Link href="/" className="text-xl font-bold text-[#e60012]">CMB</Link>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 rounded-md hover:bg-opacity-20 hover:bg-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isSidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              )}
            </svg>
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className={`flex items-center px-4 py-3 rounded-md ${
                      isActive 
                        ? 'bg-[#e60012] text-white' 
                        : 'hover:bg-opacity-20 hover:bg-gray-600'
                    }`}
                    style={{ color: isActive ? '#ffffff' : 'var(--text-secondary)' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isSidebarOpen ? 'mr-3' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    {isSidebarOpen && <span>{item.name}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        
        {/* User info */}
        <div className="p-4 border-t flex items-center" style={{ borderColor: 'var(--border-color)' }}>
          <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--panel-gray)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--text-secondary)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          {isSidebarOpen && (
            <div className="ml-3">
              <p className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>{currentUser?.displayName || currentUser?.email}</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Admin</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b flex items-center justify-between px-6" 
          style={{ backgroundColor: 'var(--panel-charcoal)', borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center">
            <h1 className="text-xl font-semibold" style={{ color: 'var(--text-main)' }}>
              {navItems.find(item => pathname === item.href || pathname.startsWith(`${item.href}/`))?.name || 'Admin Panel'}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-md transition-colors"
              style={{ backgroundColor: 'var(--panel-gray)' }}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <Link href="/" style={{ color: 'var(--text-secondary)', hover: { color: 'var(--text-main)' } }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </Link>
          </div>
        </header>
        
        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: 'var(--bg-color)' }}>
          {children}
        </main>
      </div>
    </div>
  )
} 
