'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '@/firebase/config'
import { toast } from 'react-hot-toast'

export default function NewService() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [iconFile, setIconFile] = useState(null)
  const [iconPreview, setIconPreview] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    isActive: true,
    features: [''],
    brands: [''],
    faq: [{ question: '', answer: '' }]
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleIconChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIconFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setIconPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleFeatureChange = (index, value) => {
    const updatedFeatures = [...formData.features]
    updatedFeatures[index] = value
    setFormData(prev => ({ ...prev, features: updatedFeatures }))
  }

  const addFeature = () => {
    setFormData(prev => ({ ...prev, features: [...prev.features, ''] }))
  }

  const removeFeature = (index) => {
    const updatedFeatures = formData.features.filter((_, i) => i !== index)
    setFormData(prev => ({ ...prev, features: updatedFeatures }))
  }

  const handleBrandChange = (index, value) => {
    const updatedBrands = [...formData.brands]
    updatedBrands[index] = value
    setFormData(prev => ({ ...prev, brands: updatedBrands }))
  }

  const addBrand = () => {
    setFormData(prev => ({ ...prev, brands: [...prev.brands, ''] }))
  }

  const removeBrand = (index) => {
    const updatedBrands = formData.brands.filter((_, i) => i !== index)
    setFormData(prev => ({ ...prev, brands: updatedBrands }))
  }

  const handleFaqChange = (index, field, value) => {
    const updatedFaq = [...formData.faq]
    updatedFaq[index] = { ...updatedFaq[index], [field]: value }
    setFormData(prev => ({ ...prev, faq: updatedFaq }))
  }

  const addFaq = () => {
    setFormData(prev => ({ 
      ...prev, 
      faq: [...prev.faq, { question: '', answer: '' }] 
    }))
  }

  const removeFaq = (index) => {
    const updatedFaq = formData.faq.filter((_, i) => i !== index)
    setFormData(prev => ({ ...prev, faq: updatedFaq }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate form
      if (!formData.name || !formData.description || !formData.category) {
        toast.error('Please fill all required fields')
        setLoading(false)
        return
      }

      // Prepare data
      const serviceData = {
        ...formData,
        minPrice: formData.minPrice ? parseFloat(formData.minPrice) : null,
        maxPrice: formData.maxPrice ? parseFloat(formData.maxPrice) : null,
        features: formData.features.filter(feature => feature.trim() !== ''),
        brands: formData.brands.filter(brand => brand.trim() !== ''),
        faq: formData.faq.filter(item => item.question.trim() !== '' && item.answer.trim() !== ''),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      // Upload icon if provided
      if (iconFile) {
        const iconRef = ref(storage, `services/${Date.now()}_${iconFile.name}`)
        await uploadBytes(iconRef, iconFile)
        const iconUrl = await getDownloadURL(iconRef)
        serviceData.icon = iconUrl
      }

      // Add service to Firestore
      const docRef = await addDoc(collection(db, 'services'), serviceData)
      
      toast.success('Service created successfully!')
      router.push('/admin/services')
    } catch (error) {
      console.error('Error creating service:', error)
      toast.error('Failed to create service')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Add New Service</h2>
        <button
          onClick={() => router.push('/admin/services')}
          className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#1a1a1a] rounded-lg shadow-md p-6 space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white border-b border-[#333] pb-2">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                Service Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
                required
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
                required
              >
                <option value="">Select Category</option>
                <option value="AC Repair">AC Repair</option>
                <option value="TV Repair">TV Repair</option>
                <option value="Refrigerator Repair">Refrigerator Repair</option>
                <option value="Washing Machine Repair">Washing Machine Repair</option>
                <option value="Mobile Repair">Mobile Repair</option>
                <option value="Laptop Repair">Laptop Repair</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="minPrice" className="block text-sm font-medium text-gray-300 mb-1">
                Minimum Price (₹)
              </label>
              <input
                type="number"
                id="minPrice"
                name="minPrice"
                value={formData.minPrice}
                onChange={handleChange}
                min="0"
                step="1"
                className="w-full px-3 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
              />
            </div>
            
            <div>
              <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-300 mb-1">
                Maximum Price (₹)
              </label>
              <input
                type="number"
                id="maxPrice"
                name="maxPrice"
                value={formData.maxPrice}
                onChange={handleChange}
                min="0"
                step="1"
                className="w-full px-3 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
              />
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-[#e60012] focus:ring-[#e60012] border-[#333] rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-300">
              Active (visible to customers)
            </label>
          </div>
        </div>
        
        {/* Service Icon */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white border-b border-[#333] pb-2">Service Icon</h3>
          
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              {iconPreview ? (
                <div className="h-24 w-24 bg-[#333] rounded-md flex items-center justify-center overflow-hidden">
                  <img 
                    src={iconPreview} 
                    alt="Icon Preview" 
                    className="h-16 w-16 object-contain"
                  />
                </div>
              ) : (
                <div className="h-24 w-24 bg-[#333] rounded-md flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            
            <div className="flex-grow">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Upload Icon
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleIconChange}
                className="block w-full text-sm text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-[#333] file:text-white
                  hover:file:bg-[#444]
                "
              />
              <p className="mt-1 text-xs text-gray-400">
                Recommended size: 64x64px. PNG or SVG format.
              </p>
            </div>
          </div>
        </div>
        
        {/* Features */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white border-b border-[#333] pb-2">Features</h3>
          
          {formData.features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={feature}
                onChange={(e) => handleFeatureChange(index, e.target.value)}
                placeholder="Enter feature"
                className="flex-grow px-3 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
              />
              <button
                type="button"
                onClick={() => removeFeature(index)}
                className="p-2 text-gray-400 hover:text-red-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addFeature}
            className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#333] hover:bg-[#444] focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Feature
          </button>
        </div>
        
        {/* Brands */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white border-b border-[#333] pb-2">Supported Brands</h3>
          
          {formData.brands.map((brand, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={brand}
                onChange={(e) => handleBrandChange(index, e.target.value)}
                placeholder="Enter brand name"
                className="flex-grow px-3 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
              />
              <button
                type="button"
                onClick={() => removeBrand(index)}
                className="p-2 text-gray-400 hover:text-red-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addBrand}
            className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#333] hover:bg-[#444] focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Brand
          </button>
        </div>
        
        {/* FAQ */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white border-b border-[#333] pb-2">FAQ</h3>
          
          {formData.faq.map((item, index) => (
            <div key={index} className="space-y-3 p-4 bg-[#222] rounded-md">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-white">FAQ Item #{index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeFaq(index)}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              
              <div>
                <label htmlFor={`faq-question-${index}`} className="block text-sm font-medium text-gray-300 mb-1">
                  Question
                </label>
                <input
                  type="text"
                  id={`faq-question-${index}`}
                  value={item.question}
                  onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
                />
              </div>
              
              <div>
                <label htmlFor={`faq-answer-${index}`} className="block text-sm font-medium text-gray-300 mb-1">
                  Answer
                </label>
                <textarea
                  id={`faq-answer-${index}`}
                  value={item.answer}
                  onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
                />
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addFaq}
            className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#333] hover:bg-[#444] focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add FAQ Item
          </button>
        </div>
        
        {/* Submit Button */}
        <div className="pt-4 border-t border-[#333] flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-[#e60012] hover:bg-[#d40010] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e60012] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              'Create Service'
            )}
          </button>
        </div>
      </form>
    </div>
  )
} 