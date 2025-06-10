'use client'

import { useState, useEffect } from 'react'
import AuthModal from './AuthModal'

export default function Header({ activePage }) {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

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
          {/* Login button */}
          <button 
            className="hidden md:block bg-[#e60012] text-white px-4 py-2 rounded hover:bg-[#b3000f] transition-colors"
            onClick={() => setAuthModalOpen(true)}
          >
            Login / Signup
          </button>
          
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
            <button 
              className="mt-4 bg-[#e60012] text-white py-2 rounded hover:bg-[#b3000f] transition-colors text-center"
              onClick={() => {
                setMobileMenuOpen(false)
                setAuthModalOpen(true)
              }}
            >
              Login / Signup
            </button>
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