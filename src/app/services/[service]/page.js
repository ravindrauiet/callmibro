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

export default function ServiceDetailPage({ params }) {
  const [step, setStep] = useState('brands')
  const [selectedService, setSelectedService] = useState('')
  const [selectedBrand, setSelectedBrand] = useState(null)
  const [selectedModel, setSelectedModel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()

  useEffect(() => {
    // Decode the service name from the URL and format it properly
    if (params.service) {
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
      } catch (error) {
        console.error("Error processing service parameter:", error);
        setError("Unable to load service details. Please try again.");
        setLoading(false)
      }
    } else {
      router.push('/services')
    }
  }, [params.service, router])

  const handleBrandSelect = (brand) => {
    setSelectedBrand(brand)
    setStep('models')
    // Scroll to top when changing steps
    window.scrollTo(0, 0)
  }

  const handleModelSelect = (model) => {
    setSelectedModel(model)
    setStep('booking')
    // Scroll to top when changing steps
    window.scrollTo(0, 0)
  }

  const handleGoBack = () => {
    if (step === 'models') {
      setStep('brands')
      setSelectedBrand(null)
    } else if (step === 'booking') {
      setStep('models')
      setSelectedModel(null)
    }
  }

  const handleBookingComplete = () => {
    toast.success('Your booking has been successfully created!')
    // Navigate to a confirmation page 
    router.push('/services/booking-confirmation')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header activePage="services" />
        
        <main className="py-10 px-4 max-w-6xl mx-auto text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[#e60012] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-xl">Loading service details...</p>
        </main>
        
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header activePage="services" />
        
        <main className="py-10 px-4 max-w-6xl mx-auto text-center">
          <div className="bg-red-900/30 text-red-300 p-6 rounded-lg mb-6">
            <p className="text-xl">{error}</p>
          </div>
          <button
            onClick={() => router.push('/services')}
            className="bg-[#e60012] text-white px-4 py-2 rounded hover:bg-[#b3000f]"
          >
            Back to Services
          </button>
        </main>
        
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header activePage="services" />
      
      <main className="py-10 px-4 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center">{selectedService}</h1>
          <p className="text-gray-400 text-center mt-2">
            Select your device details to book a service
          </p>
        </div>

        {/* Progress steps */}
        <div className="max-w-3xl mx-auto mb-10">
          <div className="flex justify-between relative">
            <div className="flex flex-col items-center z-10">
              <div className={`w-10 h-10 rounded-full ${step === 'brands' ? 'bg-[#e60012]' : 'bg-green-600'} flex items-center justify-center`}>
                <span className="text-white">{step === 'brands' ? '1' : '✓'}</span>
              </div>
              <span className={`text-sm mt-2 ${step === 'brands' ? 'text-white font-medium' : 'text-gray-400'}`}>Select Brand</span>
            </div>
            
            <div className="flex flex-col items-center z-10">
              <div className={`w-10 h-10 rounded-full ${step === 'models' ? 'bg-[#e60012]' : step === 'booking' ? 'bg-green-600' : 'bg-gray-700'} flex items-center justify-center`}>
                <span className="text-white">{step === 'models' ? '2' : step === 'booking' ? '✓' : '2'}</span>
              </div>
              <span className={`text-sm mt-2 ${step === 'models' ? 'text-white font-medium' : step === 'booking' ? 'text-gray-400' : 'text-gray-500'}`}>Select Model</span>
            </div>
            
            <div className="flex flex-col items-center z-10">
              <div className={`w-10 h-10 rounded-full ${step === 'booking' ? 'bg-[#e60012]' : 'bg-gray-700'} flex items-center justify-center`}>
                <span className="text-white">3</span>
              </div>
              <span className={`text-sm mt-2 ${step === 'booking' ? 'text-white font-medium' : 'text-gray-500'}`}>Book Service</span>
            </div>
            
            {/* Progress Line */}
            <div className="absolute top-5 left-0 w-full h-1 bg-gray-700 -z-0">
              <div className="h-full bg-green-600" style={{
                width: step === 'brands' ? '0%' : step === 'models' ? '50%' : '100%'
              }}></div>
            </div>
          </div>
        </div>

        {/* Back button if not on the first step */}
        {step !== 'brands' && (
          <button 
            onClick={handleGoBack}
            className="mb-6 flex items-center text-gray-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back
          </button>
        )}

        {/* Content based on current step */}
        <div className="bg-[#111] border border-[#222] rounded-lg p-6">
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
      </main>
      
      <Footer />
    </div>
  )
} 