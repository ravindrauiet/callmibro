'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { db, auth } from '@/firebase/config';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { FiCalendar, FiClock, FiMapPin, FiArrowLeft, FiArrowRight, FiInfo } from 'react-icons/fi';

// Available time slots
const timeSlots = [
  '09:00 AM - 11:00 AM',
  '11:00 AM - 01:00 PM',
  '02:00 PM - 04:00 PM',
  '04:00 PM - 06:00 PM',
  '06:00 PM - 08:00 PM'
];

export default function ScheduleAddressPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get query parameters
  const bookingId = searchParams.get('bookingId');
  const serviceId = searchParams.get('serviceId');
  const technicianId = searchParams.get('technicianId');
  
  // Form state
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    landmark: ''
  });
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookingData, setBookingData] = useState(null);

  // Generate available dates (next 7 days)
  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date.toISOString().split('T')[0];
  });

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, we would use reverse geocoding to get the address
          // For this demo, we'll just set a placeholder
          setAddress({
            street: 'Detected Street Address',
            city: 'Detected City',
            state: 'Detected State',
            zipCode: 'Detected ZIP',
            landmark: ''
          });
          setUseCurrentLocation(true);
          setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Failed to get your current location. Please enter your address manually.');
          setUseCurrentLocation(false);
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser. Please enter your address manually.');
    }
  };

  // Handle address field changes
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  // Fetch booking data from Firestore
  useEffect(() => {
    async function fetchBookingData() {
      if (!bookingId) return;
      
      try {
        setLoading(true);
        const bookingRef = doc(db, 'bookings', bookingId);
        const bookingSnapshot = await getDoc(bookingRef);
        
        if (bookingSnapshot.exists()) {
          const data = bookingSnapshot.data();
          setBookingData(data);
          
          // Pre-fill address if user has previous bookings
          if (data.address) {
            setAddress(data.address);
          }
        } else {
          setError('Booking not found. Please restart the booking process.');
        }
      } catch (error) {
        console.error('Error fetching booking:', error);
        setError('Failed to load booking data. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchBookingData();
  }, [bookingId]);

  // Save schedule and address to Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDate) {
      setError('Please select a date');
      return;
    }
    
    if (!selectedTimeSlot) {
      setError('Please select a time slot');
      return;
    }
    
    if (!address.street || !address.city || !address.zipCode) {
      setError('Please fill in all required address fields');
      return;
    }
    
    try {
      setLoading(true);
      
      if (!bookingId) {
        // Create new booking if bookingId doesn't exist
        // In a real app, we'd get the user ID from auth
        const userId = auth.currentUser?.uid || 'guest-user';
        
        const newBookingRef = doc(collection(db, 'bookings'));
        await setDoc(newBookingRef, {
          userId,
          serviceId,
          technicianId,
          schedule: {
            date: selectedDate,
            timeSlot: selectedTimeSlot
          },
          address,
          status: 'scheduled',
          createdAt: new Date()
        });
        
        // Navigate to confirmation page with new booking ID
        router.push(`/services/booking-confirmation?bookingId=${newBookingRef.id}`);
      } else {
        // Update existing booking
        const bookingRef = doc(db, 'bookings', bookingId);
        await updateDoc(bookingRef, {
          schedule: {
            date: selectedDate,
            timeSlot: selectedTimeSlot
          },
          address,
          updatedAt: new Date()
        });
        
        // Navigate to confirmation page
        router.push(`/services/booking-confirmation?bookingId=${bookingId}`);
      }
    } catch (error) {
      console.error('Error saving booking:', error);
      setError('Failed to save your booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Go back to previous step
  const handleBack = () => {
    router.back();
  };

  // For demo purposes - just go to confirmation
  const handleNext = () => {
    if (!selectedDate || !selectedTimeSlot || !address.street || !address.city || !address.zipCode) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Navigate to confirmation page (demo only)
    router.push('/services/booking-confirmation');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Progress Indicator */}
      <div className="bg-[#111] py-4 border-b border-[#333]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto mb-10">
            <div className="flex justify-between relative">
              <div className="flex flex-col items-center z-10">
                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                  <span className="text-white">✓</span>
                </div>
                <span className="text-sm mt-2 text-gray-400">Select Service</span>
              </div>
              
              <div className="flex flex-col items-center z-10">
                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                  <span className="text-white">✓</span>
                </div>
                <span className="text-sm mt-2 text-gray-400">Search Technician</span>
              </div>
              
              <div className="flex flex-col items-center z-10">
                <div className="w-10 h-10 rounded-full bg-[#e60012] flex items-center justify-center">
                  <span className="text-white">3</span>
                </div>
                <span className="text-sm mt-2 text-white font-medium">Schedule & Address</span>
              </div>
              
              <div className="flex flex-col items-center z-10">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                  <span className="text-white">4</span>
                </div>
                <span className="text-sm mt-2 text-gray-500">Confirmation</span>
              </div>
              
              {/* Progress Line */}
              <div className="absolute top-5 left-0 w-full h-1 bg-gray-700 -z-0">
                <div className="h-full bg-green-600" style={{width: '66%'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">Schedule & Address</h1>
        <p className="text-gray-400 text-center mb-8">Choose a convenient time and provide your address</p>
        
        {error && (
          <div className="bg-red-900/50 text-red-200 p-4 rounded-lg mb-6 max-w-3xl mx-auto">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Schedule Panel */}
            <div className="bg-[#1a1a1a] rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FiCalendar className="mr-2" /> Select Date & Time
              </h2>
              
              {/* Date Selection */}
              <div className="mb-6">
                <label className="block text-gray-400 mb-2">Select Date</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availableDates.map((date) => {
                    const formattedDate = new Date(date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    });
                    
                    return (
                      <button
                        key={date}
                        type="button"
                        className={`py-3 px-2 rounded-md text-center ${
                          selectedDate === date
                            ? 'bg-red-600 text-white'
                            : 'bg-[#222] text-white hover:bg-[#333]'
                        }`}
                        onClick={() => setSelectedDate(date)}
                      >
                        {formattedDate}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Time Selection */}
              <div>
                <label className="block text-gray-400 mb-2">Select Time Slot</label>
                <div className="relative">
                  <select
                    value={selectedTimeSlot}
                    onChange={(e) => setSelectedTimeSlot(e.target.value)}
                    className="w-full bg-[#222] border border-[#333] rounded-md py-3 px-4 text-white appearance-none"
                    required
                  >
                    <option value="">Select a time slot</option>
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-3 text-red-500 pointer-events-none">
                    <FiClock />
                  </div>
                </div>
              </div>
            </div>

            {/* Address Panel */}
            <div className="bg-[#111] rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FiMapPin className="mr-2" /> Your Address
              </h2>
              
              {/* Current Location Button */}
              <button
                type="button"
                onClick={getCurrentLocation}
                className="w-full mb-4 bg-[#222] hover:bg-[#333] text-white py-2 px-4 rounded-md flex items-center justify-center"
              >
                <span className="mr-2">📍</span> Use My Current Location
              </button>
              
              {/* Address Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 mb-1">Street Address*</label>
                  <input
                    type="text"
                    name="street"
                    value={address.street}
                    onChange={handleAddressChange}
                    className="w-full bg-[#222] border border-[#333] rounded-md py-2 px-4 text-white"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 mb-1">City*</label>
                    <input
                      type="text"
                      name="city"
                      value={address.city}
                      onChange={handleAddressChange}
                      className="w-full bg-[#222] border border-[#333] rounded-md py-2 px-4 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">ZIP Code*</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={address.zipCode}
                      onChange={handleAddressChange}
                      className="w-full bg-[#222] border border-[#333] rounded-md py-2 px-4 text-white"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-400 mb-1">State/Province*</label>
                  <input
                    type="text"
                    name="state"
                    value={address.state}
                    onChange={handleAddressChange}
                    className="w-full bg-[#222] border border-[#333] rounded-md py-2 px-4 text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 mb-1">Landmark (Optional)</label>
                  <input
                    type="text"
                    name="landmark"
                    value={address.landmark}
                    onChange={handleAddressChange}
                    className="w-full bg-[#222] border border-[#333] rounded-md py-2 px-4 text-white"
                  />
                </div>
              </div>

              {/* Map Preview (placeholder) */}
              <div className="mt-4 bg-[#222] h-48 rounded-md flex items-center justify-center">
                <span className="text-gray-400">Map preview will appear here</span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="py-3 px-8 border border-white text-white rounded-md hover:bg-white hover:text-black transition-colors"
            >
              <FiArrowLeft className="inline mr-2" /> Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={loading}
              className="py-3 px-8 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
            >
              {loading ? 'Processing...' : 'Next: Confirmation'} <FiArrowRight className="ml-2" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 