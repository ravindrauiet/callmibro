'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { toast } from 'react-hot-toast'

export default function NewTechnician() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [technicianForm, setTechnicianForm] = useState({
    name: '',
    email: '',
    phone: '',
    imageURL: '',
    specialization: '',
    experience: '',
    bio: '',
    isAvailable: true,
    address: '',
    city: '',
    state: '',
    pincode: ''
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setTechnicianForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!technicianForm.name || !technicianForm.email || !technicianForm.phone) {
      toast.error('Please fill in all required fields')
      return
    }
    
    setLoading(true)
    
    try {
      const technicianData = {
        ...technicianForm,
        experience: parseInt(technicianForm.experience) || 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      await addDoc(collection(db, 'technicians'), technicianData)
      
      toast.success('Technician added successfully')
      router.push('/admin/technicians')
    } catch (error) {
      console.error('Error adding technician:', error)
      toast.error('Failed to add technician')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>Add New Technician</h2>
        <button
          onClick={() => router.push('/admin/technicians')}
          className="inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none"
          style={{ 
            borderColor: 'var(--border-color)',
            backgroundColor: 'var(--panel-gray)',
            color: 'var(--text-main)'
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Technicians
        </button>
      </div>

      <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: 'var(--panel-charcoal)' }}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2" style={{ color: 'var(--text-main)', borderColor: 'var(--border-color)' }}>Personal Information</h3>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={technicianForm.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                  style={{ 
                    backgroundColor: 'var(--panel-gray)', 
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-main)'
                  }}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={technicianForm.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                  style={{ 
                    backgroundColor: 'var(--panel-gray)', 
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-main)'
                  }}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={technicianForm.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                  style={{ 
                    backgroundColor: 'var(--panel-gray)', 
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-main)'
                  }}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="imageURL" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Profile Image URL
                </label>
                <input
                  type="text"
                  id="imageURL"
                  name="imageURL"
                  value={technicianForm.imageURL}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                  style={{ 
                    backgroundColor: 'var(--panel-gray)', 
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-main)'
                  }}
                  placeholder="https://example.com/image.jpg"
                />
                {technicianForm.imageURL && (
                  <div className="mt-2 flex items-center">
                    <div className="h-16 w-16 rounded-full flex items-center justify-center overflow-hidden" style={{ backgroundColor: 'var(--panel-gray)' }}>
                      <img 
                        src={technicianForm.imageURL} 
                        alt="Preview" 
                        className="h-16 w-16 object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' /%3E%3C/svg%3E";
                        }}
                      />
                    </div>
                    <span className="ml-2 text-xs" style={{ color: 'var(--text-secondary)' }}>Preview (if URL is valid)</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Professional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2" style={{ color: 'var(--text-main)', borderColor: 'var(--border-color)' }}>Professional Information</h3>
              
              <div>
                <label htmlFor="specialization" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Specialization
                </label>
                <select
                  id="specialization"
                  name="specialization"
                  value={technicianForm.specialization}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                  style={{ 
                    backgroundColor: 'var(--panel-gray)', 
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-main)'
                  }}
                >
                  <option value="">Select Specialization</option>
                  <option value="AC Repair">AC Repair</option>
                  <option value="TV Repair">TV Repair</option>
                  <option value="Refrigerator Repair">Refrigerator Repair</option>
                  <option value="Washing Machine Repair">Washing Machine Repair</option>
                  <option value="Mobile Repair">Mobile Repair</option>
                  <option value="Laptop Repair">Laptop Repair</option>
                  <option value="General Electronics">General Electronics</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="experience" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Years of Experience
                </label>
                <input
                  type="number"
                  id="experience"
                  name="experience"
                  value={technicianForm.experience}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                  style={{ 
                    backgroundColor: 'var(--panel-gray)', 
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-main)'
                  }}
                  min="0"
                />
              </div>
              
              <div>
                <label htmlFor="bio" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Bio / Description
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={technicianForm.bio}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                  style={{ 
                    backgroundColor: 'var(--panel-gray)', 
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-main)'
                  }}
                  placeholder="Brief description about the technician's skills and experience"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isAvailable"
                  name="isAvailable"
                  checked={technicianForm.isAvailable}
                  onChange={handleChange}
                  className="h-4 w-4 text-[#e60012] focus:ring-[#e60012] rounded"
                  style={{ borderColor: 'var(--border-color)' }}
                />
                <label htmlFor="isAvailable" className="ml-2 block text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Available for new assignments
                </label>
              </div>
            </div>
          </div>
          
          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2" style={{ color: 'var(--text-main)', borderColor: 'var(--border-color)' }}>Address Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="address" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={technicianForm.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                  style={{ 
                    backgroundColor: 'var(--panel-gray)', 
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-main)'
                  }}
                />
              </div>
              
              <div>
                <label htmlFor="city" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={technicianForm.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                  style={{ 
                    backgroundColor: 'var(--panel-gray)', 
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-main)'
                  }}
                />
              </div>
              
              <div>
                <label htmlFor="state" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  State
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={technicianForm.state}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                  style={{ 
                    backgroundColor: 'var(--panel-gray)', 
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-main)'
                  }}
                />
              </div>
              
              <div>
                <label htmlFor="pincode" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Pincode
                </label>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  value={technicianForm.pincode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                  style={{ 
                    backgroundColor: 'var(--panel-gray)', 
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-main)'
                  }}
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e60012] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              style={{ 
                backgroundColor: '#e60012',
                color: 'white',
                '--tw-ring-offset-color': 'var(--panel-charcoal)'
              }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding Technician...
                </>
              ) : (
                'Add Technician'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
