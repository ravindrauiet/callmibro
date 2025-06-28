'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/contexts/AuthContext'
import { db } from '@/firebase/config'
import { collection, doc, getDoc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { useTheme } from '@/contexts/ThemeContext'

export default function BookingConfirmationPage() {
  const router = useRouter()
  const { currentUser } = useAuth()
  const searchParams = useSearchParams()
  const { isDarkMode } = useTheme()
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
  const paymentSuccess = searchParams?.get('payment') === 'success'
  const isOffline = searchParams.get('offline') === 'true'
  
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
      <div className="min-h-screen" style={{ background: 'var(--bg-color)', color: 'var(--text-main)' }}>
        <Header activePage="services" />
        
        <main className="py-10 px-4 max-w-6xl mx-auto">
          <div className="border rounded-xl p-6 md:p-12 max-w-3xl mx-auto text-center shadow-lg" style={{ 
            background: 'linear-gradient(to bottom, var(--panel-dark), var(--panel-charcoal))',
            borderColor: 'var(--border-color)'
          }}>
            <div className="animate-spin w-12 h-12 border-4 border-t-transparent rounded-full mx-auto mb-4 bg-gradient-to-r from-[#e60012] to-[#ff6b6b]"></div>
            <p className="text-xl">Processing your booking...</p>
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
        
        <main className="py-10 px-4 max-w-6xl mx-auto">
          <div className="border rounded-xl p-6 md:p-12 max-w-3xl mx-auto text-center shadow-lg" style={{ 
            background: 'linear-gradient(to bottom, var(--panel-dark), var(--panel-charcoal))',
            borderColor: 'var(--border-color)'
          }}>
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-red-900 to-red-800 mx-auto flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-[#e60012] to-[#ff6b6b] bg-clip-text text-transparent">Booking Error</h1>
            <p style={{ color: 'var(--text-secondary)' }} className="mb-8">{error}</p>
            
            <button 
              onClick={() => router.push('/services')}
              className="bg-gradient-to-r from-[#e60012] to-[#ff6b6b] hover:from-[#ff6b6b] hover:to-[#e60012] text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md"
            >
              Back to Services
            </button>
          </div>
        </main>
        
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-color)', color: 'var(--text-main)' }}>
      <Header activePage="services" />
      
      <main className="py-10 px-4 max-w-6xl mx-auto">
        {/* Progress Indicator */}
        <div className="max-w-3xl mx-auto mb-10">
          <div className="flex justify-between relative">
            <div className="flex flex-col items-center z-10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-600 to-green-700 flex items-center justify-center shadow-md">
                <span className="text-white">✓</span>
              </div>
              <span className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>Select Service</span>
            </div>
            
            <div className="flex flex-col items-center z-10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-600 to-green-700 flex items-center justify-center shadow-md">
                <span className="text-white">✓</span>
              </div>
              <span className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>Choose Technician</span>
            </div>
            
            <div className="flex flex-col items-center z-10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-600 to-green-700 flex items-center justify-center shadow-md">
                <span className="text-white">✓</span>
              </div>
              <span className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>Schedule & Address</span>
            </div>
            
            <div className="flex flex-col items-center z-10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#e60012] to-[#ff6b6b] flex items-center justify-center shadow-md">
                <span className="text-white">4</span>
              </div>
              <span className="text-sm mt-2 font-medium">Confirmation</span>
            </div>
            
            {/* Progress Line */}
            <div className="absolute top-5 left-0 w-full h-1 -z-0" style={{ background: 'var(--border-color)' }}>
              <div className="h-full bg-gradient-to-r from-green-600 to-green-700" style={{width: '100%'}}></div>
            </div>
          </div>
        </div>
      
        <div className="border rounded-xl p-6 md:p-12 max-w-3xl mx-auto shadow-lg" style={{ 
          background: 'linear-gradient(to bottom, var(--panel-dark), var(--panel-charcoal))',
          borderColor: 'var(--border-color)'
        }}>
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-700 to-green-800 mx-auto flex items-center justify-center mb-6 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center bg-gradient-to-r from-[#e60012] to-[#ff6b6b] bg-clip-text text-transparent">
            {isReschedule ? 'Booking Rescheduled!' : 'Booking Confirmed!'}
          </h1>
          
          <p style={{ color: 'var(--text-secondary)' }} className="mb-8 text-center">
            Your {bookingDetails?.serviceName} service has been successfully {isReschedule ? 'rescheduled' : 'confirmed'}.
            {currentUser?.email && ' We have sent the booking details to your email.'}
          </p>
          
          {bookingDetails && (
            <div className="rounded-lg p-6 mb-8 border shadow-md" style={{ 
              background: 'var(--panel-dark)', 
              borderColor: 'var(--border-color)' 
            }}>
              <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-[#e60012] to-[#ff6b6b] bg-clip-text text-transparent">Our Repair Services</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-lg border" style={{ 
                  background: 'var(--panel-charcoal)', 
                  borderColor: 'var(--border-color)' 
                }}>
                  <p style={{ color: 'var(--text-secondary)' }} className="mb-1">Service</p>
                  <p className="font-medium">{bookingDetails.serviceName}</p>
                </div>
                
                <div className="p-4 rounded-lg border" style={{ 
                  background: 'var(--panel-charcoal)', 
                  borderColor: 'var(--border-color)' 
                }}>
                  <p style={{ color: 'var(--text-secondary)' }} className="mb-1">Date & Time</p>
                  <p className="font-medium">
                    {bookingDetails.schedule?.date || 'To be confirmed'}, {bookingDetails.schedule?.timeSlot || ''}
                  </p>
                </div>
                
                <div className="p-4 rounded-lg border" style={{ 
                  background: 'var(--panel-charcoal)', 
                  borderColor: 'var(--border-color)' 
                }}>
                  <p style={{ color: 'var(--text-secondary)' }} className="mb-1">Address</p>
                  <p className="font-medium">{bookingDetails.address?.street || 'To be confirmed'}</p>
                </div>
                
                <div className="p-4 rounded-lg border" style={{ 
                  background: 'var(--panel-charcoal)', 
                  borderColor: 'var(--border-color)' 
                }}>
                  <p style={{ color: 'var(--text-secondary)' }} className="mb-1">Price</p>
                  <p className="font-medium bg-gradient-to-r from-[#e60012] to-[#ff6b6b] bg-clip-text text-transparent">₹ 1,200</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button 
                  onClick={() => router.push(`/services/booking?serviceId=${bookingDetails.serviceId}&serviceName=${bookingDetails.serviceName}&edit=true`)}
                  className="px-4 py-3 border border-[#e60012] text-[#e60012] hover:bg-[#e60012] hover:text-white transition-all rounded-lg flex-1 font-medium"
                >
                  Modify Booking
                </button>
                <button 
                  onClick={() => router.push(`/payment?bookingId=${bookingDetails.id}`)}
                  className="px-4 py-3 bg-gradient-to-r from-[#e60012] to-[#ff6b6b] hover:from-[#ff6b6b] hover:to-[#e60012] text-white transition-all rounded-lg flex-1 font-medium shadow-md"
                >
                  Confirm & Pay
                </button>
              </div>
              
              {bookingDetails.payment && bookingDetails.payment.status === 'paid' && (
                <div className="mt-4 rounded-lg p-4 text-center" style={{
                  background: isDarkMode ? 'rgba(22, 101, 52, 0.3)' : 'rgba(187, 247, 208, 0.3)',
                  borderColor: isDarkMode ? '#166534' : '#16a34a',
                  borderWidth: '1px'
                }}>
                  <p style={{ color: isDarkMode ? '#86efac' : '#166534' }}>
                    Payment completed! This booking has been added to your <button 
                      onClick={() => router.push('/orders')}
                      className="underline hover:text-white transition-colors font-medium"
                    >
                      order history
                    </button>.
                  </p>
                </div>
              )}
            </div>
          )}
          
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 bg-gradient-to-r from-[#e60012] to-[#ff6b6b] bg-clip-text text-transparent">What happens next?</h2>
            <div className="text-left space-y-3">
              <div className="flex items-start">
                <div className="bg-gradient-to-r from-[#e60012] to-[#ff6b6b] rounded-full h-6 w-6 flex items-center justify-center mr-3 mt-0.5 shadow-sm">
                  <span className="text-white text-sm">1</span>
                </div>
                <p style={{ color: 'var(--text-secondary)' }}>Our team will contact you within 2 hours to confirm your booking details.</p>
              </div>
              
              <div className="flex items-start">
                <div className="bg-gradient-to-r from-[#e60012] to-[#ff6b6b] rounded-full h-6 w-6 flex items-center justify-center mr-3 mt-0.5 shadow-sm">
                  <span className="text-white text-sm">2</span>
                </div>
                <p style={{ color: 'var(--text-secondary)' }}>A technician will be assigned and will arrive at your location on the scheduled date and time.</p>
              </div>
              
              <div className="flex items-start">
                <div className="bg-gradient-to-r from-[#e60012] to-[#ff6b6b] rounded-full h-6 w-6 flex items-center justify-center mr-3 mt-0.5 shadow-sm">
                  <span className="text-white text-sm">3</span>
                </div>
                <p style={{ color: 'var(--text-secondary)' }}>You can track your booking status from your profile section.</p>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <button 
              onClick={() => router.push('/')}
              className="px-6 py-3 rounded-lg shadow-md transition-all"
              style={{ 
                background: 'var(--panel-charcoal)', 
                color: 'var(--text-main)'
              }}
            >
              Back to Home
            </button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
} 