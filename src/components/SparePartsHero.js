'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function SparePartsHero() {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="bg-gradient-to-b from-black to-[#111] py-16 sm:py-20 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-[#e60012]/10 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-60 h-60 rounded-full bg-[#e60012]/10 blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        <div className={`text-center transform transition-all duration-700 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="inline-block bg-[#111] px-4 py-1 rounded-full mb-4 border border-[#333]">
            <span className="text-[#e60012] text-sm font-medium">Genuine Parts</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Shop <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e60012] to-[#ff6b6b]">Original Spare Parts</span>
          </h1>
          
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto mb-8">
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
              className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-full hover:bg-white hover:text-[#e60012] transition-colors duration-300 font-medium"
            >
              Book Repair
            </Link>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3 mt-10">
            <div className="bg-[#111]/80 border border-[#333] rounded-full px-4 py-1 flex items-center">
              <span className="w-2 h-2 rounded-full bg-[#e60012] mr-2"></span>
              <span className="text-sm">Original Parts</span>
            </div>
            <div className="bg-[#111]/80 border border-[#333] rounded-full px-4 py-1 flex items-center">
              <span className="w-2 h-2 rounded-full bg-[#e60012] mr-2"></span>
              <span className="text-sm">Warranty Included</span>
            </div>
            <div className="bg-[#111]/80 border border-[#333] rounded-full px-4 py-1 flex items-center">
              <span className="w-2 h-2 rounded-full bg-[#e60012] mr-2"></span>
              <span className="text-sm">Fast Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 