'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { collection, getDocs, doc, deleteDoc, query, where } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { toast } from 'react-hot-toast'

export default function TechniciansManagement() {
  const [technicians, setTechnicians] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSpecialty, setFilterSpecialty] = useState('all')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [technicianToDelete, setTechnicianToDelete] = useState(null)
  const [specialties, setSpecialties] = useState([])

  // Fetch technicians
  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        let techniciansQuery = collection(db, 'technicians')
        
        // Apply specialty filter if not 'all'
        if (filterSpecialty !== 'all') {
          techniciansQuery = query(
            techniciansQuery,
            where('specialties', 'array-contains', filterSpecialty)
          )
        }
        
        const techniciansSnapshot = await getDocs(techniciansQuery)
        const techniciansData = techniciansSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        // Extract all unique specialties for filter
        const allSpecialties = new Set()
        techniciansData.forEach(tech => {
          if (tech.specialties && Array.isArray(tech.specialties)) {
            tech.specialties.forEach(specialty => {
              allSpecialties.add(specialty)
            })
          }
        })
        
        setTechnicians(techniciansData)
        setSpecialties(Array.from(allSpecialties).sort())
      } catch (error) {
        console.error('Error fetching technicians:', error)
        toast.error('Failed to load technicians')
      } finally {
        setLoading(false)
      }
    }

    fetchTechnicians()
  }, [filterSpecialty])

  // Handle delete technician
  const handleDeleteClick = (technician) => {
    setTechnicianToDelete(technician)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!technicianToDelete) return
    
    try {
      await deleteDoc(doc(db, 'technicians', technicianToDelete.id))
      setTechnicians(technicians.filter(tech => tech.id !== technicianToDelete.id))
      toast.success('Technician deleted successfully')
    } catch (error) {
      console.error('Error deleting technician:', error)
      toast.error('Failed to delete technician')
    } finally {
      setShowDeleteModal(false)
      setTechnicianToDelete(null)
    }
  }

  // Filter technicians based on search term
  const filteredTechnicians = technicians.filter(technician => 
    technician.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    technician.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    technician.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    technician.location?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e60012]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white">Technicians Management</h2>
        <Link 
          href="/admin/technicians/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#e60012] hover:bg-[#d40010] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e60012]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Technician
        </Link>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search technicians..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <div className="sm:w-64">
          <select
            value={filterSpecialty}
            onChange={(e) => setFilterSpecialty(e.target.value)}
            className="w-full px-4 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
          >
            <option value="all">All Specialties</option>
            {specialties.map(specialty => (
              <option key={specialty} value={specialty}>{specialty}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Technicians Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTechnicians.length > 0 ? (
          filteredTechnicians.map((technician) => (
            <div key={technician.id} className="bg-[#1a1a1a] rounded-lg shadow-md overflow-hidden border border-[#333] hover:border-[#444] transition-colors">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#e60012] to-[#ff6b6b] flex items-center justify-center text-white text-xl font-medium">
                    {technician.photo ? (
                      <img 
                        src={technician.photo} 
                        alt={technician.name} 
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    ) : (
                      technician.name?.charAt(0).toUpperCase() || 'T'
                    )}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-white">{technician.name}</h3>
                    <p className="text-sm text-gray-400">{technician.email}</p>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-gray-300">{technician.phone}</span>
                  </div>
                  
                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-gray-300">{technician.location}</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {technician.specialties?.map((specialty, index) => (
                      <span 
                        key={index} 
                        className="px-2 py-1 bg-[#222] text-xs rounded-md text-gray-300"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-[#333]">
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      technician.isAvailable 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {technician.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800`}>
                      {technician.completedJobs || 0} Jobs
                    </span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link 
                      href={`/admin/technicians/${technician.id}/edit`}
                      className="p-2 text-blue-500 hover:text-blue-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <button 
                      onClick={() => handleDeleteClick(technician)}
                      className="p-2 text-red-500 hover:text-red-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex items-center justify-center py-8 text-gray-400">
            {searchTerm || filterSpecialty !== 'all' 
              ? 'No technicians found matching your search criteria' 
              : 'No technicians found. Add your first technician!'
            }
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-medium text-white mb-4">Confirm Delete</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete the technician "{technicianToDelete?.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 rounded-md text-white hover:bg-red-700 focus:outline-none"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 