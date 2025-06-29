'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { toast } from 'react-hot-toast'

export default function BundleDealsManagement() {
  const [bundleDeals, setBundleDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showBundleModal, setShowBundleModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedBundle, setSelectedBundle] = useState(null)
  
  // Form state
  const [bundleForm, setBundleForm] = useState({
    title: '',
    description: '',
    imageURL: '',
    discount: '',
    url: '',
    featured: false,
    isActive: true,
    originalPrice: '',
    discountedPrice: '',
    validUntil: '',
    includedItems: '',
    terms: ''
  })

  // Fetch bundle deals
  useEffect(() => {
    const fetchBundleDeals = async () => {
      try {
        const bundleDealsSnapshot = await getDocs(
          query(collection(db, 'bundleDeals'), orderBy('createdAt', 'desc'))
        )
        
        const bundleDealsData = bundleDealsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          originalPrice: doc.data().originalPrice ? parseFloat(doc.data().originalPrice) : 0,
          discountedPrice: doc.data().discountedPrice ? parseFloat(doc.data().discountedPrice) : 0
        }))
        
        setBundleDeals(bundleDealsData)
      } catch (error) {
        console.error('Error fetching bundle deals:', error)
        toast.error('Failed to load bundle deals')
      } finally {
        setLoading(false)
      }
    }

    fetchBundleDeals()
  }, [])

  // Filter bundle deals based on search term
  const filteredBundleDeals = bundleDeals.filter(bundle => {
    const matchesSearch = 
      bundle.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bundle.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bundle.discount?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  // Open bundle modal for add/edit
  const openBundleModal = (bundle = null) => {
    if (bundle) {
      setBundleForm({
        title: bundle.title || '',
        description: bundle.description || '',
        imageURL: bundle.imageURL || '',
        discount: bundle.discount || '',
        url: bundle.url || '',
        featured: bundle.featured || false,
        isActive: bundle.isActive !== false,
        originalPrice: bundle.originalPrice ? bundle.originalPrice.toString() : '',
        discountedPrice: bundle.discountedPrice ? bundle.discountedPrice.toString() : '',
        validUntil: bundle.validUntil || '',
        includedItems: bundle.includedItems || '',
        terms: bundle.terms || ''
      })
      setSelectedBundle(bundle)
    } else {
      setBundleForm({
        title: '',
        description: '',
        imageURL: '',
        discount: '',
        url: '',
        featured: false,
        isActive: true,
        originalPrice: '',
        discountedPrice: '',
        validUntil: '',
        includedItems: '',
        terms: ''
      })
      setSelectedBundle(null)
    }
    setShowBundleModal(true)
  }

  // Handle bundle form submit
  const handleBundleSubmit = async (e) => {
    e.preventDefault()
    
    if (!bundleForm.title || !bundleForm.description) {
      toast.error('Title and description are required')
      return
    }
    
    try {
      const bundleData = {
        ...bundleForm,
        originalPrice: parseFloat(bundleForm.originalPrice) || 0,
        discountedPrice: parseFloat(bundleForm.discountedPrice) || 0,
        updatedAt: serverTimestamp()
      }
      
      if (selectedBundle) {
        // Update existing bundle
        await updateDoc(doc(db, 'bundleDeals', selectedBundle.id), bundleData)
        
        // Update bundle in state
        setBundleDeals(prev => prev.map(bundle => 
          bundle.id === selectedBundle.id 
            ? { ...bundle, ...bundleData, updatedAt: new Date() } 
            : bundle
        ))
        
        toast.success('Bundle deal updated successfully')
      } else {
        // Add new bundle
        const docRef = await addDoc(collection(db, 'bundleDeals'), {
          ...bundleData,
          createdAt: serverTimestamp()
        })
        
        // Add new bundle to state
        setBundleDeals(prev => [{
          id: docRef.id,
          ...bundleData,
          createdAt: new Date(),
          updatedAt: new Date()
        }, ...prev])
        
        toast.success('Bundle deal added successfully')
      }
      
      setShowBundleModal(false)
    } catch (error) {
      console.error('Error saving bundle deal:', error)
      toast.error('Failed to save bundle deal')
    }
  }

  // Delete bundle deal
  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, 'bundleDeals', selectedBundle.id))
      
      // Remove bundle from state
      setBundleDeals(prev => prev.filter(bundle => bundle.id !== selectedBundle.id))
      
      toast.success('Bundle deal deleted successfully')
      setShowDeleteModal(false)
    } catch (error) {
      console.error('Error deleting bundle deal:', error)
      toast.error('Failed to delete bundle deal')
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
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>Bundle Deals Management</h2>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              try {
                const sampleBundles = [
                  {
                    title: "Device Protection Pack",
                    description: "Complete protection for your device with premium screen protector, durable case, and extended warranty coverage",
                    imageURL: "/product-deals.jpg",
                    discount: "20% OFF",
                    url: "/deals/protection-pack",
                    featured: true,
                    isActive: true,
                    originalPrice: 2999,
                    discountedPrice: 2399,
                    validUntil: "2024-12-31",
                    includedItems: "Screen Protector, Protective Case, Extended Warranty",
                    terms: "Valid for 1 year from purchase date"
                  },
                  {
                    title: "Home Appliance Service Bundle",
                    description: "Get comprehensive service for all your home appliances with priority support and discounted rates",
                    imageURL: "/bundle-deals.jpg",
                    discount: "30% OFF",
                    url: "/deals/appliance-service",
                    featured: false,
                    isActive: true,
                    originalPrice: 5000,
                    discountedPrice: 3500,
                    validUntil: "2024-12-31",
                    includedItems: "AC Service, Refrigerator Service, Washing Machine Service",
                    terms: "Valid for 6 months, one-time use per customer"
                  }
                ]
                
                for (const bundle of sampleBundles) {
                  await addDoc(collection(db, 'bundleDeals'), {
                    ...bundle,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                  })
                }
                
                toast.success('Sample bundle deals added successfully')
                window.location.reload()
              } catch (error) {
                console.error('Error adding sample bundles:', error)
                toast.error('Failed to add sample bundles')
              }
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e60012]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Sample Data
          </button>
          <button
            onClick={() => openBundleModal()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#e60012] hover:bg-[#d40010] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e60012]"
            style={{ '--tw-ring-offset-color': 'var(--panel-charcoal)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Bundle
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search bundle deals..."
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

      {/* Bundle Deals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBundleDeals.length > 0 ? (
          filteredBundleDeals.map((bundle) => (
            <div key={bundle.id} className="rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: 'var(--panel-charcoal)' }}>
              <div className="relative">
                <img 
                  src={bundle.imageURL || '/bundle-deals.jpg'} 
                  alt={bundle.title}
                  className="w-full h-48 object-cover"
                />
                {bundle.featured && (
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 text-xs font-semibold bg-yellow-400 text-yellow-900 rounded-full">
                      Featured
                    </span>
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-1 text-xs font-semibold bg-red-500 text-white rounded-full">
                    {bundle.discount}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-main)' }}>{bundle.title}</h3>
                <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{bundle.description}</p>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {bundle.originalPrice > 0 && (
                      <span className="text-sm line-through" style={{ color: 'var(--text-secondary)' }}>
                        ₹{bundle.originalPrice}
                      </span>
                    )}
                    {bundle.discountedPrice > 0 && (
                      <span className="text-lg font-bold text-[#e60012]">
                        ₹{bundle.discountedPrice}
                      </span>
                    )}
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    bundle.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {bundle.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={() => openBundleModal(bundle)}
                    className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedBundle(bundle)
                      setShowDeleteModal(true)
                    }}
                    className="flex-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {searchTerm ? 'No bundle deals found matching your search' : 'No bundle deals found'}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Bundle Modal */}
      {showBundleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {selectedBundle ? 'Edit Bundle Deal' : 'Add New Bundle Deal'}
            </h3>
            <form onSubmit={handleBundleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={bundleForm.title}
                    onChange={(e) => setBundleForm({ ...bundleForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount
                  </label>
                  <input
                    type="text"
                    value={bundleForm.discount}
                    onChange={(e) => setBundleForm({ ...bundleForm, discount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                    placeholder="e.g. 20% OFF"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Original Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={bundleForm.originalPrice}
                    onChange={(e) => setBundleForm({ ...bundleForm, originalPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discounted Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={bundleForm.discountedPrice}
                    onChange={(e) => setBundleForm({ ...bundleForm, discountedPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={bundleForm.imageURL}
                    onChange={(e) => setBundleForm({ ...bundleForm, imageURL: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL
                  </label>
                  <input
                    type="url"
                    value={bundleForm.url}
                    onChange={(e) => setBundleForm({ ...bundleForm, url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valid Until
                  </label>
                  <input
                    type="date"
                    value={bundleForm.validUntil}
                    onChange={(e) => setBundleForm({ ...bundleForm, validUntil: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={bundleForm.description}
                  onChange={(e) => setBundleForm({ ...bundleForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Included Items
                </label>
                <textarea
                  value={bundleForm.includedItems}
                  onChange={(e) => setBundleForm({ ...bundleForm, includedItems: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                  placeholder="List of items included in the bundle..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Terms & Conditions
                </label>
                <textarea
                  value={bundleForm.terms}
                  onChange={(e) => setBundleForm({ ...bundleForm, terms: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                  placeholder="Terms and conditions for the bundle deal..."
                />
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={bundleForm.isActive}
                    onChange={(e) => setBundleForm({ ...bundleForm, isActive: e.target.checked })}
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
                    checked={bundleForm.featured}
                    onChange={(e) => setBundleForm({ ...bundleForm, featured: e.target.checked })}
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
                  onClick={() => setShowBundleModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#e60012] rounded-md hover:bg-[#d40010]"
                >
                  {selectedBundle ? 'Update' : 'Add'} Bundle Deal
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
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Bundle Deal</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete "{selectedBundle?.title}"? This action cannot be undone.
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