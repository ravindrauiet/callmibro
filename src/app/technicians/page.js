'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import { db } from '@/firebase/config'
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Image from 'next/image'
import { FiStar, FiMapPin, FiClock, FiCheck } from 'react-icons/fi'
import TechnicianBookingModal from '@/components/TechnicianBookingModal'

// Fallback technicians data
const fallbackTechnicians = [
  {
    id: 'tech-001',
    name: 'Rajesh Kumar',
    specialization: 'Mobile Phone Specialist',
    rating: 4.8,
    reviewCount: 156,
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    location: 'Mumbai',
    experience: '8 years',
    services: ['Screen Repair', 'Battery Replacement', 'Water Damage'],
    availability: 'Available today',
    hourlyRate: '₹500',
    languages: ['English', 'Hindi', 'Marathi']
  },
  {
    id: 'tech-002',
    name: 'Priya Sharma',
    specialization: 'Laptop & Computer Expert',
    rating: 4.9,
    reviewCount: 203,
    imageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    location: 'Delhi',
    experience: '12 years',
    services: ['Hardware Repair', 'Software Issues', 'Data Recovery'],
    availability: 'Available today',
    hourlyRate: '₹600',
    languages: ['English', 'Hindi']
  },
  {
    id: 'tech-003',
    name: 'Amit Patel',
    specialization: 'TV & Electronics Specialist',
    rating: 4.7,
    reviewCount: 98,
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    location: 'Bangalore',
    experience: '10 years',
    services: ['TV Repair', 'Audio Systems', 'Smart Home'],
    availability: 'Available today',
    hourlyRate: '₹550',
    languages: ['English', 'Hindi', 'Kannada']
  },
  {
    id: 'tech-004',
    name: 'Sneha Reddy',
    specialization: 'AC & Refrigerator Expert',
    rating: 4.6,
    reviewCount: 134,
    imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    location: 'Chennai',
    experience: '9 years',
    services: ['AC Service', 'Refrigerator Repair', 'Washing Machine'],
    availability: 'Available today',
    hourlyRate: '₹450',
    languages: ['English', 'Hindi', 'Tamil']
  },
  {
    id: 'tech-005',
    name: 'Vikram Singh',
    specialization: 'Gaming Console Specialist',
    rating: 4.8,
    reviewCount: 87,
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    location: 'Pune',
    experience: '6 years',
    services: ['PS4/PS5 Repair', 'Xbox Repair', 'Nintendo Switch'],
    availability: 'Available today',
    hourlyRate: '₹700',
    languages: ['English', 'Hindi', 'Marathi']
  },
  {
    id: 'tech-006',
    name: 'Anjali Desai',
    specialization: 'Smartphone & Tablet Expert',
    rating: 4.9,
    reviewCount: 245,
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    location: 'Hyderabad',
    experience: '11 years',
    services: ['iPhone Repair', 'Android Repair', 'Tablet Repair'],
    availability: 'Available today',
    hourlyRate: '₹650',
    languages: ['English', 'Hindi', 'Telugu']
  }
]

