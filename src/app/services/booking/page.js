'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import { db } from '@/firebase/config'
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import Image from 'next/image'
import Link from 'next/link'
import { useTheme } from '@/contexts/ThemeContext'

export default function BookingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const serviceId = searchParams.get('serviceId')
  const serviceName = searchParams.get('serviceName')
  const { isDarkMode } = useTheme()
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [service, setService] = useState(null)
  const [technicians, setTechnicians] = useState([])
  
  useEffect(() => {
    if (!serviceId && !serviceName) {
      router.push('/services')
      return
    }
    
    async function fetchData() {
      try {
        setLoading(true)
        
        // Fetch service data if serviceId is provided
        if (serviceId) {
          const serviceDoc = await getDoc(doc(db, 'services', serviceId))
          if (serviceDoc.exists()) {
            setService({ id: serviceDoc.id, ...serviceDoc.data() })
          }
        }
        
        // Fetch technicians (either for specific service or all)
        const techniciansQuery = serviceId 
          ? query(collection(db, 'technicians'), where('services', 'array-contains', serviceId))
          : query(collection(db, 'technicians'))
        
        const techniciansSnapshot = await getDocs(techniciansQuery)
        
        if (techniciansSnapshot.empty) {
          // Fallback data if no technicians found
          setTechnicians([
            {
              id: 'tech1',
              name: 'John Doe',
              specialization: 'Mobile Specialist',
              rating: 4.8,
              reviews: 123,
              image: '/images/technician-placeholder.jpg',
              availability: true
            },
            {
              id: 'tech2',
              name: 'Alex Smith',
              specialization: 'Laptop Expert',
              rating: 4.6,
              reviews: 98,
              image: '/images/technician-placeholder.jpg',
              availability: true
            },
            {
              id: 'tech3',
              name: 'Sarah Johnson',
              specialization: 'Hardware Specialist',
              rating: 4.9,
              reviews: 156,
              image: '/images/technician-placeholder.jpg',
              availability: false
            }
          ])
        } else {
          const techData = techniciansSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          setTechnicians(techData)
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load technicians. Please try again.')
        // Set fallback data
        setTechnicians([
          {
            id: 'tech1',
            name: 'John Doe',
            specialization: 'Mobile Specialist',
            rating: 4.8,
            reviews: 123,
            image: '/images/technician-placeholder.jpg',
            availability: true
          }
        ])
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [serviceId, serviceName, router])
  
  const handleSelectTechnician = (technicianId) => {
    router.push(`/services/booking/schedule-address?serviceId=${serviceId || ''}&serviceName=${serviceName || ''}&technicianId=${technicianId}`)
  }
  
  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg-color)', color: 'var(--text-main)' }}>
        <Header activePage="services" />
        <main className="py-10 px-4 max-w-6xl mx-auto text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[#e60012] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-xl">Loading technicians...</p>
        </main>
        <Footer />
      </div>
    )
  }
  
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-color)', color: 'var(--text-main)' }}>
      <Header activePage="services" />
      
      <main className="py-10 px-4 max-w-6xl mx-auto">
        {/* Progress Indicator */}
        <div className="max-w-3xl mx-auto mb-10">
          <div className="flex justify-between relative">
            <div className="flex flex-col items-center z-10">
              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                <span className="text-white">✓</span>
              </div>
              <span className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>Select Service</span>
            </div>
            
            <div className="flex flex-col items-center z-10">
              <div className="w-10 h-10 rounded-full bg-[#e60012] flex items-center justify-center">
                <span className="text-white">2</span>
              </div>
              <span className="text-sm mt-2 font-medium">Choose Technician</span>
            </div>
            
            <div className="flex flex-col items-center z-10">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--panel-dark)' }}>
                <span className="text-white">3</span>
              </div>
              <span className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>Schedule & Address</span>
            </div>
            
            <div className="flex flex-col items-center z-10">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--panel-dark)' }}>
                <span className="text-white">4</span>
              </div>
              <span className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>Confirmation</span>
            </div>
            
            {/* Progress Line */}
            <div className="absolute top-5 left-0 w-full h-1 -z-0" style={{ background: 'var(--border-color)' }}>
              <div className="h-full bg-green-600" style={{width: '33%'}}></div>
            </div>
          </div>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">Choose Your Technician</h1>
        <p style={{ color: 'var(--text-secondary)' }} className="text-center mb-10">
          Select a technician for your {serviceName || 'repair'} service
        </p>
        
        {error && (
          <div className="bg-red-900/50 text-red-200 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {technicians.map(tech => (
            <div 
              key={tech.id}
              className={`border rounded-lg overflow-hidden transition-colors cursor-pointer ${tech.availability !== false ? 'hover:border-[#e60012]' : 'opacity-60'}`}
              style={{ 
                background: 'var(--panel-dark)', 
                borderColor: tech.availability !== false ? 'var(--border-color)' : 'var(--border-color)'
              }}
              onClick={() => tech.availability !== false && handleSelectTechnician(tech.id)}
            >
              <div className="aspect-w-1 aspect-h-1 relative" style={{ background: 'var(--panel-charcoal)' }}>
                <div className="flex items-center justify-center h-full overflow-hidden">
                  {tech.image ? (
                    <Image 
                      src={tech.image} 
                      alt={tech.name}
                      width={300} 
                      height={300} 
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-[#e60012] flex items-center justify-center">
                      <span className="text-5xl font-bold text-white">
                        {tech.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                
                {tech.availability === false && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm">
                      Not Available
                    </span>
                  </div>
                )}
                
                {tech.rating && (
                  <div className="absolute bottom-2 right-2 text-yellow-400 text-sm px-2 py-1 rounded-full flex items-center" style={{ background: 'var(--panel-dark)' }}>
                    <span className="mr-1">★</span>
                    <span>{tech.rating}</span>
                    {tech.reviews && (
                      <span style={{ color: 'var(--text-secondary)' }} className="text-xs ml-1">({tech.reviews})</span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="text-xl font-semibold">{tech.name}</h3>
                <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-3">{tech.specialization}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {tech.skills && tech.skills.slice(0, 3).map((skill, index) => (
                    <span key={index} className="text-xs px-2 py-1 rounded-full" style={{ 
                      background: 'var(--panel-charcoal)', 
                      color: 'var(--text-secondary)' 
                    }}>
                      {skill}
                    </span>
                  ))}
                </div>
                
                <button 
                  className={`w-full py-2 rounded-md ${
                    tech.availability !== false 
                      ? 'bg-[#e60012] hover:bg-red-700 text-white' 
                      : 'text-gray-500 cursor-not-allowed'
                  } transition-colors`}
                  style={{ 
                    backgroundColor: tech.availability !== false ? undefined : 'var(--panel-charcoal)'
                  }}
                  disabled={tech.availability === false}
                >
                  {tech.availability !== false ? 'Select & Continue' : 'Unavailable'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
      
      <Footer />
    </div>
  )
} 