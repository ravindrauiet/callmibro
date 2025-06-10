'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'react-hot-toast'

export default function BookingForm({ service, brand, model, onComplete }) {
  const { currentUser } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: currentUser?.displayName || '',
    email: currentUser?.email || '',
    phone: currentUser?.phoneNumber || '',
    address: '',
    date: '',
    time: '',
    issue: '',
    additionalNotes: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form
    if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.date || !formData.time) {
      toast.error('Please fill all required fields')
      return
    }
    
    setLoading(true)
    
    try {
      // Simulate API call to save booking
      // In a real app, this would be a call to your backend/Firebase
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success('Service booking created successfully!')
      onComplete()
    } catch (error) {
      console.error('Error creating booking:', error)
      toast.error('Failed to create booking. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#111] border border-[#222] rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Booking Details</h2>
        <p className="text-gray-400">Complete your booking for {service}</p>
      </div>
      
      {/* Service Summary */}
      <div className="bg-[#222] rounded-lg p-4 mb-6">
        <h3 className="font-medium mb-2">Service Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Service</p>
            <p>{service}</p>
          </div>
          <div>
            <p className="text-gray-400">Brand</p>
            <p>{brand.name}</p>
          </div>
          <div>
            <p className="text-gray-400">Model</p>
            <p>{model.name}</p>
          </div>
          <div>
            <p className="text-gray-400">Price</p>
            <p className="text-[#e60012] font-medium">{model.price}</p>
          </div>
        </div>
      </div>
      
      {/* Booking Form */}
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-[#222] border border-[#333] rounded p-2 text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-[#222] border border-[#333] rounded p-2 text-white"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-[#222] border border-[#333] rounded p-2 text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Service Address *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full bg-[#222] border border-[#333] rounded p-2 text-white"
                required
              />
            </div>
          </div>
          
          {/* Appointment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Preferred Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-[#222] border border-[#333] rounded p-2 text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Preferred Time *</label>
              <select
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full bg-[#222] border border-[#333] rounded p-2 text-white"
                required
              >
                <option value="">Select Time</option>
                <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM</option>
                <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM</option>
                <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
              </select>
            </div>
          </div>
          
          {/* Issue Description */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Describe Your Issue</label>
            <textarea
              name="issue"
              value={formData.issue}
              onChange={handleChange}
              rows="3"
              className="w-full bg-[#222] border border-[#333] rounded p-2 text-white"
            ></textarea>
          </div>
          
          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Additional Notes</label>
            <textarea
              name="additionalNotes"
              value={formData.additionalNotes}
              onChange={handleChange}
              rows="2"
              className="w-full bg-[#222] border border-[#333] rounded p-2 text-white"
            ></textarea>
          </div>
          
          {/* Submit Button */}
          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-[#e60012] text-white py-3 rounded-md font-medium ${
                loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-700'
              } transition-colors`}
            >
              {loading ? 'Processing...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
} 