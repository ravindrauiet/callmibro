'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from '@/contexts/ThemeContext'

export default function SparePartsHero() {
  const [isVisible, setIsVisible] = useState(false)
  const { isDarkMode } = useTheme()
  
  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section 
      className="py-16 sm:py-20 relative overflow-hidden"
      style={{ 
        background: isDarkMode 
          ? 'linear-gradient(to bottom, #000, var(--panel-dark))' 
          : 'linear-gradient(to bottom, var(--bg-color), var(--panel-dark))'
      }}
    >
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-[#e60012]/10 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-60 h-60 rounded-full bg-[#e60012]/10 blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        <div className={`text-center transform transition-all duration-700 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="inline-block px-4 py-1 rounded-full mb-4" 
            style={{ 
              backgroundColor: 'var(--panel-dark)', 
              borderColor: 'var(--border-color)',
              borderWidth: '1px'
            }}
          >
            <span className="text-[#e60012] text-sm font-medium">Genuine Parts</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4" style={{ color: 'var(--text-main)' }}>
            Shop <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e60012] to-[#ff6b6b]">Original Spare Parts</span>
          </h1>
          
          <p className="text-base sm:text-lg max-w-2xl mx-auto mb-8" style={{ color: 'var(--text-secondary)' }}>
            Find high-quality replacement parts for phones, TVs, ACs, refrigerators & more with warranty and guaranteed compatibility
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <Link 
              href="#products" 
              className="bg-gradient-to-r from-[#e60012] to-[#ff6b6b] text-white px-6 py-3 rounded-full hover:shadow-lg hover:shadow-[#e60012]/20 transition-all duration-300 font-medium"
            >
              Browse Catalog
            </Link>
            <Link 
              href="/services" 
              className="border-2 px-6 py-3 rounded-full hover:bg-white hover:text-[#e60012] transition-colors duration-300 font-medium"
              style={{ 
                borderColor: 'var(--text-main)',
                color: 'var(--text-main)',
              }}
            >
              Book Repair
            </Link>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3 mt-10">
            <div className="rounded-full px-4 py-1 flex items-center" 
              style={{ 
                backgroundColor: 'var(--panel-dark-accent)',
                borderColor: 'var(--border-color)',
                borderWidth: '1px'
              }}
            >
              <span className="w-2 h-2 rounded-full bg-[#e60012] mr-2"></span>
              <span className="text-sm" style={{ color: 'var(--text-main)' }}>Original Parts</span>
            </div>
            <div className="rounded-full px-4 py-1 flex items-center" 
              style={{ 
                backgroundColor: 'var(--panel-dark-accent)',
                borderColor: 'var(--border-color)',
                borderWidth: '1px'
              }}
            >
              <span className="w-2 h-2 rounded-full bg-[#e60012] mr-2"></span>
              <span className="text-sm" style={{ color: 'var(--text-main)' }}>Warranty Included</span>
            </div>
            <div className="rounded-full px-4 py-1 flex items-center" 
              style={{ 
                backgroundColor: 'var(--panel-dark-accent)',
                borderColor: 'var(--border-color)',
                borderWidth: '1px'
              }}
            >
              <span className="w-2 h-2 rounded-full bg-[#e60012] mr-2"></span>
              <span className="text-sm" style={{ color: 'var(--text-main)' }}>Fast Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 