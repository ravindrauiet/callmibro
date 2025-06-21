'use client'

import { useState, useEffect } from 'react'

export default function Timeline() {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setIsVisible(true)
      }
    }, {
      threshold: 0.2
    })
    
    const element = document.getElementById('timeline-section')
    if (element) observer.observe(element)
    
    return () => {
      if (element) observer.unobserve(element)
    }
  }, [])

  const steps = [
    {
      number: 1,
      title: "Choose Your Device",
      description: "Select your device type and specific issue from our comprehensive service catalog",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      primary: true
    },
    {
      number: 2,
      title: "Book a Technician",
      description: "Schedule your preferred time slot with one of our certified expert technicians",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      primary: false
    },
    {
      number: 3,
      title: "Track & Monitor",
      description: "Follow your technician's arrival and service progress with real-time updates",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      primary: true
    },
    {
      number: 4,
      title: "Payment & Warranty",
      description: "Pay securely after service completion and enjoy our satisfaction guarantee",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      primary: false
    }
  ]

  return (
    <section id="timeline-section" className="py-20 sm:py-28 px-4 sm:px-8 relative overflow-hidden bg-gradient-to-b from-[#111] to-black">
      {/* Background blur elements */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#e60012]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#e60012]/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Section heading */}
        <div 
          className={`mb-20 text-center transform transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="inline-block bg-[#111] px-4 py-1 rounded-full mb-4 border border-[#333]">
            <span className="text-[#e60012] text-sm font-medium">Simple Process</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            How It <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e60012] to-[#ff6b6b]">Works</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Our streamlined booking process makes getting expert repairs quick and easy
          </p>
        </div>
        
        {/* Desktop Timeline */}
        <div className="hidden md:grid grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`relative transform transition-all duration-1000 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="absolute top-8 left-[60%] right-0 h-0.5 bg-gradient-to-r from-[#e60012] to-[#333]"></div>
              )}
              
              {/* Step Content */}
              <div className="text-center relative">
                {/* Animated Circle */}
                <div className={`relative inline-flex mb-6 ${isVisible ? 'animate-pulse-slow' : ''}`}>
                  {/* Outer Circle */}
                  <div className="absolute inset-0 rounded-full bg-[#e60012]/20 scale-125"></div>
                  {/* Inner Circle */}
                  <div className={`w-16 h-16 ${step.primary ? 'bg-gradient-to-r from-[#e60012] to-[#ff6b6b]' : 'bg-[#333]'} rounded-full flex items-center justify-center z-10 shadow-lg`}>
                    {step.icon}
                  </div>
                  {/* Number Badge */}
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white text-[#111] flex items-center justify-center text-xs font-bold z-20">
                    {step.number}
                  </div>
                </div>
                
                {/* Text Content */}
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm px-4">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Mobile Timeline (vertical) */}
        <div className="md:hidden flex flex-col items-start">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`relative flex items-start mb-12 last:mb-0 transform transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              {/* Vertical line connecting steps */}
              {index < steps.length - 1 && (
                <div className="absolute top-16 left-8 w-0.5 h-[calc(100%+12px)] bg-gradient-to-b from-[#e60012] to-[#333]"></div>
              )}
              
              {/* Step Content */}
              <div className="flex flex-col items-center mr-6 relative">
                {/* Circle */}
                <div className={`w-16 h-16 ${step.primary ? 'bg-gradient-to-r from-[#e60012] to-[#ff6b6b]' : 'bg-[#333]'} rounded-full flex items-center justify-center z-10 mb-2 shadow-lg`}>
                  {step.icon}
                  
                  {/* Number Badge */}
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white text-[#111] flex items-center justify-center text-xs font-bold">
                    {step.number}
                  </div>
                </div>
              </div>
              
              {/* Text Content */}
              <div className="flex-1 pt-2">
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 