'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc, serverTimestamp, query, where, orderBy } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { toast } from 'react-hot-toast'

export default function SparePartsManagement() {
  const [spareParts, setSpareParts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showSparePartModal, setShowSparePartModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedSparePart, setSelectedSparePart] = useState(null)
  
  // Form state
  const [sparePartForm, setSparePartForm] = useState({
    name: '',
    deviceCategory: '',
    brand: '',
    model: '',
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

  // Predefined device categories, brands, and models
  const deviceCategories = [
    'Mobile Phones',
    'TVs', 
    'ACs',
    'Refrigerators',
    'Washing Machines',
    'Laptops',
    'Tablets',
    'Gaming Consoles'
  ]

  const brandOptions = {
    'Mobile Phones': ['Apple', 'Samsung', 'Xiaomi', 'OnePlus', 'OPPO', 'Vivo', 'Realme', 'Nothing', 'Google', 'Motorola'],
    'TVs': ['Samsung', 'LG', 'Sony', 'Panasonic', 'TCL', 'Mi', 'OnePlus', 'VU', 'Thomson', 'BPL'],
    'ACs': ['Voltas', 'Blue Star', 'Carrier', 'Daikin', 'Hitachi', 'LG', 'Samsung', 'Panasonic', 'Whirlpool', 'Godrej'],
    'Refrigerators': ['LG', 'Samsung', 'Whirlpool', 'Godrej', 'Haier', 'Panasonic', 'Hitachi', 'Bosch', 'BPL', 'Voltas'],
    'Washing Machines': ['LG', 'Samsung', 'Whirlpool', 'IFB', 'Bosch', 'Haier', 'Panasonic', 'Godrej', 'BPL', 'Voltas'],
    'Laptops': ['Dell', 'HP', 'Lenovo', 'Apple', 'ASUS', 'Acer', 'MSI', 'Razer', 'Alienware', 'Gigabyte'],
    'Tablets': ['Apple', 'Samsung', 'Xiaomi', 'Lenovo', 'Realme', 'OPPO', 'OnePlus', 'Amazon', 'Google', 'Huawei'],
    'Gaming Consoles': ['Sony', 'Microsoft', 'Nintendo', 'Steam', 'ASUS', 'Razer', 'Logitech', 'Corsair', 'HyperX', 'SteelSeries']
  }

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
        
        // Extract unique categories, brands, and models
        const uniqueCategories = [...new Set(sparePartsData.map(part => part.category))]
          .filter(Boolean)
          .sort()
        
        const uniqueBrands = [...new Set(sparePartsData.map(part => part.brand))]
          .filter(Boolean)
          .sort()
        
        const uniqueModels = [...new Set(sparePartsData.map(part => part.model))]
          .filter(Boolean)
          .sort()
        
        setSpareParts(sparePartsData)
        setCategories(uniqueCategories)
        setBrands(uniqueBrands)
        setModels(uniqueModels)
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
      part.compatibility?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.model?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = filterCategory === 'all' || part.category === filterCategory
    
    return matchesSearch && matchesCategory
  })

  // Open spare part modal for add/edit
  const openSparePartModal = (sparePart = null) => {
    if (sparePart) {
      setSparePartForm({
        name: sparePart.name || '',
        deviceCategory: sparePart.deviceCategory || '',
        brand: sparePart.brand || '',
        model: sparePart.model || '',
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
        deviceCategory: '',
        brand: '',
        model: '',
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
    
    if (!sparePartForm.name || !sparePartForm.deviceCategory || !sparePartForm.brand) {
      toast.error('Name, Device Category, and Brand are required')
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
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>Spare Parts Management</h2>
        <button
          onClick={() => openSparePartModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#e60012] hover:bg-[#d40010] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e60012]"
          style={{ '--tw-ring-offset-color': 'var(--panel-charcoal)' }}
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

      {/* Spare Parts Table */}
      <div className="rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: 'var(--panel-charcoal)' }}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y" style={{ borderColor: 'var(--border-color)' }}>
            <thead style={{ backgroundColor: 'var(--panel-gray)' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Spare Part
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Device Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Brand & Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Stock
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
              {filteredSpareParts.length > 0 ? (
                filteredSpareParts.map((part) => (
                  <tr key={part.id} className="hover:bg-opacity-20 hover:bg-gray-600 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-md flex items-center justify-center overflow-hidden" style={{ backgroundColor: 'var(--panel-gray)' }}>
                          {part.imageURL ? (
                            <img 
                              src={part.imageURL} 
                              alt={part.name} 
                              className="h-10 w-10 object-cover"
                            />
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--text-secondary)' }}>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>{part.name}</div>
                          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{part.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{part.deviceCategory}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm" style={{ color: 'var(--text-main)' }}>{part.brand}</div>
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{part.model}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm" style={{ color: 'var(--text-main)' }}>₹{part.price}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{part.stock}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          part.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {part.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {part.featured && (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Featured
                          </span>
                        )}
                      </div>
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
                  <td colSpan={7} className="px-6 py-4 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {searchTerm ? 'No spare parts found matching your search' : 'No spare parts found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Spare Part Modal */}
      {showSparePartModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {selectedSparePart ? 'Edit Spare Part' : 'Add New Spare Part'}
            </h3>
            <form onSubmit={handleSparePartSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={sparePartForm.name}
                    onChange={(e) => setSparePartForm({ ...sparePartForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Device Category *
                  </label>
                  <select
                    value={sparePartForm.deviceCategory}
                    onChange={(e) => setSparePartForm({ ...sparePartForm, deviceCategory: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                    required
                  >
                    <option value="">Select Device Category</option>
                    {deviceCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand *
                  </label>
                  <select
                    value={sparePartForm.brand}
                    onChange={(e) => setSparePartForm({ ...sparePartForm, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                    required
                  >
                    <option value="">Select Brand</option>
                    {sparePartForm.deviceCategory && brandOptions[sparePartForm.deviceCategory]?.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model
                  </label>
                  <input
                    type="text"
                    value={sparePartForm.model}
                    onChange={(e) => setSparePartForm({ ...sparePartForm, model: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={sparePartForm.category}
                    onChange={(e) => setSparePartForm({ ...sparePartForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={sparePartForm.price}
                    onChange={(e) => setSparePartForm({ ...sparePartForm, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    value={sparePartForm.stock}
                    onChange={(e) => setSparePartForm({ ...sparePartForm, stock: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={sparePartForm.imageURL}
                    onChange={(e) => setSparePartForm({ ...sparePartForm, imageURL: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={sparePartForm.description}
                  onChange={(e) => setSparePartForm({ ...sparePartForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Compatibility
                </label>
                <textarea
                  value={sparePartForm.compatibility}
                  onChange={(e) => setSparePartForm({ ...sparePartForm, compatibility: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                  placeholder="Compatible devices/models..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specifications
                </label>
                <textarea
                  value={sparePartForm.specifications}
                  onChange={(e) => setSparePartForm({ ...sparePartForm, specifications: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                  placeholder="Technical specifications..."
                />
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={sparePartForm.isActive}
                    onChange={(e) => setSparePartForm({ ...sparePartForm, isActive: e.target.checked })}
                    className="h-4 w-4 text-[#e60012] focus:ring-[#e60012] border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                    Active
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={sparePartForm.featured}
                    onChange={(e) => setSparePartForm({ ...sparePartForm, featured: e.target.checked })}
                    className="h-4 w-4 text-[#e60012] focus:ring-[#e60012] border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                    Featured
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSparePartModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#e60012] rounded-md hover:bg-[#d40010]"
                >
                  {selectedSparePart ? 'Update' : 'Add'} Spare Part
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
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Spare Part</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete "{selectedSparePart?.name}"? This action cannot be undone.
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