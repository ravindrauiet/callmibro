'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { db } from '@/firebase/config'
import { collection, doc, getDoc, getDocs, query, where, orderBy } from 'firebase/firestore'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ShareUrlButton from '@/components/ShareUrlButton'
import ShareQrCodeButton from '@/components/ShareQrCodeButton'
import ShareWhatsAppUrlButton from '@/components/ShareWhatsAppUrlButton'
import ShareWhatsAppListButton from '@/components/ShareWhatsAppListButton'
import SharePdfButton from '@/components/SharePdfButton'

export default function ShopInventorySharePage({ params }) {
  const shopId = params.id
  const { isDarkMode } = useTheme()
  
  // Add print styles
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @media print {
        .no-print { display: none !important; }
        .print-break { page-break-before: always; }
        .inventory-grid { 
          display: grid !important;
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 1rem !important;
        }
        .inventory-card {
          break-inside: avoid;
          page-break-inside: avoid;
        }
        body { 
          background: white !important;
          color: black !important;
        }
        * { 
          box-shadow: none !important;
          text-shadow: none !important;
        }
      }
    `
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])
  
  const [shopData, setShopData] = useState(null)
  const [inventory, setInventory] = useState([])
  const [filteredInventory, setFilteredInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [brandFilter, setBrandFilter] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [selectedItems, setSelectedItems] = useState([])
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  
  // Define share URL - include selected items if any
  const shareUrl = typeof window !== 'undefined' 
    ? selectedItems.length > 0 
      ? `${window.location.origin}/shop-inventory/${shopId}/share?items=${selectedItems.join(',')}`
      : `${window.location.origin}/shop-inventory/${shopId}/share`
    : ''
  
  // Get selected items from URL parameters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const itemsParam = urlParams.get('items')
      if (itemsParam) {
        const itemIds = itemsParam.split(',').filter(id => id.trim() !== '')
        setSelectedItems(itemIds)
      }
    }
  }, [])
  
  // Fetch shop data and inventory
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch shop data
        const shopDoc = await getDoc(doc(db, 'shopOwners', shopId))
        if (shopDoc.exists()) {
          const shop = { id: shopDoc.id, ...shopDoc.data() }
          setShopData(shop)
          
          // Only show inventory if shop is approved
          if (shop.status === 'approved') {
            // Fetch inventory items
            const inventoryQuery = query(
              collection(db, 'shopOwners', shopId, 'inventory'),
              where('quantity', '>', 0), // Only show items in stock
              orderBy('quantity', 'desc')
            )
            const inventorySnapshot = await getDocs(inventoryQuery)
            const inventoryItems = inventorySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }))
            
            setInventory(inventoryItems)
            setFilteredInventory(inventoryItems)
          }
        }
      } catch (error) {
        console.error('Error fetching shop data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [shopId])
  
  // Filter and sort inventory
  useEffect(() => {
    let filtered = [...inventory]
    
    // If selected items are specified in URL, only show those items
    if (selectedItems.length > 0) {
      filtered = filtered.filter(item => selectedItems.includes(item.id))
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.brand || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.model || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.category || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter(item => item.category === categoryFilter)
    }
    
    // Apply brand filter
    if (brandFilter) {
      filtered = filtered.filter(item => item.brand === brandFilter)
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]
      
      if (sortBy === 'price' || sortBy === 'quantity') {
        aValue = parseFloat(aValue) || 0
        bValue = parseFloat(bValue) || 0
      } else {
        aValue = String(aValue || '').toLowerCase()
        bValue = String(bValue || '').toLowerCase()
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
    
    setFilteredInventory(filtered)
  }, [inventory, searchTerm, categoryFilter, brandFilter, sortBy, sortOrder, selectedItems])
  
  // Get unique categories and brands for filters
  const categories = [...new Set(inventory.map(item => item.category).filter(Boolean))]
  const brands = [...new Set(inventory.map(item => item.brand).filter(Boolean))]
  
  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: isDarkMode ? 'var(--bg-dark)' : 'var(--bg-light)' }}>
        <Header />
        <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--accent-red)' }}></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }
  
  if (!shopData) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: isDarkMode ? 'var(--bg-dark)' : 'var(--bg-light)' }}>
        <Header />
        <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-main)' }}>
                Shop Not Found
              </h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                The shop you're looking for doesn't exist or has been removed.
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }
  
  if (shopData.status !== 'approved') {
    return (
      <div className="min-h-screen" style={{ backgroundColor: isDarkMode ? 'var(--bg-dark)' : 'var(--bg-light)' }}>
        <Header />
        <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-main)' }}>
                {shopData.shopName}
              </h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                This shop's inventory is not available for viewing at the moment.
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }
  
  return (
    <div className="min-h-screen" style={{ backgroundColor: isDarkMode ? 'var(--bg-dark)' : 'var(--bg-light)' }}>
      <div className="no-print">
        <Header />
      </div>
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-main)' }}>
                {shopData.shopName}
              </h1>
              {/* Enhanced Share Options */}
              <div className="no-print mb-4">
                {/* Mobile: Horizontally scrollable */}
                <div className="md:hidden overflow-x-auto pb-4">
                  <div className="flex space-x-3 min-w-max px-4">
                    <ShareUrlButton url={shareUrl} buttonText="Copy Link" className="whitespace-nowrap" />
                    <ShareQrCodeButton url={shareUrl} buttonText="QR Code" className="whitespace-nowrap" />
                    <ShareWhatsAppUrlButton url={shareUrl} shopName={shopData.shopName} buttonText="WhatsApp URL" className="whitespace-nowrap" />
                    <ShareWhatsAppListButton shopName={shopData.shopName} contactNumber={shopData.contactNumber} inventory={filteredInventory} buttonText="WhatsApp List" className="whitespace-nowrap" />
                    <SharePdfButton shopName={shopData.shopName} contactNumber={shopData.contactNumber} inventory={filteredInventory} buttonText="PDF" className="whitespace-nowrap" />
                  </div>
                </div>
                
                {/* Desktop: Horizontal layout */}
                <div className="hidden md:flex flex-wrap justify-center gap-3">
                  <ShareUrlButton url={shareUrl} />
                  <ShareQrCodeButton url={shareUrl} />
                  <ShareWhatsAppUrlButton url={shareUrl} shopName={shopData.shopName} />
                  <ShareWhatsAppListButton shopName={shopData.shopName} contactNumber={shopData.contactNumber} inventory={filteredInventory} />
                  <SharePdfButton shopName={shopData.shopName} contactNumber={shopData.contactNumber} inventory={filteredInventory} />
                </div>
              </div>
              <p className="text-lg mb-4" style={{ color: 'var(--text-secondary)' }}>
                {selectedItems.length > 0 ? `Selected Items (${selectedItems.length})` : 'Available Inventory'}
              </p>
              {selectedItems.length > 0 && (
                <div className="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  {/* <p className="text-sm text-center mb-2" style={{ color: 'var(--text-main)' }}>
                    📋 Showing only selected items from the shared link
                  </p> */}
                  {/* <div className="text-center">
                    <a 
                      href={`/shop-inventory/${shopId}/share`}
                      className="inline-flex items-center px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                      View All Items
                    </a>
                  </div> */}
                </div>
              )}
              {shopData.address && (
                <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                  📍 {shopData.address}
                </p>
              )}
              {shopData.contactNumber && (
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                  📞 {shopData.contactNumber}
                </p>
              )}
            </div>
          </div>
          
          {/* Filters */}
          <div className="no-print mb-6 p-4 rounded-lg shadow-md" style={{ backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)' }}>
            {/* Mobile: Simplified search and filter button */}
            <div className="md:hidden space-y-3">
              {/* Search Bar */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Search Products</label>
                <input
                  type="text"
                  placeholder="Search by name, brand, model..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                  style={{ 
                    backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                    color: 'var(--text-main)',
                    borderColor: 'var(--border-color)'
                  }}
                />
              </div>
              
              {/* Filter Button */}
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="w-full flex items-center justify-center px-4 py-2 border rounded-md transition-colors"
                style={{ 
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-main)',
                  backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)',
                  ':hover': {
                    backgroundColor: isDarkMode ? 'var(--panel-charcoal)' : 'var(--panel-gray)'
                  }
                }}
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters & Sort
                <span className="ml-2 text-xs px-2 py-1 rounded-full" style={{ 
                  backgroundColor: isDarkMode ? 'var(--panel-charcoal)' : 'var(--panel-gray)',
                  color: 'var(--text-main)'
                }}>
                  {[categoryFilter, brandFilter, sortBy].filter(Boolean).length}
                </span>
              </button>
              
              {/* Mobile Filter Panel */}
              {showMobileFilters && (
                <div className="space-y-3 p-3 rounded-lg border" style={{ 
                  backgroundColor: isDarkMode ? 'var(--panel-charcoal)' : 'var(--panel-gray)',
                  borderColor: 'var(--border-color)'
                }}>
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Category
                    </label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                      style={{ 
                        backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                        color: 'var(--text-main)',
                        borderColor: 'var(--border-color)'
                      }}
                    >
                      <option value="">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Brand Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Brand
                    </label>
                    <select
                      value={brandFilter}
                      onChange={(e) => setBrandFilter(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                      style={{ 
                        backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                        color: 'var(--text-main)',
                        borderColor: 'var(--border-color)'
                      }}
                    >
                      <option value="">All Brands</option>
                      {brands.map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Sort */}
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Sort By
                    </label>
                    <select
                      value={`${sortBy}-${sortOrder}`}
                      onChange={(e) => {
                        const [field, order] = e.target.value.split('-')
                        setSortBy(field)
                        setSortOrder(order)
                      }}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                      style={{ 
                        backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                        color: 'var(--text-main)',
                        borderColor: 'var(--border-color)'
                      }}
                    >
                      <option value="name-asc">Name (A-Z)</option>
                      <option value="name-desc">Name (Z-A)</option>
                      <option value="price-asc">Price (Low-High)</option>
                      <option value="price-desc">Price (High-Low)</option>
                      <option value="brand-asc">Brand (A-Z)</option>
                      <option value="category-asc">Category (A-Z)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
            
            {/* Desktop: Full filter grid */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Search Products
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, brand, model..."
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                  style={{ 
                    backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                    color: 'var(--text-main)',
                    borderColor: 'var(--border-color)'
                  }}
                />
              </div>
              
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                  style={{ 
                    backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                    color: 'var(--text-main)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              {/* Brand Filter */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Brand
                </label>
                <select
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                  style={{ 
                    backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                    color: 'var(--text-main)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  <option value="">All Brands</option>
                  {brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
              
              {/* Sort */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Sort By
                </label>
                                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('-')
                      setSortBy(field)
                      setSortOrder(order)
                    }}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                  style={{ 
                    backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                    color: 'var(--text-main)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="price-asc">Price (Low-High)</option>
                  <option value="price-desc">Price (High-Low)</option>
                  <option value="brand-asc">Brand (A-Z)</option>
                  <option value="category-asc">Category (A-Z)</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Results Count and Actions */}
          <div className="no-print mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {selectedItems.length > 0 
                ? `Showing ${filteredInventory.length} selected items`
                : `Showing ${filteredInventory.length} of ${inventory.length} available items`
              }
            </p>
            <button
              onClick={() => window.print()}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Inventory List
            </button>
          </div>
          
          {/* Inventory Grid */}
          {filteredInventory.length > 0 ? (
            <div className="inventory-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredInventory.map((item) => (
                <div
                  key={item.id}
                  className="inventory-card rounded-lg shadow-md overflow-hidden transition-transform duration-200 hover:scale-105"
                  style={{ backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)' }}
                >
                  <div className="p-4">
                    <div className="mb-3">
                      <h3 className="font-semibold text-lg mb-1" style={{ color: 'var(--text-main)' }}>
                        {item.name}
                      </h3>
                      <div className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <p><span className="font-medium">Category:</span> {item.category}</p>
                        <p><span className="font-medium">Brand:</span> {item.brand}</p>
                        {item.model && <p><span className="font-medium">Model:</span> {item.model}</p>}
                        <p><span className="font-medium">Available:</span> {item.quantity} units</p>
                      </div>
                    </div>
                    
                    <div className="border-t pt-3" style={{ borderColor: 'var(--border-color)' }}>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold" style={{ color: 'var(--accent-red)' }}>
                          ₹{item.price}
                        </span>
                        <span className="text-sm px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          In Stock
                        </span>
                      </div>
                    </div>
                    
                    {item.description && (
                      <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {item.description.length > 100 
                            ? `${item.description.substring(0, 100)}...` 
                            : item.description
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--text-secondary)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-main)' }}>
                No items found
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                {inventory.length === 0 
                  ? 'This shop currently has no inventory available.' 
                  : 'No items match your search criteria. Try adjusting your filters.'
                }
              </p>
            </div>
          )}
          
          {/* Contact Information */}
          <div className="no-print mt-12 p-6 rounded-lg shadow-md text-center" style={{ backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-main)' }}>
              Interested in any of these items?
            </h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {shopData.contactNumber && (
                <a
                  href={`tel:${shopData.contactNumber}`}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call {shopData.contactNumber}
                </a>
              )}
              {shopData.email && (
                <a
                  href={`mailto:${shopData.email}`}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email {shopData.shopName}
                </a>
              )}
            </div>
          </div>
        </div>
      </main>
      <div className="no-print">
        <Footer />
      </div>
    </div>
  )
} 