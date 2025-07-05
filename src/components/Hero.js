'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import SearchBar from './SearchBar'

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false)
  const { isDarkMode } = useTheme()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Array of cities for the scrolling text effect
  const cities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 
    'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'
  ]

  return (
    <section className="min-h-[90vh] relative overflow-hidden" style={{ 
      background: isDarkMode ? 'linear-gradient(to right, var(--bg-color), var(--panel-dark))' : 'linear-gradient(to right, var(--bg-color), var(--panel-charcoal))'
    }}>
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-[#e60012]/10 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-60 h-60 rounded-full bg-[#e60012]/5 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#e60012]/5 blur-3xl"></div>
      </div>

      {/* Hero content container */}
      <div className="container mx-auto px-4 py-12 md:py-20 flex flex-col md:flex-row items-center relative z-10">
        {/* Left content - Text & CTA */}
        <div 
          className={`w-full md:w-1/2 md:pr-8 mb-10 md:mb-0 transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <div className="inline-block bg-[#e60012]/10 px-4 py-1 rounded-full mb-4">
            <span className="text-[#e60012] uppercase tracking-wider font-bold text-sm">Next-Gen Repair Platform</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            <span>Expert Tech Repair</span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e60012] to-[#ff6b6b]">At Your Doorstep</span>
          </h1>
          
          <p className="mb-8 text-base sm:text-lg max-w-lg" style={{ color: 'var(--text-secondary)' }}>
            Book certified technicians for same-day repairs or browse our catalog of genuine spare parts with guaranteed quality and fast delivery.
          </p>
          
          {/* Search Bar */}
          <div className="mb-8 w-full">
            <SearchBar />
          </div>
          
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/services" 
              className="bg-gradient-to-r from-[#e60012] to-[#ff6b6b] text-white px-8 py-3 rounded-full hover:shadow-lg hover:shadow-[#e60012]/20 transition-all duration-300 font-medium text-base flex items-center"
            >
              <span>Book Service</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
            
            <Link
              href="/spare-parts"
              className="bg-transparent border-2 px-8 py-3 rounded-full transition-colors duration-300 font-medium text-base"
              style={{ 
                borderColor: 'var(--text-main)', 
                color: 'var(--text-main)',
                ':hover': {
                  backgroundColor: 'var(--text-main)',
                  color: isDarkMode ? 'var(--bg-color)' : 'var(--text-main)'
                }
              }}
            >
              Browse Parts
            </Link>
          </div>
          
          {/* Cities and availability */}
          <div className="mt-10 flex items-center">
            <div className="mr-4 flex -space-x-2">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="w-8 h-8 rounded-full bg-[#e60012] border-2 flex items-center justify-center text-xs font-bold text-white"
                  style={{ borderColor: 'var(--bg-color)' }}
                >
                  {item}
                </div>
              ))}
            </div>
            <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
              <span style={{ color: 'var(--text-main)' }} className="font-medium">500+</span> expert technicians available
            </p>
          </div>
        </div>
        
        {/* Right content - Image or Device Mockup */}
        <div 
          className={`w-full md:w-1/2 relative transform transition-all duration-1000 delay-300 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          {/* Device frame with image inside */}
          <div className="relative mx-auto max-w-[240px] h-[320px] sm:max-w-sm sm:h-[450px] md:max-w-md">
            {/* Phone frame */}
            <div className="relative w-full h-full sm:aspect-[9/16] rounded-3xl border-[6px] sm:border-[8px] border-[#333] bg-gray-800 shadow-2xl overflow-hidden">
              {/* Screen content */}
              <div className="absolute inset-0 overflow-hidden">
                <Image
                  src="/hero.jpg"
                  alt="CallMiBro Repair Service"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 640px) 240px, (max-width: 768px) 384px, 448px"
                  priority={true}
                  quality={90}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                  <div className="p-2 sm:p-3 md:p-6">
                    <div className="flex items-center mb-1 sm:mb-2">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500 mr-1 sm:mr-2"></div>
                      <span className="text-white text-xs sm:text-sm font-medium">Live Tracking</span>
                    </div>
                    <h3 className="text-white text-xs sm:text-sm md:text-lg font-bold mb-1">iPhone Screen Repair</h3>
                    <p className="text-gray-300 text-xs">ETA: 35 mins • Technician: on the way</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 md:-top-6 md:-right-6 w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 bg-[#e60012]/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 md:-bottom-6 md:-left-6 w-16 h-16 sm:w-20 sm:h-20 md:w-32 md:h-32 bg-[#e60012]/10 rounded-full blur-xl"></div>
          </div>
          
          {/* Floating badges */}
          <div className="absolute top-4 -left-1 sm:top-6 sm:-left-2 md:top-10 md:-left-4 lg:-left-10 bg-white text-black p-1 sm:p-1.5 md:p-2 rounded-lg shadow-lg transform rotate-[-6deg] shadow-[#e60012]/20">
            <div className="flex items-center">
              <div className="bg-[#e60012] rounded-full p-0.5 sm:p-1 md:p-1.5 mr-1 sm:mr-1.5 md:mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-xs font-bold">Same-day service</span>
            </div>
          </div>
          
          <div className="absolute bottom-6 -right-1 sm:bottom-8 sm:-right-2 md:bottom-12 md:-right-4 lg:-right-10 bg-white text-black p-1 sm:p-1.5 md:p-2 rounded-lg shadow-lg transform rotate-[6deg] shadow-[#e60012]/20">
            <div className="flex items-center">
              <div className="bg-[#e60012] rounded-full p-0.5 sm:p-1 md:p-1.5 mr-1 sm:mr-1.5 md:mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-bold">Upfront pricing</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom scrolling cities bar */}
      <div className="absolute bottom-0 left-0 right-0 backdrop-blur-sm border-t py-3" 
        style={{ 
          backgroundColor: 'var(--panel-dark)', 
          borderColor: 'var(--border-color)'
        }}
      >
        <div className="flex space-x-8 animate-scroll">
          {[...cities, ...cities].map((city, index) => (
            <span key={index} style={{ color: 'var(--text-secondary)' }} className="text-sm whitespace-nowrap font-medium">
              <span className="text-[#e60012]">•</span> Available in {city}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
} 