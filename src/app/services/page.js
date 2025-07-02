'use client'

import Header from '../../components/Header'
import Footer from '../../components/Footer'
import RepairServices from '../../components/RepairServices'
import ExpertsBenefits from '../../components/ExpertsBenefits'
import ExpressBookingModal from '../../components/ExpressBookingModal'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from '@/contexts/ThemeContext'

export default function ServicesPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [showExpressBookingModal, setShowExpressBookingModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const { isDarkMode } = useTheme()
  
  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Popular service categories with icons
  const popularCategories = [
    { name: "Mobile Phones", icon: "/icons/mobile-screen.svg", color: "from-[#e60012] to-[#ff6b6b]", category: "Mobile Phones" },
    { name: "TVs", icon: "/icons/tv.svg", color: "from-[#e60012] to-[#ff6b6b]", category: "TVs" },
    { name: "ACs", icon: "/icons/ac.svg", color: "from-[#e60012] to-[#ff6b6b]", category: "ACs" },
    { name: "Refrigerators", icon: "/icons/battery2.svg", color: "from-[#e60012] to-[#ff6b6b]", category: "Refrigerators" },
    { name: "Audio", icon: "/icons/speaker.svg", color: "from-[#e60012] to-[#ff6b6b]", category: "Audio" }
  ];

  const handleCategoryClick = (category) => {
    setSelectedCategory(category)
    
    const repairSection = document.getElementById('repair-services-section')
    if (repairSection) {
      repairSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const resetCategory = () => {
    setSelectedCategory(null)
  }

  return (
    <main className="min-h-screen">
      <Header activePage="services" />
      
      {/* Hero Section with 3D elements and particles */}
      <section className="relative pt-24 pb-32 px-4 sm:px-8 overflow-hidden" style={{ background: 'var(--bg-color)' }}>
        {/* Animated background elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-[#e60012]/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-[#e60012]/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-[#e60012]/10 rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-5"></div>
        </div>
        
        <div className="container mx-auto max-w-6xl">
          <div 
            className={`flex flex-col items-center transition-all duration-1000 transform ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            <div className="inline-block px-4 py-1 rounded-full mb-4 border backdrop-blur-sm" 
              style={{ 
                background: isDarkMode ? 'linear-gradient(to right, var(--panel-dark), var(--panel-charcoal))' : 'var(--panel-charcoal)',
                borderColor: 'var(--border-color)' 
              }}
            >
              <span className="text-[#e60012] text-sm font-medium">Premium Repair Solutions</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-center leading-tight">
              Professional <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e60012] to-[#ff6b6b] relative">
                Repair Services
                <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#e60012] to-[#ff6b6b] rounded-full opacity-50"></span>
              </span>
            </h1>
            
            <p className="text-lg mb-10 text-center max-w-3xl" style={{ color: 'var(--text-secondary)' }}>
              Find the perfect repair service for your device and get it fixed by certified experts in your area with our quick and reliable solutions
            </p>
            
            {/* Enhanced CTA buttons with hover effects */}
            <div className="flex flex-wrap justify-center gap-4 mb-16">
              <button 
                onClick={() => setShowExpressBookingModal(true)}
                className="relative overflow-hidden group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-[#e60012] to-[#ff6b6b] rounded-full"></span>
                <span className="relative block bg-gradient-to-r from-[#e60012] to-[#ff6b6b] text-white px-8 py-4 rounded-full font-medium transform transition-all group-hover:shadow-lg group-hover:shadow-[#e60012]/20 group-hover:scale-[1.02]">
                  <span className="flex items-center">
                    Express Booking
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                </span>
              </button>
              
              <Link href="#service-pricing" className="relative group">
                <span className="absolute inset-0 rounded-full transform transition-all" 
                  style={{ 
                    backgroundColor: 'var(--text-main)', 
                    opacity: isDarkMode ? 0.05 : 0.1
                  }}
                ></span>
                <span className="relative block border px-8 py-4 rounded-full font-medium transform transition-all"
                  style={{ 
                    borderColor: 'var(--text-main)',
                    opacity: 0.8,
                    color: 'var(--text-main)'
                  }}
                >
                  View Pricing
                </span>
              </Link>
            </div>
            
            {/* Popular Categories Carousel */}
            <div className="w-full">
              <h2 className="text-xl font-bold mb-6 text-center">Popular Service Categories</h2>
              <div className="flex flex-wrap justify-center gap-4">
                {popularCategories.map((category, index) => (
                  <button 
                    key={index}
                    onClick={() => handleCategoryClick(category.category)}
                    className={`border rounded-xl p-4 flex flex-col items-center transition-all hover:border-[#e60012] hover:shadow-lg hover:shadow-[#e60012]/10 hover:scale-105 w-[120px] h-[120px] cursor-pointer ${
                      selectedCategory === category.category ? 'border-[#e60012] shadow-lg shadow-[#e60012]/20' : ''
                    }`}
                    style={{ 
                      background: isDarkMode 
                        ? 'linear-gradient(to bottom right, var(--panel-dark), var(--panel-charcoal))' 
                        : 'linear-gradient(to bottom right, var(--panel-charcoal), var(--panel-gray))',
                      borderColor: selectedCategory === category.category ? '#e60012' : 'var(--border-color)',
                      transitionDelay: `${index * 50}ms`
                    }}
                  >
                    <div className={`w-12 h-12 mb-3 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                      <Image 
                        src={category.icon} 
                        alt={category.name} 
                        width={24} 
                        height={24}
                        className="brightness-0 invert"
                      />
                    </div>
                    <span className="text-sm font-medium text-center">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Floating Stats with enhanced design */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 w-full">
              {[
                { number: "10K+", text: "Repairs Completed", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
                { number: "500+", text: "Expert Technicians", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
                { number: "50+", text: "Service Centers", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
                { number: "4.8/5", text: "Customer Rating", icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" },
              ].map((stat, index) => (
                <div 
                  key={index}
                  className="rounded-xl p-5 text-center transform transition-all duration-700 hover:border-[#333] group border"
                  style={{ 
                    background: 'linear-gradient(to bottom right, var(--panel-dark), var(--panel-charcoal))',
                    borderColor: 'var(--border-color)',
                    transitionDelay: `${index * 100 + 500}ms` 
                  }}
                >
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#e60012]/10 flex items-center justify-center group-hover:bg-[#e60012]/20 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#e60012]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} />
                    </svg>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#e60012] to-[#ff6b6b]">
                    {stat.number}
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }} className="text-sm mt-1">{stat.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Enhanced Service Finder Section */}
      <RepairServices initialCategory={selectedCategory} onReset={resetCategory} />
      
      {/* Enhanced Benefits Section */}
      <ExpertsBenefits />
      
      {/* New Section: Service Process */}
      <section className="py-20 sm:py-28 px-4 sm:px-8 relative overflow-hidden" style={{ 
        background: isDarkMode 
          ? 'linear-gradient(to bottom, var(--bg-color), var(--panel-dark))' 
          : 'linear-gradient(to bottom, var(--bg-color), var(--panel-charcoal))'
      }}>
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-[#e60012]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#e60012]/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1 rounded-full mb-4 border" style={{ 
              background: 'var(--panel-dark)', 
              borderColor: 'var(--border-color)' 
            }}>
              <span className="text-[#e60012] text-sm font-medium">Simple & Fast</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              How Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e60012] to-[#ff6b6b]">Service Works</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)' }} className="max-w-2xl mx-auto">
              We've simplified the repair process to get your devices fixed quickly and efficiently
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-24 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#e60012]/30 to-transparent"></div>
            
            {/* Step 1 */}
            <div className="rounded-xl p-6 relative hover:border-[#e60012] hover:shadow-lg hover:shadow-[#e60012]/10 transition-all group border" style={{ 
              background: 'var(--panel-dark)', 
              borderColor: 'var(--border-color)' 
            }}>
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-r from-[#e60012] to-[#ff6b6b] flex items-center justify-center text-white font-bold text-lg z-10">1</div>
              <div className="pt-8 text-center">
                <h3 className="text-xl font-bold mb-4">Book a Service</h3>
                <p style={{ color: 'var(--text-secondary)' }} className="mb-4">Select your device, issue, and preferred time slot for the service</p>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-[#e60012] opacity-75 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="rounded-xl p-6 relative hover:border-[#e60012] hover:shadow-lg hover:shadow-[#e60012]/10 transition-all group border" style={{ 
              background: 'var(--panel-dark)', 
              borderColor: 'var(--border-color)' 
            }}>
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-r from-[#e60012] to-[#ff6b6b] flex items-center justify-center text-white font-bold text-lg z-10">2</div>
              <div className="pt-8 text-center">
                <h3 className="text-xl font-bold mb-4">Expert Diagnosis</h3>
                <p style={{ color: 'var(--text-secondary)' }} className="mb-4">Our certified technician will diagnose the issue and provide a quote</p>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-[#e60012] opacity-75 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="rounded-xl p-6 relative hover:border-[#e60012] hover:shadow-lg hover:shadow-[#e60012]/10 transition-all group border" style={{ 
              background: 'var(--panel-dark)', 
              borderColor: 'var(--border-color)' 
            }}>
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-r from-[#e60012] to-[#ff6b6b] flex items-center justify-center text-white font-bold text-lg z-10">3</div>
              <div className="pt-8 text-center">
                <h3 className="text-xl font-bold mb-4">Quick Repair</h3>
                <p style={{ color: 'var(--text-secondary)' }} className="mb-4">Get your device fixed and back in your hands in no time</p>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-[#e60012] opacity-75 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* CTA Button */}
          <div className="mt-16 text-center">
            <Link href="/services/booking" className="inline-block bg-gradient-to-r from-[#e60012] to-[#ff6b6b] text-white px-8 py-4 rounded-full font-medium hover:shadow-lg hover:shadow-[#e60012]/20 transition-all transform hover:scale-[1.02]">
              Get Started Now
            </Link>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section id="service-pricing" className="py-20 sm:py-28 px-4 sm:px-8 relative overflow-hidden" style={{ background: 'var(--bg-color)' }}>
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1 rounded-full mb-4 border" style={{ 
              background: 'var(--panel-dark)', 
              borderColor: 'var(--border-color)' 
            }}>
              <span className="text-[#e60012] text-sm font-medium">Transparent Pricing</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Service <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e60012] to-[#ff6b6b]">Pricing</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)' }} className="max-w-2xl mx-auto">
              We offer competitive pricing with no hidden fees
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Basic Service */}
            <div className="border rounded-xl overflow-hidden transition-all hover:border-[#e60012] hover:shadow-lg hover:shadow-[#e60012]/10" style={{ 
              background: 'linear-gradient(to bottom right, var(--panel-dark), var(--panel-charcoal))',
              borderColor: 'var(--border-color)'
            }}>
              <div className="p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <h3 className="text-xl font-bold mb-2">Basic Diagnostics</h3>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold">₹499</span>
                  <span style={{ color: 'var(--text-secondary)' }} className="text-sm mb-1">onwards</span>
                </div>
                <p style={{ color: 'var(--text-secondary)' }} className="text-sm mt-2">Perfect for simple issues and quick fixes</p>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {["Complete device inspection", "Software diagnostics", "Minor repairs", "30-day service warranty"].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#e60012] mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm" style={{ color: 'var(--text-main)' }}>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/services/booking?plan=basic" className="mt-6 block w-full py-2 px-4 bg-transparent border border-[#e60012] text-[#e60012] rounded-lg text-center font-medium hover:bg-[#e60012] hover:text-white transition-colors">
                  Book Service
                </Link>
              </div>
            </div>
            
            {/* Standard Service */}
            <div className="border border-[#e60012] rounded-xl overflow-hidden transition-all hover:shadow-lg hover:shadow-[#e60012]/20 relative transform hover:scale-[1.02]" style={{ 
              background: 'linear-gradient(to bottom right, var(--panel-dark), var(--panel-charcoal))'
            }}>
              <div className="absolute top-0 right-0">
                <div className="bg-[#e60012] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">POPULAR</div>
              </div>
              <div className="p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <h3 className="text-xl font-bold mb-2">Standard Repair</h3>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold">₹999</span>
                  <span style={{ color: 'var(--text-secondary)' }} className="text-sm mb-1">onwards</span>
                </div>
                <p style={{ color: 'var(--text-secondary)' }} className="text-sm mt-2">Comprehensive repair for most common issues</p>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {["All Basic features", "Hardware repairs", "Component replacement", "90-day service warranty", "Free follow-up check"].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#e60012] mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm" style={{ color: 'var(--text-main)' }}>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/services/booking?plan=standard" className="mt-6 block w-full py-2 px-4 bg-gradient-to-r from-[#e60012] to-[#ff6b6b] text-white rounded-lg text-center font-medium hover:shadow-lg hover:shadow-[#e60012]/20 transition-all">
                  Book Service
                </Link>
              </div>
            </div>
            
            {/* Premium Service */}
            <div className="border rounded-xl overflow-hidden transition-all hover:border-[#e60012] hover:shadow-lg hover:shadow-[#e60012]/10" style={{ 
              background: 'linear-gradient(to bottom right, var(--panel-dark), var(--panel-charcoal))',
              borderColor: 'var(--border-color)'
            }}>
              <div className="p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <h3 className="text-xl font-bold mb-2">Premium Service</h3>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold">₹1999</span>
                  <span style={{ color: 'var(--text-secondary)' }} className="text-sm mb-1">onwards</span>
                </div>
                <p style={{ color: 'var(--text-secondary)' }} className="text-sm mt-2">Complete overhaul and advanced repairs</p>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {["All Standard features", "Advanced diagnostics", "Major component replacement", "Priority service", "1-year service warranty", "Free maintenance check-ups"].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#e60012] mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm" style={{ color: 'var(--text-main)' }}>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/services/booking?plan=premium" className="mt-6 block w-full py-2 px-4 bg-transparent border border-[#e60012] text-[#e60012] rounded-lg text-center font-medium hover:bg-[#e60012] hover:text-white transition-colors">
                  Book Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
      
      {/* Express Booking Modal */}
      <ExpressBookingModal 
        isOpen={showExpressBookingModal}
        onClose={() => setShowExpressBookingModal(false)}
      />
    </main>
  )
} 