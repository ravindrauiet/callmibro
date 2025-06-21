'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Services() {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
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
  }, [])

  const services = [
    {
      title: "Mobile Repairs",
      description: "Professional screen & battery replacement services",
      icon: "/icons/mobile-screen.svg",
      url: "/services?category=mobile",
      primary: true
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
      primary: true
    },
    {
      title: "Refrigerator Fix",
      description: "Professional compressor & seal replacement",
      icon: "/icons/battery.svg", // Using battery icon as placeholder for refrigerator
      url: "/services?category=refrigerator",
      primary: false
    }
  ]

  return (
    <section id="services-section" className="relative py-20 sm:py-28 px-4 sm:px-8 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-black to-[#111] -z-10"></div>
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#e60012]/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-[#e60012]/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto max-w-6xl">
        {/* Section Heading */}
        <div 
          className={`mb-12 md:mb-16 text-center transform transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="inline-block bg-[#111] px-4 py-1 rounded-full mb-4 border border-[#333]">
            <span className="text-[#e60012] text-sm font-medium">Expert Solutions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Our Premium <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e60012] to-[#ff6b6b]">Repair Categories</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Choose from our wide range of professional repair services designed for quality and reliability
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {services.map((service, index) => (
            <Link 
              href={service.url} 
              key={index}
              className={`group bg-[#111] border border-[#222] hover:border-[#e60012] p-6 rounded-xl transition-all hover:shadow-lg hover:shadow-[#e60012]/10 transform ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              } transition-all duration-700 delay-${index * 100}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className={`w-16 h-16 mb-6 p-3 rounded-lg ${service.primary ? 'bg-gradient-to-r from-[#e60012] to-[#ff6b6b]' : 'bg-[#333]'} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
                <Image 
                  src={service.icon} 
                  alt={service.title} 
                  width={30} 
                  height={30}
                  className="brightness-[10]"
                />
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-[#e60012] transition-colors">{service.title}</h3>
              <p className="text-gray-400 text-sm">{service.description}</p>
              
              <div className="mt-6 flex items-center text-sm text-[#e60012] font-medium opacity-0 group-hover:opacity-100 transform group-hover:translate-x-0 -translate-x-2 transition-all duration-300">
                <span>Learn more</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
} 