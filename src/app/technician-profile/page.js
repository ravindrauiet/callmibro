'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { db } from '@/firebase/config'
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore'
import { toast } from 'react-hot-toast'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { FiUser, FiMail, FiPhone, FiMapPin, FiTool, FiAward, FiClock, FiStar, FiEdit3, FiCheck } from 'react-icons/fi'

export default function TechnicianProfilePage() {
  const router = useRouter()
  const { currentUser } = useAuth()
  const { isDarkMode } = useTheme()
  const [technician, setTechnician] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({})
  const [bookings, setBookings] = useState([])

  useEffect(() => {
    const fetchTechnicianData = async () => {
      if (!currentUser) {
        router.push('/?showAuth=true')
        return
      }

      try {
        setLoading(true)
        
        // Fetch technician data
        const techniciansRef = collection(db, 'technicians')
        const techQuery = query(techniciansRef, where('userId', '==', currentUser.uid))
        const techSnapshot = await getDocs(techQuery)

        if (techSnapshot.empty) {
          toast.error('You are not registered as a technician')
          router.push('/technician-registration')
          return
        }

        const techData = {
          id: techSnapshot.docs[0].id,
          ...techSnapshot.docs[0].data()
        }
        setTechnician(techData)
        setFormData(techData)

        // Fetch bookings for this technician from technician-bookings collection
        const bookingsRef = collection(db, 'technician-bookings')
        const bookingsQuery = query(bookingsRef, where('technicianId', '==', techSnapshot.docs[0].id))
        const bookingsSnapshot = await getDocs(bookingsQuery)
        
        if (!bookingsSnapshot.empty) {
          const bookingsData = bookingsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          setBookings(bookingsData)
        }
      } catch (error) {
        console.error('Error fetching technician data:', error)
        toast.error('Failed to load technician data')
      } finally {
        setLoading(false)
      }
    }

    fetchTechnicianData()
  }, [currentUser, router])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const calculateCompletion = () => {
    if (!technician) return 0
    
    const fields = [
      'name', 'email', 'phone', 'location', 'specialization',
      'about', 'services', 'certifications', 'workingHours',
      'hourlyRate', 'imageUrl'
    ]
    
    const completedFields = fields.filter(field => {
      const value = technician[field]
      if (!value) return false
      
      if (Array.isArray(value)) {
        return value.length > 0
      }
      
      if (typeof value === 'string') {
        return value.trim() !== ''
      }
      
      return true
    })
    
    return Math.round((completedFields.length / fields.length) * 100)
  }

  const handleSave = async () => {
    if (!technician) return

    setSaving(true)
    try {
      const completion = calculateCompletion()
      
      await updateDoc(doc(db, 'technicians', technician.id), {
        ...formData,
        profileCompletion: completion,
        updatedAt: new Date()
      })

      setTechnician(prev => ({
        ...prev,
        ...formData,
        profileCompletion: completion
      }))

      toast.success('Profile updated successfully!')
      setEditMode(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleBookingStatus = async (bookingId, status) => {
    try {
      await updateDoc(doc(db, 'technician-bookings', bookingId), {
        status: status,
        updatedAt: new Date()
      })

      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: status }
          : booking
      ))

      toast.success(`Booking ${status}`)
    } catch (error) {
      console.error('Error updating booking:', error)
      toast.error('Failed to update booking status')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ 
        background: isDarkMode 
          ? 'linear-gradient(to bottom, var(--bg-color), var(--panel-dark))' 
          : 'linear-gradient(to bottom, var(--bg-color), var(--panel-charcoal))'
      }}>
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e60012] mx-auto mb-4"></div>
            <p style={{ color: 'var(--text-secondary)' }}>Loading profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!technician) {
    return null
  }

  const completion = calculateCompletion()

  return (
    <div className="min-h-screen flex flex-col" style={{ 
      background: isDarkMode 
        ? 'linear-gradient(to bottom, var(--bg-color), var(--panel-dark))' 
        : 'linear-gradient(to bottom, var(--bg-color), var(--panel-charcoal))'
    }}>
      <Header />
      
      <main className="flex-grow py-8 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-main)' }}>
                Technician Profile
              </h1>
              <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                Complete your profile to get visible on our platform
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <button
                onClick={() => setEditMode(!editMode)}
                className="flex items-center px-4 py-2 rounded-lg transition-all"
                style={{ 
                  background: editMode ? 'var(--panel-charcoal)' : 'var(--panel-gray)',
                  color: 'var(--text-main)'
                }}
              >
                <FiEdit3 className="w-4 h-4 mr-2" />
                {editMode ? 'Cancel Edit' : 'Edit Profile'}
              </button>
            </div>
          </div>

          {/* Profile Completion Status */}
          <div className="mb-8 p-6 rounded-xl shadow-lg" style={{ 
            background: isDarkMode 
              ? 'linear-gradient(to bottom, var(--panel-dark), var(--panel-charcoal))' 
              : 'var(--panel-dark)',
            borderColor: 'var(--border-color)',
            borderWidth: '1px'
          }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold" style={{ color: 'var(--text-main)' }}>
                Profile Completion
              </h2>
              <span className="text-2xl font-bold" style={{ color: completion >= 95 ? '#10b981' : '#f59e0b' }}>
                {completion}%
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div 
                className="h-3 rounded-full transition-all duration-500"
                style={{ 
                  width: `${completion}%`,
                  background: completion >= 95 ? 'linear-gradient(to right, #10b981, #34d399)' : 'linear-gradient(to right, #f59e0b, #fbbf24)'
                }}
              ></div>
            </div>
            
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {completion >= 95 ? (
                <div className="flex items-center text-green-600">
                  <FiCheck className="w-4 h-4 mr-2" />
                  Your profile is complete! You're visible on our platform.
                </div>
              ) : (
                <div className="flex items-center text-yellow-600">
                  <FiClock className="w-4 h-4 mr-2" />
                  Complete your profile to 95% to become visible on our platform.
                </div>
              )}
            </div>
          </div>

          {/* Profile Form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Profile */}
            <div className="lg:col-span-2">
              <div className="p-6 rounded-xl shadow-lg" style={{ 
                background: isDarkMode 
                  ? 'linear-gradient(to bottom, var(--panel-dark), var(--panel-charcoal))' 
                  : 'var(--panel-dark)',
                borderColor: 'var(--border-color)',
                borderWidth: '1px'
              }}>
                <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-main)' }}>
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Full Name
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-all"
                        style={{ 
                          background: 'var(--panel-charcoal)',
                          color: 'var(--text-main)',
                          borderColor: 'var(--border-color)',
                          border: '1px solid var(--border-color)'
                        }}
                      />
                    ) : (
                      <p className="px-4 py-3 rounded-lg" style={{ 
                        background: 'var(--panel-charcoal)',
                        color: 'var(--text-main)'
                      }}>
                        {technician.name || 'Not provided'}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Email
                    </label>
                    {editMode ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-all"
                        style={{ 
                          background: 'var(--panel-charcoal)',
                          color: 'var(--text-main)',
                          borderColor: 'var(--border-color)',
                          border: '1px solid var(--border-color)'
                        }}
                      />
                    ) : (
                      <p className="px-4 py-3 rounded-lg" style={{ 
                        background: 'var(--panel-charcoal)',
                        color: 'var(--text-main)'
                      }}>
                        {technician.email || 'Not provided'}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Phone Number
                    </label>
                    {editMode ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-all"
                        style={{ 
                          background: 'var(--panel-charcoal)',
                          color: 'var(--text-main)',
                          borderColor: 'var(--border-color)',
                          border: '1px solid var(--border-color)'
                        }}
                      />
                    ) : (
                      <p className="px-4 py-3 rounded-lg" style={{ 
                        background: 'var(--panel-charcoal)',
                        color: 'var(--text-main)'
                      }}>
                        {technician.phone || 'Not provided'}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Location
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        name="location"
                        value={formData.location || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-all"
                        style={{ 
                          background: 'var(--panel-charcoal)',
                          color: 'var(--text-main)',
                          borderColor: 'var(--border-color)',
                          border: '1px solid var(--border-color)'
                        }}
                      />
                    ) : (
                      <p className="px-4 py-3 rounded-lg" style={{ 
                        background: 'var(--panel-charcoal)',
                        color: 'var(--text-main)'
                      }}>
                        {technician.location || 'Not provided'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Specialization
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-all"
                        style={{ 
                          background: 'var(--panel-charcoal)',
                          color: 'var(--text-main)',
                          borderColor: 'var(--border-color)',
                          border: '1px solid var(--border-color)'
                        }}
                        placeholder="e.g., Mobile Repair, Laptop Repair, Data Recovery"
                      />
                    ) : (
                      <p className="px-4 py-3 rounded-lg" style={{ 
                        background: 'var(--panel-charcoal)',
                        color: 'var(--text-main)'
                      }}>
                        {technician.specialization || 'Not provided'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Hourly Rate (₹)
                    </label>
                    {editMode ? (
                      <input
                        type="number"
                        name="hourlyRate"
                        value={formData.hourlyRate || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-all"
                        style={{ 
                          background: 'var(--panel-charcoal)',
                          color: 'var(--text-main)',
                          borderColor: 'var(--border-color)',
                          border: '1px solid var(--border-color)'
                        }}
                        placeholder="500"
                      />
                    ) : (
                      <p className="px-4 py-3 rounded-lg" style={{ 
                        background: 'var(--panel-charcoal)',
                        color: 'var(--text-main)'
                      }}>
                        ₹{technician.hourlyRate || 'Not specified'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    About Me
                  </label>
                  {editMode ? (
                    <textarea
                      name="about"
                      value={formData.about || ''}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-all"
                      style={{ 
                        background: 'var(--panel-charcoal)',
                        color: 'var(--text-main)',
                        borderColor: 'var(--border-color)',
                        border: '1px solid var(--border-color)'
                      }}
                      placeholder="Tell customers about your experience and expertise..."
                    />
                  ) : (
                    <p className="px-4 py-3 rounded-lg" style={{ 
                      background: 'var(--panel-charcoal)',
                      color: 'var(--text-main)'
                    }}>
                      {technician.about || 'No description provided'}
                    </p>
                  )}
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Working Hours
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      name="workingHours"
                      value={formData.workingHours || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-all"
                      style={{ 
                        background: 'var(--panel-charcoal)',
                        color: 'var(--text-main)',
                        borderColor: 'var(--border-color)',
                        border: '1px solid var(--border-color)'
                      }}
                      placeholder="e.g., Mon-Fri 9AM-6PM, Sat 10AM-4PM"
                    />
                  ) : (
                    <p className="px-4 py-3 rounded-lg" style={{ 
                      background: 'var(--panel-charcoal)',
                      color: 'var(--text-main)'
                    }}>
                      {technician.workingHours || 'Not specified'}
                    </p>
                  )}
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Certifications
                  </label>
                  {editMode ? (
                    <textarea
                      name="certifications"
                      value={formData.certifications || ''}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-all"
                      style={{ 
                        background: 'var(--panel-charcoal)',
                        color: 'var(--text-main)',
                        borderColor: 'var(--border-color)',
                        border: '1px solid var(--border-color)'
                      }}
                      placeholder="List your certifications, training, or qualifications..."
                    />
                  ) : (
                    <p className="px-4 py-3 rounded-lg" style={{ 
                      background: 'var(--panel-charcoal)',
                      color: 'var(--text-main)'
                    }}>
                      {technician.certifications || 'No certifications listed'}
                    </p>
                  )}
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Profile Image URL
                  </label>
                  {editMode ? (
                    <input
                      type="url"
                      name="imageUrl"
                      value={formData.imageUrl || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-all"
                      style={{ 
                        background: 'var(--panel-charcoal)',
                        color: 'var(--text-main)',
                        borderColor: 'var(--border-color)',
                        border: '1px solid var(--border-color)'
                      }}
                      placeholder="https://example.com/your-photo.jpg"
                    />
                  ) : (
                    <p className="px-4 py-3 rounded-lg" style={{ 
                      background: 'var(--panel-charcoal)',
                      color: 'var(--text-main)'
                    }}>
                      {technician.imageUrl || 'No profile image'}
                    </p>
                  )}
                </div>
              </div>

              {/* Services */}
              <div className="mt-8 p-6 rounded-xl shadow-lg" style={{ 
                background: isDarkMode 
                  ? 'linear-gradient(to bottom, var(--panel-dark), var(--panel-charcoal))' 
                  : 'var(--panel-dark)',
                borderColor: 'var(--border-color)',
                borderWidth: '1px'
              }}>
                <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-main)' }}>
                  Services Offered
                </h3>
                
                {editMode ? (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Services (comma-separated)
                    </label>
                    <input
                      type="text"
                      name="services"
                      value={Array.isArray(formData.services) ? formData.services.join(', ') : (formData.services || '')}
                      onChange={(e) => {
                        const value = e.target.value
                        const services = value.split(',').map(s => s.trim()).filter(s => s)
                        setFormData(prev => ({ ...prev, services }))
                      }}
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-all"
                      style={{ 
                        background: 'var(--panel-charcoal)',
                        color: 'var(--text-main)',
                        borderColor: 'var(--border-color)',
                        border: '1px solid var(--border-color)'
                      }}
                      placeholder="Hardware Repair, Software Issues, Data Recovery..."
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Array.isArray(technician.services) && technician.services.length > 0 ? (
                      technician.services.map((service, index) => (
                        <div key={index} className="flex items-center p-3 rounded-lg" style={{ background: 'var(--panel-gray)' }}>
                          <FiTool className="w-4 h-4 mr-3 text-[#e60012]" />
                          <span style={{ color: 'var(--text-main)' }}>{service}</span>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: 'var(--text-secondary)' }}>No services listed</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status */}
              <div className="p-6 rounded-xl shadow-lg" style={{ 
                background: isDarkMode 
                  ? 'linear-gradient(to bottom, var(--panel-dark), var(--panel-charcoal))' 
                  : 'var(--panel-dark)',
                borderColor: 'var(--border-color)',
                borderWidth: '1px'
              }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-main)' }}>
                  Account Status
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span style={{ color: 'var(--text-secondary)' }}>Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      technician.status === 'approved' ? 'bg-green-100 text-green-800' :
                      technician.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {technician.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: 'var(--text-secondary)' }}>Experience</span>
                    <span style={{ color: 'var(--text-main)' }}>{technician.experience || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: 'var(--text-secondary)' }}>Specialization</span>
                    <span style={{ color: 'var(--text-main)' }}>{technician.specialization || 'Not specified'}</span>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              {editMode && (
                <div className="p-6 rounded-xl shadow-lg" style={{ 
                  background: isDarkMode 
                    ? 'linear-gradient(to bottom, var(--panel-dark), var(--panel-charcoal))' 
                    : 'var(--panel-dark)',
                  borderColor: 'var(--border-color)',
                  borderWidth: '1px'
                }}>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-[#e60012] to-[#ff6b6b] text-white py-3 px-6 rounded-lg font-medium hover:from-[#d4000e] hover:to-[#e65b5b] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiCheck className="w-5 h-5 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bookings */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-main)' }}>
              Recent Bookings ({bookings.length})
            </h2>
            
            {bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="p-6 rounded-xl shadow-lg" style={{ 
                    background: isDarkMode 
                      ? 'linear-gradient(to bottom, var(--panel-dark), var(--panel-charcoal))' 
                      : 'var(--panel-dark)',
                    borderColor: 'var(--border-color)',
                    borderWidth: '1px'
                  }}>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="font-semibold" style={{ color: 'var(--text-main)' }}>
                            {booking.customerName}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            booking.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            booking.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }} className="mb-2">
                          <strong>Service:</strong> {booking.service}
                        </p>
                        <p style={{ color: 'var(--text-secondary)' }} className="mb-2">
                          <strong>Phone:</strong> {booking.customerPhone}
                        </p>
                        {booking.reason && (
                          <p style={{ color: 'var(--text-secondary)' }}>
                            <strong>Reason:</strong> {booking.reason}
                          </p>
                        )}
                      </div>
                      
                      {booking.status === 'pending' && (
                        <div className="flex space-x-2 mt-4 md:mt-0">
                          <button
                            onClick={() => handleBookingStatus(booking.id, 'accepted')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleBookingStatus(booking.id, 'rejected')}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">📋</div>
                <p style={{ color: 'var(--text-secondary)' }}>No bookings yet</p>
                <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                  Complete your profile to start receiving booking requests
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
} 