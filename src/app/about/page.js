'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Image from 'next/image'

export default function AboutPage() {
  const { isDarkMode } = useTheme()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const stats = [
    { number: "50,000+", label: "Happy Customers" },
    { number: "500+", label: "Expert Technicians" },
    { number: "100+", label: "Cities Covered" },
    { number: "24/7", label: "Customer Support" }
  ]

  const values = [
    {
      title: "Quality First",
      description: "We never compromise on the quality of our services. Every repair is done with precision and care.",
      icon: "🔧"
    },
    {
      title: "Customer Trust",
      description: "Building long-term relationships through transparency, reliability, and exceptional service.",
      icon: "🤝"
    },
    {
      title: "Innovation",
      description: "Constantly evolving our technology and processes to provide better service experiences.",
      icon: "💡"
    },
    {
      title: "Accessibility",
      description: "Making professional repair services accessible to everyone, everywhere in India.",
      icon: "🌍"
    }
  ]

  const team = [
    {
      name: "Rajesh Kumar",
      role: "Founder & CEO",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      bio: "15+ years in electronics and appliance repair industry"
    },
    {
      name: "Priya Sharma",
      role: "Head of Operations",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      bio: "Expert in service delivery and customer experience"
    },
    {
      name: "Amit Patel",
      role: "Technical Director",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      bio: "Certified technician with 12+ years of experience"
    },
    {
      name: "Sneha Reddy",
      role: "Customer Success Manager",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      bio: "Dedicated to ensuring customer satisfaction"
    }
  ]

  return (
    <div className="min-h-screen flex flex-col" style={{ 
      background: isDarkMode 
        ? 'linear-gradient(to bottom, var(--bg-color), var(--panel-dark))' 
        : 'linear-gradient(to bottom, var(--bg-color), var(--panel-charcoal))'
    }}>
      <Header />
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className={`text-center mb-16 transform transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: 'var(--text-main)' }}>
              About <span className="bg-gradient-to-r from-[#e60012] to-[#ff6b6b] bg-clip-text text-transparent">CallMiBro</span>
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              India's most trusted appliance and device repair service, bringing expert technicians to your doorstep since 2020.
            </p>
          </div>

          {/* Mission Section */}
          <div className={`mb-16 transform transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-main)' }}>
                  Our Mission
                </h2>
                <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
                  To revolutionize the repair industry by making professional, reliable, and affordable device repair services 
                  accessible to every household in India. We believe that quality repair services should be just a call away.
                </p>
                <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
                  Our platform connects skilled technicians with customers who need reliable repair services for their 
                  smartphones, laptops, TVs, ACs, refrigerators, and other electronic devices.
                </p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#e60012] to-[#ff6b6b] flex items-center justify-center">
                    <span className="text-white text-xl">✓</span>
                  </div>
                  <span className="text-lg font-medium" style={{ color: 'var(--text-main)' }}>
                    Trusted by 50,000+ customers across India
                  </span>
                </div>
              </div>
              <div className="relative">
                <div className="w-full h-80 rounded-2xl overflow-hidden shadow-lg" style={{ 
                  background: isDarkMode 
                    ? 'linear-gradient(to bottom, var(--panel-dark), var(--panel-charcoal))' 
                    : 'var(--panel-dark)',
                  borderColor: 'var(--border-color)',
                  borderWidth: '1px'
                }}>
                  <Image
                    src="/hero.jpg"
                    alt="CallMiBro Team"
                    width={600}
                    height={400}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className={`mb-16 transform transition-all duration-700 delay-400 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className="text-center p-6 rounded-xl shadow-lg"
                  style={{ 
                    background: isDarkMode 
                      ? 'linear-gradient(to bottom, var(--panel-dark), var(--panel-charcoal))' 
                      : 'var(--panel-dark)',
                    borderColor: 'var(--border-color)',
                    borderWidth: '1px'
                  }}
                >
                  <div className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-[#e60012] to-[#ff6b6b] bg-clip-text text-transparent">
                    {stat.number}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Values Section */}
          <div className={`mb-16 transform transition-all duration-700 delay-600 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <h2 className="text-3xl font-bold text-center mb-12" style={{ color: 'var(--text-main)' }}>
              Our Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <div 
                  key={index}
                  className="p-6 rounded-xl text-center shadow-lg"
                  style={{ 
                    background: isDarkMode 
                      ? 'linear-gradient(to bottom, var(--panel-dark), var(--panel-charcoal))' 
                      : 'var(--panel-dark)',
                    borderColor: 'var(--border-color)',
                    borderWidth: '1px'
                  }}
                >
                  <div className="text-4xl mb-4">{value.icon}</div>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-main)' }}>
                    {value.title}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Story Section */}
          <div className={`mb-16 transform transition-all duration-700 delay-800 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <div className="w-full h-80 rounded-2xl overflow-hidden shadow-lg" style={{ 
                  background: isDarkMode 
                    ? 'linear-gradient(to bottom, var(--panel-dark), var(--panel-charcoal))' 
                    : 'var(--panel-dark)',
                  borderColor: 'var(--border-color)',
                  borderWidth: '1px'
                }}>
                  <Image
                    src="/product-deals.jpg"
                    alt="Our Story"
                    width={600}
                    height={400}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-main)' }}>
                  Our Story
                </h2>
                <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
                  CallMiBro was born from a simple observation: finding reliable repair services was a nightmare. 
                  Customers were often left with broken devices, unreliable service providers, and no accountability.
                </p>
                <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
                  In 2020, we set out to change this by creating a platform that connects verified, skilled technicians 
                  with customers who need quality repair services. Today, we're proud to serve thousands of customers 
                  across India with our reliable, transparent, and professional repair services.
                </p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#e60012] to-[#ff6b6b] flex items-center justify-center">
                    <span className="text-white text-xl">🏆</span>
                  </div>
                  <span className="text-lg font-medium" style={{ color: 'var(--text-main)' }}>
                    Award-winning service quality
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Team Section */}
          <div className={`mb-16 transform transition-all duration-700 delay-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <h2 className="text-3xl font-bold text-center mb-12" style={{ color: 'var(--text-main)' }}>
              Meet Our Team
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member, index) => (
                <div 
                  key={index}
                  className="text-center p-6 rounded-xl shadow-lg"
                  style={{ 
                    background: isDarkMode 
                      ? 'linear-gradient(to bottom, var(--panel-dark), var(--panel-charcoal))' 
                      : 'var(--panel-dark)',
                    borderColor: 'var(--border-color)',
                    borderWidth: '1px'
                  }}
                >
                  <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4">
                    <Image
                      src={member.image}
                      alt={member.name}
                      width={96}
                      height={96}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-main)' }}>
                    {member.name}
                  </h3>
                  <p className="text-sm mb-3 bg-gradient-to-r from-[#e60012] to-[#ff6b6b] bg-clip-text text-transparent font-medium">
                    {member.role}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {member.bio}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className={`text-center transform transition-all duration-700 delay-1200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="p-8 rounded-2xl shadow-lg" style={{ 
              background: isDarkMode 
                ? 'linear-gradient(to bottom, var(--panel-dark), var(--panel-charcoal))' 
                : 'var(--panel-dark)',
              borderColor: 'var(--border-color)',
              borderWidth: '1px'
            }}>
              <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-main)' }}>
                Ready to Experience Quality Repair Services?
              </h2>
              <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                Join thousands of satisfied customers who trust CallMiBro for their device repair needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-gradient-to-r from-[#e60012] to-[#ff6b6b] text-white px-8 py-3 rounded-lg font-medium hover:from-[#d4000e] hover:to-[#e65b5b] transition-all">
                  Book a Service
                </button>
                <button className="border border-[#e60012] text-[#e60012] px-8 py-3 rounded-lg font-medium hover:bg-[#e60012] hover:text-white transition-all">
                  Contact Us
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
} 