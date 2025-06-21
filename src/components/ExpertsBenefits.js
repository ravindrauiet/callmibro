'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'

export default function ExpertsBenefits() {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setIsVisible(true)
      }
    }, {
      threshold: 0.1
    })
    
    const element = document.getElementById('experts-benefits')
    if (element) observer.observe(element)
    
    return () => {
      if (element) observer.unobserve(element)
    }
  }, [])

  const benefits = [
    {
      id: 1,
      title: "Certified Pros",
      description: "Our technicians undergo extensive training and certification to ensure top-quality repairs",
      icon: "/icons/certified.svg",
      color: "from-[#ff4b4b] to-[#ff7676]"
    },
    {
      id: 2,
      title: "On-time Guarantee",
      description: "We guarantee punctual service with specific time slots and real-time technician tracking",
      icon: "/icons/ontime.svg",
      color: "from-[#3366ff] to-[#5c8aff]"
    },
    {
      id: 3,
      title: "Transparent Pricing",
      description: "Get detailed cost breakdowns upfront with no hidden fees or surprise charges",
      icon: "/icons/pricing.svg",
      color: "from-[#00ccb8] to-[#39e5d5]"
    },
    {
      id: 4,
      title: "Secure Payments",
      description: "Multiple payment options with state-of-the-art encryption for your financial security",
      icon: "/icons/secure.svg",
      color: "from-[#6b46c1] to-[#8a63d2]"
    }
  ]

  return (
    <section id="experts-benefits" className="py-20 sm:py-28 px-4 sm:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#111] to-black -z-10"></div>
      <div className="absolute top-0 right-1/4 w-64 h-64 bg-[#e60012]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-[#e60012]/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Section Heading */}
        <div 
          className={`mb-16 text-center transform transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="inline-block bg-[#111] px-4 py-1 rounded-full mb-4 border border-[#333]">
            <span className="text-[#e60012] text-sm font-medium">Service Excellence</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Why Choose Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e60012] to-[#ff6b6b]">Experts</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Experience premium service quality with our team of experienced technicians and industry-leading standards
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={benefit.id} 
              className={`bg-[#111] border border-[#222] rounded-xl p-6 transform transition-all duration-700 hover:border-[#e60012] hover:shadow-lg hover:shadow-[#e60012]/10 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 100 + 500}ms` }}
            >
              <div className={`w-16 h-16 mb-6 p-3 rounded-lg bg-gradient-to-br ${benefit.color} flex items-center justify-center transform hover:scale-110 transition-transform duration-300`}>
                <div className="brightness-[10]">
                  <Image 
                    src={benefit.icon} 
                    alt={benefit.title} 
                    width={30}
                    height={30}
                    className="object-contain"
                  />
                </div>
              </div>
              
              <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
              <p className="text-gray-400 text-sm">{benefit.description}</p>
            </div>
          ))}
        </div>
        
        {/* Call to Action */}
        <div className={`mt-16 text-center transform transition-all duration-700 delay-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <button className="bg-gradient-to-r from-[#e60012] to-[#ff6b6b] text-white px-8 py-3 rounded-full font-medium hover:shadow-lg hover:shadow-[#e60012]/20 transition-all">
            Book Our Experts
          </button>
        </div>
      </div>
    </section>
  )
} 