'use client'

import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { toast } from 'react-hot-toast'

export default function TechnicianBookingModal({ isOpen, onClose, technician = null }) {
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [service, setService] = useState('')
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { currentUser } = useAuth()
  const { isDarkMode } = useTheme()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!customerName.trim() || !customerPhone.trim() || !service.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    if (!currentUser) {
      toast.error('Please login to book a technician')
      // Redirect to login page
      window.location.href = '/?showAuth=true'
      return
    }

    if (!technician) {
      toast.error('Technician information is missing')
      return
    }

    setIsSubmitting(true)
    try {
      const bookingData = {
        customerId: currentUser.uid,
        customerEmail: currentUser.email,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        service: service.trim(),
        reason: reason.trim(),
        technicianId: technician.id,
        technicianName: technician.name,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      // Save to technician-bookings collection
      await addDoc(collection(db, 'technician-bookings'), bookingData)
      
      toast.success('Technician booking submitted successfully!')
      onClose()
      setCustomerName('')
      setCustomerPhone('')
      setService('')
      setReason('')
    } catch (error) {
      console.error('Error submitting technician booking:', error)
      toast.error('Failed to submit booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }



  const handleClose = () => {
    onClose()
    setCustomerName('')
    setCustomerPhone('')
    setService('')
    setReason('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className={`max-w-md w-full rounded-lg shadow-xl transform transition-all ${
          isDarkMode ? 'bg-gray-900' : 'bg-white'
        }`}
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>
              Book Technician
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {technician && (
            <div className="mb-4 p-3 rounded-lg" style={{ background: 'var(--panel-gray)' }}>
              <p className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>
                Booking: {technician.name}
              </p>
              {technician.specialization && (
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {technician.specialization}
                </p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>
                Your Name *
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-all ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>
                Phone Number *
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-all ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="Enter your phone number"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>
                Service Required *
              </label>
              <input
                type="text"
                value={service}
                onChange={(e) => setService(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-all ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="e.g., Mobile Repair, Laptop Service"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>
                Issue Description
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-all resize-none ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="Describe your device issue..."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[#e60012] to-[#ff6b6b] text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg hover:shadow-[#e60012]/20 transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Book Technician'}
            </button>

            {!currentUser && (
              <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
                You need to be logged in to book a technician
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  )
} 