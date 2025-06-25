'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'react-hot-toast'
import { db } from '@/firebase/config'
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore'
import { FiMapPin, FiUser, FiUserPlus, FiLock } from 'react-icons/fi'
import { useTheme } from '@/contexts/ThemeContext'

export default function BookingForm({ service, brand, model, onComplete }) {
  console.log('BookingForm rendering with props:', { service, brand, model });
  const { currentUser } = useAuth()
  const router = useRouter()
  const { isDarkMode } = useTheme()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [bookingFor, setBookingFor] = useState('self') // 'self' or 'other'
  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedSavedAddress, setSelectedSavedAddress] = useState('')
  const [userCoordinates, setUserCoordinates] = useState(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const [showPhoneNumberModal, setShowPhoneNumberModal] = useState(false)
  const [tempPhoneNumber, setTempPhoneNumber] = useState('')
  
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
  
  // Original user data for resetting when switching between self/other
  const [originalUserData, setOriginalUserData] = useState({
    name: '',
    email: '',
    phone: ''
  })

  // Fetch user's saved addresses and profile data
  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            setUserProfile(userData)
            
            // Save original user data for resetting
            const originalData = {
              name: userData.name || currentUser.displayName || '',
              email: userData.email || currentUser.email || '',
              phone: userData.phone || currentUser.phoneNumber || ''
            }
            setOriginalUserData(originalData)
            
            // Set form data from user profile
            setFormData(prev => ({
              ...prev,
              ...originalData
            }))
            
            // Get saved addresses
            if (userData.savedAddresses && Array.isArray(userData.savedAddresses)) {
              setSavedAddresses(userData.savedAddresses)
              
              // If user has a default address, select it
              const defaultAddress = userData.savedAddresses.find(addr => addr.isDefault)
              if (defaultAddress) {
                setSelectedSavedAddress(defaultAddress.id)
                setFormData(prev => ({
                  ...prev,
                  address: defaultAddress.fullAddress
                }))
              }
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
        }
      }
    }
    
    fetchUserData()
  }, [currentUser])
  
  // Handle booking for self/other toggle
  const handleBookingForToggle = (value) => {
    setBookingFor(value)
    
    if (value === 'self') {
      // Reset to original user data
      setFormData(prev => ({
        ...prev,
        name: originalUserData.name,
        email: originalUserData.email,
        phone: originalUserData.phone
      }))
    } else {
      // Clear fields for someone else
      setFormData(prev => ({
        ...prev,
        name: '',
        email: '',
        phone: ''
      }))
    }
  }

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
    // If phone is empty, require it
    if (!phone || phone.trim() === '') {
      return 'Phone number is required';
    }
    
    // Remove all non-numeric characters for validation
    const cleanedPhone = phone.replace(/\D/g, '');
    
    // Check if it has at least 10 digits
    if (cleanedPhone.length < 10) {
      return 'Please enter a valid 10-digit phone number';
    }
    
    // Valid phone number
    return null;
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
    
    // Allow phone to be edited even when booking for self
    if (bookingFor === 'self' && (name === 'name' || name === 'email')) {
      return
    }
    
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
    console.log('Validating form with data:', formData);
    
    const newErrors = {
      name: validateRequired(formData.name, 'Full name'),
      email: validateEmail(formData.email),
      phone: validatePhone(formData.phone),
      address: validateRequired(formData.address, 'Service address'),
      date: validateDate(formData.date),
      time: validateRequired(formData.time, 'Time slot')
    }
    
    console.log('Validation errors:', newErrors);
    setErrors(newErrors)
    
    // Check if any errors exist
    const hasErrors = Object.values(newErrors).some(error => error !== null);
    console.log('Form has errors:', hasErrors);
    return !hasErrors;
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('Form submission started with data:', formData);
    
    // Validate form
    if (!validateForm()) {
      toast.error('Please correct the errors in the form')
      console.log('Form validation failed');
      return
    }
    
    if (!currentUser) {
      toast.error('You must be logged in to book a service')
      console.log('User not logged in');
      return
    }
    
    setLoading(true)
    
    try {
      console.log('Preparing booking data for submission');
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
        isExpressBooking: false, // Flag to identify regular bookings
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      console.log('Submitting booking data to Firestore:', bookingData);
      const docRef = await addDoc(collection(db, 'bookings'), bookingData)
      console.log('Booking created with ID:', docRef.id);
      
      toast.success('Service booking created successfully!')
      
      // Call the onComplete callback if provided
      if (typeof onComplete === 'function') {
        onComplete(docRef.id);
      }
      
      // Redirect to booking confirmation page
      const confirmationUrl = `/services/booking-confirmation?bookingId=${docRef.id}&serviceName=${encodeURIComponent(service)}&serviceType=${encodeURIComponent(model.name)}&date=${encodeURIComponent(formData.date)}&timeSlot=${encodeURIComponent(formData.time)}`;
      console.log('Redirecting to:', confirmationUrl);
      router.push(confirmationUrl);
      
    } catch (error) {
      console.error('Failed to create booking:', error);
      toast.error('Failed to create booking. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleExpressBooking = () => {
    // Check if user is logged in
    if (!currentUser) {
      toast.error('You must be logged in to use express booking')
      return
    }
    
    // Check if user has a phone number
    if (!formData.phone || formData.phone.trim() === '') {
      // Show phone number collection modal
      setShowPhoneNumberModal(true)
      return
    }
    
    // User has phone number, proceed with express booking
    proceedWithExpressBooking()
  }

  // Function to process express booking after validating phone number
  const proceedWithExpressBooking = () => {
    // Set default values for quick booking
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const formattedDate = tomorrow.toISOString().split('T')[0]
    
    setFormData(prev => ({
      ...prev,
      date: formattedDate,
      time: '09:00 AM - 11:00 AM',
    }))
    
    // Create a modified submit function for express booking
    submitExpressBooking()
  }

  // Function to handle phone number submission and proceed with booking
  const handlePhoneNumberSubmit = (e) => {
    e.preventDefault()
    
    // Validate phone number
    const phoneError = validatePhone(tempPhoneNumber)
    if (phoneError) {
      toast.error(phoneError)
      return
    }
    
    // Update form data with the provided phone number
    setFormData(prev => ({
      ...prev,
      phone: tempPhoneNumber
    }))
    
    // Close modal and proceed with booking
    setShowPhoneNumberModal(false)
    proceedWithExpressBooking()
  }

  // Function to submit an express booking
  const submitExpressBooking = async () => {
    if (!currentUser) {
      toast.error('You must be logged in to book a service')
      return
    }
    
    setLoading(true)
    
    try {
      // Default address if none is provided
      const address = formData.address || "Will call to confirm address"
      
      // Save booking to Firestore with express booking flag
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
          address: address,
          bookingFor: bookingFor
        },
        coordinates: userCoordinates,
        issue: formData.issue || "Express booking - details to be confirmed",
        additionalNotes: formData.additionalNotes,
        status: 'scheduled',
        paymentStatus: 'pending',
        orderType: 'service',
        isExpressBooking: true, // Flag for express booking
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      const docRef = await addDoc(collection(db, 'bookings'), bookingData)
      
      toast.success('Express booking created successfully!')
      
      // Call the onComplete callback if provided
      if (typeof onComplete === 'function') {
        onComplete(docRef.id);
      }
      
      // Redirect to booking confirmation page
      const confirmationUrl = `/services/booking-confirmation?bookingId=${docRef.id}&serviceName=${encodeURIComponent(service)}&serviceType=${encodeURIComponent(model.name)}&date=${encodeURIComponent(formData.date)}&timeSlot=${encodeURIComponent(formData.time)}&express=true`;
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

  console.log('BookingForm before render - current state:', { 
    formData, 
    errors, 
    loading, 
    bookingFor,
    isDarkMode
  });

  return (
    <div className="border rounded-xl p-6 sm:p-8 shadow-2xl" style={{ 
      background: 'linear-gradient(to bottom, var(--panel-dark), var(--panel-charcoal))',
      borderColor: 'var(--border-color)'
    }}>
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3 bg-gradient-to-r from-[#e60012] to-[#ff6b6b] bg-clip-text text-transparent">Book Your Service</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Complete your booking details for {service} service</p>
      </div>
      
      {/* Express booking option - UPDATED DESIGN */}
      <div className="relative overflow-hidden rounded-xl p-6 mb-8 border shadow-lg transform hover:scale-[1.01] transition-all duration-300" style={{
        background: 'linear-gradient(to bottom right, var(--panel-dark-accent), var(--panel-charcoal-accent))',
        borderColor: 'var(--accent-transparent)'
      }}>
        <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-20">
          <div className="absolute transform rotate-12 w-full h-full bg-[#e60012] rounded-full"></div>
        </div>
        <h3 className="text-xl font-bold mb-3 flex items-center">
          <span className="inline-flex items-center justify-center w-8 h-8 mr-2 rounded-full bg-[#e60012]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </span>
          Express Booking
        </h3>
        <p style={{ color: 'var(--text-secondary)' }} className="mb-4">Skip the details and get instant service with our express booking option. We'll use your saved information.</p>
        <button
          type="button"
          onClick={handleExpressBooking}
          disabled={loading || !currentUser}
          className="w-full py-4 px-6 bg-gradient-to-r from-[#e60012] to-[#ff6b6b] hover:from-[#d40010] hover:to-[#e55b5b] text-white font-bold rounded-lg shadow-lg transition-all flex items-center justify-center group"
        >
          {loading ? (
            <span className="animate-pulse">Processing...</span>
          ) : (
            <>
              <span>Book Instantly</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>
      </div>
      
      {/* Service Summary - UPDATED DESIGN */}
      <div className="rounded-xl p-6 mb-8 border shadow-lg" style={{
        background: 'linear-gradient(to bottom right, var(--panel-dark), var(--panel-charcoal))',
        borderColor: 'var(--border-color)'
      }}>
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <span className="inline-flex items-center justify-center w-8 h-8 mr-2 rounded-full" style={{ background: 'var(--panel-dark)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#e60012]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          Your Service Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-lg border hover:border-[#444] transition-colors" style={{
            background: 'var(--panel-dark)',
            borderColor: 'var(--border-color)'
          }}>
            <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-1">Service Type</p>
            <p className="font-bold text-lg">{service}</p>
          </div>
          <div className="p-4 rounded-lg border hover:border-[#444] transition-colors" style={{
            background: 'var(--panel-dark)',
            borderColor: 'var(--border-color)'
          }}>
            <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-1">Selected Brand</p>
            <p className="font-bold text-lg">{brand.name}</p>
          </div>
          <div className="p-4 rounded-lg border hover:border-[#444] transition-colors" style={{
            background: 'var(--panel-dark)',
            borderColor: 'var(--border-color)'
          }}>
            <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-1">Device Model</p>
            <p className="font-bold text-lg">{model.name}</p>
          </div>
        </div>
      </div>
      
      {!currentUser && (
        <div className="bg-gradient-to-r from-red-900/30 to-red-800/20 border border-red-800 text-red-300 p-4 rounded-lg mb-8">
          <div className="flex items-start">
            <div className="mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-lg">Login Required</p>
              <p className="text-sm mb-3">You need to be logged in to book a service with us.</p>
              <button 
                onClick={() => document.getElementById('login-btn')?.click()}
                className="px-6 py-2 bg-gradient-to-r from-[#e60012] to-[#ff6b6b] hover:from-[#d40010] hover:to-[#e55b5b] text-white font-medium rounded-md shadow-md transition-all flex items-center"
              >
                <FiLock className="mr-2" size={16} />
                Login Now
              </button>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Booking for self or other - UPDATED DESIGN */}
        <div className="space-y-4 mb-2">
          <label className="block text-lg font-bold">Who needs this service?</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              onClick={() => handleBookingForToggle('self')}
              className={`p-5 rounded-xl cursor-pointer border-2 flex items-center gap-4 transition-all ${
                bookingFor === 'self' 
                  ? 'border-[#e60012] bg-gradient-to-br from-[#e60012]/10 to-[#e60012]/5' 
                  : 'hover:border-gray-600'
              }`}
              style={{ 
                borderColor: bookingFor === 'self' ? undefined : 'var(--border-color)',
                background: bookingFor === 'self' ? undefined : 'var(--panel-charcoal)'
              }}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                bookingFor === 'self' ? 'bg-[#e60012]' : ''
              }`} style={{ 
                background: bookingFor === 'self' ? undefined : 'var(--panel-dark)'
              }}>
                <FiUser size={24} className="text-white" />
              </div>
              <div>
                <p className={`font-bold text-lg ${bookingFor === 'self' ? 'text-white' : ''}`} style={{ 
                  color: bookingFor === 'self' ? undefined : 'var(--text-main)'
                }}>For Myself</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>We'll use your profile information</p>
              </div>
              {bookingFor === 'self' && (
                <div className="ml-auto">
                  <div className="w-6 h-6 rounded-full bg-[#e60012] flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
            <div 
              onClick={() => handleBookingForToggle('other')}
              className={`p-5 rounded-xl cursor-pointer border-2 flex items-center gap-4 transition-all ${
                bookingFor === 'other' 
                  ? 'border-[#e60012] bg-gradient-to-br from-[#e60012]/10 to-[#e60012]/5' 
                  : 'hover:border-gray-600'
              }`}
              style={{ 
                borderColor: bookingFor === 'other' ? undefined : 'var(--border-color)',
                background: bookingFor === 'other' ? undefined : 'var(--panel-charcoal)'
              }}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                bookingFor === 'other' ? 'bg-[#e60012]' : ''
              }`} style={{ 
                background: bookingFor === 'other' ? undefined : 'var(--panel-dark)'
              }}>
                <FiUserPlus size={24} className="text-white" />
              </div>
              <div>
                <p className={`font-bold text-lg ${bookingFor === 'other' ? 'text-white' : ''}`} style={{ 
                  color: bookingFor === 'other' ? undefined : 'var(--text-main)'
                }}>For Someone Else</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Enter their contact details</p>
              </div>
              {bookingFor === 'other' && (
                <div className="ml-auto">
                  <div className="w-6 h-6 rounded-full bg-[#e60012] flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Customer Information Section - UPDATED */}
        {bookingFor === 'self' ? (
          <div className="rounded-xl p-6 border shadow-lg" style={{ 
            background: 'var(--panel-dark)', 
            borderColor: 'var(--border-color)' 
          }}>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <span className="inline-flex items-center justify-center w-8 h-8 mr-2 rounded-full" style={{ background: 'var(--panel-charcoal)' }}>
                <FiUser className="h-4 w-4 text-[#e60012]" />
              </span>
              Your Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-lg" style={{ background: 'var(--panel-charcoal)' }}>
                <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-1">Full Name</p>
                <p className="font-bold">{formData.name || 'Not provided'}</p>
              </div>
              <div className="p-4 rounded-lg" style={{ background: 'var(--panel-charcoal)' }}>
                <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-1">Email Address</p>
                <p className="font-bold">{formData.email || 'Not provided'}</p>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label htmlFor="phone" className="block text-sm font-medium">Phone Number</label>
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange}
                  placeholder="Enter 10-digit phone number"
                  className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-colors ${
                    errors.phone ? 'border-red-600 bg-red-50/10' : ''
                  }`}
                  style={{ 
                    background: errors.phone ? 'var(--panel-charcoal)' : 'var(--panel-charcoal)', 
                    borderColor: errors.phone ? '#e60012' : 'var(--border-color)',
                    color: 'var(--text-main)'
                  }}
                  required
                />
                {errors.phone && (
                  <div className="flex items-center mt-1 text-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-xs">{errors.phone}</p>
                  </div>
                )}
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Please enter a valid 10-digit phone number (required)
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium">Full Name</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                value={formData.name} 
                onChange={handleChange}
                placeholder="Enter full name"
                className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-colors ${
                  errors.name ? 'border-red-600' : ''
                }`}
                style={{ 
                  background: 'var(--panel-charcoal)', 
                  borderColor: errors.name ? undefined : 'var(--border-color)',
                  color: 'var(--text-main)'
                }}
                required
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium">Phone Number</label>
              <input 
                type="tel" 
                id="phone" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange}
                placeholder="Enter 10-digit phone number"
                className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-colors ${
                  errors.phone ? 'border-red-600 bg-red-50/10' : ''
                }`}
                style={{ 
                  background: errors.phone ? 'var(--panel-charcoal)' : 'var(--panel-charcoal)', 
                  borderColor: errors.phone ? '#e60012' : 'var(--border-color)',
                  color: 'var(--text-main)'
                }}
                required
              />
              {errors.phone && (
                <div className="flex items-center mt-1 text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-xs">{errors.phone}</p>
                </div>
              )}
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Please enter a valid 10-digit phone number (required)
              </p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="email" className="block text-sm font-medium">Email Address</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange}
                placeholder="Enter email address"
                className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-colors ${
                  errors.email ? 'border-red-600' : ''
                }`}
                style={{ 
                  background: 'var(--panel-charcoal)', 
                  borderColor: errors.email ? undefined : 'var(--border-color)',
                  color: 'var(--text-main)'
                }}
                required
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
          </div>
        )}

        {/* Address Section - UPDATED DESIGN */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <span className="inline-flex items-center justify-center w-8 h-8 mr-2 rounded-full" style={{ background: 'var(--panel-charcoal)' }}>
              <FiMapPin className="h-4 w-4 text-[#e60012]" />
            </span>
            Service Location
          </h3>
          
          <div className="p-6 rounded-xl border" style={{ 
            background: 'var(--panel-dark)', 
            borderColor: 'var(--border-color)' 
          }}>
            {/* Saved addresses selector - only show if user has saved addresses */}
            {currentUser && savedAddresses.length > 0 && (
              <div className="mb-6">
                <label className="block text-base font-medium mb-3">
                  Select a Saved Address
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => {
                        setSelectedSavedAddress(addr.id);
                        setFormData(prev => ({
                          ...prev,
                          address: addr.fullAddress
                        }));
                      }}
                      className={`cursor-pointer p-3 rounded-lg border ${
                        selectedSavedAddress === addr.id
                          ? 'border-[#e60012] bg-[#e60012]/10'
                          : 'hover:border-gray-600'
                      }`}
                      style={{ 
                        borderColor: selectedSavedAddress === addr.id ? undefined : 'var(--border-color)',
                        background: selectedSavedAddress === addr.id ? undefined : 'var(--panel-charcoal)'
                      }}
                    >
                      <div className="flex items-start">
                        <div className="mr-3">
                          {selectedSavedAddress === addr.id ? (
                            <div className="w-5 h-5 rounded-full bg-[#e60012] flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border" style={{ borderColor: 'var(--border-color)' }}></div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{addr.name}</p>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{addr.fullAddress.substring(0, 50)}...</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Location detection */}
            {navigator.geolocation && (
              <button 
                type="button"
                onClick={getCurrentLocation}
                className="w-full mb-4 py-3 px-4 rounded-lg border hover:border-gray-600 flex items-center justify-center transition-all group"
                style={{ 
                  background: 'var(--panel-charcoal)', 
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-main)'
                }}
                disabled={isLoadingLocation}
              >
                {isLoadingLocation ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    <span>Detecting your location...</span>
                  </>
                ) : (
                  <>
                    <FiMapPin className="mr-2 group-hover:text-[#e60012] transition-colors" />
                    <span>Use my current location</span>
                  </>
                )}
              </button>
            )}
            
            {/* Address textarea */}
            <div>
              <label htmlFor="address" className="block text-base font-medium mb-3">
                Service Address
              </label>
              <textarea 
                id="address" 
                name="address" 
                value={formData.address} 
                onChange={handleChange}
                placeholder="Enter your complete address for service"
                rows="3"
                className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-colors ${
                  errors.address ? 'border-red-600' : ''
                }`}
                style={{ 
                  background: 'var(--panel-charcoal)', 
                  borderColor: errors.address ? undefined : 'var(--border-color)',
                  color: 'var(--text-main)'
                }}
                required
              ></textarea>
              {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
              
              <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                Please provide a complete address including landmarks to help our technician locate you easily.
              </p>
            </div>
          </div>
        </div>

        {/* Modern Date & Time Selector */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <span className="inline-flex items-center justify-center w-8 h-8 mr-2 rounded-full" style={{ background: 'var(--panel-charcoal)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#e60012]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </span>
            Schedule Service
          </h3>
          
          <div className="p-6 rounded-xl border" style={{ 
            background: 'var(--panel-dark)', 
            borderColor: 'var(--border-color)' 
          }}>
            {/* Date selector */}
            <div className="mb-6">
              <label htmlFor="date" className="block text-base font-medium mb-3">Select Date</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, dayOffset) => {
                  const date = new Date();
                  date.setDate(date.getDate() + dayOffset);
                  const dateString = date.toISOString().split('T')[0];
                  const isSelected = formData.date === dateString;
                  
                  return (
                    <div 
                      key={dateString}
                      onClick={() => {
                        setFormData(prev => ({...prev, date: dateString}));
                        setErrors(prev => ({...prev, date: null}));
                      }}
                      className={`relative overflow-hidden rounded-lg cursor-pointer transition-all border-2 ${
                        isSelected 
                          ? 'border-[#e60012] bg-gradient-to-b from-[#e60012]/10 to-[#e60012]/5' 
                          : 'hover:border-gray-600'
                      }`}
                      style={{ 
                        borderColor: isSelected ? undefined : 'var(--border-color)',
                        background: isSelected ? undefined : 'var(--panel-charcoal)'
                      }}
                    >
                      <div className="px-2 py-1 text-center">
                        <p style={{ color: 'var(--text-secondary)' }} className="text-xs">{date.toLocaleDateString('en-US', {weekday: 'short'})}</p>
                        <p className={`text-2xl font-bold ${isSelected ? 'text-white' : ''}`} style={{ color: isSelected ? undefined : 'var(--text-main)' }}>
                          {date.getDate()}
                        </p>
                        <p style={{ color: 'var(--text-secondary)' }} className="text-xs">
                          {date.toLocaleDateString('en-US', {month: 'short'})}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-[#e60012]"></div>
                      )}
                    </div>
                  );
                })}
              </div>
              {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
            </div>
            
            {/* Time selector */}
            <div>
              <label className="block text-base font-medium mb-3">Select Time Slot</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['09:00 AM - 11:00 AM', '11:00 AM - 01:00 PM', '01:00 PM - 03:00 PM', 
                 '03:00 PM - 05:00 PM', '05:00 PM - 07:00 PM'].map((timeSlot) => {
                  const isSelected = formData.time === timeSlot;
                  
                  return (
                    <div 
                      key={timeSlot}
                      onClick={() => {
                        setFormData(prev => ({...prev, time: timeSlot}));
                        setErrors(prev => ({...prev, time: null}));
                      }}
                      className={`relative rounded-lg cursor-pointer transition-all border ${
                        isSelected 
                          ? 'border-[#e60012] bg-[#e60012]/10' 
                          : 'hover:border-gray-600'
                      } p-3`}
                      style={{ 
                        borderColor: isSelected ? undefined : 'var(--border-color)',
                        background: isSelected ? undefined : 'var(--panel-charcoal)'
                      }}
                    >
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full mr-2 ${isSelected ? 'bg-[#e60012]' : 'border'}`} style={{ borderColor: isSelected ? undefined : 'var(--border-color)' }}>
                          {isSelected && (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                        <span className={isSelected ? 'text-white' : ''} style={{ color: isSelected ? undefined : 'var(--text-main)' }}>
                          {timeSlot}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {errors.time && <p className="text-xs text-red-500 mt-1">{errors.time}</p>}
            </div>
          </div>
        </div>

        {/* Issue Description - UPDATED DESIGN */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <span className="inline-flex items-center justify-center w-8 h-8 mr-2 rounded-full" style={{ background: 'var(--panel-dark)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#e60012]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </span>
            Problem Details
          </h3>
          
          <div className="p-6 rounded-xl border" style={{ 
            background: 'var(--panel-dark)', 
            borderColor: 'var(--border-color)' 
          }}>
            {/* Issue description textarea */}
            <div className="mb-6">
              <label htmlFor="issue" className="block text-base font-medium mb-3">
                Describe the issue you're experiencing
              </label>
              <textarea 
                id="issue" 
                name="issue" 
                value={formData.issue} 
                onChange={handleChange}
                placeholder="Example: My phone screen is cracked and unresponsive on the right side..."
                rows="3"
                className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-colors"
                style={{ 
                  background: 'var(--panel-charcoal)', 
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-main)'
                }}
              ></textarea>
            </div>
            
            {/* Additional notes textarea */}
            <div>
              <label htmlFor="additionalNotes" className="block text-base font-medium mb-3">
                Additional Notes (Optional)
              </label>
              <textarea 
                id="additionalNotes" 
                name="additionalNotes" 
                value={formData.additionalNotes} 
                onChange={handleChange}
                placeholder="Example: The security code to enter the building is 2580..."
                rows="2"
                className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-colors"
                style={{ 
                  background: 'var(--panel-charcoal)', 
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-main)'
                }}
              ></textarea>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex flex-col items-center">
            <button
              type="submit"
              disabled={loading || !currentUser}
              className="w-full py-4 px-8 bg-gradient-to-r from-[#e60012] to-[#ff6b6b] hover:from-[#d40010] hover:to-[#e55b5b] text-white text-lg font-bold rounded-xl shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  <span>Processing your booking...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <span>Complete Booking</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
            </button>
            <p style={{ color: 'var(--text-secondary)' }} className="text-sm mt-3 text-center">
              By completing this booking, you agree to our <span className="text-[#e60012] cursor-pointer">Terms of Service</span>
            </p>
          </div>
        </div>
      </form>

      {/* Phone Number Collection Modal */}
      {showPhoneNumberModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="border rounded-xl p-6 max-w-md w-full shadow-2xl animate-fadeIn" style={{ 
            background: 'var(--panel-dark)', 
            borderColor: 'var(--border-color)' 
          }}>
            <h3 className="text-xl font-bold mb-4">One More Step</h3>
            <p style={{ color: 'var(--text-secondary)' }} className="mb-4">We need your phone number to complete your express booking.</p>
            
            <form onSubmit={handlePhoneNumberSubmit} className="space-y-4">
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium mb-1">Phone Number</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  value={tempPhoneNumber}
                  onChange={(e) => setTempPhoneNumber(e.target.value)}
                  placeholder="Enter your 10-digit phone number"
                  className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e60012]"
                  style={{ 
                    background: 'var(--panel-charcoal)', 
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-main)'
                  }}
                  required
                />
              </div>
              
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPhoneNumberModal(false)}
                  className="flex-1 py-3 px-4 border rounded-lg transition-colors"
                  style={{ 
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-main)',
                    background: 'var(--panel-charcoal)'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-[#e60012] to-[#ff6b6b] text-white font-medium rounded-lg hover:from-[#d40010] hover:to-[#e55b5b] transition-colors"
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 