export default function TechniciansPage() {
  const router = useRouter()
  const { isDarkMode } = useTheme()
  const [technicians, setTechnicians] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [specializationFilter, setSpecializationFilter] = useState('')
  const [sortBy, setSortBy] = useState('rating')
  const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const [selectedTechnician, setSelectedTechnician] = useState(null)

  useEffect(() => {
    async function fetchTechnicians() {
      try {
        setLoading(true)
        
        // Try to fetch from Firebase
        const techniciansQuery = query(
          collection(db, 'technicians'),
          where('status', '==', 'approved'),
          orderBy('rating', 'desc')
        )
        const techniciansSnapshot = await getDocs(techniciansQuery)
        
        if (!techniciansSnapshot.empty) {
          const techniciansData = techniciansSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          setTechnicians(techniciansData)
        } else {
          // Use fallback data if no technicians found
          setTechnicians(fallbackTechnicians)
        }
      } catch (error) {
        console.error('Error fetching technicians:', error)
        // Use fallback data on error
        setTechnicians(fallbackTechnicians)
      } finally {
        setLoading(false)
      }
    }

    fetchTechnicians()
  }, [])

  // Filter and sort technicians
  const filteredTechnicians = technicians
    .filter(tech => {
      const matchesSearch = tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tech.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tech.services.some(service => service.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesLocation = !locationFilter || tech.location.toLowerCase().includes(locationFilter.toLowerCase())
      const matchesSpecialization = !specializationFilter || tech.specialization.toLowerCase().includes(specializationFilter.toLowerCase())
      
      return matchesSearch && matchesLocation && matchesSpecialization
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating
        case 'experience':
          return parseInt(b.experience) - parseInt(a.experience)
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return b.rating - a.rating
      }
    })

  const handleTechnicianClick = (technicianId) => {
    router.push(`/technicians/${technicianId}`)
  }

  const handleBookNow = (technician) => {
    setSelectedTechnician(technician)
    setBookingModalOpen(true)
  }

  const locations = [...new Set(technicians.map(tech => tech.location))]
  const specializations = [...new Set(technicians.map(tech => tech.specialization))]

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
            <p className="text-xl" style={{ color: 'var(--text-main)' }}>Loading technicians...</p>
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
      <Header />
      
      <main className="flex-grow py-16 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-main)' }}>
              Our Expert <span className="bg-gradient-to-r from-[#e60012] to-[#ff6b6b] bg-clip-text text-transparent">Technicians</span>
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Meet our certified and experienced technicians who are ready to fix your devices with precision and care.
            </p>
          </div>

          {/* Join Our Team Banner */}
          <div className="mb-8 p-8 rounded-xl shadow-lg" style={{ 
            background: isDarkMode 
              ? 'linear-gradient(135deg, var(--panel-dark), var(--panel-charcoal))' 
              : 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
            borderColor: 'var(--border-color)',
            borderWidth: '1px'
          }}>
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-main)' }}>
                Want to Join Our Team?
              </h2>
              <p className="text-lg mb-6 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                Are you a skilled technician looking for opportunities? Join our platform and start earning by helping customers with their device repairs.
              </p>
              <button
                onClick={() => router.push('/technician-registration')}
                className="bg-gradient-to-r from-[#e60012] to-[#ff6b6b] text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-[#e60012]/20 transform hover:scale-105 transition-all"
              >
                Join Our Team
              </button>
            </div>
          </div>

          {/* Filters Section */}
          <div className="mb-8 p-6 rounded-xl shadow-lg" style={{ 
            background: isDarkMode 
              ? 'linear-gradient(to bottom, var(--panel-dark), var(--panel-charcoal))' 
              : 'var(--panel-dark)',
            borderColor: 'var(--border-color)',
            borderWidth: '1px'
          }}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Search Technicians
                </label>
                <input
                  type="text"
                  placeholder="Name, specialization, or service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-all"
                  style={{ 
                    background: 'var(--panel-charcoal)',
                    color: 'var(--text-main)',
                    borderColor: 'var(--border-color)',
                    border: '1px solid var(--border-color)'
                  }}
                />
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Location
                </label>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-all"
                  style={{ 
                    background: 'var(--panel-charcoal)',
                    color: 'var(--text-main)',
                    borderColor: 'var(--border-color)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <option value="">All Locations</option>
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>

              {/* Specialization Filter */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Specialization
                </label>
                <select
                  value={specializationFilter}
                  onChange={(e) => setSpecializationFilter(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-all"
                  style={{ 
                    background: 'var(--panel-charcoal)',
                    color: 'var(--text-main)',
                    borderColor: 'var(--border-color)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <option value="">All Specializations</option>
                  {specializations.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-all"
                  style={{ 
                    background: 'var(--panel-charcoal)',
                    color: 'var(--text-main)',
                    borderColor: 'var(--border-color)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <option value="rating">Highest Rated</option>
                  <option value="experience">Most Experienced</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p style={{ color: 'var(--text-secondary)' }}>
              Showing {filteredTechnicians.length} of {technicians.length} technicians
            </p>
          </div>

          {/* Technicians Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTechnicians.map((technician) => (
              <div 
                key={technician.id}
                className="p-6 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105"
                style={{ 
                  background: isDarkMode 
                    ? 'linear-gradient(to bottom, var(--panel-dark), var(--panel-charcoal))' 
                    : 'var(--panel-dark)',
                  borderColor: 'var(--border-color)',
                  borderWidth: '1px'
                }}
                onClick={() => handleTechnicianClick(technician.id)}
              >
                {/* Technician Header */}
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={technician.imageUrl}
                      alt={technician.name}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-main)' }}>{technician.name}</h3>
                    <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                      {technician.specialization}
                    </p>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <FiStar className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="ml-1 text-sm font-medium" style={{ color: 'var(--text-main)' }}>{technician.rating}</span>
                      </div>
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        ({technician.reviewCount} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Technician Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm">
                    <FiMapPin className="w-4 h-4 mr-2" style={{ color: 'var(--text-secondary)' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{technician.location}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <FiClock className="w-4 h-4 mr-2" style={{ color: 'var(--text-secondary)' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{technician.experience} experience</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <FiCheck className="w-4 h-4 mr-2 text-green-500" />
                    <span className="text-green-500">{technician.availability}</span>
                  </div>
                </div>

                {/* Services */}
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Services:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {technician.services.slice(0, 3).map((service, index) => (
                      <span 
                        key={index}
                        className="text-xs px-2 py-1 rounded-full"
                        style={{ 
                          background: 'var(--panel-gray)',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        {service}
                      </span>
                    ))}
                    {technician.services.length > 3 && (
                      <span className="text-xs px-2 py-1 rounded-full" style={{ color: 'var(--text-secondary)' }}>
                        +{technician.services.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Rate and Languages */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Starting from</p>
                    <p className="text-lg font-semibold text-[#e60012]">{technician.hourlyRate}/hr</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Languages</p>
                    <p className="text-xs" style={{ color: 'var(--text-main)' }}>{technician.languages.slice(0, 2).join(', ')}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleBookNow(technician)
                    }}
                    className="flex-1 bg-gradient-to-r from-[#e60012] to-[#ff6b6b] text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-[#d4000e] hover:to-[#e65b5b] transition-all"
                  >
                    Book Now
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleTechnicianClick(technician.id)
                    }}
                    className="px-4 py-2 border border-[#e60012] text-[#e60012] rounded-lg text-sm font-medium hover:bg-[#e60012] hover:text-white transition-all"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredTechnicians.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-main)' }}>No technicians found</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Try adjusting your search criteria or filters
              </p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
      
      {/* Booking Modal */}
      <TechnicianBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        technician={selectedTechnician}
      />
    </div>
  )
} 