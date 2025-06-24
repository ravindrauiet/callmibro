'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import BrandSelection from '../../../components/service-booking/BrandSelection'
import ModelSelection from '../../../components/service-booking/ModelSelection'
import BookingForm from '../../../components/service-booking/BookingForm'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'

export default function ServiceDetailPage({ params }) {
  const [step, setStep] = useState('brands')
  const [selectedService, setSelectedService] = useState('')
  const [selectedBrand, setSelectedBrand] = useState(null)
  const [selectedModel, setSelectedModel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isVisible, setIsVisible] = useState(false)
  const router = useRouter()
  const { currentUser } = useAuth()
  const { isDarkMode } = useTheme()

  useEffect(() => {
    // Set visibility for animations
    setIsVisible(true)
    
    // Decode the service name from the URL and format it properly
    if (params && params.service) {
      try {
        setLoading(true)
        
        const decodedService = decodeURIComponent(params.service);
        
        // Convert to title case and replace hyphens with spaces
        const formattedService = decodedService
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        setSelectedService(formattedService);
        setLoading(false)
        
        // Show success toast
        toast.success(`Service loaded: ${formattedService}`)
      } catch (error) {
        console.error("Error processing service parameter:", error);
        setError(`Unable to load service details: ${error.message}`);
        setLoading(false)
      }
    } else {
      setError("No service specified in URL parameters")
      setLoading(false)
    }
  }, [params])

  const handleBrandSelect = (brand) => {
    setSelectedBrand(brand)
    setStep('models')
    // Scroll to top when changing steps
    window.scrollTo(0, 0)
    toast.success(`Brand selected: ${brand.name}`)
  }

  const handleModelSelect = (model) => {
    setSelectedModel(model)
    setStep('booking')
    // Scroll to top when changing steps
    window.scrollTo(0, 0)
    toast.success(`Model selected: ${model.name}`)
  }

  const handleGoBack = () => {
    if (step === 'models') {
      setStep('brands')
      setSelectedBrand(null)
      toast.success('Back to brand selection')
    } else if (step === 'booking') {
      setStep('models')
      setSelectedModel(null)
      toast.success('Back to model selection')
    }
  }

  const handleBookingComplete = (bookingId) => {
    toast.success('Your booking has been successfully created!')
    // Navigate to a confirmation page with the booking ID
    router.push(`/services/booking-confirmation?bookingId=${bookingId}`)
  }

  const handleExpressBooking = () => {
    // Skip to booking form with default brand and model
    if (!currentUser) {
      toast.error('You need to log in to use express booking')
      document.getElementById('login-btn')?.click()
      return
    }

    // Set default brand and model
    const defaultBrand = { id: 'express-default', name: 'Any Brand' }
    const defaultModel = { 
      id: 'express-default', 
      name: 'Standard Service', 
      price: null 
    }
    
    setSelectedBrand(defaultBrand)
    setSelectedModel(defaultModel)
    setStep('booking')
    
    // Scroll to top
    window.scrollTo(0, 0)
    toast.success('Quick booking activated. Complete your details to proceed.')
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg-color)', color: 'var(--text-main)' }}>
        <Header activePage="services" />
        
        <main className="relative py-16 px-4">
          {/* Background Elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-[#e60012]/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-[#e60012]/5 rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-6xl mx-auto text-center">
            <div className="w-16 h-16 border-4 border-t-transparent border-[#e60012] rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold mb-2">Loading Service Details</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Please wait while we prepare your booking experience</p>
          </div>
        </main>
        
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg-color)', color: 'var(--text-main)' }}>
        <Header activePage="services" />
        
        <main className="relative py-16 px-4">
          {/* Background Elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-[#e60012]/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-[#e60012]/5 rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <div className="rounded-xl p-8 text-center border" style={{ 
              background: 'var(--panel-dark)', 
              borderColor: 'var(--border-color)' 
            }}>
              <div className="w-16 h-16 rounded-full bg-[#e60012]/20 flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#e60012]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-4">{error}</h2>
              <button
                onClick={() => router.push('/services')}
                className="bg-gradient-to-r from-[#e60012] to-[#ff6b6b] text-white px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-[#e60012]/20 transition-all"
              >
                Back to Services
              </button>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-color)', color: 'var(--text-main)' }}>
      <Header activePage="services" />
      
      <main className="relative py-16 px-4">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-[#e60012]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-[#e60012]/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-6xl mx-auto">
          {/* Service Header */}
          <div 
            className={`mb-12 text-center transform transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            <div className="inline-block px-4 py-1 rounded-full mb-4 border" style={{ 
              background: 'var(--panel-dark)', 
              borderColor: 'var(--border-color)' 
            }}>
              <span className="text-[#e60012] text-sm font-medium">Professional Service</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e60012] to-[#ff6b6b]">
                {selectedService}
              </span>
            </h1>
            
            <p style={{ color: 'var(--text-secondary)' }} className="max-w-2xl mx-auto mb-8">
              Follow the steps below to book your {selectedService.toLowerCase()} service with one of our certified technicians
            </p>
            
            {/* Express Booking Option */}
            <div className="max-w-md mx-auto">
              <button 
                onClick={handleExpressBooking}
                className="w-full py-4 px-6 bg-gradient-to-r from-[#e60012] to-[#ff6b6b] hover:from-[#d40010] hover:to-[#e55b5b] text-white font-medium text-lg rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Continue to Book Your Service
              </button>
              <p style={{ color: 'var(--text-secondary)' }} className="text-sm mt-2">Skip brand & model selection for faster booking</p>
            </div>
          </div>

          {/* Progress steps */}
          <div 
            className={`max-w-3xl mx-auto mb-10 transform transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            <div className="flex justify-between relative">
              <div className="flex flex-col items-center z-10">
                <div className={`w-12 h-12 rounded-full ${
                  step === 'brands' 
                    ? 'bg-gradient-to-r from-[#e60012] to-[#ff6b6b]' 
                    : 'bg-gradient-to-r from-[#22c55e] to-[#16a34a]'
                } flex items-center justify-center shadow-lg ${
                  step === 'brands' ? 'animate-pulse-slow' : ''
                }`}>
                  <span className="text-white font-medium">{step === 'brands' ? '1' : '✓'}</span>
                </div>
                <span className={`text-sm mt-2 ${step === 'brands' ? 'font-medium' : ''}`} style={{ 
                  color: step === 'brands' ? 'var(--text-main)' : 'var(--text-secondary)' 
                }}>Select Brand</span>
              </div>
              
              <div className="flex flex-col items-center z-10">
                <div className={`w-12 h-12 rounded-full ${
                  step === 'models' 
                    ? 'bg-gradient-to-r from-[#e60012] to-[#ff6b6b]' 
                    : step === 'booking' 
                      ? 'bg-gradient-to-r from-[#22c55e] to-[#16a34a]' 
                      : 'bg-opacity-20'
                } flex items-center justify-center shadow-lg ${
                  step === 'models' ? 'animate-pulse-slow' : ''
                }`} style={{ 
                  backgroundColor: step !== 'models' && step !== 'booking' ? 'var(--panel-dark)' : undefined 
                }}>
                  <span className="text-white font-medium">
                    {step === 'brands' ? '2' : step === 'models' ? '2' : '✓'}
                  </span>
                </div>
                <span className={`text-sm mt-2 ${step === 'models' ? 'font-medium' : ''}`} style={{ 
                  color: step === 'models' ? 'var(--text-main)' : 'var(--text-secondary)' 
                }}>Select Model</span>
              </div>
              
              <div className="flex flex-col items-center z-10">
                <div className={`w-12 h-12 rounded-full ${
                  step === 'booking' 
                    ? 'bg-gradient-to-r from-[#e60012] to-[#ff6b6b]' 
                    : 'bg-opacity-20'
                } flex items-center justify-center shadow-lg ${
                  step === 'booking' ? 'animate-pulse-slow' : ''
                }`} style={{ 
                  backgroundColor: step !== 'booking' ? 'var(--panel-dark)' : undefined 
                }}>
                  <span className="text-white font-medium">3</span>
                </div>
                <span className={`text-sm mt-2 ${step === 'booking' ? 'font-medium' : ''}`} style={{ 
                  color: step === 'booking' ? 'var(--text-main)' : 'var(--text-secondary)' 
                }}>Book Service</span>
              </div>
              
              {/* Progress bar */}
              <div className="absolute top-6 left-0 w-full h-0.5 -z-0" style={{ backgroundColor: 'var(--border-color)' }}>
                <div 
                  className="h-full bg-gradient-to-r from-[#e60012] to-[#ff6b6b] transition-all duration-500"
                  style={{ 
                    width: step === 'brands' ? '0%' : step === 'models' ? '50%' : '100%' 
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Back button if not on the first step */}
          {step !== 'brands' && (
            <div 
              className={`max-w-3xl mx-auto mb-6 transform transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <button 
                onClick={handleGoBack}
                className="flex items-center hover:text-[#e60012] transition-colors group"
                style={{ color: 'var(--text-secondary)' }}
              >
                <div className="w-8 h-8 rounded-full border flex items-center justify-center mr-2 group-hover:border-[#e60012] transition-colors"
                  style={{ borderColor: 'var(--border-color)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Back to previous step</span>
              </button>
            </div>
          )}

          {/* Content based on current step */}
          <div 
            className={`border rounded-xl p-6 md:p-8 shadow-xl max-w-3xl mx-auto transform transition-all duration-1000 delay-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
            style={{ 
              background: 'var(--panel-dark)', 
              borderColor: 'var(--border-color)' 
            }}
          >
            {step === 'brands' && (
              <BrandSelection 
                service={selectedService} 
                onBrandSelect={handleBrandSelect} 
              />
            )}

            {step === 'models' && selectedBrand && (
              <ModelSelection 
                service={selectedService}
                brand={selectedBrand}
                onModelSelect={handleModelSelect}
              />
            )}

            {step === 'booking' && selectedBrand && selectedModel && (
              <BookingForm 
                service={selectedService}
                brand={selectedBrand}
                model={selectedModel}
                onComplete={handleBookingComplete}
              />
            )}
          </div>
          
          {/* Service Benefits */}
          <div 
            className={`mt-16 max-w-3xl mx-auto transform transition-all duration-1000 delay-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { 
                  title: "Expert Technicians", 
                  description: "Highly trained specialists with years of experience",
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  )
                },
                { 
                  title: "90-Day Warranty", 
                  description: "All our repairs come with a solid warranty",
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  )
                },
                { 
                  title: "Genuine Parts", 
                  description: "We only use authentic replacement parts",
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )
                }
              ].map((benefit, index) => (
                <div 
                  key={index} 
                  className="border rounded-lg p-4 flex items-start"
                  style={{ 
                    background: 'var(--panel-dark)', 
                    borderColor: 'var(--border-color)',
                    transitionDelay: `${index * 100 + 800}ms` 
                  }}
                >
                  <div className="mr-4 rounded-full bg-[#e60012]/10 p-3 text-[#e60012]">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">{benefit.title}</h3>
                    <p style={{ color: 'var(--text-secondary)' }} className="text-sm">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
} 