'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'react-hot-toast'
import { db } from '@/firebase/config'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

export default function BookingForm({ service, brand, model, onComplete }) {
  const { currentUser } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  
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

  // Form validation functions
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email) ? null : 'Please enter a valid email address';
  }

  const validatePhone = (phone) => {
    const regex = /^\d{10}$/;
    return regex.test(phone.replace(/[^0-9]/g, '')) ? null : 'Please enter a valid 10-digit phone number';
  }

  const validateRequired = (value, fieldName) => {
    return value.trim() ? null : `${fieldName} is required`;
  }

  const validateDate = (date) => {
    if (!date) return 'Date is required';
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return selectedDate >= today ? null : 'Date cannot be in the past';
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }))
    }
    
    // Real-time validation for specific fields
    if (name === 'email' && value.trim()) {
      setErrors(prev => ({
        ...prev,
        email: validateEmail(value)
      }))
    } else if (name === 'phone' && value.trim()) {
      setErrors(prev => ({
        ...prev,
        phone: validatePhone(value)
      }))
    } else if (name === 'date' && value) {
      setErrors(prev => ({
        ...prev,
        date: validateDate(value)
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {
      name: validateRequired(formData.name, 'Full name'),
      email: validateEmail(formData.email),
      phone: validatePhone(formData.phone),
      address: validateRequired(formData.address, 'Service address'),
      date: validateDate(formData.date),
      time: validateRequired(formData.time, 'Time slot')
    }
    
    setErrors(newErrors)
    
    // Check if any errors exist
    return !Object.values(newErrors).some(error => error !== null);
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form
    if (!validateForm()) {
      toast.error('Please correct the errors in the form')
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

  // Save form data to localStorage to prevent data loss
  useEffect(() => {
    // Load saved form data if exists
    const savedData = localStorage.getItem('bookingFormData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Only use saved data for empty fields
        setFormData(prev => ({
          ...prev,
          address: prev.address || parsedData.address || '',
          issue: prev.issue || parsedData.issue || '',
          additionalNotes: prev.additionalNotes || parsedData.additionalNotes || ''
        }));
      } catch (e) {
        // Ignore parsing errors
      }
    }
  }, []);

  // Save form data when it changes
  useEffect(() => {
    localStorage.setItem('bookingFormData', JSON.stringify({
      address: formData.address,
      issue: formData.issue,
      additionalNotes: formData.additionalNotes
    }));
  }, [formData.address, formData.issue, formData.additionalNotes]);

  return (
    <div className="bg-gradient-to-b from-[#111] to-[#191919] border border-[#333] rounded-lg p-4 sm:p-6 shadow-lg">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold mb-2 bg-gradient-to-r from-[#e60012] to-[#ff6b6b] bg-clip-text text-transparent">Booking Details</h2>
        <p className="text-gray-400">Complete your booking for {service}</p>
      </div>
      
      {/* Service Summary */}
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#222] rounded-lg p-4 sm:p-5 mb-6 border border-[#333] shadow-md">
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
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#222] rounded-lg p-4 sm:p-5 mb-6 border border-[#333] shadow-md">
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
      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-5">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-medium mb-3">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full bg-[#222] border ${errors.name ? 'border-red-500' : 'border-[#444]'} rounded-md p-2.5 text-white focus:border-[#e60012] focus:outline-none transition-colors`}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  required
                />
                {errors.name && (
                  <p id="name-error" className="mt-1 text-xs text-red-500">{errors.name}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full bg-[#222] border ${errors.email ? 'border-red-500' : 'border-[#444]'} rounded-md p-2.5 text-white focus:border-[#e60012] focus:outline-none transition-colors`}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  required
                />
                {errors.email && (
                  <p id="email-error" className="mt-1 text-xs text-red-500">{errors.email}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full bg-[#222] border ${errors.phone ? 'border-red-500' : 'border-[#444]'} rounded-md p-2.5 text-white focus:border-[#e60012] focus:outline-none transition-colors`}
                aria-describedby={errors.phone ? "phone-error" : undefined}
                required
              />
              {errors.phone && (
                <p id="phone-error" className="mt-1 text-xs text-red-500">{errors.phone}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-1">Service Address *</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`w-full bg-[#222] border ${errors.address ? 'border-red-500' : 'border-[#444]'} rounded-md p-2.5 text-white focus:border-[#e60012] focus:outline-none transition-colors`}
                aria-describedby={errors.address ? "address-error" : undefined}
                required
              />
              {errors.address && (
                <p id="address-error" className="mt-1 text-xs text-red-500">{errors.address}</p>
              )}
            </div>
          </div>
          
          {/* Appointment Details */}
          <div>
            <h3 className="text-lg font-medium mb-3">Appointment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">Preferred Date *</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full bg-[#222] border ${errors.date ? 'border-red-500' : 'border-[#444]'} rounded-md p-2.5 text-white focus:border-[#e60012] focus:outline-none transition-colors`}
                  aria-describedby={errors.date ? "date-error" : undefined}
                  required
                />
                {errors.date && (
                  <p id="date-error" className="mt-1 text-xs text-red-500">{errors.date}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-300 mb-1">Preferred Time *</label>
                <select
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className={`w-full bg-[#222] border ${errors.time ? 'border-red-500' : 'border-[#444]'} rounded-md p-2.5 text-white focus:border-[#e60012] focus:outline-none transition-colors`}
                  aria-describedby={errors.time ? "time-error" : undefined}
                  required
                >
                  <option value="">Select Time</option>
                  <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM</option>
                  <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM</option>
                  <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                  <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                </select>
                {errors.time && (
                  <p id="time-error" className="mt-1 text-xs text-red-500">{errors.time}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Issue Details */}
          <div>
            <label htmlFor="issue" className="block text-sm font-medium text-gray-300 mb-1">Describe the issue</label>
            <textarea
              id="issue"
              name="issue"
              value={formData.issue}
              onChange={handleChange}
              rows={3}
              className="w-full bg-[#222] border border-[#444] rounded-md p-2.5 text-white focus:border-[#e60012] focus:outline-none transition-colors"
              placeholder="Please describe the issue you're experiencing..."
            ></textarea>
          </div>
          
          <div>
            <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-300 mb-1">Additional Notes</label>
            <textarea
              id="additionalNotes"
              name="additionalNotes"
              value={formData.additionalNotes}
              onChange={handleChange}
              rows={2}
              className="w-full bg-[#222] border border-[#444] rounded-md p-2.5 text-white focus:border-[#e60012] focus:outline-none transition-colors"
              placeholder="Any additional information you'd like us to know..."
            ></textarea>
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || !currentUser}
              className={`w-full ${loading || !currentUser ? 'bg-gray-600' : 'bg-gradient-to-r from-[#e60012] to-[#ff6b6b] hover:from-[#d40010] hover:to-[#e55b5b]'} text-white px-6 py-3 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:ring-offset-2 focus:ring-offset-[#111]`}
              aria-busy={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : 'Book Service'}
            </button>
            
            <p className="text-xs text-gray-400 mt-3 text-center">
              By booking this service, you agree to our <a href="#" className="text-[#e60012] hover:underline">Terms of Service</a> and <a href="#" className="text-[#e60012] hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </form>
    </div>
  )
} 