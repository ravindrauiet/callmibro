'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc, serverTimestamp, query, where } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { toast } from 'react-hot-toast'

export default function ModelsManagement() {
  const [models, setModels] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBrand, setFilterBrand] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showModelModal, setShowModelModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedModel, setSelectedModel] = useState(null)
  const [categories, setCategories] = useState([])
  
  // Form state
  const [modelForm, setModelForm] = useState({
    name: '',
    brandId: '',
    brandName: '',
    category: '',
    description: '',
    photoURL: '',
    isActive: true
  })

  // Fetch models and brands
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch brands first
        const brandsSnapshot = await getDocs(collection(db, 'brands'))
        const brandsData = brandsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setBrands(brandsData)
        
        // Extract all unique categories
        const allCategories = new Set()
        brandsData.forEach(brand => {
          if (brand.category) {
            allCategories.add(brand.category)
          }
        })
        setCategories(Array.from(allCategories).sort())
        
        // Fetch models from the dedicated models collection
        const modelsCollection = collection(db, 'models')
        const modelsSnapshot = await getDocs(modelsCollection)
        
        const modelsData = modelsSnapshot.docs.map(doc => {
          const data = doc.data()
          const brand = brandsData.find(b => b.id === data.brandId) || {}
          
          return {
            id: doc.id,
            ...data,
            brandName: brand.name || data.brandName || 'Unknown Brand',
            brandCategory: brand.category || data.category || 'Uncategorized'
          }
        })
        
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

  // Filter models based on search term, brand filter and category
  const filteredModels = models.filter(model => {
    const matchesSearch = model.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBrand = filterBrand === 'all' || model.brandId === filterBrand
    const matchesCategory = filterCategory === 'all' || model.category === filterCategory
    return matchesSearch && matchesBrand && matchesCategory
  })

  // Filter brands by selected category
  const filteredBrands = brands.filter(brand => 
    filterCategory === 'all' || brand.category === filterCategory
  )

  // Open model modal for add/edit
  const openModelModal = (model = null) => {
    if (model) {
      setModelForm({
        name: model.name || '',
        brandId: model.brandId || '',
        brandName: model.brandName || '',
        category: model.category || '',
        description: model.description || '',
        photoURL: model.photoURL || '',
        isActive: model.isActive !== false
      })
      setSelectedModel(model)
    } else {
      // Start with empty form
      const initialCategory = categories.length > 0 ? categories[0] : ''
      const initialBrand = brands.filter(b => b.category === initialCategory)[0] || brands[0] || {}
      
      setModelForm({
        name: '',
        brandId: initialBrand.id || '',
        brandName: initialBrand.name || '',
        category: initialCategory,
        description: '',
        photoURL: '',
        isActive: true
      })
      setSelectedModel(null)
    }
    setShowModelModal(true)
  }

  // Handle category change in form
  const handleCategoryChange = (category) => {
    const brandsInCategory = brands.filter(b => b.category === category)
    const firstBrand = brandsInCategory[0] || {}
    
    setModelForm(prev => ({
      ...prev,
      category,
      brandId: firstBrand.id || '',
      brandName: firstBrand.name || ''
    }))
  }

  // Handle brand change in form
  const handleBrandChange = (brandId) => {
    const selectedBrand = brands.find(b => b.id === brandId) || {}
    
    setModelForm(prev => ({
      ...prev,
      brandId,
      brandName: selectedBrand.name || '',
      category: selectedBrand.category || prev.category
    }))
  }

  // Handle model form submit
  const handleModelSubmit = async (e) => {
    e.preventDefault()
    
    if (!modelForm.name || !modelForm.brandId || !modelForm.category) {
      toast.error('Model name, brand and category are required')
      return
    }
    
    try {
      // Get the brand details
      const selectedBrand = brands.find(b => b.id === modelForm.brandId) || {}
      
      // Prepare model data
      const modelData = {
        name: modelForm.name,
        brandId: modelForm.brandId,
        brandName: selectedBrand.name || modelForm.brandName,
        category: selectedBrand.category || modelForm.category,
        description: modelForm.description,
        photoURL: modelForm.photoURL,
        isActive: modelForm.isActive,
        updatedAt: serverTimestamp()
      }
      
      if (selectedModel) {
        // Update existing model in standalone collection
        await updateDoc(doc(db, 'models', selectedModel.id), modelData)
        
        // Update model in state
        setModels(prev => prev.map(model => 
          model.id === selectedModel.id
            ? { 
                ...model, 
                ...modelData,
                updatedAt: new Date()
              } 
            : model
        ))
        
        toast.success('Model updated successfully')
      } else {
        // Add new model to standalone collection
        modelData.createdAt = serverTimestamp()
        
        const docRef = await addDoc(collection(db, 'models'), modelData)
        
        // Add new model to state
        setModels(prev => [...prev, {
          id: docRef.id,
          ...modelData,
          createdAt: new Date(),
          updatedAt: new Date()
        }])
        
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
      // Delete from standalone collection
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
        <h2 className="text-2xl font-bold text-white">Models Management</h2>
        <div className="flex space-x-3">
          <Link
            href="/admin/models/migrate"
            className="inline-flex items-center px-4 py-2 border border-[#333] rounded-md shadow-sm text-sm font-medium text-white hover:bg-[#222] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e60012]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Migration Tool
          </Link>
          <button
            onClick={() => openModelModal()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#e60012] hover:bg-[#d40010] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e60012]"
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
            className="w-full px-4 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            className="w-full px-3 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
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
            className="w-full px-3 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
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
      <div className="bg-[#1a1a1a] rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#333]">
            <thead className="bg-[#222]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Brand (Category)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#1a1a1a] divide-y divide-[#333]">
              {filteredModels.length > 0 ? (
                filteredModels.map((model) => (
                  <tr key={model.id} className="hover:bg-[#222] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {model.photoURL ? (
                          <div className="h-10 w-10 bg-[#222] rounded-md flex items-center justify-center overflow-hidden mr-3">
                            <img 
                              src={model.photoURL} 
                              alt={model.name} 
                              className="h-8 w-8 object-contain"
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 bg-[#222] rounded-md flex items-center justify-center text-gray-400 mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                        )}
                        <div className="text-white font-medium">{model.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-white">
                        {model.brandName} <span className="text-gray-400">({model.category})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${model.isActive ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
                        {model.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
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
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-400">
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
          <div className="bg-[#1a1a1a] rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-white mb-4">
              {selectedModel ? 'Edit Model' : 'Add New Model'}
            </h3>
            
            <form onSubmit={handleModelSubmit} className="space-y-4">
              {/* Category Selection */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">
                  Category *
                </label>
                <select
                  id="category"
                  value={modelForm.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              {/* Brand Selection */}
              <div>
                <label htmlFor="brandId" className="block text-sm font-medium text-gray-300 mb-1">
                  Brand *
                </label>
                <select
                  id="brandId"
                  value={modelForm.brandId}
                  onChange={(e) => handleBrandChange(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
                >
                  <option value="">Select Brand</option>
                  {brands
                    .filter(brand => !modelForm.category || brand.category === modelForm.category)
                    .map(brand => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                </select>
              </div>
              
              {/* Model Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                  Model Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={modelForm.name}
                  onChange={(e) => setModelForm({...modelForm, name: e.target.value})}
                  required
                  className="w-full px-3 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
                  placeholder="Enter model name"
                />
              </div>
              
              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={modelForm.description}
                  onChange={(e) => setModelForm({...modelForm, description: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
                  placeholder="Enter model description"
                ></textarea>
              </div>
              
              {/* Photo URL */}
              <div>
                <label htmlFor="photoURL" className="block text-sm font-medium text-gray-300 mb-1">
                  Photo URL
                </label>
                <input
                  type="text"
                  id="photoURL"
                  value={modelForm.photoURL}
                  onChange={(e) => setModelForm({...modelForm, photoURL: e.target.value})}
                  className="w-full px-3 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
                  placeholder="Enter photo URL"
                />
              </div>
              
              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={modelForm.isActive}
                  onChange={(e) => setModelForm({...modelForm, isActive: e.target.checked})}
                  className="h-4 w-4 text-[#e60012] bg-[#222] border-[#333] rounded focus:ring-[#e60012]"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-300">
                  Active
                </label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-[#333]">
                <button
                  type="button"
                  onClick={() => setShowModelModal(false)}
                  className="px-4 py-2 border border-[#333] rounded-md text-white hover:bg-[#222] focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#e60012] border border-transparent rounded-md text-white hover:bg-[#d40010] focus:outline-none"
                >
                  {selectedModel ? 'Update Model' : 'Add Model'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-white mb-4">Confirm Delete</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete the model "{selectedModel?.name}"? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-[#333] rounded-md text-white hover:bg-[#222] focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-white hover:bg-red-700 focus:outline-none"
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