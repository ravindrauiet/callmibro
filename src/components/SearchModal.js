'use client'

import { useState, useEffect, useRef } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import SearchBar from './SearchBar'

export default function SearchModal({ isOpen, onClose }) {
  const { isDarkMode } = useTheme()
  const modalRef = useRef(null)
  const searchInputRef = useRef(null)

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey)
      document.body.style.overflow = 'hidden'
      
      // Focus search input after modal opens
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus()
        }
      }, 100)
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey)
      document.body.style.overflow = 'auto'
    }
  }, [isOpen, onClose])

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border"
        style={{ 
          backgroundColor: 'var(--panel-dark)',
          borderColor: 'var(--border-color)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#e60012] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>Search CallMiBro</h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Find services, spare parts, and shops
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Search Content */}
        <div className="p-6">
          <SearchBar />
          
          {/* Quick Actions */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-main)' }}>Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <button
                onClick={() => {
                  window.location.href = '/services'
                  onClose()
                }}
                className="p-4 rounded-xl border text-left transition-all hover:shadow-lg hover:scale-105"
                style={{ 
                  borderColor: 'var(--border-color)',
                  backgroundColor: 'var(--panel-gray)'
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white text-lg">🔧</span>
                  </div>
                  <div>
                    <div className="font-medium" style={{ color: 'var(--text-main)' }}>Book Service</div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Repair your devices</div>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => {
                  window.location.href = '/spare-parts'
                  onClose()
                }}
                className="p-4 rounded-xl border text-left transition-all hover:shadow-lg hover:scale-105"
                style={{ 
                  borderColor: 'var(--border-color)',
                  backgroundColor: 'var(--panel-gray)'
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-white text-lg">📱</span>
                  </div>
                  <div>
                    <div className="font-medium" style={{ color: 'var(--text-main)' }}>Spare Parts</div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Find replacement parts</div>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => {
                  window.location.href = '/shops'
                  onClose()
                }}
                className="p-4 rounded-xl border text-left transition-all hover:shadow-lg hover:scale-105"
                style={{ 
                  borderColor: 'var(--border-color)',
                  backgroundColor: 'var(--panel-gray)'
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                    <span className="text-white text-lg">🏪</span>
                  </div>
                  <div>
                    <div className="font-medium" style={{ color: 'var(--text-main)' }}>Find Shops</div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Browse repair shops</div>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => {
                  window.location.href = '/technicians'
                  onClose()
                }}
                className="p-4 rounded-xl border text-left transition-all hover:shadow-lg hover:scale-105"
                style={{ 
                  borderColor: 'var(--border-color)',
                  backgroundColor: 'var(--panel-gray)'
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                    <span className="text-white text-lg">👨‍🔧</span>
                  </div>
                  <div>
                    <div className="font-medium" style={{ color: 'var(--text-main)' }}>Technicians</div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Expert repair techs</div>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => {
                  window.location.href = '/profile'
                  onClose()
                }}
                className="p-4 rounded-xl border text-left transition-all hover:shadow-lg hover:scale-105"
                style={{ 
                  borderColor: 'var(--border-color)',
                  backgroundColor: 'var(--panel-gray)'
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center">
                    <span className="text-white text-lg">📦</span>
                  </div>
                  <div>
                    <div className="font-medium" style={{ color: 'var(--text-main)' }}>My Inventory</div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Manage your stock</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 