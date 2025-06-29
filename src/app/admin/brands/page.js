'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { toast } from 'react-hot-toast'

export default function BrandsManagement() {
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [showBrandModal, setShowBrandModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [categories, setCategories] = useState([])
  
  // Form state
  const [brandForm, setBrandForm] = useState({
    name: '',
    category: '',
    logo: '',
    isActive: true
  })

  // Fetch brands and categories
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const brandsSnapshot = await getDocs(collection(db, 'brands'))
        const brandsData = brandsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        // Extract all unique categories
        const allCategories = new Set()
        brandsData.forEach(brand => {
          if (brand.category) {
            allCategories.add(brand.category)
          }
        })
        
        setBrands(brandsData)
        setCategories(Array.from(allCategories).sort())
      } catch (error) {
        console.error('Error fetching brands:', error)
        toast.error('Failed to load brands')
      } finally {
        setLoading(false)
      }
    }

    fetchBrands()
  }, [])

  // Filter brands based on search term and category
  const filteredBrands = brands.filter(brand => {
    const matchesSearch = brand.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || brand.category === filterCategory
    return matchesSearch && matchesCategory
  })

  // Open brand modal for add/edit
  const openBrandModal = (brand = null) => {
    if (brand) {
      setBrandForm({
        name: brand.name || '',
        category: brand.category || '',
        logo: brand.logo || '',
        isActive: brand.isActive !== false
      })
      setSelectedBrand(brand)
    } else {
      setBrandForm({
        name: '',
        category: '',
        logo: '',
        isActive: true
      })
      setSelectedBrand(null)
    }
    setShowBrandModal(true)
  }

  // Handle brand form submit
  const handleBrandSubmit = async (e) => {
    e.preventDefault()
    
    if (!brandForm.name || !brandForm.category) {
      toast.error('Brand name and category are required')
      return
    }
    
    try {
      if (selectedBrand) {
        // Update existing brand
        await updateDoc(doc(db, 'brands', selectedBrand.id), {
          ...brandForm,
          updatedAt: serverTimestamp()
        })
        
        // Update brand in state
        setBrands(prev => prev.map(brand => 
          brand.id === selectedBrand.id 
            ? { ...brand, ...brandForm, updatedAt: new Date() } 
            : brand
        ))
        
        toast.success('Brand updated successfully')
      } else {
        // Add new brand
        const docRef = await addDoc(collection(db, 'brands'), {
          ...brandForm,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
        
        // Add new brand to state
        setBrands(prev => [...prev, {
          id: docRef.id,
          ...brandForm,
          createdAt: new Date(),
          updatedAt: new Date()
        }])
        
        toast.success('Brand added successfully')
      }
      
      setShowBrandModal(false)
    } catch (error) {
      console.error('Error saving brand:', error)
      toast.error('Failed to save brand')
    }
  }

  // Delete brand
  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, 'brands', selectedBrand.id))
      
      // Remove brand from state
      setBrands(prev => prev.filter(brand => brand.id !== selectedBrand.id))
      
      toast.success('Brand deleted successfully')
      setShowDeleteModal(false)
    } catch (error) {
      console.error('Error deleting brand:', error)
      toast.error('Failed to delete brand')
    }
  }

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
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>Brands Management</h2>
        <button
          onClick={() => openBrandModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#e60012] hover:bg-[#d40010] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e60012]"
          style={{ '--tw-ring-offset-color': 'var(--panel-charcoal)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Brand
        </button>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search brands..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
            style={{ 
              backgroundColor: 'var(--panel-gray)', 
              borderColor: 'var(--border-color)',
              color: 'var(--text-main)'
            }}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--text-secondary)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <div className="sm:w-64">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
            style={{ 
              backgroundColor: 'var(--panel-gray)', 
              borderColor: 'var(--border-color)',
              color: 'var(--text-main)'
            }}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Brands Table */}
      <div className="rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: 'var(--panel-charcoal)' }}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y" style={{ borderColor: 'var(--border-color)' }}>
            <thead style={{ backgroundColor: 'var(--panel-gray)' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Brand
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ backgroundColor: 'var(--panel-charcoal)', borderColor: 'var(--border-color)' }}>
              {filteredBrands.length > 0 ? (
                filteredBrands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-opacity-20 hover:bg-gray-600 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-md flex items-center justify-center overflow-hidden" style={{ backgroundColor: 'var(--panel-gray)' }}>
                          {brand.logo ? (
                            <img 
                              src={brand.logo} 
                              alt={brand.name} 
                              className="h-10 w-10 object-cover"
                            />
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--text-secondary)' }}>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>{brand.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{brand.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        brand.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {brand.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => openBrandModal(brand)}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedBrand(brand)
                            setShowDeleteModal(true)
                          }}
                          className="text-red-500 hover:text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {searchTerm ? 'No brands found matching your search' : 'No brands found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Brand Modal */}
      {showBrandModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {selectedBrand ? 'Edit Brand' : 'Add New Brand'}
            </h3>
            <form onSubmit={handleBrandSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand Name *
                </label>
                <input
                  type="text"
                  value={brandForm.name}
                  onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <input
                  type="text"
                  value={brandForm.category}
                  onChange={(e) => setBrandForm({ ...brandForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logo URL
                </label>
                <input
                  type="url"
                  value={brandForm.logo}
                  onChange={(e) => setBrandForm({ ...brandForm, logo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={brandForm.isActive}
                  onChange={(e) => setBrandForm({ ...brandForm, isActive: e.target.checked })}
                  className="h-4 w-4 text-[#e60012] focus:ring-[#e60012] border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Active
                </label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBrandModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#e60012] rounded-md hover:bg-[#d40010]"
                >
                  {selectedBrand ? 'Update' : 'Add'} Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Brand</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete "{selectedBrand?.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
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