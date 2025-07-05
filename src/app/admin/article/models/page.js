'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs, doc, addDoc, updateDoc, serverTimestamp, query, where, orderBy } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { toast } from 'react-hot-toast'

export default function ModelArticleManagement() {
  const [brands, setBrands] = useState([])
  const [models, setModels] = useState([])
  const [spareParts, setSpareParts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedSpareParts, setSelectedSpareParts] = useState([])
  const [modelPages, setModelPages] = useState([])
  
  // Form state
  const [modelPageForm, setModelPageForm] = useState({
    modelId: '',
    modelName: '',
    brandName: '',
    category: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    overview: '',
    specifications: {},
    features: [],
    priceComparison: {
      amazon: '',
      flipkart: '',
      croma: ''
    },
    compatibleSpareParts: [],
    isActive: true
  })

  // Categories
  const categories = [
    'AC', 'TV', 'Refrigerator', 'Washing Machine', 'Mobile', 'Laptop', 'Other'
  ]

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get brands
        const brandsSnapshot = await getDocs(collection(db, 'brands'))
        const brandsData = brandsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setBrands(brandsData)
        
        // Get models
        const modelsSnapshot = await getDocs(collection(db, 'models'))
        const modelsData = modelsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setModels(modelsData)
        
        // Get spare parts
        const sparePartsSnapshot = await getDocs(collection(db, 'spareParts'))
        const sparePartsData = sparePartsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setSpareParts(sparePartsData)
        
        // Get existing model pages
        const modelPagesSnapshot = await getDocs(collection(db, 'modelPages'))
        const modelPagesData = modelPagesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setModelPages(modelPagesData)
        
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    setSelectedBrand('')
    setSelectedModel('')
    setModelPageForm(prev => ({
      ...prev,
      category,
      brandName: '',
      modelName: ''
    }))
  }

  // Handle brand change
  const handleBrandChange = (brandId) => {
    const brand = brands.find(b => b.id === brandId)
    if (brand) {
      setSelectedBrand(brandId)
      setSelectedModel('')
      setModelPageForm(prev => ({
        ...prev,
        brandName: brand.name
      }))
    }
  }

  // Handle model change
  const handleModelChange = (modelId) => {
    const model = models.find(m => m.id === modelId)
    if (model) {
      setSelectedModel(modelId)
      setModelPageForm(prev => ({
        ...prev,
        modelId: model.id,
        modelName: model.name
      }))
      
      // Get compatible spare parts
      const compatibleParts = spareParts.filter(part => 
        part.compatibleModels && part.compatibleModels.includes(model.name)
      )
      setSelectedSpareParts(compatibleParts.map(p => p.id))
    }
  }

  // Handle spare part selection
  const handleSparePartSelection = (partId, isSelected) => {
    if (isSelected) {
      setSelectedSpareParts(prev => [...prev, partId])
    } else {
      setSelectedSpareParts(prev => prev.filter(id => id !== partId))
    }
  }

  // Handle specifications change
  const handleSpecificationChange = (key, value) => {
    setModelPageForm(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [key]: value
      }
    }))
  }

  // Add specification field
  const addSpecification = () => {
    const key = prompt('Enter specification name:')
    if (key) {
      const value = prompt('Enter specification value:')
      if (value) {
        handleSpecificationChange(key, value)
      }
    }
  }

  // Remove specification
  const removeSpecification = (key) => {
    setModelPageForm(prev => {
      const newSpecs = { ...prev.specifications }
      delete newSpecs[key]
      return { ...prev, specifications: newSpecs }
    })
  }

  // Handle features change
  const handleFeatureChange = (index, value) => {
    setModelPageForm(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }))
  }

  // Add feature
  const addFeature = () => {
    setModelPageForm(prev => ({
      ...prev,
      features: [...prev.features, '']
    }))
  }

  // Remove feature
  const removeFeature = (index) => {
    setModelPageForm(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!modelPageForm.modelId || !modelPageForm.seoTitle) {
      toast.error('Model and SEO title are required')
      return
    }
    
    try {
      const pageData = {
        ...modelPageForm,
        compatibleSpareParts: selectedSpareParts,
        slug: modelPageForm.modelName.toLowerCase().replace(/\s+/g, '-'),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      // Check if page already exists
      const existingPage = modelPages.find(page => page.modelId === modelPageForm.modelId)
      
      if (existingPage) {
        // Update existing page
        await updateDoc(doc(db, 'modelPages', existingPage.id), {
          ...pageData,
          updatedAt: serverTimestamp()
        })
        
        setModelPages(prev => prev.map(page => 
          page.id === existingPage.id 
            ? { ...page, ...pageData, updatedAt: new Date() }
            : page
        ))
        
        toast.success('Model page updated successfully')
      } else {
        // Create new page
        const docRef = await addDoc(collection(db, 'modelPages'), pageData)
        
        setModelPages(prev => [...prev, {
          id: docRef.id,
          ...pageData,
          createdAt: new Date(),
          updatedAt: new Date()
        }])
        
        toast.success('Model page created successfully')
      }
      
      // Reset form
      setModelPageForm({
        modelId: '',
        modelName: '',
        brandName: '',
        category: '',
        seoTitle: '',
        seoDescription: '',
        seoKeywords: '',
        overview: '',
        specifications: {},
        features: [],
        priceComparison: {
          amazon: '',
          flipkart: '',
          croma: ''
        },
        compatibleSpareParts: [],
        isActive: true
      })
      setSelectedCategory('')
      setSelectedBrand('')
      setSelectedModel('')
      setSelectedSpareParts([])
      setShowForm(false)
      
    } catch (error) {
      console.error('Error saving model page:', error)
      toast.error('Failed to save model page')
    }
  }

  // Get filtered brands
  const filteredBrands = selectedCategory 
    ? brands.filter(brand => brand.category === selectedCategory)
    : brands

  // Get filtered models
  const filteredModels = selectedBrand 
    ? models.filter(model => model.brandId === selectedBrand)
    : []

  // Get compatible spare parts for selected model
  const compatibleParts = selectedModel 
    ? spareParts.filter(part => 
        part.compatibleModels && 
        part.compatibleModels.includes(models.find(m => m.id === selectedModel)?.name)
      )
    : []

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
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>
          Model Page Management
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#e60012] hover:bg-[#d40010] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e60012]"
          style={{ '--tw-ring-offset-color': 'var(--panel-charcoal)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Model Page
        </button>
      </div>

      {/* Existing Model Pages */}
      <div className="rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: 'var(--panel-charcoal)' }}>
        <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-main)' }}>
            Existing Model Pages ({modelPages.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y" style={{ borderColor: 'var(--border-color)' }}>
            <thead style={{ backgroundColor: 'var(--panel-gray)' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Brand
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  SEO Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Spare Parts
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
              {modelPages.length > 0 ? (
                modelPages.map((page) => (
                  <tr key={page.id} className="hover:bg-opacity-20 hover:bg-gray-600 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>
                        {page.modelName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {page.brandName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {page.category}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {page.seoTitle}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {page.compatibleSpareParts?.length || 0} parts
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        page.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {page.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => {
                            setModelPageForm(page)
                            setSelectedCategory(page.category)
                            setSelectedBrand(brands.find(b => b.name === page.brandName)?.id || '')
                            setSelectedModel(page.modelId)
                            setSelectedSpareParts(page.compatibleSpareParts || [])
                            setShowForm(true)
                          }}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          Edit
                        </button>
                        <a
                          href={`/brands/${page.brandName.toLowerCase()}/${page.category.toLowerCase()}/${page.slug}`}
                          target="_blank"
                          className="text-green-500 hover:text-green-600"
                        >
                          View
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                    No model pages created yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {modelPageForm.modelId ? 'Edit Model Page' : 'Create Model Page'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Model Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand *
                  </label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => handleBrandChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                    disabled={!selectedCategory}
                    required
                  >
                    <option value="">Select Brand</option>
                    {filteredBrands.map(brand => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model *
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => handleModelChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                    disabled={!selectedBrand}
                    required
                  >
                    <option value="">Select Model</option>
                    {filteredModels.map(model => (
                      <option key={model.id} value={model.id}>{model.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SEO Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Title *
                  </label>
                  <input
                    type="text"
                    value={modelPageForm.seoTitle}
                    onChange={(e) => setModelPageForm({ ...modelPageForm, seoTitle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                    placeholder="Samsung Galaxy S21 - Price, Specs, Reviews"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Keywords
                  </label>
                  <input
                    type="text"
                    value={modelPageForm.seoKeywords}
                    onChange={(e) => setModelPageForm({ ...modelPageForm, seoKeywords: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                    placeholder="samsung, galaxy s21, mobile, smartphone"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Description
                </label>
                <textarea
                  value={modelPageForm.seoDescription}
                  onChange={(e) => setModelPageForm({ ...modelPageForm, seoDescription: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                  placeholder="Meta description for search engines..."
                />
              </div>

              {/* Content Sections */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model Overview
                </label>
                <textarea
                  value={modelPageForm.overview}
                  onChange={(e) => setModelPageForm({ ...modelPageForm, overview: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                  placeholder="Detailed model overview and features..."
                />
              </div>

              {/* Specifications */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Specifications
                  </label>
                  <button
                    type="button"
                    onClick={addSpecification}
                    className="text-sm text-[#e60012] hover:text-[#d40010]"
                  >
                    + Add Specification
                  </button>
                </div>
                <div className="space-y-2">
                  {Object.entries(modelPageForm.specifications).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={key}
                        onChange={(e) => handleSpecificationChange(e.target.value, value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                        placeholder="Specification name"
                      />
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleSpecificationChange(key, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                        placeholder="Value"
                      />
                      <button
                        type="button"
                        onClick={() => removeSpecification(key)}
                        className="text-red-500 hover:text-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Features
                  </label>
                  <button
                    type="button"
                    onClick={addFeature}
                    className="text-sm text-[#e60012] hover:text-[#d40010]"
                  >
                    + Add Feature
                  </button>
                </div>
                <div className="space-y-2">
                  {modelPageForm.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                        placeholder="Feature description"
                      />
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Comparison */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Comparison URLs
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Amazon</label>
                    <input
                      type="url"
                      value={modelPageForm.priceComparison.amazon}
                      onChange={(e) => setModelPageForm({
                        ...modelPageForm,
                        priceComparison: { ...modelPageForm.priceComparison, amazon: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="Amazon URL"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Flipkart</label>
                    <input
                      type="url"
                      value={modelPageForm.priceComparison.flipkart}
                      onChange={(e) => setModelPageForm({
                        ...modelPageForm,
                        priceComparison: { ...modelPageForm.priceComparison, flipkart: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="Flipkart URL"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Croma</label>
                    <input
                      type="url"
                      value={modelPageForm.priceComparison.croma}
                      onChange={(e) => setModelPageForm({
                        ...modelPageForm,
                        priceComparison: { ...modelPageForm.priceComparison, croma: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="Croma URL"
                    />
                  </div>
                </div>
              </div>

              {/* Compatible Spare Parts */}
              {selectedModel && compatibleParts.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Compatible Spare Parts
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto border rounded-md p-3" style={{ borderColor: 'var(--border-color)' }}>
                    {compatibleParts.map(part => (
                      <label key={part.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedSpareParts.includes(part.id)}
                          onChange={(e) => handleSparePartSelection(part.id, e.target.checked)}
                          className="h-4 w-4 text-[#e60012] focus:ring-[#e60012] border-gray-300 rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate" style={{ color: 'var(--text-main)' }}>
                            {part.name}
                          </div>
                          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            ₹{part.price}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={modelPageForm.isActive}
                  onChange={(e) => setModelPageForm({ ...modelPageForm, isActive: e.target.checked })}
                  className="h-4 w-4 text-[#e60012] focus:ring-[#e60012] border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Active
                </label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#e60012] rounded-md hover:bg-[#d40010]"
                >
                  {modelPageForm.modelId ? 'Update' : 'Create'} Model Page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 