'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { db } from '@/firebase/config'
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore'
import { toast } from 'react-hot-toast'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { FiUser, FiMail, FiPhone, FiMapPin, FiTool, FiCheck } from 'react-icons/fi'

export default function TechnicianRegistrationPage() {
  const router = useRouter()
  const { currentUser } = useAuth()
  const { isDarkMode } = useTheme()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    specialization: '',
    experience: '',
    whyJoin: ''
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
      toast.error('Please login to register as a technician')
      router.push('/?showAuth=true')
      return
    }

    // Basic validation
    if (!formData.name || !formData.email || !formData.phone || !formData.location || !formData.specialization) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      // Check if user is already registered as a technician
      const techniciansRef = collection(db, 'technicians')
      const existingQuery = query(techniciansRef, where('userId', '==', currentUser.uid))
      const existingSnapshot = await getDocs(existingQuery)

      if (!existingSnapshot.empty) {
        toast.error('You are already registered as a technician')
        router.push('/technician-profile')
        return
      }

      // Add technician registration
      const technicianData = {
        userId: currentUser.uid,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        specialization: formData.specialization,
        experience: formData.experience,
        whyJoin: formData.whyJoin,
        status: 'pending', // pending, approved, rejected
        profileCompletion: 25, // Initial completion percentage
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const docRef = await addDoc(collection(db, 'technicians'), technicianData)
      
      toast.success('Registration submitted successfully!')
      router.push('/technician-profile')
    } catch (error) {
      console.error('Error registering technician:', error)
      toast.error('Failed to submit registration. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ 
      background: isDarkMode 
        ? 'linear-gradient(to bottom, var(--bg-color), var(--panel-dark))' 
        : 'linear-gradient(to bottom, var(--bg-color), var(--panel-charcoal))'
    }}>
      <Header />
      
      <main className="flex-grow py-16 px-4 sm:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🔧</div>
            <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-main)' }}>
              Join Our Technician Network
            </h1>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              Start your journey as a certified technician and help customers with their device repairs
            </p>
          </div>

          {/* Registration Form */}
          <div className="p-8 rounded-xl shadow-lg" style={{ 
            background: isDarkMode 
              ? 'linear-gradient(to bottom, var(--panel-dark), var(--panel-charcoal))' 
              : 'var(--panel-dark)',
            borderColor: 'var(--border-color)',
            borderWidth: '1px'
          }}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center" style={{ color: 'var(--text-main)' }}>
                  <FiUser className="w-5 h-5 mr-2 text-[#e60012]" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
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
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-all"
                      style={{ 
                        background: 'var(--panel-charcoal)',
                        color: 'var(--text-main)',
                        borderColor: 'var(--border-color)',
                        border: '1px solid var(--border-color)'
                      }}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
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
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Location *
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-all"
                      style={{ 
                        background: 'var(--panel-charcoal)',
                        color: 'var(--text-main)',
                        borderColor: 'var(--border-color)',
                        border: '1px solid var(--border-color)'
                      }}
                      placeholder="City, State"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center" style={{ color: 'var(--text-main)' }}>
                  <FiTool className="w-5 h-5 mr-2 text-[#e60012]" />
                  Professional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Specialization *
                    </label>
                    <select
                      name="specialization"
                      value={formData.specialization}
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
                      <option value="">Select your specialization</option>
                      <option value="Mobile Phone Repair">Mobile Phone Repair</option>
                      <option value="Laptop & Computer Repair">Laptop & Computer Repair</option>
                      <option value="Tablet Repair">Tablet Repair</option>
                      <option value="Gaming Console Repair">Gaming Console Repair</option>
                      <option value="Smart TV Repair">Smart TV Repair</option>
                      <option value="Audio Equipment Repair">Audio Equipment Repair</option>
                      <option value="General Electronics">General Electronics</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Years of Experience
                    </label>
                    <input
                      type="text"
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-all"
                      style={{ 
                        background: 'var(--panel-charcoal)',
                        color: 'var(--text-main)',
                        borderColor: 'var(--border-color)',
                        border: '1px solid var(--border-color)'
                      }}
                      placeholder="e.g., 5 years"
                    />
                  </div>
                </div>
              </div>

              {/* Motivation */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Why do you want to join our technician network?
                </label>
                <textarea
                  name="whyJoin"
                  value={formData.whyJoin}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-all"
                  style={{ 
                    background: 'var(--panel-charcoal)',
                    color: 'var(--text-main)',
                    borderColor: 'var(--border-color)',
                    border: '1px solid var(--border-color)'
                  }}
                  placeholder="Tell us about your motivation to join our platform..."
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
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FiCheck className="w-5 h-5 mr-2" />
                      Submit Registration
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Info Box */}
          <div className="mt-8 p-6 rounded-xl" style={{ 
            background: isDarkMode ? 'var(--panel-charcoal)' : 'var(--panel-gray)',
            borderColor: 'var(--border-color)',
            borderWidth: '1px'
          }}>
            <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-main)' }}>
              What happens next?
            </h3>
            <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <p>• Your registration will be reviewed by our team</p>
              <p>• Once approved, you'll need to complete your profile (95% completion required)</p>
              <p>• You'll be visible on our technician directory</p>
              <p>• Start receiving booking requests from customers</p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
} 