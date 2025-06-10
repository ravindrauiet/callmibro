'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import { useAuth } from '@/contexts/AuthContext'
import { db } from '@/firebase/config'
import { collection, doc, getDoc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore'

export default function BookingConfirmationPage() {
  const router = useRouter()
  const { currentUser } = useAuth()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [bookingDetails, setBookingDetails] = useState(null)
  const [error, setError] = useState(null)
  const [bookingConfirmed, setBookingConfirmed] = useState(false)
  
  // Get parameters from URL
  const bookingId = searchParams?.get('bookingId')
  const serviceId = searchParams?.get('serviceId')
  const serviceName = searchParams?.get('serviceName')
  const serviceType = searchParams?.get('serviceType')
  const date = searchParams?.get('date')
  const timeSlot = searchParams?.get('timeSlot')
  const isReschedule = searchParams?.get('reschedule') === 'true'
  
  useEffect(() => {
    // If there's a bookingId, we need to fetch the booking details
    if (bookingId) {
      fetchBookingDetails(bookingId)
    } else if (!currentUser) {
      // If no user is logged in and we're creating a new booking, redirect to login
      router.push('/')
      return
    } else if (!serviceId && !serviceName) {
      // If essential params are missing, redirect to services
      router.push('/services')
      return
    } else {
      // We have all the info we need for a new booking
      setLoading(false)
      
      // For a new booking, construct the details from URL params
      setBookingDetails({
        serviceId,
        serviceName,
        serviceType,
        schedule: {
          date,
          timeSlot
        }
      })
      
      // Save the new booking
      saveBooking()
    }
  }, [bookingId, currentUser, serviceId, serviceName])
  
  // Fetch existing booking details
  const fetchBookingDetails = async (id) => {
    try {
      setLoading(true)
      const bookingRef = doc(db, 'bookings', id)
      const bookingSnap = await getDoc(bookingRef)
      
      if (!bookingSnap.exists()) {
        setError('Booking not found')
        setLoading(false)
        return
      }
      
      const data = bookingSnap.data()
      setBookingDetails({ id: bookingSnap.id, ...data })
      
      // If it's a reschedule, update the booking with new date/time
      if (isReschedule && date && timeSlot) {
        await updateDoc(bookingRef, {
          schedule: {
            date,
            timeSlot
          },
          updatedAt: serverTimestamp()
        })
        
        // Update local state
        setBookingDetails(prev => ({
          ...prev,
          schedule: {
            date,
            timeSlot
          }
        }))
      }
      
      setBookingConfirmed(true)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching booking:', error)
      setError('Failed to load booking details')
      setLoading(false)
    }
  }
  
  // Save a new booking to Firestore
  const saveBooking = async () => {
    if (!currentUser || !serviceId || !serviceName) return
    
    try {
      setLoading(true)
      
      // Create a new booking document
      const newBooking = {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        serviceId,
        serviceName,
        serviceType: serviceType || 'Standard',
        schedule: {
          date: date || null,
          timeSlot: timeSlot || null
        },
        status: 'scheduled',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      // Add to Firestore
      const docRef = await addDoc(collection(db, 'bookings'), newBooking)
      
      // Update local state with the ID
      setBookingDetails({ id: docRef.id, ...newBooking })
      setBookingConfirmed(true)
    } catch (error) {
      console.error('Error saving booking:', error)
      setError('Failed to confirm booking. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header activePage="services" />
        
        <main className="py-10 px-4 max-w-6xl mx-auto">
          <div className="bg-[#111] border border-[#222] rounded-xl p-6 md:p-12 max-w-3xl mx-auto text-center">
            <div className="animate-spin w-12 h-12 border-4 border-[#e60012] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-xl">Processing your booking...</p>
          </div>
        </main>
        
        <Footer />
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header activePage="services" />
        
        <main className="py-10 px-4 max-w-6xl mx-auto">
          <div className="bg-[#111] border border-[#222] rounded-xl p-6 md:p-12 max-w-3xl mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-red-900 mx-auto flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Something Went Wrong</h1>
            
            <p className="text-gray-400 mb-8">{error}</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <button 
                onClick={() => router.push('/services')}
                className="bg-[#e60012] text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors"
              >
                Try Again
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
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {isReschedule ? 'Booking Rescheduled!' : 'Booking Confirmed!'}
          </h1>
          
          <p className="text-gray-400 mb-8">
            Your {bookingDetails?.serviceName} service has been successfully {isReschedule ? 'rescheduled' : 'confirmed'}.
            {currentUser?.email && ' We have sent the booking details to your email.'}
          </p>
          
          {bookingDetails && (
            <div className="bg-[#222] rounded-lg p-6 mb-8 text-left">
              <h3 className="text-xl font-semibold mb-4">Booking Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400">Service</p>
                  <p className="font-medium">{bookingDetails.serviceName}</p>
                </div>
                
                <div>
                  <p className="text-gray-400">Type</p>
                  <p className="font-medium">{bookingDetails.serviceType || 'Standard'}</p>
                </div>
                
                <div>
                  <p className="text-gray-400">Date</p>
                  <p className="font-medium">{bookingDetails.schedule?.date || 'To be confirmed'}</p>
                </div>
                
                <div>
                  <p className="text-gray-400">Time</p>
                  <p className="font-medium">{bookingDetails.schedule?.timeSlot || 'To be confirmed'}</p>
                </div>
                
                <div>
                  <p className="text-gray-400">Status</p>
                  <p className="font-medium">
                    <span className="inline-block px-2 py-1 bg-blue-900 text-blue-300 rounded-full text-xs">
                      {bookingDetails.status?.charAt(0).toUpperCase() + bookingDetails.status?.slice(1) || 'Scheduled'}
                    </span>
                  </p>
                </div>
                
                <div>
                  <p className="text-gray-400">Booking ID</p>
                  <p className="font-medium">{bookingDetails.id ? bookingDetails.id.slice(0, 8) : 'Processing...'}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="mb-8">
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