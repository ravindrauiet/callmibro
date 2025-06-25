'use client'

import { useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

export default function Modal({ isOpen, onClose, title, children }) {
  const { isDarkMode } = useTheme()
  
  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 backdrop-blur-sm" 
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
        onClick={onClose}
      ></div>
      
      {/* Modal Container */}
      <div 
        className="rounded-lg w-full max-w-md mx-auto z-10 overflow-hidden shadow-xl transform transition-all"
        style={{ 
          backgroundColor: 'var(--panel-dark)',
          borderColor: 'var(--border-color)',
          borderWidth: '1px'
        }}
      >
        {/* Modal Header */}
        <div 
          className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4"
          style={{ 
            borderBottomWidth: '1px',
            borderColor: 'var(--border-color)'
          }}
        >
          <h2 
            className="text-lg sm:text-xl font-bold"
            style={{ color: 'var(--text-main)' }}
          >
            {title}
          </h2>
          <button 
            className="hover:text-[#e60012] transition-colors focus:outline-none"
            style={{ color: 'var(--text-secondary)' }}
            onClick={onClose}
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Modal Content */}
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  )
} 