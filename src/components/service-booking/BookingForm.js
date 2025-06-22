'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'react-hot-toast'
import { db } from '@/firebase/config'
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore'
import { FiMapPin, FiUser, FiUserPlus } from 'react-icons/fi'

export default function BookingForm({ service, brand, model, onComplete }) {
  const { currentUser } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [bookingFor, setBookingFor] = useState('self') // 'self' or 'other'
  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedSavedAddress, setSelectedSavedAddress] = useState('')
  const [userCoordinates, setUserCoordinates] = useState(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  
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

  // Fetch user's saved addresses
  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            
            // Set form data from user profile
            setFormData(prev => ({
              ...prev,
              name: userData.name || currentUser.displayName || prev.name,
              email: userData.email || currentUser.email || prev.email,
              phone: userData.phone || prev.phone
            }))
            
            // Get saved addresses
            if (userData.savedAddresses && Array.isArray(userData.savedAddresses)) {
              setSavedAddresses(userData.savedAddresses)
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
        }
      }
    }
    
    fetchUserData()
  }, [currentUser])

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }
    
    setIsLoadingLocation(true)
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserCoordinates({ latitude, longitude })
        
        // In a real app, we would use reverse geocoding to get the address
        // For now, just show the coordinates
        setFormData(prev => ({
          ...prev,
          address: `Location detected: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        }))
        
        toast.success('Location detected successfully')
        setIsLoadingLocation(false)
      },
      (error) => {
        console.error('Error getting location:', error)
        toast.error('Failed to get your location. Please enter your address manually.')
        setIsLoadingLocation(false)
      },
      { enableHighAccuracy: true }
    )
  }

  // Handle saved address selection
  const handleAddressSelect = (e) => {
    const addressId = e.target.value
    setSelectedSavedAddress(addressId)
    
    if (addressId) {
      const selectedAddress = savedAddresses.find(addr => addr.id === addressId)
      if (selectedAddress) {
        setFormData(prev => ({
          ...prev,
          address: selectedAddress.fullAddress
        }))
      }
    }
  }

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
          address: formData.address,
          bookingFor: bookingFor
        },
        coordinates: userCoordinates,
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

  const handleExpressBooking = () => {
    // Skip form filling and go to confirmation immediately
    if (!currentUser) {
      toast.error('You must be logged in to use express booking')
      return
    }
    
    // Set default values for quick booking
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const formattedDate = tomorrow.toISOString().split('T')[0]
    
    setFormData(prev => ({
      ...prev,
      date: formattedDate,
      time: '09:00 AM - 11:00 AM',
    }))
    
    // Submit the form with defaults
    handleSubmit({ preventDefault: () => {} })
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
      
      {/* Express booking option */}
      <div className="bg-gradient-to-br from-[#2a1a1a] to-[#331a1a] rounded-lg p-4 sm:p-5 mb-6 border border-[#e60012]/50 shadow-md">
        <h3 className="font-medium mb-3 text-white">Express Booking</h3>
        <p className="text-gray-300 text-sm mb-3">Want to skip the form? Book your service with one click and we'll use your saved information.</p>
        <button
          type="button"
          onClick={handleExpressBooking}
          disabled={loading || !currentUser}
          className="w-full py-3 px-4 bg-gradient-to-r from-[#e60012] to-[#ff6b6b] hover:from-[#d40010] hover:to-[#e55b5b] text-white font-medium rounded-md shadow-sm transition-colors flex items-center justify-center"
        >
          {loading ? (
            <span className="animate-pulse">Processing...</span>
          ) : (
            <>Continue to Book Your Service</>
          )}
        </button>
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
        </div>
      </div>
      
      {!currentUser && (
        <div className="bg-gradient-to-r from-red-900/30 to-red-800/20 border border-red-800 text-red-300 p-4 rounded-lg mb-6">
          <p className="font-medium">You need to login to book a service</p>
          <button 
            onClick={() => document.getElementById('login-btn')?.click()}
            className="mt-2 text-white bg-gradient-to-r from-[#e60012] to-[#ff6b6b] hover:from-[#d40010] hover:to-[#e55b5b] px-4 py-2 rounded text-sm transition-all duration-300"
          >
            Login Now
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Booking for self or other */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">Who are you booking this service for?</label>
          <div className="flex gap-3">
            <div 
              onClick={() => setBookingFor('self')}
              className={`flex-1 p-4 rounded-lg cursor-pointer border flex items-center gap-2 transition-all ${
                bookingFor === 'self' 
                  ? 'border-[#e60012] bg-[#e60012]/10' 
                  : 'border-[#333] hover:border-gray-600'
              }`}
            >
              <FiUser size={18} className={bookingFor === 'self' ? 'text-[#e60012]' : 'text-gray-400'} />
              <div>
                <p className={`font-medium ${bookingFor === 'self' ? 'text-white' : 'text-gray-300'}`}>Myself</p>
                <p className="text-xs text-gray-500">Use my profile information</p>
              </div>
            </div>
            <div 
              onClick={() => setBookingFor('other')}
              className={`flex-1 p-4 rounded-lg cursor-pointer border flex items-center gap-2 transition-all ${
                bookingFor === 'other' 
                  ? 'border-[#e60012] bg-[#e60012]/10' 
                  : 'border-[#333] hover:border-gray-600'
              }`}
            >
              <FiUserPlus size={18} className={bookingFor === 'other' ? 'text-[#e60012]' : 'text-gray-400'} />
              <div>
                <p className={`font-medium ${bookingFor === 'other' ? 'text-white' : 'text-gray-300'}`}>Someone else</p>
                <p className="text-xs text-gray-500">Enter their details</p>
              </div>
            </div>
          </div>
        </div>
      
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-white">Full Name</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              value={formData.name} 
              onChange={handleChange}
              placeholder="Enter full name"
              className={`w-full px-4 py-3 bg-[#222] border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-colors ${
                errors.name ? 'border-red-600' : 'border-[#333]'
              }`}
              required
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="block text-sm font-medium text-white">Phone Number</label>
            <input 
              type="tel" 
              id="phone" 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange}
              placeholder="Enter 10-digit phone number"
              className={`w-full px-4 py-3 bg-[#222] border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-colors ${
                errors.phone ? 'border-red-600' : 'border-[#333]'
              }`}
              required
            />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="email" className="block text-sm font-medium text-white">Email Address</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange}
              placeholder="Enter email address"
              className={`w-full px-4 py-3 bg-[#222] border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-colors ${
                errors.email ? 'border-red-600' : 'border-[#333]'
              }`}
              required
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div className="space-y-2 md:col-span-2">
            {/* Saved addresses selector */}
            {currentUser && savedAddresses.length > 0 && (
              <div className="mb-4">
                <label htmlFor="savedAddress" className="block text-sm font-medium text-white mb-2">
                  Use a saved address
                </label>
                <div className="flex gap-2">
                  <select
                    id="savedAddress"
                    value={selectedSavedAddress}
                    onChange={handleAddressSelect}
                    className="flex-grow px-4 py-3 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-[#e60012]"
                  >
                    <option value="">Select a saved address</option>
                    {savedAddresses.map((addr) => (
                      <option key={addr.id} value={addr.id}>
                        {addr.name} - {addr.fullAddress.substring(0, 30)}...
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center">
              <label htmlFor="address" className="block text-sm font-medium text-white">Service Address</label>
              {/* Location detection button */}
              {navigator.geolocation && (
                <button 
                  type="button"
                  onClick={getCurrentLocation}
                  className="text-xs flex items-center gap-1 text-[#e60012] hover:text-[#ff6b6b]"
                  disabled={isLoadingLocation}
                >
                  <FiMapPin size={14} />
                  {isLoadingLocation ? 'Detecting...' : 'Use my current location'}
                </button>
              )}
            </div>
            
            <textarea 
              id="address" 
              name="address" 
              value={formData.address} 
              onChange={handleChange}
              placeholder="Enter complete service address"
              rows="3"
              className={`w-full px-4 py-3 bg-[#222] border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-colors ${
                errors.address ? 'border-red-600' : 'border-[#333]'
              }`}
              required
            ></textarea>
            {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="date" className="block text-sm font-medium text-white">Preferred Date</label>
            <input 
              type="date" 
              id="date" 
              name="date" 
              value={formData.date} 
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-3 bg-[#222] border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-colors ${
                errors.date ? 'border-red-600' : 'border-[#333]'
              }`}
              required
            />
            {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="time" className="block text-sm font-medium text-white">Preferred Time</label>
            <select 
              id="time" 
              name="time" 
              value={formData.time} 
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-[#222] border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-colors ${
                errors.time ? 'border-red-600' : 'border-[#333]'
              }`}
              required
            >
              <option value="">Select Time Slot</option>
              <option value="09:00 AM - 11:00 AM">9:00 AM - 11:00 AM</option>
              <option value="11:00 AM - 01:00 PM">11:00 AM - 1:00 PM</option>
              <option value="01:00 PM - 03:00 PM">1:00 PM - 3:00 PM</option>
              <option value="03:00 PM - 05:00 PM">3:00 PM - 5:00 PM</option>
              <option value="05:00 PM - 07:00 PM">5:00 PM - 7:00 PM</option>
            </select>
            {errors.time && <p className="text-xs text-red-500 mt-1">{errors.time}</p>}
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="issue" className="block text-sm font-medium text-white">Issue Description</label>
            <textarea 
              id="issue" 
              name="issue" 
              value={formData.issue} 
              onChange={handleChange}
              placeholder="Describe the issue you're experiencing"
              rows="2"
              className="w-full px-4 py-3 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-colors"
            ></textarea>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="additionalNotes" className="block text-sm font-medium text-white">Additional Notes (Optional)</label>
            <textarea 
              id="additionalNotes" 
              name="additionalNotes" 
              value={formData.additionalNotes} 
              onChange={handleChange}
              placeholder="Any additional information you want us to know"
              rows="2"
              className="w-full px-4 py-3 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-colors"
            ></textarea>
          </div>
        </div>

        <div className="pt-4 border-t border-[#333]">
          <button
            type="submit"
            disabled={loading || !currentUser}
            className="w-full py-3 px-4 bg-gradient-to-r from-[#e60012] to-[#ff6b6b] hover:from-[#d40010] hover:to-[#e55b5b] text-white font-medium rounded-md shadow-sm transition-colors flex items-center justify-center"
          >
            {loading ? (
              <span className="animate-pulse">Processing...</span>
            ) : (
              <>Complete Booking</>
            )}
          </button>
        </div>
      </form>
    </div>
  )
} 