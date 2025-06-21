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
  const [showModelModal, setShowModelModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedModel, setSelectedModel] = useState(null)
  
  // Form state
  const [modelForm, setModelForm] = useState({
    name: '',
    brandId: '',
    description: '',
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
        
        // Fetch all models
        const modelsData = []
        
        for (const brand of brandsData) {
          const modelsSnapshot = await getDocs(collection(db, 'brands', brand.id, 'models'))
          
          modelsSnapshot.docs.forEach(doc => {
            modelsData.push({
              id: doc.id,
              brandId: brand.id,
              brandName: brand.name,
              brandCategory: brand.category,
              ...doc.data()
            })
          })
        }
        
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

  // Filter models based on search term and brand filter
  const filteredModels = models.filter(model => {
    const matchesSearch = model.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBrand = filterBrand === 'all' || model.brandId === filterBrand
    return matchesSearch && matchesBrand
  })

  // Open model modal for add/edit
  const openModelModal = (model = null) => {
    if (model) {
      setModelForm({
        name: model.name || '',
        brandId: model.brandId || '',
        description: model.description || '',
        isActive: model.isActive !== false
      })
      setSelectedModel(model)
    } else {
      setModelForm({
        name: '',
        brandId: brands.length > 0 ? brands[0].id : '',
        description: '',
        isActive: true
      })
      setSelectedModel(null)
    }
    setShowModelModal(true)
  }

  // Handle model form submit
  const handleModelSubmit = async (e) => {
    e.preventDefault()
    
    if (!modelForm.name || !modelForm.brandId) {
      toast.error('Model name and brand are required')
      return
    }
    
    try {
      if (selectedModel) {
        // Update existing model
        await updateDoc(doc(db, 'brands', modelForm.brandId, 'models', selectedModel.id), {
          name: modelForm.name,
          description: modelForm.description,
          isActive: modelForm.isActive,
          updatedAt: serverTimestamp()
        })
        
        // Update model in state
        const brandName = brands.find(b => b.id === modelForm.brandId)?.name || ''
        const brandCategory = brands.find(b => b.id === modelForm.brandId)?.category || ''
        
        setModels(prev => prev.map(model => 
          model.id === selectedModel.id && model.brandId === selectedModel.brandId
            ? { 
                ...model, 
                name: modelForm.name,
                description: modelForm.description,
                isActive: modelForm.isActive,
                brandId: modelForm.brandId,
                brandName: brandName,
                brandCategory: brandCategory,
                updatedAt: new Date()
              } 
            : model
        ))
        
        toast.success('Model updated successfully')
      } else {
        // Add new model
        const docRef = await addDoc(collection(db, 'brands', modelForm.brandId, 'models'), {
          name: modelForm.name,
          description: modelForm.description,
          isActive: modelForm.isActive,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
        
        // Add new model to state
        const brandName = brands.find(b => b.id === modelForm.brandId)?.name || ''
        const brandCategory = brands.find(b => b.id === modelForm.brandId)?.category || ''
        
        setModels(prev => [...prev, {
          id: docRef.id,
          brandId: modelForm.brandId,
          brandName: brandName,
          brandCategory: brandCategory,
          ...modelForm,
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
      await deleteDoc(doc(db, 'brands', selectedModel.brandId, 'models', selectedModel.id))
      
      // Remove model from state
      setModels(prev => prev.filter(model => 
        !(model.id === selectedModel.id && model.brandId === selectedModel.brandId)
      ))
      
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
        
        <div className="sm:w-64">
          <select
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
            className="w-full px-3 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
          >
            <option value="all">All Brands</option>
            {brands.map(brand => (
              <option key={brand.id} value={brand.id}>{brand.name}</option>
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
                  Brand
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Description
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
              {filteredModels.length > 0 ? (
                filteredModels.map((model) => (
                  <tr key={`${model.brandId}-${model.id}`} className="hover:bg-[#222] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{model.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {model.brandName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {model.brandCategory}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div className="max-w-xs truncate">{model.description || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        model.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {model.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => openModelModal(model)}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setSelectedModel(model)
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
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-400">
                    {searchTerm || filterBrand !== 'all' 
                      ? 'No models found matching your search criteria' 
                      : 'No models found. Add your first model!'
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Modal */}
      {showModelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-medium text-white mb-4">
              {selectedModel ? 'Edit Model' : 'Add New Model'}
            </h3>
            
            <form onSubmit={handleModelSubmit} className="space-y-4">
              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-300 mb-1">
                  Brand <span className="text-red-500">*</span>
                </label>
                <select
                  id="brand"
                  value={modelForm.brandId}
                  onChange={(e) => setModelForm({...modelForm, brandId: e.target.value})}
                  className="w-full px-3 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
                  required
                >
                  <option value="">Select Brand</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                  Model Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={modelForm.name}
                  onChange={(e) => setModelForm({...modelForm, name: e.target.value})}
                  className="w-full px-3 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={modelForm.description}
                  onChange={(e) => setModelForm({...modelForm, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={modelForm.isActive}
                  onChange={(e) => setModelForm({...modelForm, isActive: e.target.checked})}
                  className="h-4 w-4 text-[#e60012] focus:ring-[#e60012] border-[#333] rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-300">
                  Active (visible to customers)
                </label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModelModal(false)}
                  className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#e60012] rounded-md text-white hover:bg-[#d40010] focus:outline-none"
                >
                  {selectedModel ? 'Update Model' : 'Add Model'}
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
              Are you sure you want to delete the model "{selectedModel?.name}" from brand "{selectedModel?.brandName}"? This action cannot be undone.
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