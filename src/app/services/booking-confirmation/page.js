'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'

export default function BookingConfirmationPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-black text-white">
      <Header activePage="services" />
      
      <main className="py-10 px-4 max-w-6xl mx-auto">
        <div className="bg-[#111] border border-[#222] rounded-xl p-6 md:p-12 max-w-3xl mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-green-900 mx-auto flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Booking Confirmed!</h1>
          
          <p className="text-gray-400 mb-8">
            Your service booking has been successfully confirmed. We have sent the booking details to your email.
          </p>
          
          <div className="bg-[#222] p-6 rounded-lg mb-8">
            <h2 className="text-lg font-semibold mb-4">What happens next?</h2>
            <div className="text-left space-y-3">
              <div className="flex items-start">
                <div className="bg-[#e60012] rounded-full h-6 w-6 flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-white text-sm">1</span>
                </div>
                <p className="text-gray-300">Our team will contact you within 2 hours to confirm your booking details.</p>
              </div>
              
              <div className="flex items-start">
                <div className="bg-[#e60012] rounded-full h-6 w-6 flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-white text-sm">2</span>
                </div>
                <p className="text-gray-300">A technician will be assigned and will arrive at your location on the scheduled date and time.</p>
              </div>
              
              <div className="flex items-start">
                <div className="bg-[#e60012] rounded-full h-6 w-6 flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-white text-sm">3</span>
                </div>
                <p className="text-gray-300">You can track your booking status from your profile section.</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => router.push('/profile')}
              className="bg-[#e60012] text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors"
            >
              View Your Bookings
            </button>
            
            <button 
              onClick={() => router.push('/')}
              className="border border-gray-600 text-gray-300 px-6 py-3 rounded-md hover:bg-gray-800 transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
} 