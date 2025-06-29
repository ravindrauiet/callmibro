'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { collection, getDocs, query, where, orderBy, limit, startAfter, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { toast } from 'react-hot-toast'

export default function ExpressBookingsManagement() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [lastVisible, setLastVisible] = useState(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [noMoreBookings, setNoMoreBookings] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [newStatus, setNewStatus] = useState('')

  const BOOKINGS_PER_PAGE = 10

  // Fetch express bookings
  useEffect(() => {
    const fetchExpressBookings = async () => {
      setLoading(true)
      try {
        // Query bookings with isExpressBooking = true
        let bookingsQuery = collection(db, 'bookings')
        
        // Apply status filter if not 'all'
        if (filterStatus !== 'all') {
          bookingsQuery = query(
            bookingsQuery,
            where('isExpressBooking', '==', true),
            where('status', '==', filterStatus),
            orderBy('createdAt', 'desc'),
            limit(BOOKINGS_PER_PAGE)
          )
        } else {
          bookingsQuery = query(
            bookingsQuery,
            where('isExpressBooking', '==', true),
            orderBy('createdAt', 'desc'),
            limit(BOOKINGS_PER_PAGE)
          )
        }
        
        const bookingsSnapshot = await getDocs(bookingsQuery)
        
        if (bookingsSnapshot.empty) {
          setBookings([])
          setNoMoreBookings(true)
        } else {
          const bookingsData = bookingsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          setBookings(bookingsData)
          setLastVisible(bookingsSnapshot.docs[bookingsSnapshot.docs.length - 1])
          setNoMoreBookings(bookingsSnapshot.docs.length < BOOKINGS_PER_PAGE)
        }
      } catch (error) {
        console.error('Error fetching express bookings:', error)
        toast.error('Failed to load express bookings')
      } finally {
        setLoading(false)
      }
    }

    fetchExpressBookings()
  }, [filterStatus])

  // Load more express bookings
  const loadMoreBookings = async () => {
    if (loadingMore || noMoreBookings) return
    
    setLoadingMore(true)
    try {
      let bookingsQuery
      
      if (filterStatus !== 'all') {
        bookingsQuery = query(
          collection(db, 'bookings'),
          where('isExpressBooking', '==', true),
          where('status', '==', filterStatus),
          orderBy('createdAt', 'desc'),
          startAfter(lastVisible),
          limit(BOOKINGS_PER_PAGE)
        )
      } else {
        bookingsQuery = query(
          collection(db, 'bookings'),
          where('isExpressBooking', '==', true),
          orderBy('createdAt', 'desc'),
          startAfter(lastVisible),
          limit(BOOKINGS_PER_PAGE)
        )
      }
      
      const bookingsSnapshot = await getDocs(bookingsQuery)
      
      if (bookingsSnapshot.empty) {
        setNoMoreBookings(true)
      } else {
        const newBookings = bookingsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        setBookings(prev => [...prev, ...newBookings])
        setLastVisible(bookingsSnapshot.docs[bookingsSnapshot.docs.length - 1])
        setNoMoreBookings(bookingsSnapshot.docs.length < BOOKINGS_PER_PAGE)
      }
    } catch (error) {
      console.error('Error loading more express bookings:', error)
      toast.error('Failed to load more express bookings')
    } finally {
      setLoadingMore(false)
    }
  }

  // Handle status change
  const openStatusModal = (booking) => {
    setSelectedBooking(booking)
    setNewStatus(booking.status)
    setShowStatusModal(true)
  }

  const updateBookingStatus = async () => {
    if (!selectedBooking || !newStatus) return
    
    try {
      await updateDoc(doc(db, 'bookings', selectedBooking.id), {
        status: newStatus,
        updatedAt: new Date()
      })
      
      // Update booking in state
      setBookings(prev => 
        prev.map(booking => 
          booking.id === selectedBooking.id 
            ? { ...booking, status: newStatus } 
            : booking
        )
      )
      
      toast.success('Express booking status updated successfully')
      setShowStatusModal(false)
    } catch (error) {
      console.error('Error updating express booking status:', error)
      toast.error('Failed to update express booking status')
    }
  }

  // Filter bookings based on search term
  const filteredBookings = bookings.filter(booking => 
    booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.contactInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.contactInfo?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.contactInfo?.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e60012]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>Express Bookings Management</h2>
        <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-[#e60012] to-[#ff6b6b] rounded-md text-white text-sm font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Express Bookings
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1 rounded-md text-sm ${
            filterStatus === 'all' 
              ? 'bg-[#e60012] text-white' 
              : 'hover:bg-opacity-20 hover:bg-gray-600'
          }`}
          style={{ 
            backgroundColor: filterStatus === 'all' ? '#e60012' : 'var(--panel-gray)',
            color: filterStatus === 'all' ? '#ffffff' : 'var(--text-secondary)'
          }}
        >
          All
        </button>
        <button
          onClick={() => setFilterStatus('scheduled')}
          className={`px-3 py-1 rounded-md text-sm ${
            filterStatus === 'scheduled' 
              ? 'bg-[#e60012] text-white' 
              : 'hover:bg-opacity-20 hover:bg-gray-600'
          }`}
          style={{ 
            backgroundColor: filterStatus === 'scheduled' ? '#e60012' : 'var(--panel-gray)',
            color: filterStatus === 'scheduled' ? '#ffffff' : 'var(--text-secondary)'
          }}
        >
          Scheduled
        </button>
        <button
          onClick={() => setFilterStatus('confirmed')}
          className={`px-3 py-1 rounded-md text-sm ${
            filterStatus === 'confirmed' 
              ? 'bg-[#e60012] text-white' 
              : 'hover:bg-opacity-20 hover:bg-gray-600'
          }`}
          style={{ 
            backgroundColor: filterStatus === 'confirmed' ? '#e60012' : 'var(--panel-gray)',
            color: filterStatus === 'confirmed' ? '#ffffff' : 'var(--text-secondary)'
          }}
        >
          Confirmed
        </button>
        <button
          onClick={() => setFilterStatus('in_progress')}
          className={`px-3 py-1 rounded-md text-sm ${
            filterStatus === 'in_progress' 
              ? 'bg-[#e60012] text-white' 
              : 'hover:bg-opacity-20 hover:bg-gray-600'
          }`}
          style={{ 
            backgroundColor: filterStatus === 'in_progress' ? '#e60012' : 'var(--panel-gray)',
            color: filterStatus === 'in_progress' ? '#ffffff' : 'var(--text-secondary)'
          }}
        >
          In Progress
        </button>
        <button
          onClick={() => setFilterStatus('completed')}
          className={`px-3 py-1 rounded-md text-sm ${
            filterStatus === 'completed' 
              ? 'bg-[#e60012] text-white' 
              : 'hover:bg-opacity-20 hover:bg-gray-600'
          }`}
          style={{ 
            backgroundColor: filterStatus === 'completed' ? '#e60012' : 'var(--panel-gray)',
            color: filterStatus === 'completed' ? '#ffffff' : 'var(--text-secondary)'
          }}
        >
          Completed
        </button>
        <button
          onClick={() => setFilterStatus('cancelled')}
          className={`px-3 py-1 rounded-md text-sm ${
            filterStatus === 'cancelled' 
              ? 'bg-[#e60012] text-white' 
              : 'hover:bg-opacity-20 hover:bg-gray-600'
          }`}
          style={{ 
            backgroundColor: filterStatus === 'cancelled' ? '#e60012' : 'var(--panel-gray)',
            color: filterStatus === 'cancelled' ? '#ffffff' : 'var(--text-secondary)'
          }}
        >
          Cancelled
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search express bookings by ID, service, customer name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
          style={{ 
            backgroundColor: 'var(--panel-gray)', 
            borderColor: 'var(--border-color)',
            color: 'var(--text-main)'
          }}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--text-secondary)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Express Bookings Table */}
      <div className="rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: 'var(--panel-charcoal)' }}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y" style={{ borderColor: 'var(--border-color)' }}>
            <thead style={{ backgroundColor: 'var(--panel-gray)' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Booking ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ backgroundColor: 'var(--panel-charcoal)', borderColor: 'var(--border-color)' }}>
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-opacity-20 hover:bg-gray-600 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {booking.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm" style={{ color: 'var(--text-main)' }}>{booking.serviceName}</div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#e60012] text-white">
                        Express
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm" style={{ color: 'var(--text-main)' }}>{booking.contactInfo?.name || 'N/A'}</div>
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{booking.contactInfo?.email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {booking.contactInfo?.phone || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {booking.schedule?.date ? formatDate(booking.schedule.date) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <Link 
                          href={`/admin/bookings/${booking.id}`}
                          className="text-[#e60012] hover:text-[#ff6b6b]"
                        >
                          View
                        </Link>
                        <button 
                          onClick={() => openStatusModal(booking)}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          Update Status
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {searchTerm ? 'No express bookings found matching your search' : 'No express bookings found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Load More Button */}
        {!noMoreBookings && (
          <div className="px-6 py-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <button
              onClick={loadMoreBookings}
              disabled={loadingMore}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#e60012] hover:bg-[#d40010] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e60012] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ '--tw-ring-offset-color': 'var(--panel-charcoal)' }}
            >
              {loadingMore ? 'Loading...' : 'Load More Express Bookings'}
            </button>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Update Express Booking Status</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Booking ID: {selectedBooking?.id.substring(0, 8)}...
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
              >
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={updateBookingStatus}
                className="px-4 py-2 text-sm font-medium text-white bg-[#e60012] rounded-md hover:bg-[#d40010]"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }) {
  const { bgColor, textColor } = getStatusColor(status, 'badge')
  
  return (
    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}>
      {formatStatus(status)}
    </span>
  )
}

function formatStatus(status) {
  if (!status) return 'Unknown'
  
  return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')
}

function getStatusColor(status, type) {
  switch (status) {
    case 'scheduled':
      return { bgColor: 'bg-blue-100', textColor: 'text-blue-800' }
    case 'confirmed':
      return { bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' }
    case 'in_progress':
      return { bgColor: 'bg-purple-100', textColor: 'text-purple-800' }
    case 'completed':
      return { bgColor: 'bg-green-100', textColor: 'text-green-800' }
    case 'cancelled':
      return { bgColor: 'bg-red-100', textColor: 'text-red-800' }
    default:
      return { bgColor: 'bg-gray-100', textColor: 'text-gray-800' }
  }
} 