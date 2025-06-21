'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc, serverTimestamp, query, where, orderBy } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { toast } from 'react-hot-toast'

export default function SparePartsManagement() {
  const [spareParts, setSpareParts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showSparePartModal, setShowSparePartModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedSparePart, setSelectedSparePart] = useState(null)
  
  // Form state
  const [sparePartForm, setSparePartForm] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    imageURL: '',
    stock: 1,
    isActive: true,
    compatibility: '',
    specifications: '',
    featured: false
  })

  // Fetch spare parts
  useEffect(() => {
    const fetchSpareParts = async () => {
      try {
        const sparePartsSnapshot = await getDocs(
          query(collection(db, 'spareParts'), orderBy('createdAt', 'desc'))
        )
        
        const sparePartsData = sparePartsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          price: doc.data().price ? parseFloat(doc.data().price) : 0,
          stock: doc.data().stock || 0
        }))
        
        // Extract unique categories
        const uniqueCategories = [...new Set(sparePartsData.map(part => part.category))]
          .filter(Boolean)
          .sort()
        
        setSpareParts(sparePartsData)
        setCategories(uniqueCategories)
      } catch (error) {
        console.error('Error fetching spare parts:', error)
        toast.error('Failed to load spare parts')
      } finally {
        setLoading(false)
      }
    }

    fetchSpareParts()
  }, [])

  // Filter spare parts based on search term and category filter
  const filteredSpareParts = spareParts.filter(part => {
    const matchesSearch = 
      part.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.compatibility?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = filterCategory === 'all' || part.category === filterCategory
    
    return matchesSearch && matchesCategory
  })

  // Open spare part modal for add/edit
  const openSparePartModal = (sparePart = null) => {
    if (sparePart) {
      setSparePartForm({
        name: sparePart.name || '',
        category: sparePart.category || '',
        description: sparePart.description || '',
        price: sparePart.price ? sparePart.price.toString() : '',
        imageURL: sparePart.imageURL || '',
        stock: sparePart.stock || 1,
        isActive: sparePart.isActive !== false,
        compatibility: sparePart.compatibility || '',
        specifications: sparePart.specifications || '',
        featured: sparePart.featured || false
      })
      setSelectedSparePart(sparePart)
    } else {
      setSparePartForm({
        name: '',
        category: categories.length > 0 ? categories[0] : '',
        description: '',
        price: '',
        imageURL: '',
        stock: 1,
        isActive: true,
        compatibility: '',
        specifications: '',
        featured: false
      })
      setSelectedSparePart(null)
    }
    setShowSparePartModal(true)
  }

  // Handle spare part form submit
  const handleSparePartSubmit = async (e) => {
    e.preventDefault()
    
    if (!sparePartForm.name || !sparePartForm.category) {
      toast.error('Name and category are required')
      return
    }
    
    try {
      const sparePartData = {
        ...sparePartForm,
        price: parseFloat(sparePartForm.price) || 0,
        stock: parseInt(sparePartForm.stock) || 0,
        updatedAt: serverTimestamp()
      }
      
      if (selectedSparePart) {
        // Update existing spare part
        await updateDoc(doc(db, 'spareParts', selectedSparePart.id), sparePartData)
        
        // Update spare part in state
        setSpareParts(prev => prev.map(part => 
          part.id === selectedSparePart.id 
            ? { ...part, ...sparePartData, updatedAt: new Date() } 
            : part
        ))
        
        toast.success('Spare part updated successfully')
      } else {
        // Add new spare part
        const docRef = await addDoc(collection(db, 'spareParts'), {
          ...sparePartData,
          createdAt: serverTimestamp()
        })
        
        // Add new spare part to state
        setSpareParts(prev => [{
          id: docRef.id,
          ...sparePartData,
          createdAt: new Date(),
          updatedAt: new Date()
        }, ...prev])
        
        // Add new category to categories list if it doesn't exist
        if (sparePartForm.category && !categories.includes(sparePartForm.category)) {
          setCategories(prev => [...prev, sparePartForm.category].sort())
        }
        
        toast.success('Spare part added successfully')
      }
      
      setShowSparePartModal(false)
    } catch (error) {
      console.error('Error saving spare part:', error)
      toast.error('Failed to save spare part')
    }
  }

  // Delete spare part
  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, 'spareParts', selectedSparePart.id))
      
      // Remove spare part from state
      setSpareParts(prev => prev.filter(part => part.id !== selectedSparePart.id))
      
      toast.success('Spare part deleted successfully')
      setShowDeleteModal(false)
    } catch (error) {
      console.error('Error deleting spare part:', error)
      toast.error('Failed to delete spare part')
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
        <h2 className="text-2xl font-bold text-white">Spare Parts Management</h2>
        <button
          onClick={() => openSparePartModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#e60012] hover:bg-[#d40010] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e60012]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Spare Part
        </button>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search spare parts..."
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
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Spare Parts Table */}
      <div className="bg-[#1a1a1a] rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#333]">
            <thead className="bg-[#222]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#1a1a1a] divide-y divide-[#333]">
              {filteredSpareParts.length > 0 ? (
                filteredSpareParts.map((part) => (
                  <tr key={part.id} className="hover:bg-[#222] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {part.imageURL ? (
                        <div className="h-12 w-12 bg-[#222] rounded-md flex items-center justify-center overflow-hidden">
                          <img 
                            src={part.imageURL} 
                            alt={part.name} 
                            className="h-10 w-10 object-contain"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' /%3E%3C/svg%3E";
                            }}
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 bg-[#222] rounded-md flex items-center justify-center text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{part.name}</div>
                      {part.featured && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {part.category || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      ₹{part.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {part.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        part.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {part.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => openSparePartModal(part)}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSparePart(part)
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
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-400">
                    {searchTerm || filterCategory !== 'all' 
                      ? 'No spare parts found matching your search criteria' 
                      : 'No spare parts found. Add your first spare part!'
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Spare Part Modal */}
      {showSparePartModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-medium text-white mb-4">
              {selectedSparePart ? 'Edit Spare Part' : 'Add New Spare Part'}
            </h3>
            
            <form onSubmit={handleSparePartSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={sparePartForm.name}
                    onChange={(e) => setSparePartForm({...sparePartForm, name: e.target.value})}
                    className="w-full px-3 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="category"
                    list="category-options"
                    value={sparePartForm.category}
                    onChange={(e) => setSparePartForm({...sparePartForm, category: e.target.value})}
                    className="w-full px-3 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
                    placeholder="Select or type a category"
                    required
                  />
                  <datalist id="category-options">
                    {categories.map(category => (
                      <option key={category} value={category} />
                    ))}
                    {!categories.includes('AC Parts') && <option value="AC Parts" />}
                    {!categories.includes('TV Parts') && <option value="TV Parts" />}
                    {!categories.includes('Refrigerator Parts') && <option value="Refrigerator Parts" />}
                    {!categories.includes('Washing Machine Parts') && <option value="Washing Machine Parts" />}
                    {!categories.includes('Mobile Parts') && <option value="Mobile Parts" />}
                    {!categories.includes('Laptop Parts') && <option value="Laptop Parts" />}
                  </datalist>
                </div>
                
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    id="price"
                    value={sparePartForm.price}
                    onChange={(e) => setSparePartForm({...sparePartForm, price: e.target.value})}
                    className="w-full px-3 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label htmlFor="stock" className="block text-sm font-medium text-gray-300 mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    id="stock"
                    value={sparePartForm.stock}
                    onChange={(e) => setSparePartForm({...sparePartForm, stock: e.target.value})}
                    className="w-full px-3 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
                    min="0"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="imageURL" className="block text-sm font-medium text-gray-300 mb-1">
                    Image URL
                  </label>
                  <input
                    type="text"
                    id="imageURL"
                    value={sparePartForm.imageURL}
                    onChange={(e) => setSparePartForm({...sparePartForm, imageURL: e.target.value})}
                    className="w-full px-3 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
                    placeholder="https://example.com/image.jpg"
                  />
                  {sparePartForm.imageURL && (
                    <div className="mt-2 flex items-center">
                      <div className="h-16 w-16 bg-[#222] rounded-md flex items-center justify-center overflow-hidden">
                        <img 
                          src={sparePartForm.imageURL} 
                          alt="Preview" 
                          className="h-14 w-14 object-contain"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' /%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                      <span className="ml-2 text-xs text-gray-400">Preview (if URL is valid)</span>
                    </div>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={sparePartForm.description}
                    onChange={(e) => setSparePartForm({...sparePartForm, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="compatibility" className="block text-sm font-medium text-gray-300 mb-1">
                    Compatibility
                  </label>
                  <input
                    type="text"
                    id="compatibility"
                    value={sparePartForm.compatibility}
                    onChange={(e) => setSparePartForm({...sparePartForm, compatibility: e.target.value})}
                    className="w-full px-3 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
                    placeholder="e.g. Samsung Galaxy S10, iPhone 12, etc."
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="specifications" className="block text-sm font-medium text-gray-300 mb-1">
                    Specifications
                  </label>
                  <textarea
                    id="specifications"
                    value={sparePartForm.specifications}
                    onChange={(e) => setSparePartForm({...sparePartForm, specifications: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
                    placeholder="Technical specifications, dimensions, etc."
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={sparePartForm.isActive}
                    onChange={(e) => setSparePartForm({...sparePartForm, isActive: e.target.checked})}
                    className="h-4 w-4 text-[#e60012] focus:ring-[#e60012] border-[#333] rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-300">
                    Active (visible to customers)
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={sparePartForm.featured}
                    onChange={(e) => setSparePartForm({...sparePartForm, featured: e.target.checked})}
                    className="h-4 w-4 text-[#e60012] focus:ring-[#e60012] border-[#333] rounded"
                  />
                  <label htmlFor="featured" className="ml-2 block text-sm text-gray-300">
                    Featured (highlight on homepage)
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSparePartModal(false)}
                  className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#e60012] rounded-md text-white hover:bg-[#d40010] focus:outline-none"
                >
                  {selectedSparePart ? 'Update Spare Part' : 'Add Spare Part'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-medium text-white mb-4">Confirm Delete</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete the spare part "{selectedSparePart?.name}"? This action cannot be undone.
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