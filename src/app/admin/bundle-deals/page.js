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
        <h2 className="text-2xl font-bold text-white">Bundle Deals Management</h2>
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
                    includedItems: "Premium screen protector, Shockproof case, Extended warranty (1 year), Free installation",
                    terms: "Valid for all device types. Warranty covers manufacturing defects only. Installation available at service centers."
                  },
                  {
                    title: "Complete Repair Bundle",
                    description: "Professional repair service including screen replacement, battery replacement, and comprehensive diagnostic",
                    imageURL: "/bundle-deals.jpg",
                    discount: "15% OFF",
                    url: "/deals/repair-bundle",
                    featured: false,
                    isActive: true,
                    originalPrice: 4999,
                    discountedPrice: 4249,
                    validUntil: "2024-11-30",
                    includedItems: "Screen replacement, Battery replacement, Diagnostic service, 90-day warranty, Free pickup & delivery",
                    terms: "Valid for smartphones and tablets. Original parts used. Service available in select cities."
                  },
                  {
                    title: "Gaming Device Care Package",
                    description: "Specialized care package for gaming devices with cooling solutions and performance optimization",
                    imageURL: "/product-deals.jpg",
                    discount: "25% OFF",
                    url: "/deals/gaming-care",
                    featured: true,
                    isActive: true,
                    originalPrice: 3999,
                    discountedPrice: 2999,
                    validUntil: "2024-10-31",
                    includedItems: "Cooling pad, Performance optimization, Thermal paste replacement, Gaming accessories, 6-month warranty",
                    terms: "Valid for gaming laptops and desktops. Professional installation required. Limited to specific models."
                  }
                ];
                
                for (const bundle of sampleBundles) {
                  await addDoc(collection(db, 'bundleDeals'), {
                    ...bundle,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                  });
                }
                
                toast.success('Sample bundle deals added successfully!');
                // Refresh the page to show new data
                window.location.reload();
              } catch (error) {
                console.error('Error adding sample bundles:', error);
                toast.error('Failed to add sample bundles');
              }
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-[#222] hover:bg-[#333] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e60012]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Sample Data
          </button>
          <button
            onClick={() => openBundleModal()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#e60012] hover:bg-[#d40010] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e60012]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Bundle Deal
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
          className="w-full px-4 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Bundle Deals Table */}
      <div className="bg-[#1a1a1a] rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#333]">
            <thead className="bg-[#222]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Price
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
              {filteredBundleDeals.length > 0 ? (
                filteredBundleDeals.map((bundle) => (
                  <tr key={bundle.id} className="hover:bg-[#222] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {bundle.imageURL ? (
                        <div className="h-12 w-12 bg-[#222] rounded-md flex items-center justify-center overflow-hidden">
                          <img 
                            src={bundle.imageURL} 
                            alt={bundle.title} 
                            className="h-10 w-10 object-cover rounded"
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
                      <div className="text-sm font-medium text-white">{bundle.title}</div>
                      {bundle.featured && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300 max-w-xs truncate">{bundle.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {bundle.discount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {bundle.originalPrice > 0 && (
                        <div>
                          <span className="line-through text-gray-500">₹{bundle.originalPrice.toFixed(2)}</span>
                          <br />
                          <span className="text-[#e60012] font-bold">₹{bundle.discountedPrice.toFixed(2)}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        bundle.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {bundle.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => openBundleModal(bundle)}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBundle(bundle)
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
                    {searchTerm 
                      ? 'No bundle deals found matching your search criteria' 
                      : 'No bundle deals found. Add your first bundle deal!'
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bundle Deal Modal */}
      {showBundleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-medium text-white mb-4">
              {selectedBundle ? 'Edit Bundle Deal' : 'Add New Bundle Deal'}
            </h3>
            
            <form onSubmit={handleBundleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={bundleForm.title}
                    onChange={(e) => setBundleForm({...bundleForm, title: e.target.value})}
                    className="w-full px-3 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    value={bundleForm.description}
                    onChange={(e) => setBundleForm({...bundleForm, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="discount" className="block text-sm font-medium text-gray-300 mb-1">
                    Discount
                  </label>
                  <input
                    type="text"
                    id="discount"
                    value={bundleForm.discount}
                    onChange={(e) => setBundleForm({...bundleForm, discount: e.target.value})}
                    className="w-full px-3 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
                    placeholder="e.g. 20% OFF"
                  />
                </div>
                
                <div>
                  <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-1">
                    URL
                  </label>
                  <input
                    type="text"
                    id="url"
                    value={bundleForm.url}
                    onChange={(e) => setBundleForm({...bundleForm, url: e.target.value})}
                    className="w-full px-3 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
                    placeholder="/deals/protection-pack"
                  />
                </div>
                
                <div>
                  <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-300 mb-1">
                    Original Price (₹)
                  </label>
                  <input
                    type="number"
                    id="originalPrice"
                    value={bundleForm.originalPrice}
                    onChange={(e) => setBundleForm({...bundleForm, originalPrice: e.target.value})}
                    className="w-full px-3 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label htmlFor="discountedPrice" className="block text-sm font-medium text-gray-300 mb-1">
                    Discounted Price (₹)
                  </label>
                  <input
                    type="number"
                    id="discountedPrice"
                    value={bundleForm.discountedPrice}
                    onChange={(e) => setBundleForm({...bundleForm, discountedPrice: e.target.value})}
                    className="w-full px-3 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="imageURL" className="block text-sm font-medium text-gray-300 mb-1">
                    Image URL
                  </label>
                  <input
                    type="text"
                    id="imageURL"
                    value={bundleForm.imageURL}
                    onChange={(e) => setBundleForm({...bundleForm, imageURL: e.target.value})}
                    className="w-full px-3 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
                    placeholder="https://example.com/image.jpg"
                  />
                  {bundleForm.imageURL && (
                    <div className="mt-2 flex items-center">
                      <div className="h-16 w-16 bg-[#222] rounded-md flex items-center justify-center overflow-hidden">
                        <img 
                          src={bundleForm.imageURL} 
                          alt="Preview" 
                          className="h-14 w-14 object-cover rounded"
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
                
                <div>
                  <label htmlFor="validUntil" className="block text-sm font-medium text-gray-300 mb-1">
                    Valid Until
                  </label>
                  <input
                    type="date"
                    id="validUntil"
                    value={bundleForm.validUntil}
                    onChange={(e) => setBundleForm({...bundleForm, validUntil: e.target.value})}
                    className="w-full px-3 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="includedItems" className="block text-sm font-medium text-gray-300 mb-1">
                    Included Items
                  </label>
                  <textarea
                    id="includedItems"
                    value={bundleForm.includedItems}
                    onChange={(e) => setBundleForm({...bundleForm, includedItems: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
                    placeholder="e.g. Screen protector, case, extended warranty"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="terms" className="block text-sm font-medium text-gray-300 mb-1">
                    Terms & Conditions
                  </label>
                  <textarea
                    id="terms"
                    value={bundleForm.terms}
                    onChange={(e) => setBundleForm({...bundleForm, terms: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
                    placeholder="Terms and conditions for this bundle deal"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={bundleForm.isActive}
                    onChange={(e) => setBundleForm({...bundleForm, isActive: e.target.checked})}
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
                    checked={bundleForm.featured}
                    onChange={(e) => setBundleForm({...bundleForm, featured: e.target.checked})}
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
                  onClick={() => setShowBundleModal(false)}
                  className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#e60012] rounded-md text-white hover:bg-[#d40010] focus:outline-none"
                >
                  {selectedBundle ? 'Update Bundle Deal' : 'Add Bundle Deal'}
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
              Are you sure you want to delete the bundle deal "{selectedBundle?.title}"? This action cannot be undone.
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