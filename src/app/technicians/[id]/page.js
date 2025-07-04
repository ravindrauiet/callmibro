'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { db } from '@/firebase/config'
import { doc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Image from 'next/image'
import { FiStar, FiMapPin, FiClock, FiCheck, FiPhone, FiMail, FiAward, FiShield, FiTool } from 'react-icons/fi'
import { toast } from 'react-hot-toast'

// Fallback technician data
const fallbackTechnician = {
  id: 'tech-002',
  name: 'Priya Sharma',
  specialization: 'Laptop & Computer Expert',
  rating: 4.9,
  reviewCount: 203,
  imageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face',
  location: 'Delhi',
  experience: '12 years',
  services: ['Hardware Repair', 'Software Issues', 'Data Recovery', 'Virus Removal', 'System Optimization', 'Network Setup'],
  availability: 'Available today',
  hourlyRate: '₹600',
  languages: ['English', 'Hindi'],
  about: 'Certified computer technician with over 12 years of experience in laptop and desktop repair. Specialized in hardware diagnostics, software troubleshooting, and data recovery.',
  certifications: ['CompTIA A+', 'Microsoft Certified Professional', 'Cisco CCNA'],
  workingHours: '9:00 AM - 7:00 PM',
  responseTime: 'Within 2 hours',
  totalJobs: 1247,
  successRate: '98%',
  phone: '+91 98765 43210',
  email: 'priya.sharma@callmibro.com'
}

export default function TechnicianProfilePage() {
  const router = useRouter()
  const params = useParams()
  const { isDarkMode } = useTheme()
  const { currentUser } = useAuth()
  const [technician, setTechnician] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState([])
  const [selectedService, setSelectedService] = useState('')

  useEffect(() => {
    async function fetchTechnicianData() {
      try {
        setLoading(true)
        const technicianId = params.id

        // Try to fetch from Firebase
        const technicianDoc = await getDoc(doc(db, 'technicians', technicianId))
        
        if (technicianDoc.exists()) {
          const technicianData = {
            id: technicianDoc.id,
            ...technicianDoc.data()
          }
          setTechnician(technicianData)
        } else {
          // Use fallback data if technician not found
          setTechnician(fallbackTechnician)
        }

        // Fetch reviews for this technician
        try {
          const reviewsQuery = query(
            collection(db, 'reviews'),
            where('technicianId', '==', technicianId),
            orderBy('createdAt', 'desc')
          )
          const reviewsSnapshot = await getDocs(reviewsQuery)
          
          if (!reviewsSnapshot.empty) {
            const reviewsData = reviewsSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }))
            setReviews(reviewsData)
          } else {
            // Generate sample reviews
            setReviews([
              {
                id: '1',
                userName: 'Rahul Kumar',
                rating: 5,
                comment: 'Excellent service! Fixed my laptop quickly and professionally.',
                createdAt: new Date(Date.now() - 86400000)
              },
              {
                id: '2',
                userName: 'Anita Singh',
                rating: 5,
                comment: 'Very knowledgeable technician. Highly recommended!',
                createdAt: new Date(Date.now() - 172800000)
              },
              {
                id: '3',
                userName: 'Vikram Patel',
                rating: 4,
                comment: 'Good service, reasonable pricing. Will use again.',
                createdAt: new Date(Date.now() - 259200000)
              }
            ])
          }
        } catch (error) {
          console.error('Error fetching reviews:', error)
        }
      } catch (error) {
        console.error('Error fetching technician:', error)
        setTechnician(fallbackTechnician)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchTechnicianData()
    }
  }, [params.id])

  const handleBookService = () => {
    if (!currentUser) {
      toast.error('Please login to book a service')
      router.push('/?showAuth=true')
      return
    }

    if (!selectedService) {
      toast.error('Please select a service')
      return
    }

    router.push(`/services/booking?technicianId=${technician.id}&service=${encodeURIComponent(selectedService)}`)
  }

  const handleContact = (method) => {
    if (method === 'phone') {
      window.open(`tel:${technician.phone}`)
    } else if (method === 'email') {
      window.open(`mailto:${technician.email}`)
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
        <main className="flex-grow py-16 px-4 sm:px-8">
          <div className="max-w-6xl mx-auto text-center">
            <div className="animate-spin w-12 h-12 border-4 border-[#e60012] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-xl" style={{ color: 'var(--text-main)' }}>Loading technician profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!technician) {
    return (
      <div className="min-h-screen flex flex-col" style={{ 
        background: isDarkMode 
          ? 'linear-gradient(to bottom, var(--bg-color), var(--panel-dark))' 
          : 'linear-gradient(to bottom, var(--bg-color), var(--panel-charcoal))'
      }}>
        <Header />
        <main className="flex-grow py-16 px-4 sm:px-8">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-main)' }}>Technician Not Found</h1>
            <p style={{ color: 'var(--text-secondary)' }} className="mb-6">
              The technician you're looking for doesn't exist or has been removed.
            </p>
            <button 
              onClick={() => router.push('/technicians')}
              className="bg-gradient-to-r from-[#e60012] to-[#ff6b6b] text-white px-6 py-3 rounded-lg font-medium hover:from-[#d4000e] hover:to-[#e65b5b] transition-all"
            >
              Browse All Technicians
            </button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ 
      background: isDarkMode 
        ? 'linear-gradient(to bottom, var(--bg-color), var(--panel-dark))' 
        : 'linear-gradient(to bottom, var(--bg-color), var(--panel-charcoal))'
    }}>
      {/* <Header /> */}
      
      <main className="flex-grow py-8 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <button 
              onClick={() => router.push('/technicians')}
              className="flex items-center text-sm hover:text-[#e60012] transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Technicians
            </button>
          </nav>

          {/* Technician Profile */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Main Info */}
            <div className="lg:col-span-2">
              <div className="p-6 rounded-xl shadow-lg" style={{ 
                background: isDarkMode 
                  ? 'linear-gradient(to bottom, var(--panel-dark), var(--panel-charcoal))' 
                  : 'var(--panel-dark)',
                borderColor: 'var(--border-color)',
                borderWidth: '1px'
              }}>
                <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
                  <div className="w-32 h-32 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={technician.imageUrl}
                      alt={technician.name}
                      width={128}
                      height={128}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>{technician.name}</h1>
                      <div className="flex items-center bg-green-100 dark:bg-green-900 px-2 py-1 rounded-full">
                        <FiCheck className="w-3 h-3 text-green-600 dark:text-green-400 mr-1" />
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">Verified</span>
                      </div>
                    </div>
                    
                    <p className="text-lg mb-3" style={{ color: 'var(--text-secondary)' }}>
                      {technician.specialization}
                    </p>
                    
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex items-center">
                        <FiStar className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="ml-1 font-medium" style={{ color: 'var(--text-main)' }}>{technician.rating}</span>
                        <span className="ml-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                          ({technician.reviewCount} reviews)
                        </span>
                      </div>
                      <div className="flex items-center">
                        <FiMapPin className="w-4 h-4 mr-1" style={{ color: 'var(--text-secondary)' }} />
                        <span style={{ color: 'var(--text-secondary)' }}>{technician.location}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {technician.about}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats & Contact */}
            <div className="space-y-4">
              <div className="p-6 rounded-xl shadow-lg" style={{ 
                background: isDarkMode 
                  ? 'linear-gradient(to bottom, var(--panel-dark), var(--panel-charcoal))' 
                  : 'var(--panel-dark)',
                borderColor: 'var(--border-color)',
                borderWidth: '1px'
              }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-main)' }}>Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span style={{ color: 'var(--text-secondary)' }}>Experience</span>
                    <span className="font-medium" style={{ color: 'var(--text-main)' }}>{technician.experience}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: 'var(--text-secondary)' }}>Total Jobs</span>
                    <span className="font-medium" style={{ color: 'var(--text-main)' }}>{technician.totalJobs}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: 'var(--text-secondary)' }}>Success Rate</span>
                    <span className="font-medium text-green-500">{technician.successRate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: 'var(--text-secondary)' }}>Response Time</span>
                    <span className="font-medium" style={{ color: 'var(--text-main)' }}>{technician.responseTime}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl shadow-lg" style={{ 
                background: isDarkMode 
                  ? 'linear-gradient(to bottom, var(--panel-dark), var(--panel-charcoal))' 
                  : 'var(--panel-dark)',
                borderColor: 'var(--border-color)',
                borderWidth: '1px'
              }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-main)' }}>Contact Info</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => handleContact('phone')}
                    className="flex items-center w-full p-3 rounded-lg hover:bg-opacity-10 transition-all"
                    style={{ 
                      background: 'var(--panel-gray)',
                      color: 'var(--text-main)'
                    }}
                  >
                    <FiPhone className="w-4 h-4 mr-3" />
                    <span>{technician.phone}</span>
                  </button>
                  <button 
                    onClick={() => handleContact('email')}
                    className="flex items-center w-full p-3 rounded-lg hover:bg-opacity-10 transition-all"
                    style={{ 
                      background: 'var(--panel-gray)',
                      color: 'var(--text-main)'
                    }}
                  >
                    <FiMail className="w-4 h-4 mr-3" />
                    <span>{technician.email}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Services Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-main)' }}>Services Offered</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {technician.services.map((service, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    selectedService === service 
                      ? 'ring-2 ring-[#e60012]' 
                      : 'hover:shadow-md'
                  }`}
                  style={{ 
                    background: isDarkMode 
                      ? 'linear-gradient(to bottom, var(--panel-dark), var(--panel-charcoal))' 
                      : 'var(--panel-dark)',
                    borderColor: 'var(--border-color)',
                    borderWidth: '1px'
                  }}
                  onClick={() => setSelectedService(service)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FiTool className="w-5 h-5 mr-3 text-[#e60012]" />
                      <span style={{ color: 'var(--text-main)' }}>{service}</span>
                    </div>
                    {selectedService === service && (
                      <FiCheck className="w-5 h-5 text-[#e60012]" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Booking Section */}
          <div className="mb-8 p-6 rounded-xl shadow-lg" style={{ 
            background: isDarkMode 
              ? 'linear-gradient(to bottom, var(--panel-dark), var(--panel-charcoal))' 
              : 'var(--panel-dark)',
            borderColor: 'var(--border-color)',
            borderWidth: '1px'
          }}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-main)' }}>Book This Technician</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Select Service
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-all"
                  style={{ 
                    background: 'var(--panel-charcoal)',
                    color: 'var(--text-main)',
                    borderColor: 'var(--border-color)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <option value="">Choose a service...</option>
                  {technician.services.map((service, index) => (
                    <option key={index} value={service}>{service}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={handleBookService}
                  disabled={!selectedService}
                  className="w-full bg-gradient-to-r from-[#e60012] to-[#ff6b6b] text-white py-3 px-6 rounded-lg font-medium hover:from-[#d4000e] hover:to-[#e65b5b] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Book Now - {technician.hourlyRate}/hr
                </button>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-main)' }}>
              Customer Reviews ({reviews.length})
            </h2>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div 
                  key={review.id}
                  className="p-6 rounded-xl shadow-lg" 
                  style={{ 
                    background: isDarkMode 
                      ? 'linear-gradient(to bottom, var(--panel-dark), var(--panel-charcoal))' 
                      : 'var(--panel-dark)',
                    borderColor: 'var(--border-color)',
                    borderWidth: '1px'
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#e60012] to-[#ff6b6b] flex items-center justify-center text-white font-medium mr-3">
                        {review.userName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-main)' }}>{review.userName}</p>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <FiStar 
                              key={i} 
                              className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {review.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)' }}>{review.comment}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications & Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-6 rounded-xl shadow-lg" style={{ 
              background: isDarkMode 
                ? 'linear-gradient(to bottom, var(--panel-dark), var(--panel-charcoal))' 
                : 'var(--panel-dark)',
              borderColor: 'var(--border-color)',
              borderWidth: '1px'
            }}>
              <h3 className="text-xl font-semibold mb-4 flex items-center" style={{ color: 'var(--text-main)' }}>
                <FiAward className="w-5 h-5 mr-2 text-[#e60012]" />
                Certifications
              </h3>
              <div className="space-y-2">
                {technician.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center p-3 rounded-lg" style={{ background: 'var(--panel-gray)' }}>
                    <FiShield className="w-4 h-4 mr-3 text-[#e60012]" />
                    <span style={{ color: 'var(--text-main)' }}>{cert}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-xl shadow-lg" style={{ 
              background: isDarkMode 
                ? 'linear-gradient(to bottom, var(--panel-dark), var(--panel-charcoal))' 
                : 'var(--panel-dark)',
              borderColor: 'var(--border-color)',
              borderWidth: '1px'
            }}>
              <h3 className="text-xl font-semibold mb-4 flex items-center" style={{ color: 'var(--text-main)' }}>
                <FiClock className="w-5 h-5 mr-2 text-[#e60012]" />
                Working Hours
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Available Hours</span>
                  <span className="font-medium" style={{ color: 'var(--text-main)' }}>{technician.workingHours}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Languages</span>
                  <span className="font-medium" style={{ color: 'var(--text-main)' }}>{technician.languages.join(', ')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Availability</span>
                  <span className="font-medium text-green-500">{technician.availability}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
} 