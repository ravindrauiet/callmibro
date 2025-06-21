'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '@/firebase/config'
import { collection, query, where, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore'

export default function Bookings() {
  const { currentUser } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingBooking, setUpdatingBooking] = useState(null)

  // Fetch bookings from Firebase
  useEffect(() => {
    async function fetchBookings() {
      if (!currentUser) {
        setLoading(false)
        return
      }
      
      try {
        setLoading(true)
        setError(null)
        
        // Create a query to get bookings for the current user
        const bookingsRef = collection(db, 'bookings')
        const q = query(
          bookingsRef,
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        )
        
        const querySnapshot = await getDocs(q)
        
        if (querySnapshot.empty) {
          setBookings([])
        } else {
          const bookingsData = querySnapshot.docs.map(doc => {
            const data = doc.data()
            // Convert Firestore timestamps to JavaScript Date objects
            const createdAt = data.createdAt?.toDate?.() || data.createdAt
            const scheduleDate = data.schedule?.date?.toDate?.() || data.schedule?.date
            
            return {
              id: doc.id,
              ...data,
              createdAt,
              schedule: {
                ...data.schedule,
                date: scheduleDate
              }
            }
          })
          setBookings(bookingsData)
        }
      } catch (error) {
        console.error('Error fetching bookings:', error)
        setError('Failed to load your bookings. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    if (currentUser) {
      fetchBookings()
    }
  }, [currentUser])

  const handleCancelBooking = async (bookingId) => {
    if (!currentUser || !bookingId) return
    
    try {
      setUpdatingBooking(bookingId)
      
      // Update the booking status in Firestore
      const bookingRef = doc(db, 'bookings', bookingId)
      await updateDoc(bookingRef, {
        status: 'cancelled',
        updatedAt: new Date()
      })
      
      // Update local state
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId ? {...booking, status: 'cancelled'} : booking
        )
      )
    } catch (error) {
      console.error('Error cancelling booking:', error)
      alert('Failed to cancel booking. Please try again.')
    } finally {
      setUpdatingBooking(null)
    }
  }

  const handleReschedule = (bookingId) => {
    router.push(`/services/booking-confirmation?bookingId=${bookingId}&reschedule=true`)
  }

  const handleViewDetails = (bookingId) => {
    router.push(`/services/booking-confirmation?bookingId=${bookingId}`)
  }

  const getStatusStyle = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
        return 'bg-gradient-to-r from-green-800 to-green-900 text-green-100'
      case 'scheduled':
        return 'bg-gradient-to-r from-[#e60012] to-[#ff6b6b] text-white'
      case 'cancelled':
        return 'bg-gradient-to-r from-gray-700 to-gray-800 text-gray-300'
      case 'pending':
        return 'bg-gradient-to-r from-yellow-700 to-yellow-800 text-yellow-100'
      case 'in progress':
        return 'bg-gradient-to-r from-blue-800 to-blue-900 text-blue-100'
      default:
        return 'bg-gradient-to-r from-gray-700 to-gray-800 text-gray-300'
    }
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    
    try {
      // If date is a timestamp or Date object
      if (date instanceof Date) {
        return date.toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }
      
      // If date is already a string
      if (typeof date === 'string') {
        return new Date(date).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }
      
      // If date is a Firestore timestamp
      if (date && typeof date.toDate === 'function') {
        return date.toDate().toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }
      
      return 'N/A'
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'N/A'
    }
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-b from-[#111] to-[#0a0a0a] border border-[#222] rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-semibold bg-gradient-to-r from-[#e60012] to-[#ff6b6b] bg-clip-text text-transparent mb-6">Your Service Bookings</h3>
        <div className="text-center py-10">
          <div className="animate-spin w-10 h-10 border-4 border-t-transparent rounded-full mx-auto mb-4 bg-gradient-to-r from-[#e60012] to-[#ff6b6b]"></div>
          <p className="text-gray-400">Loading your bookings...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gradient-to-b from-[#111] to-[#0a0a0a] border border-[#222] rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-semibold bg-gradient-to-r from-[#e60012] to-[#ff6b6b] bg-clip-text text-transparent mb-6">Your Service Bookings</h3>
        <div className="bg-gradient-to-r from-red-900 to-red-800 text-red-100 p-4 rounded-lg mb-6">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 underline hover:text-white transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-b from-[#111] to-[#0a0a0a] border border-[#222] rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-semibold bg-gradient-to-r from-[#e60012] to-[#ff6b6b] bg-clip-text text-transparent mb-6">Your Service Bookings</h3>
      
      {bookings.length > 0 ? (
        <div className="space-y-6">
          {bookings.map(booking => (
            <div key={booking.id} className="border border-[#333] rounded-xl p-5 hover:shadow-md transition-all bg-[#0d0d0d]">
              <div className="flex flex-col md:flex-row justify-between mb-4">
                <div>
                  <h4 className="font-medium text-lg">{booking.serviceName || 'Service'}</h4>
                  <p className="text-gray-400">
                    {booking.schedule?.date ? formatDate(booking.schedule.date) : 'Date not set'} 
                    {booking.schedule?.timeSlot && ` • ${booking.schedule.timeSlot}`}
                  </p>
                </div>
                
                <div className="mt-2 md:mt-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${getStatusStyle(booking.status)}`}>
                    {booking.status 
                      ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) 
                      : 'Pending'}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-[#161616] p-3 rounded-lg">
                  <p className="text-gray-400 mb-1">Service Type</p>
                  <p className="font-medium">{booking.serviceType || 'N/A'}</p>
                </div>
                
                <div className="bg-[#161616] p-3 rounded-lg">
                  <p className="text-gray-400 mb-1">Address</p>
                  <p className="font-medium truncate">{booking.address || 'Address not set'}</p>
                </div>
                
                <div className="bg-[#161616] p-3 rounded-lg">
                  <p className="text-gray-400 mb-1">Price</p>
                  <p className="font-medium">{booking.price ? `₹${booking.price}` : 'To be determined'}</p>
                </div>
              </div>
              
              <div className="mt-5 flex flex-wrap gap-3">
                {booking.status === 'scheduled' && (
                  <>
                    <button 
                      onClick={() => handleReschedule(booking.id)}
                      className="text-sm bg-gradient-to-r from-[#e60012] to-[#ff6b6b] hover:from-[#ff6b6b] hover:to-[#e60012] text-white transition-all px-4 py-2 rounded-lg font-medium shadow-sm"
                      disabled={updatingBooking === booking.id}
                    >
                      Reschedule
                    </button>
                    <button 
                      onClick={() => handleCancelBooking(booking.id)}
                      className="text-sm border border-gray-600 text-gray-400 hover:bg-gray-700 transition-all px-4 py-2 rounded-lg"
                      disabled={updatingBooking === booking.id}
                    >
                      {updatingBooking === booking.id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  </>
                )}
                
                <button 
                  onClick={() => handleViewDetails(booking.id)}
                  className="text-sm bg-[#222] hover:bg-[#333] text-white transition-all px-4 py-2 rounded-lg ml-auto"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-[#0d0d0d] rounded-xl border border-[#222]">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#e60012] to-[#ff6b6b] flex items-center justify-center opacity-70">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h4 className="text-xl font-medium mb-2">No bookings yet</h4>
          <p className="text-gray-400 mb-6">You haven't made any service bookings yet.</p>
          <button 
            onClick={() => router.push('/services')}
            className="bg-gradient-to-r from-[#e60012] to-[#ff6b6b] hover:from-[#ff6b6b] hover:to-[#e60012] text-white transition-all px-6 py-3 rounded-lg font-medium shadow-md"
          >
            Book a Service
          </button>
        </div>
      )}
    </div>
  )
} 