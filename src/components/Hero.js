'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Array of cities for the scrolling text effect
  const cities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 
    'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'
  ]

  return (
    <section className="min-h-[90vh] bg-gradient-to-r from-black to-[#111] relative overflow-hidden">
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
            <span className="text-white">Expert Tech Repair</span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e60012] to-[#ff6b6b]">At Your Doorstep</span>
          </h1>
          
          <p className="text-gray-300 mb-8 text-base sm:text-lg max-w-lg">
            Book certified technicians for same-day repairs or browse our catalog of genuine spare parts with guaranteed quality and fast delivery.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/services" 
              className="bg-gradient-to-r from-[#e60012] to-[#ff4b4b] text-white px-8 py-3 rounded-full hover:shadow-lg hover:shadow-[#e60012]/20 transition-all duration-300 font-medium text-base flex items-center"
            >
              <span>Book Service</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
            
            <Link 
              href="/spare-parts" 
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full hover:bg-white hover:text-[#e60012] transition-colors duration-300 font-medium text-base"
            >
              Browse Parts
            </Link>
          </div>
          
          {/* Cities and availability */}
          <div className="mt-10 flex items-center">
            <div className="mr-4 flex -space-x-2">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className={`w-8 h-8 rounded-full bg-[#e60012] border-2 border-black flex items-center justify-center text-xs font-bold`}>
                  {item}
                </div>
              ))}
            </div>
            <p className="text-gray-400 text-sm">
              <span className="text-white font-medium">500+</span> expert technicians available
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
          <div className="relative mx-auto max-w-md">
            {/* Phone frame */}
            <div className="relative w-full aspect-[9/16] rounded-3xl border-[8px] border-[#333] bg-gray-800 shadow-2xl overflow-hidden">
              {/* Screen content */}
              <div className="absolute inset-0 overflow-hidden">
                <Image
                  src="/hero.jpg"
                  alt="CallMiBro Repair Service"
                  fill
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                  <div className="p-6">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-white text-sm font-medium">Live Tracking</span>
                    </div>
                    <h3 className="text-white text-lg font-bold mb-1">iPhone Screen Repair</h3>
                    <p className="text-gray-300 text-xs">ETA: 35 mins • Technician: on the way</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#e60012]/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[#e60012]/10 rounded-full blur-xl"></div>
          </div>
          
          {/* Floating badges */}
          <div className="absolute top-10 -left-4 md:-left-10 bg-white text-black p-2 rounded-lg shadow-lg transform rotate-[-6deg] shadow-[#e60012]/20">
            <div className="flex items-center">
              <div className="bg-[#e60012] rounded-full p-1.5 mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-xs font-bold">Same-day service</span>
            </div>
          </div>
          
          <div className="absolute bottom-12 -right-4 md:-right-10 bg-white text-black p-2 rounded-lg shadow-lg transform rotate-[6deg] shadow-[#e60012]/20">
            <div className="flex items-center">
              <div className="bg-[#e60012] rounded-full p-1.5 mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-bold">Upfront pricing</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom scrolling cities bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#111] bg-opacity-80 backdrop-blur-sm border-t border-[#222] py-3">
        <div className="flex space-x-8 animate-scroll">
          {[...cities, ...cities].map((city, index) => (
            <span key={index} className="text-gray-400 text-sm whitespace-nowrap font-medium">
              <span className="text-[#e60012]">•</span> Available in {city}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
} 