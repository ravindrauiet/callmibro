'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { toast } from 'react-hot-toast'

export default function ModelsManagement() {
  const [models, setModels] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterBrand, setFilterBrand] = useState('all')
  const [showModelModal, setShowModelModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedModel, setSelectedModel] = useState(null)
  
  // Form state
  const [modelForm, setModelForm] = useState({
    name: '',
    category: '',
    brandId: '',
    brandName: '',
    photoURL: '',
    isActive: true
  })

  // Categories
  const categories = [
    'AC',
    'TV',
    'Refrigerator', 
    'Washing Machine',
    'Mobile',
    'Laptop',
    'Other'
  ]

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch brands
        const brandsSnapshot = await getDocs(
          query(collection(db, 'brands'), orderBy('name'))
        )
        const brandsData = brandsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setBrands(brandsData)
        
        // Fetch models
        const modelsSnapshot = await getDocs(
          query(collection(db, 'models'), orderBy('name'))
        )
        const modelsData = modelsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        }))
        setModels(modelsData)
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter brands based on selected category
  const filteredBrands = filterCategory === 'all' 
    ? brands 
    : brands.filter(brand => brand.category === filterCategory)

  // Filter models
  const filteredModels = models.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.brandName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || model.category === filterCategory
    const matchesBrand = filterBrand === 'all' || model.brandId === filterBrand
    
    return matchesSearch && matchesCategory && matchesBrand
  })

  // Open model modal for add/edit
  const openModelModal = (model = null) => {
    if (model) {
      setModelForm({
        name: model.name || '',
        category: model.category || '',
        brandId: model.brandId || '',
        brandName: model.brandName || '',
        photoURL: model.photoURL || '',
        isActive: model.isActive !== false
      })
      setSelectedModel(model)
    } else {
      setModelForm({
        name: '',
        category: '',
        brandId: '',
        brandName: '',
        photoURL: '',
        isActive: true
      })
      setSelectedModel(null)
    }
    setShowModelModal(true)
  }

  // Handle category change
  const handleCategoryChange = (category) => {
    setModelForm(prev => ({
      ...prev,
      category,
      brandId: '',
      brandName: ''
    }))
  }

  // Handle brand change
  const handleBrandChange = (brandId) => {
    const selectedBrand = brands.find(brand => brand.id === brandId)
    setModelForm(prev => ({
      ...prev,
      brandId,
      brandName: selectedBrand ? selectedBrand.name : ''
    }))
  }

  // Handle model form submit
  const handleModelSubmit = async (e) => {
    e.preventDefault()
    
    if (!modelForm.name || !modelForm.category || !modelForm.brandId) {
      toast.error('Please fill in all required fields')
      return
    }
    
    try {
      const modelData = {
        ...modelForm,
        updatedAt: serverTimestamp()
      }
      
      if (selectedModel) {
        // Update existing model
        await updateDoc(doc(db, 'models', selectedModel.id), modelData)
        
        // Update model in state
        setModels(prev => prev.map(model => 
          model.id === selectedModel.id 
            ? { ...model, ...modelData, updatedAt: new Date() } 
            : model
        ))
        
        toast.success('Model updated successfully')
      } else {
        // Add new model
        const docRef = await addDoc(collection(db, 'models'), {
          ...modelData,
          createdAt: serverTimestamp()
        })
        
        // Add new model to state
        setModels(prev => [{
          id: docRef.id,
          ...modelData,
          createdAt: new Date(),
          updatedAt: new Date()
        }, ...prev])
        
        toast.success('Model added successfully')
      }
      
      setShowModelModal(false)
    } catch (error) {
      console.error('Error saving model:', error)
      toast.error('Failed to save model')
    }
  }

  // Delete model
  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, 'models', selectedModel.id))
      
      // Remove model from state
      setModels(prev => prev.filter(model => model.id !== selectedModel.id))
      
      toast.success('Model deleted successfully')
      setShowDeleteModal(false)
    } catch (error) {
      console.error('Error deleting model:', error)
      toast.error('Failed to delete model')
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
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>Models Management</h2>
        <div className="flex space-x-3">
          <Link
            href="/admin/models/migrate"
            className="inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e60012]"
            style={{ 
              borderColor: 'var(--border-color)',
              backgroundColor: 'var(--panel-gray)',
              color: 'var(--text-main)'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Migration Tool
          </Link>
          <button
            onClick={() => openModelModal()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e60012]"
            style={{ 
              backgroundColor: '#e60012',
              color: 'white',
              '--tw-ring-offset-color': 'var(--panel-charcoal)'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Model
          </button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search models..."
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
        
        {/* Category filter */}
        <div className="sm:w-64">
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value)
              setFilterBrand('all') // Reset brand filter when category changes
            }}
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
        
        {/* Brand filter */}
        <div className="sm:w-64">
          <select
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
            style={{ 
              backgroundColor: 'var(--panel-gray)', 
              borderColor: 'var(--border-color)',
              color: 'var(--text-main)'
            }}
          >
            <option value="all">All Brands</option>
            {filteredBrands.map(brand => (
              <option key={brand.id} value={brand.id}>
                {brand.name} ({brand.category})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Models Table */}
      <div className="rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: 'var(--panel-charcoal)' }}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y" style={{ borderColor: 'var(--border-color)' }}>
            <thead style={{ backgroundColor: 'var(--panel-gray)' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Brand (Category)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ backgroundColor: 'var(--panel-charcoal)', borderColor: 'var(--border-color)' }}>
              {filteredModels.length > 0 ? (
                filteredModels.map((model) => (
                  <tr key={model.id} className="transition-colors" style={{ '--tw-hover-bg': 'var(--panel-gray)' }}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {model.photoURL ? (
                          <div className="h-10 w-10 rounded-md flex items-center justify-center overflow-hidden mr-3" style={{ backgroundColor: 'var(--panel-gray)' }}>
                            <img 
                              src={model.photoURL} 
                              alt={model.name} 
                              className="h-8 w-8 object-contain"
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-md flex items-center justify-center mr-3" style={{ backgroundColor: 'var(--panel-gray)' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--text-secondary)' }}>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                        )}
                        <div className="font-medium" style={{ color: 'var(--text-main)' }}>{model.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div style={{ color: 'var(--text-main)' }}>
                        {model.brandName} <span style={{ color: 'var(--text-secondary)' }}>({model.category})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${model.isActive ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
                        {model.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {model.createdAt instanceof Date 
                        ? model.createdAt.toLocaleDateString() 
                        : 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => openModelModal(model)}
                          className="text-indigo-400 hover:text-indigo-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setSelectedModel(model);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center" style={{ color: 'var(--text-secondary)' }}>
                    {searchTerm || filterBrand !== 'all' || filterCategory !== 'all'
                      ? 'No models found matching your filters.'
                      : 'No models found. Add one to get started.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Model Modal */}
      {showModelModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="rounded-lg shadow-xl max-w-md w-full p-6" style={{ backgroundColor: 'var(--panel-charcoal)' }}>
            <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--text-main)' }}>
              {selectedModel ? 'Edit Model' : 'Add New Model'}
            </h3>
            
            <form onSubmit={handleModelSubmit} className="space-y-4">
              {/* Category Selection */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Category *
                </label>
                <select
                  id="category"
                  value={modelForm.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                  style={{ 
                    backgroundColor: 'var(--panel-gray)', 
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-main)'
                  }}
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Brand Selection */}
              <div>
                <label htmlFor="brand" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Brand *
                </label>
                <select
                  id="brand"
                  value={modelForm.brandId}
                  onChange={(e) => handleBrandChange(e.target.value)}
                  required
                  disabled={!modelForm.category}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                  style={{ 
                    backgroundColor: 'var(--panel-gray)', 
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-main)'
                  }}
                >
                  <option value="">Select Brand</option>
                  {brands
                    .filter(brand => brand.category === modelForm.category)
                    .map(brand => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))
                  }
                </select>
              </div>

              {/* Model Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Model Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={modelForm.name}
                  onChange={(e) => setModelForm({...modelForm, name: e.target.value})}
                  required
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                  style={{ 
                    backgroundColor: 'var(--panel-gray)', 
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-main)'
                  }}
                />
              </div>

              {/* Photo URL */}
              <div>
                <label htmlFor="photoURL" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Photo URL
                </label>
                <input
                  type="url"
                  id="photoURL"
                  value={modelForm.photoURL}
                  onChange={(e) => setModelForm({...modelForm, photoURL: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                  style={{ 
                    backgroundColor: 'var(--panel-gray)', 
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-main)'
                  }}
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={modelForm.isActive}
                  onChange={(e) => setModelForm({...modelForm, isActive: e.target.checked})}
                  className="h-4 w-4 text-[#e60012] focus:ring-[#e60012] rounded"
                  style={{ 
                    backgroundColor: 'var(--panel-gray)',
                    borderColor: 'var(--border-color)'
                  }}
                />
                <label htmlFor="isActive" className="ml-2 block text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Active
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <button
                  type="button"
                  onClick={() => setShowModelModal(false)}
                  className="px-4 py-2 border rounded-md focus:outline-none"
                  style={{ 
                    borderColor: 'var(--border-color)',
                    backgroundColor: 'var(--panel-gray)',
                    color: 'var(--text-main)'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md focus:outline-none"
                  style={{ 
                    backgroundColor: '#e60012',
                    color: 'white'
                  }}
                >
                  {selectedModel ? 'Update' : 'Add'} Model
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="rounded-lg shadow-xl max-w-md w-full p-6" style={{ backgroundColor: 'var(--panel-charcoal)' }}>
            <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--text-main)' }}>Confirm Delete</h3>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              Are you sure you want to delete the model "{selectedModel?.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded-md focus:outline-none"
                style={{ 
                  borderColor: 'var(--border-color)',
                  backgroundColor: 'var(--panel-gray)',
                  color: 'var(--text-main)'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 border border-transparent rounded-md focus:outline-none"
                style={{ 
                  backgroundColor: 'red',
                  color: 'white'
                }}
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