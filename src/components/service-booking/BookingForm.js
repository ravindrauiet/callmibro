'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'react-hot-toast'
import { db } from '@/firebase/config'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

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
    
    if (!currentUser) {
      toast.error('You must be logged in to book a service')
      return
    }
    
    setLoading(true)
    
    try {
      // Save booking to Firestore
      const bookingData = {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        serviceName: service,
        serviceType: model.name,
        brandName: brand.name,
        price: model.price,
        schedule: {
          date: formData.date,
          timeSlot: formData.time
        },
        contactInfo: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address
        },
        issue: formData.issue,
        additionalNotes: formData.additionalNotes,
        status: 'scheduled',
        paymentStatus: 'pending',
        orderType: 'service',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      const docRef = await addDoc(collection(db, 'bookings'), bookingData)
      
      toast.success('Service booking created successfully!')
      
      // Call the onComplete callback if provided
      if (typeof onComplete === 'function') {
        onComplete(docRef.id);
      }
      
      // Redirect to booking confirmation page
      const confirmationUrl = `/services/booking-confirmation?bookingId=${docRef.id}&serviceName=${encodeURIComponent(service)}&serviceType=${encodeURIComponent(model.name)}&date=${encodeURIComponent(formData.date)}&timeSlot=${encodeURIComponent(formData.time)}`;
      router.push(confirmationUrl);
      
    } catch (error) {
      toast.error('Failed to create booking. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-b from-[#111] to-[#191919] border border-[#333] rounded-lg p-6 shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2 bg-gradient-to-r from-[#e60012] to-[#ff6b6b] bg-clip-text text-transparent">Booking Details</h2>
        <p className="text-gray-400">Complete your booking for {service}</p>
      </div>
      
      {/* Service Summary */}
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#222] rounded-lg p-5 mb-6 border border-[#333] shadow-md">
        <h3 className="font-medium mb-3 text-white">Service Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-400 mb-1">Service</p>
            <p className="font-medium">{service}</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">Brand</p>
            <p className="font-medium">{brand.name}</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">Model</p>
            <p className="font-medium">{model.name}</p>
          </div>
          <div className="md:col-span-3">
            <p className="text-gray-400 mb-1">Price</p>
            <p className="text-xl font-semibold bg-gradient-to-r from-[#e60012] to-[#ff6b6b] bg-clip-text text-transparent">{model.price}</p>
          </div>
        </div>
      </div>
      
      {/* Payment Preview */}
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#222] rounded-lg p-5 mb-6 border border-[#333] shadow-md">
        <h3 className="font-medium mb-3 text-white">Payment Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Service Fee</span>
            <span>{model.price}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Visit Charge</span>
            <span>₹0.00</span>
          </div>
          <div className="border-t border-[#333] my-2 pt-2 flex justify-between">
            <span className="font-medium">Total Amount</span>
            <span className="font-semibold bg-gradient-to-r from-[#e60012] to-[#ff6b6b] bg-clip-text text-transparent">{model.price}</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">Payment will be collected after service confirmation</p>
        </div>
      </div>
      
      {!currentUser && (
        <div className="bg-gradient-to-r from-red-900/30 to-red-800/20 border border-red-800 text-red-300 p-4 rounded-lg mb-6">
          <p className="font-medium">You need to login to book a service</p>
          <button 
            onClick={() => document.getElementById('login-btn')?.click()}
            className="mt-2 text-white bg-gradient-to-r from-[#e60012] to-[#ff6b6b] hover:from-[#d40010] hover:to-[#e55b5b] px-4 py-2 rounded text-sm transition-all duration-300"
          >
            Login / Sign Up
          </button>
        </div>
      )}
      
      {/* Booking Form */}
      <form onSubmit={handleSubmit}>
        <div className="space-y-5">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-medium mb-3">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-[#222] border border-[#444] rounded-md p-2.5 text-white focus:border-[#e60012] focus:outline-none transition-colors"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-[#222] border border-[#444] rounded-md p-2.5 text-white focus:border-[#e60012] focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-[#222] border border-[#444] rounded-md p-2.5 text-white focus:border-[#e60012] focus:outline-none transition-colors"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Service Address *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full bg-[#222] border border-[#444] rounded-md p-2.5 text-white focus:border-[#e60012] focus:outline-none transition-colors"
                required
              />
            </div>
          </div>
          
          {/* Appointment Details */}
          <div>
            <h3 className="text-lg font-medium mb-3">Appointment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Preferred Date *</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-[#222] border border-[#444] rounded-md p-2.5 text-white focus:border-[#e60012] focus:outline-none transition-colors"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Preferred Time *</label>
                <select
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full bg-[#222] border border-[#444] rounded-md p-2.5 text-white focus:border-[#e60012] focus:outline-none transition-colors"
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
          </div>
          
          {/* Issue Description */}
          <div>
            <h3 className="text-lg font-medium mb-3">Service Details</h3>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Describe Your Issue</label>
              <textarea
                name="issue"
                value={formData.issue}
                onChange={handleChange}
                rows="3"
                className="w-full bg-[#222] border border-[#444] rounded-md p-2.5 text-white focus:border-[#e60012] focus:outline-none transition-colors"
                placeholder="Please describe the problem you're experiencing..."
              ></textarea>
            </div>
          </div>
          
          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Additional Notes</label>
            <textarea
              name="additionalNotes"
              value={formData.additionalNotes}
              onChange={handleChange}
              rows="2"
              className="w-full bg-[#222] border border-[#444] rounded-md p-2.5 text-white focus:border-[#e60012] focus:outline-none transition-colors"
              placeholder="Any special instructions or information for the technician..."
            ></textarea>
          </div>
          
          {/* Submit Button */}
          <div className="mt-8">
            <button
              type="submit"
              disabled={loading || !currentUser}
              className={`w-full bg-gradient-to-r from-[#e60012] to-[#ff6b6b] text-white py-3.5 rounded-md font-medium ${
                (loading || !currentUser) ? 'opacity-70 cursor-not-allowed' : 'hover:from-[#d40010] hover:to-[#e55b5b] transform hover:scale-[1.01]'
              } transition-all duration-300 shadow-lg`}
            >
              {loading ? 'Processing...' : 'Confirm Booking'}
            </button>
            <p className="text-xs text-gray-400 text-center mt-3">
              By confirming, you agree to our service terms and conditions
            </p>
          </div>
        </div>
      </form>
    </div>
  )
} 