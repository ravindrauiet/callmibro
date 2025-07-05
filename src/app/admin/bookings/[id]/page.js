'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { toast } from 'react-hot-toast'

export default function BookingDetail() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id
  
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [newStatus, setNewStatus] = useState('')

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) return
      
      setLoading(true)
      try {
        const bookingDoc = await getDoc(doc(db, 'bookings', bookingId))
        
        if (bookingDoc.exists()) {
          setBooking({
            id: bookingDoc.id,
            ...bookingDoc.data()
          })
          setNewStatus(bookingDoc.data().status || 'pending')
        } else {
          toast.error('Booking not found')
          router.push('/admin/bookings')
        }
      } catch (error) {
        console.error('Error fetching booking:', error)
        toast.error('Failed to load booking details')
        router.push('/admin/bookings')
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [bookingId, router])

  const updateBookingStatus = async () => {
    if (!booking || !newStatus) return
    
    setUpdating(true)
    try {
      await updateDoc(doc(db, 'bookings', booking.id), {
        status: newStatus,
        updatedAt: new Date()
      })
      
      setBooking(prev => ({ ...prev, status: newStatus }))
      toast.success('Booking status updated successfully')
    } catch (error) {
      console.error('Error updating booking status:', error)
      toast.error('Failed to update booking status')
    } finally {
      setUpdating(false)
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatStatus = (status) => {
    if (!status) return 'Unknown'
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'confirmed':
        return 'bg-yellow-100 text-yellow-800'
      case 'in_progress':
        return 'bg-purple-100 text-purple-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e60012]"></div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="text-center py-8">
        <p style={{ color: 'var(--text-secondary)' }}>Booking not found</p>
        <Link href="/admin/bookings" className="text-[#e60012] hover:underline">
          Back to Bookings
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>
            Booking Details
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            ID: {booking.id}
          </p>
        </div>
        <Link 
          href="/admin/bookings"
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          ← Back to Bookings
        </Link>
      </div>

      {/* Booking Type Badge */}
      {booking.isExpressBooking && (
        <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-[#e60012] to-[#ff6b6b] rounded-md text-white text-sm font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Express Booking
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Service Information */}
          <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--panel-charcoal)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-main)' }}>
              Service Information
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Service:</span>
                <p className="text-sm" style={{ color: 'var(--text-main)' }}>
                  {booking.serviceName || (booking.isExpressBooking ? 'Express Repair Service' : 'N/A')}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Status:</span>
                <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                  {formatStatus(booking.status)}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Created:</span>
                <p className="text-sm" style={{ color: 'var(--text-main)' }}>
                  {formatDate(booking.createdAt)}
                </p>
              </div>
              {booking.updatedAt && (
                <div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Last Updated:</span>
                  <p className="text-sm" style={{ color: 'var(--text-main)' }}>
                    {formatDate(booking.updatedAt)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Customer Information */}
          <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--panel-charcoal)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-main)' }}>
              Customer Information
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Name:</span>
                <p className="text-sm" style={{ color: 'var(--text-main)' }}>
                  {booking.contactInfo?.name || booking.userEmail?.split('@')[0] || 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Email:</span>
                <p className="text-sm" style={{ color: 'var(--text-main)' }}>
                  {booking.contactInfo?.email || booking.userEmail || 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Phone:</span>
                <p className="text-sm" style={{ color: 'var(--text-main)' }}>
                  {booking.contactInfo?.phone || booking.mobileNumber || 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>User ID:</span>
                <p className="text-sm" style={{ color: 'var(--text-main)' }}>
                  {booking.userId || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Schedule Information */}
          <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--panel-charcoal)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-main)' }}>
              Schedule Information
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Scheduled Date:</span>
                <p className="text-sm" style={{ color: 'var(--text-main)' }}>
                  {booking.schedule?.date ? formatDate(booking.schedule.date) : 'Not scheduled'}
                </p>
              </div>
              {booking.schedule?.time && (
                <div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Time:</span>
                  <p className="text-sm" style={{ color: 'var(--text-main)' }}>
                    {booking.schedule.time}
                  </p>
                </div>
              )}
              {booking.schedule?.address && (
                <div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Address:</span>
                  <p className="text-sm" style={{ color: 'var(--text-main)' }}>
                    {booking.schedule.address}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Description/Issue Details */}
          {booking.description && (
            <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--panel-charcoal)' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-main)' }}>
                Issue Description
              </h3>
              <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text-main)' }}>
                {booking.description}
              </p>
            </div>
          )}

          {/* Status Update */}
          <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--panel-charcoal)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-main)' }}>
              Update Status
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                  style={{ 
                    backgroundColor: 'var(--panel-gray)', 
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-main)'
                  }}
                >
                  <option value="pending">Pending</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <button
                onClick={updateBookingStatus}
                disabled={updating || newStatus === booking.status}
                className="w-full px-4 py-2 bg-[#e60012] text-white rounded-md hover:bg-[#d40010] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 