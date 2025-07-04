'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { db } from '@/firebase/config'
import { collection, addDoc } from 'firebase/firestore'
import { toast } from 'react-hot-toast'
import { FiX, FiUser, FiPhone, FiTool, FiMessageSquare } from 'react-icons/fi'

export default function TechnicianBookingModal({ isOpen, onClose, technician }) {
  const { currentUser } = useAuth()
  const { isDarkMode } = useTheme()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    service: '',
    reason: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!currentUser) {
      toast.error('Please login to book a technician')
      return
    }

    // Basic validation
    if (!formData.customerName || !formData.customerPhone || !formData.service) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      const bookingData = {
        technicianId: technician.id,
        technicianName: technician.name,
        customerId: currentUser.uid,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        service: formData.service,
        reason: formData.reason,
        status: 'pending', // pending, accepted, rejected, completed
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await addDoc(collection(db, 'bookings'), bookingData)
      
      toast.success('Booking request sent successfully!')
      onClose()
      
      // Reset form
      setFormData({
        customerName: '',
        customerPhone: '',
        service: '',
        reason: ''
      })
    } catch (error) {
      console.error('Error creating booking:', error)
      toast.error('Failed to send booking request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="w-full max-w-md rounded-xl shadow-lg p-6"
        style={{ 
          background: isDarkMode 
            ? 'linear-gradient(to bottom, var(--panel-dark), var(--panel-charcoal))' 
            : 'var(--panel-dark)',
          borderColor: 'var(--border-color)',
          borderWidth: '1px'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-main)' }}>
            Book {technician?.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-opacity-10 transition-all"
            style={{ 
              background: 'var(--panel-gray)',
              color: 'var(--text-main)'
            }}
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Technician Info */}
        <div className="mb-6 p-4 rounded-lg" style={{ background: 'var(--panel-gray)' }}>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#e60012] to-[#ff6b6b] flex items-center justify-center text-white font-medium">
              {technician?.name?.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--text-main)' }}>
                {technician?.name}
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {technician?.specialization}
              </p>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center" style={{ color: 'var(--text-secondary)' }}>
              <FiUser className="w-4 h-4 mr-2" />
              Your Name *
            </label>
            <input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-all"
              style={{ 
                background: 'var(--panel-charcoal)',
                color: 'var(--text-main)',
                borderColor: 'var(--border-color)',
                border: '1px solid var(--border-color)'
              }}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center" style={{ color: 'var(--text-secondary)' }}>
              <FiPhone className="w-4 h-4 mr-2" />
              Phone Number *
            </label>
            <input
              type="tel"
              name="customerPhone"
              value={formData.customerPhone}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-all"
              style={{ 
                background: 'var(--panel-charcoal)',
                color: 'var(--text-main)',
                borderColor: 'var(--border-color)',
                border: '1px solid var(--border-color)'
              }}
              placeholder="+91 98765 43210"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center" style={{ color: 'var(--text-secondary)' }}>
              <FiTool className="w-4 h-4 mr-2" />
              Service Required *
            </label>
            <select
              name="service"
              value={formData.service}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-all"
              style={{ 
                background: 'var(--panel-charcoal)',
                color: 'var(--text-main)',
                borderColor: 'var(--border-color)',
                border: '1px solid var(--border-color)'
              }}
              required
            >
              <option value="">Select a service</option>
              {Array.isArray(technician?.services) && technician.services.map((service, index) => (
                <option key={index} value={service}>{service}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center" style={{ color: 'var(--text-secondary)' }}>
              <FiMessageSquare className="w-4 h-4 mr-2" />
              Reason/Description
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-all"
              style={{ 
                background: 'var(--panel-charcoal)',
                color: 'var(--text-main)',
                borderColor: 'var(--border-color)',
                border: '1px solid var(--border-color)'
              }}
              placeholder="Describe your issue or what you need help with..."
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#e60012] to-[#ff6b6b] text-white py-3 px-6 rounded-lg font-medium hover:from-[#d4000e] hover:to-[#e65b5b] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sending Request...
                </>
              ) : (
                'Send Booking Request'
              )}
            </button>
          </div>
        </form>

        {/* Info */}
        <div className="mt-6 p-4 rounded-lg text-sm" style={{ 
          background: 'var(--panel-gray)',
          color: 'var(--text-secondary)'
        }}>
          <p>• The technician will review your request and respond within 24 hours</p>
          <p>• You'll be notified via phone/email about the status</p>
          <p>• Payment will be discussed after the technician accepts your request</p>
        </div>
      </div>
    </div>
  )
} 