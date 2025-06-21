'use client'

import Header from '../../components/Header'
import Footer from '../../components/Footer'
import RepairServices from '../../components/RepairServices'
import ExpertsBenefits from '../../components/ExpertsBenefits'
import { useState, useEffect } from 'react'

export default function ServicesPage() {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <main className="min-h-screen bg-black text-white">
      <Header activePage="services" />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-4 sm:px-8 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-[#e60012]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-[#e60012]/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto max-w-6xl">
          <div 
            className={`flex flex-col items-center transition-all duration-1000 transform ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            <div className="inline-block bg-[#111] px-4 py-1 rounded-full mb-4 border border-[#333]">
              <span className="text-[#e60012] text-sm font-medium">Expert Repair Solutions</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-center">
              Professional <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e60012] to-[#ff6b6b]">Repair Services</span>
            </h1>
            
            <p className="text-gray-400 text-lg mb-8 text-center max-w-3xl">
              Find the perfect repair service for your device and get it fixed by certified experts in your area
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <button className="bg-gradient-to-r from-[#e60012] to-[#ff6b6b] text-white px-8 py-3 rounded-full font-medium hover:shadow-lg hover:shadow-[#e60012]/20 transition-all">
                Book Now
              </button>
              <button className="bg-transparent border border-white/20 text-white px-8 py-3 rounded-full font-medium hover:border-[#e60012] transition-all">
                View Pricing
              </button>
            </div>
            
            {/* Floating Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 w-full">
              {[
                { number: "10K+", text: "Repairs Completed" },
                { number: "500+", text: "Expert Technicians" },
                { number: "50+", text: "Service Centers" },
                { number: "4.8/5", text: "Customer Rating" },
              ].map((stat, index) => (
                <div 
                  key={index}
                  className="bg-[#111] border border-[#222] rounded-xl p-4 text-center transform transition-all duration-700"
                  style={{ transitionDelay: `${index * 100 + 500}ms` }}
                >
                  <div className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#e60012] to-[#ff6b6b]">
                    {stat.number}
                  </div>
                  <div className="text-gray-400 text-sm mt-1">{stat.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      <RepairServices />
      <ExpertsBenefits />
      <Footer />
    </main>
  )
} 