'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import BrandSelection from '../../../components/service-booking/BrandSelection'
import ModelSelection from '../../../components/service-booking/ModelSelection'
import BookingForm from '../../../components/service-booking/BookingForm'

export default function ServiceDetailPage({ params }) {
  const [step, setStep] = useState('brands')
  const [selectedService, setSelectedService] = useState('')
  const [selectedBrand, setSelectedBrand] = useState(null)
  const [selectedModel, setSelectedModel] = useState(null)
  const router = useRouter()

  useEffect(() => {
    // Decode the service name from the URL and format it properly
    if (params.service) {
      const decodedService = decodeURIComponent(params.service);
      // Convert to title case and replace hyphens with spaces
      const formattedService = decodedService
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      setSelectedService(formattedService);
    }
  }, [params.service])

  const handleBrandSelect = (brand) => {
    setSelectedBrand(brand)
    setStep('models')
  }

  const handleModelSelect = (model) => {
    setSelectedModel(model)
    setStep('booking')
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
    // Navigate to a confirmation page or back to services
    router.push('/services/booking-confirmation')
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
      </main>
      
      <Footer />
    </div>
  )
} 