'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

export default function Services() {
  const [isVisible, setIsVisible] = useState(false)
  const [error, setError] = useState(null)
  const { isDarkMode } = useTheme()
  
  useEffect(() => {
    try {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true)
        }
      }, {
        threshold: 0.2
      })
      
      const element = document.getElementById('services-section')
      if (element) observer.observe(element)
      
      return () => {
        if (element) observer.unobserve(element)
      }
    } catch (err) {
      console.error('Error in Services intersection observer:', err)
      setError(err.message)
      // Default to visible if observer fails
      setIsVisible(true)
    }
  }, [])

  const services = [
    {
      title: "Mobile Repairs",
      description: "Professional screen & battery replacement services",
      icon: "/icons/mobile-screen.svg",
      url: "/services?category=mobile",
      primary: false
    },
    {
      title: "TV Services",
      description: "Expert screen, software & power issue solutions",
      icon: "/icons/tv.svg",
      url: "/services?category=tv",
      primary: false
    },
    {
      title: "AC Repairs",
      description: "Specialized cooling, gas refill & maintenance",
      icon: "/icons/ac.svg",
      url: "/services?category=ac",
      primary: false
    },
    {
      title: "Refrigerator Fix",
      description: "Professional compressor & seal replacement",
      icon: "/icons/battery.svg", // Using battery icon as placeholder for refrigerator
      url: "/services?category=refrigerator",
      primary: false
    }
  ]

  // Handle image error
  const handleImageError = (e) => {
    console.error('Failed to load service icon')
    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23fff'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 6v6m0 0v6m0-6h6m-6 0H6'/%3E%3C/svg%3E"
  }

  return (
    <section id="services-section" className="relative py-16 sm:py-20 px-4 sm:px-8 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10" style={{ 
        background: isDarkMode 
          ? 'linear-gradient(to bottom, var(--bg-color), var(--panel-dark))' 
          : 'linear-gradient(to bottom, var(--bg-color), var(--panel-charcoal))'
      }}></div>
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#e60012]/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-[#e60012]/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto max-w-6xl">
        {/* Section Heading */}
        <div 
          className={`mb-10 md:mb-12 text-center transform transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="inline-block px-4 py-1 rounded-full mb-4 border" style={{ 
            background: 'var(--panel-dark)', 
            borderColor: 'var(--border-color)' 
          }}>
            <span className="text-[#e60012] text-sm font-medium">Expert Solutions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
            Our Premium <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e60012] to-[#ff6b6b]">Repair Categories</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)' }} className="max-w-2xl mx-auto text-sm sm:text-base">
            Choose from our wide range of professional repair services designed for quality and reliability
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-8 p-4 bg-red-900/20 border border-red-900/50 rounded-lg text-center">
            <p className="text-red-400 text-sm">
              {error}. Please refresh the page to try again.
            </p>
          </div>
        )}

        {/* Services Grid - Horizontal scroll on mobile, grid on larger screens */}
        <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar snap-x snap-mandatory">
          <div className="flex gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 lg:gap-8 min-w-max sm:min-w-0">
            {services.map((service, index) => (
              <div key={index} className="w-[260px] sm:w-auto flex-shrink-0 sm:flex-shrink snap-start">
                <Link 
                  href={service.url} 
                  className={`group p-5 sm:p-6 rounded-xl transition-all hover:shadow-lg hover:shadow-[#e60012]/10 transform ${
                    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  } transition-all duration-700 border hover:border-[#e60012] block h-full`}
                  style={{ 
                    transitionDelay: `${index * 100}ms`,
                    background: 'var(--panel-dark)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 mb-5 sm:mb-6 p-3 rounded-lg ${service.primary ? 'bg-gradient-to-r from-[#e60012] to-[#ff6b6b]' : ''} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}
                    style={!service.primary ? { background: 'var(--panel-gray)' } : {}}
                  >
                    <Image 
                      src={service.icon} 
                      alt={service.title} 
                      width={30} 
                      height={30}
                      className="brightness-[10]"
                      onError={handleImageError}
                    />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2 group-hover:text-[#e60012] transition-colors">{service.title}</h3>
                  <p style={{ color: 'var(--text-secondary)' }} className="text-sm">{service.description}</p>
                  
                  <div className="mt-4 sm:mt-6 flex items-center text-sm text-[#e60012] font-medium opacity-0 group-hover:opacity-100 transform group-hover:translate-x-0 -translate-x-2 transition-all duration-300">
                    <span>Learn more</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
} 