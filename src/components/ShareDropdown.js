import React, { useState, useRef, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import ShareUrlButton from './ShareUrlButton'
import ShareQrCodeButton from './ShareQrCodeButton'
import ShareWhatsAppUrlButton from './ShareWhatsAppUrlButton'
import ShareWhatsAppListButton from './ShareWhatsAppListButton'
import ProfilePdfButton from './ProfilePdfButton'

export default function ShareDropdown({ shopId, shopName, contactNumber, inventory, selectedItems = [] }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const { isDarkMode } = useTheme()
  
  // Create URL with selected items if any are selected
  const shareUrl = typeof window !== 'undefined' 
    ? selectedItems.length > 0 
      ? `${window.location.origin}/shop-inventory/${shopId}/share?items=${selectedItems.join(',')}`
      : `${window.location.origin}/shop-inventory/${shopId}/share`
    : ''
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])
  
  // Close dropdown on ESC key
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('keydown', handleEscKey)
    return () => {
      document.removeEventListener('keydown', handleEscKey)
    }
  }, [])
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 flex items-center"
        style={{ 
          backgroundColor: isDarkMode ? '#059669' : '#059669',
          color: 'white'
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
        </svg>
        {selectedItems.length > 0 ? `Share (${selectedItems.length} selected)` : 'Share Inventory'}
        <svg 
          className={`ml-2 h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-64 rounded-md shadow-lg z-50"
          style={{ 
            backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)',
            border: `1px solid ${isDarkMode ? 'var(--border-color)' : 'var(--border-color)'}`
          }}
        >
          <div className="py-1" role="menu" aria-orientation="vertical">
            <div className="px-1 py-1 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Share Options
            </div>
            <div className="border-t" style={{ borderColor: 'var(--border-color)' }}></div>
            
            <div className="px-3 py-1">
              <ShareUrlButton 
                url={shareUrl} 
                buttonText="Copy Link" 
                className="w-full justify-center"
              />
            </div>
            
            <div className="px-3 py-1">
              <ShareQrCodeButton 
                url={shareUrl} 
                buttonText="Show QR Code" 
                className="w-full justify-center"
              />
            </div>
            
            <div className="px-3 py-1">
              <ShareWhatsAppUrlButton 
                url={shareUrl} 
                shopName={shopName} 
                buttonText="WhatsApp (with URL)" 
                className="w-full justify-center"
              />
            </div>
            
            <div className="px-3 py-1">
              <ShareWhatsAppListButton 
                shopName={shopName} 
                contactNumber={contactNumber} 
                inventory={selectedItems.length > 0 ? inventory.filter(item => selectedItems.includes(item.id)) : inventory} 
                buttonText={selectedItems.length > 0 ? `WhatsApp (${selectedItems.length} selected)` : "WhatsApp (as List)"} 
                className="w-full justify-center"
              />
            </div>
            
            <div className="px-3 py-1">
              <ProfilePdfButton 
                shopName={shopName} 
                contactNumber={contactNumber} 
                inventory={selectedItems.length > 0 ? inventory.filter(item => selectedItems.includes(item.id)) : inventory} 
                buttonText={selectedItems.length > 0 ? `Download PDF (${selectedItems.length} selected)` : "Download PDF"} 
                className="w-full justify-center"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 