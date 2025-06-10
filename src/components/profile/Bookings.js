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
        return 'bg-green-900 text-green-300'
      case 'scheduled':
        return 'bg-blue-900 text-blue-300'
      case 'cancelled':
        return 'bg-red-900 text-red-300'
      case 'pending':
        return 'bg-yellow-900 text-yellow-300'
      case 'in progress':
        return 'bg-purple-900 text-purple-300'
      default:
        return 'bg-gray-800 text-gray-300'
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
      <div className="bg-[#111] border border-[#222] rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-6">Your Service Bookings</h3>
        <div className="text-center py-10">
          <p className="text-gray-400">Loading your bookings...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-[#111] border border-[#222] rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-6">Your Service Bookings</h3>
        <div className="bg-red-900 text-red-100 p-4 rounded mb-6">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 underline"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#111] border border-[#222] rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-6">Your Service Bookings</h3>
      
      {bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map(booking => (
            <div key={booking.id} className="border border-[#333] rounded-lg p-4">
              <div className="flex flex-col md:flex-row justify-between mb-4">
                <div>
                  <h4 className="font-medium text-lg">{booking.serviceName || 'Service'}</h4>
                  <p className="text-gray-400">
                    {booking.schedule?.date ? formatDate(booking.schedule.date) : 'Date not set'} 
                    {booking.schedule?.timeSlot && ` • ${booking.schedule.timeSlot}`}
                  </p>
                </div>
                
                <div className="mt-2 md:mt-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(booking.status)}`}>
                    {booking.status 
                      ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) 
                      : 'Pending'}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Service Type</p>
                  <p>{booking.serviceType || 'N/A'}</p>
                </div>
                
                <div>
                  <p className="text-gray-400">Address</p>
                  <p>{booking.address || 'Address not set'}</p>
                </div>
                
                <div>
                  <p className="text-gray-400">Price</p>
                  <p>{booking.price ? `₹${booking.price}` : 'To be determined'}</p>
                </div>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-3">
                {booking.status === 'scheduled' && (
                  <>
                    <button 
                      onClick={() => handleReschedule(booking.id)}
                      className="text-sm border border-[#e60012] text-[#e60012] hover:bg-[#e60012] hover:text-white transition-colors px-3 py-1 rounded"
                      disabled={updatingBooking === booking.id}
                    >
                      Reschedule
                    </button>
                    <button 
                      onClick={() => handleCancelBooking(booking.id)}
                      className="text-sm border border-gray-600 text-gray-400 hover:bg-gray-700 transition-colors px-3 py-1 rounded"
                      disabled={updatingBooking === booking.id}
                    >
                      {updatingBooking === booking.id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  </>
                )}
                
                {booking.status === 'completed' && (
                  <button 
                    onClick={() => router.push('/services')}
                    className="text-sm border border-[#e60012] text-[#e60012] hover:bg-[#e60012] hover:text-white transition-colors px-3 py-1 rounded"
                  >
                    Book Again
                  </button>
                )}
                
                <button 
                  onClick={() => handleViewDetails(booking.id)}
                  className="text-sm bg-[#e60012] text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-400 mb-4">You don't have any service bookings yet</p>
          <button 
            onClick={() => router.push('/services')} 
            className="bg-[#e60012] text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Book a Service
          </button>
        </div>
      )}
    </div>
  )
} 