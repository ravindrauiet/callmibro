'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { collection, query, where, getDocs, limit, doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const { isDarkMode } = useTheme()
  const { currentUser } = useAuth()
  const searchRef = useRef(null)
  const resultsRef = useRef(null)

  // Search categories
  const searchCategories = [
    { name: 'Services', icon: '🔧', color: 'bg-blue-500' },
    { name: 'Spare Parts', icon: '📱', color: 'bg-green-500' },
    { name: 'Shops', icon: '🏪', color: 'bg-purple-500' },
    { name: 'My Inventory', icon: '📦', color: 'bg-orange-500' },
    { name: 'Brand Pages', icon: '🏷️', color: 'bg-indigo-500' },
    { name: 'Articles', icon: '📄', color: 'bg-teal-500' }
  ]

  // Static search data for demo
  const staticSearchData = {
    services: [
      { id: '1', name: 'iPhone Screen Repair', category: 'Services', type: 'service', url: '/services/iphone-screen-repair' },
      { id: '2', name: 'Laptop Battery Replacement', category: 'Services', type: 'service', url: '/services/laptop-battery-replacement' },
      { id: '3', name: 'TV Remote Repair', category: 'Services', type: 'service', url: '/services/tv-remote-repair' },
      { id: '4', name: 'AC Service', category: 'Services', type: 'service', url: '/services/ac-service' },
      { id: '5', name: 'Refrigerator Repair', category: 'Services', type: 'service', url: '/services/refrigerator-repair' }
    ],
    spareParts: [
      { id: '1', name: 'Phone Battery', category: 'Spare Parts', type: 'part', url: '/spare-parts/1' },
      { id: '2', name: 'Laptop Charger', category: 'Spare Parts', type: 'part', url: '/spare-parts/2' },
      { id: '3', name: 'TV Remote', category: 'Spare Parts', type: 'part', url: '/spare-parts/3' },
      { id: '4', name: 'AC Fitter', category: 'Spare Parts', type: 'part', url: '/spare-parts/4' },
      { id: '5', name: 'Refrigerator Shelf', category: 'Spare Parts', type: 'part', url: '/spare-parts/5' }
    ],
    shops: [
      { id: '1', name: 'TechFix Pro', category: 'Shops', type: 'shop', url: '/shops/1' },
      { id: '2', name: 'Mobile Care Center', category: 'Shops', type: 'shop', url: '/shops/2' },
      { id: '3', name: 'Electronics Hub', category: 'Shops', type: 'shop', url: '/shops/3' },
      { id: '4', name: 'Smart Device Repair', category: 'Shops', type: 'shop', url: '/shops/4' }
    ]
  }

  // Search function
  const performSearch = async (term) => {
    if (!term.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    
    try {
      // Search in static data first (for demo)
      const allData = [
        ...staticSearchData.services,
        ...staticSearchData.spareParts,
        ...staticSearchData.shops
      ]

      const filtered = allData.filter(item =>
        item.name.toLowerCase().includes(term.toLowerCase()) ||
        item.category.toLowerCase().includes(term.toLowerCase())
      )

      // Also search in Firebase collections
      const firebaseResults = []
      
      // Search spare parts
      try {
        // Fetch all spare parts and filter client-side for better search
        const sparePartsQuery = query(
          collection(db, 'spareParts'),
          limit(50) // Fetch more items for better search coverage
        )
        const sparePartsSnapshot = await getDocs(sparePartsQuery)
        const sparePartsResults = []
        
        sparePartsSnapshot.docs.forEach(doc => {
          const data = doc.data()
          // Check if name, brand, model, description, or category matches search term
          const searchLower = term.toLowerCase()
          const nameMatch = data.name && data.name.toLowerCase().includes(searchLower)
          const brandMatch = data.brand && data.brand.toLowerCase().includes(searchLower)
          const modelMatch = data.model && data.model.toLowerCase().includes(searchLower)
          const descriptionMatch = data.description && data.description.toLowerCase().includes(searchLower)
          const categoryMatch = data.category && data.category.toLowerCase().includes(searchLower)
          const deviceCategoryMatch = data.deviceCategory && data.deviceCategory.toLowerCase().includes(searchLower)
          
          if (nameMatch || brandMatch || modelMatch || descriptionMatch || categoryMatch || deviceCategoryMatch) {
            sparePartsResults.push({
              id: doc.id,
              name: data.name,
              category: data.category || 'Spare Parts',
              type: 'part',
              url: `/spare-parts/${doc.id}`,
              brand: data.brand,
              model: data.model,
              price: data.price,
              discount: data.discount,
              description: data.description
            })
          }
        })
        
        // Sort by relevance (exact matches first, then partial matches)
        sparePartsResults.sort((a, b) => {
          const searchLower = term.toLowerCase()
          const aNameExact = a.name.toLowerCase().startsWith(searchLower)
          const bNameExact = b.name.toLowerCase().startsWith(searchLower)
          
          if (aNameExact && !bNameExact) return -1
          if (!aNameExact && bNameExact) return 1
          return 0
        })
        
        firebaseResults.push(...sparePartsResults.slice(0, 10)) // Limit to top 10 results
      } catch (error) {
        console.log('Error searching spare parts:', error)
      }

      // Search services
      try {
        const servicesQuery = query(
          collection(db, 'services'),
          where('isActive', '==', true),
          limit(20) // Fetch more services for better search
        )
        const servicesSnapshot = await getDocs(servicesQuery)
        const serviceResults = []
        
        servicesSnapshot.docs.forEach(doc => {
          const data = doc.data()
          // Check if service name, category, or description matches search term
          const searchLower = term.toLowerCase()
          const nameMatch = data.name && data.name.toLowerCase().includes(searchLower)
          const categoryMatch = data.category && data.category.toLowerCase().includes(searchLower)
          const descriptionMatch = data.description && data.description.toLowerCase().includes(searchLower)
          
          if (nameMatch || categoryMatch || descriptionMatch) {
            serviceResults.push({
              id: doc.id,
              name: data.name,
              category: data.category || 'Services',
              type: 'service',
              url: `/services/${data.name.toLowerCase().replace(/\s+/g, '-')}`,
              description: data.description,
              minPrice: data.minPrice,
              maxPrice: data.maxPrice
            })
          }
        })
        
        // Sort by relevance
        serviceResults.sort((a, b) => {
          const searchLower = term.toLowerCase()
          const aNameExact = a.name.toLowerCase().startsWith(searchLower)
          const bNameExact = b.name.toLowerCase().startsWith(searchLower)
          
          if (aNameExact && !bNameExact) return -1
          if (!aNameExact && bNameExact) return 1
          return 0
        })
        
        firebaseResults.push(...serviceResults.slice(0, 8)) // Limit to top 8 results
      } catch (error) {
        console.log('Error searching services:', error)
      }

      // Search shops
      try {
        const shopsQuery = query(
          collection(db, 'shopOwners'),
          where('status', '==', 'approved'),
          limit(10)
        )
        const shopsSnapshot = await getDocs(shopsQuery)
        const shopResults = []
        
        shopsSnapshot.docs.forEach(doc => {
          const data = doc.data()
          // Check if shop name, services, or address match search term
          const searchLower = term.toLowerCase()
          const shopNameMatch = data.shopName && data.shopName.toLowerCase().includes(searchLower)
          const servicesMatch = data.services && Array.isArray(data.services) && 
            data.services.some(service => service.toLowerCase().includes(searchLower))
          const addressMatch = data.address && data.address.toLowerCase().includes(searchLower)
          
          if (shopNameMatch || servicesMatch || addressMatch) {
            shopResults.push({
              id: doc.id,
              name: data.shopName,
              category: 'Shops',
              type: 'shop',
              url: `/shops/${doc.id}`,
              contactNumber: data.contactNumber,
              address: data.address,
              services: data.services || []
            })
          }
        })
        
        firebaseResults.push(...shopResults)
      } catch (error) {
        console.log('Error searching shops:', error)
      }

      // Search brand pages
      try {
        const brandsQuery = query(
          collection(db, 'brandPages'),
          limit(20)
        )
        const brandsSnapshot = await getDocs(brandsQuery)
        const brandResults = []
        
        brandsSnapshot.docs.forEach(doc => {
          const data = doc.data()
          // Check if brand name, description, or categories match search term
          const searchLower = term.toLowerCase()
          const brandNameMatch = data.brandName && data.brandName.toLowerCase().includes(searchLower)
          const descriptionMatch = data.overview && data.overview.toLowerCase().includes(searchLower)
          const categoryMatch = data.category && data.category.toLowerCase().includes(searchLower)
          
          if (brandNameMatch || descriptionMatch || categoryMatch) {
            brandResults.push({
              id: doc.id,
              name: data.brandName,
              category: 'Brand Pages',
              type: 'brand',
              url: `/brands/${data.brandName.toLowerCase().replace(/\s+/g, '-')}`,
              description: data.overview,
              categories: data.category ? [data.category] : []
            })
          }
        })
        
        // Sort by relevance
        brandResults.sort((a, b) => {
          const searchLower = term.toLowerCase()
          const aNameExact = a.name.toLowerCase().startsWith(searchLower)
          const bNameExact = b.name.toLowerCase().startsWith(searchLower)
          
          if (aNameExact && !bNameExact) return -1
          if (!aNameExact && bNameExact) return 1
          return 0
        })
        
        firebaseResults.push(...brandResults.slice(0, 15)) // Limit to top 15 brand results
        console.log('Brand search results:', brandResults.length, brandResults)
        
        // Also add category-level results for each brand
        const categoryResults = []
        brandsSnapshot.docs.forEach(doc => {
          const data = doc.data()
          const searchLower = term.toLowerCase()
          
          // Check if category matches search term
          const categoryMatch = data.category && data.category.toLowerCase().includes(searchLower)
          
          if (categoryMatch) {
            categoryResults.push({
              id: `category-${doc.id}`,
              name: `${data.brandName} ${data.category}`,
              category: 'Brand Pages',
              type: 'brand-category',
              url: `/brands/${data.brandName.toLowerCase().replace(/\s+/g, '-')}/${data.category.toLowerCase().replace(/\s+/g, '-')}`,
              description: `${data.brandName} ${data.category} products and services`,
              categories: [data.category]
            })
          }
        })
        
        // Sort category results by relevance
        categoryResults.sort((a, b) => {
          const searchLower = term.toLowerCase()
          const aNameExact = a.name.toLowerCase().startsWith(searchLower)
          const bNameExact = b.name.toLowerCase().startsWith(searchLower)
          
          if (aNameExact && !bNameExact) return -1
          if (!aNameExact && bNameExact) return 1
          return 0
        })
        
        firebaseResults.push(...categoryResults.slice(0, 10)) // Limit to top 10 category results
        console.log('Category search results:', categoryResults.length, categoryResults)
      } catch (error) {
        console.log('Error searching brands:', error)
      }

      // Search articles
      try {
        const articlesQuery = query(
          collection(db, 'modelPages'),
          limit(20)
        )
        const articlesSnapshot = await getDocs(articlesQuery)
        const articleResults = []
        
        articlesSnapshot.docs.forEach(doc => {
          const data = doc.data()
          // Check if model name, overview, or features match search term
          const searchLower = term.toLowerCase()
          const modelNameMatch = data.modelName && data.modelName.toLowerCase().includes(searchLower)
          const overviewMatch = data.overview && data.overview.toLowerCase().includes(searchLower)
          const brandNameMatch = data.brandName && data.brandName.toLowerCase().includes(searchLower)
          const featuresMatch = data.features && Array.isArray(data.features) && 
            data.features.some(feature => feature.toLowerCase().includes(searchLower))
          
          if (modelNameMatch || overviewMatch || brandNameMatch || featuresMatch) {
            articleResults.push({
              id: doc.id,
              name: data.modelName,
              category: 'Articles',
              type: 'article',
              url: `/brands/${data.brandName.toLowerCase().replace(/\s+/g, '-')}/${data.category.toLowerCase().replace(/\s+/g, '-')}/${data.modelName.toLowerCase().replace(/\s+/g, '-')}`,
              description: data.overview,
              tags: data.features || []
            })
          }
        })
        
        // Sort by relevance
        articleResults.sort((a, b) => {
          const searchLower = term.toLowerCase()
          const aNameExact = a.name.toLowerCase().startsWith(searchLower)
          const bNameExact = b.name.toLowerCase().startsWith(searchLower)
          
          if (aNameExact && !bNameExact) return -1
          if (!aNameExact && bNameExact) return 1
          return 0
        })
        
        firebaseResults.push(...articleResults.slice(0, 15)) // Limit to top 15 article results
        console.log('Article search results:', articleResults.length, articleResults)
      } catch (error) {
        console.log('Error searching articles:', error)
      }

      // Search user inventory if user is logged in
      const userInventoryResults = []
      if (currentUser) {
        try {
          // First, check if user is a shop owner
          const shopOwnersQuery = query(
            collection(db, 'shopOwners'),
            where('userId', '==', currentUser.uid)
          )
          const shopOwnersSnapshot = await getDocs(shopOwnersQuery)
          
          if (!shopOwnersSnapshot.empty) {
            const shopOwner = shopOwnersSnapshot.docs[0]
            const shopId = shopOwner.id
            
            // Search in user's inventory - fetch all and filter client-side
            const inventoryQuery = query(
              collection(db, 'shopOwners', shopId, 'inventory'),
              limit(50) // Fetch more items for better search
            )
            const inventorySnapshot = await getDocs(inventoryQuery)
            
            inventorySnapshot.docs.forEach(doc => {
              const item = doc.data()
              // Check multiple fields for better search
              const searchLower = term.toLowerCase()
              const nameMatch = item.name && item.name.toLowerCase().includes(searchLower)
              const brandMatch = item.brand && item.brand.toLowerCase().includes(searchLower)
              const modelMatch = item.model && item.model.toLowerCase().includes(searchLower)
              const categoryMatch = item.category && item.category.toLowerCase().includes(searchLower)
              const descriptionMatch = item.description && item.description.toLowerCase().includes(searchLower)
              const skuMatch = item.sku && item.sku.toLowerCase().includes(searchLower)
              
              if (nameMatch || brandMatch || modelMatch || categoryMatch || descriptionMatch || skuMatch) {
                userInventoryResults.push({
                  id: doc.id,
                  name: item.name,
                  category: item.category || 'My Inventory',
                  type: 'inventory',
                  url: `/shop-inventory/${shopId}`,
                  quantity: item.quantity,
                  price: item.price,
                  brand: item.brand,
                  model: item.model
                })
              }
            })
            
            // Sort by relevance
            userInventoryResults.sort((a, b) => {
              const searchLower = term.toLowerCase()
              const aNameExact = a.name.toLowerCase().startsWith(searchLower)
              const bNameExact = b.name.toLowerCase().startsWith(searchLower)
              
              if (aNameExact && !bNameExact) return -1
              if (!aNameExact && bNameExact) return 1
              return 0
            })
          }
        } catch (error) {
          console.log('Error searching user inventory:', error)
        }
      }

      // Combine all results
      const combinedResults = [...filtered, ...firebaseResults, ...userInventoryResults]
      
      // Remove duplicates and limit results
      const uniqueResults = combinedResults.filter((item, index, self) =>
        index === self.findIndex(t => t.id === item.id && t.type === item.type)
      ).slice(0, 20) // Increased limit to accommodate brand and article results

      console.log('Final search results:', uniqueResults.length, uniqueResults)
      setSearchResults(uniqueResults)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Handle search input
  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    setActiveIndex(-1)
    
    if (value.trim()) {
      performSearch(value)
      setShowResults(true)
    } else {
      setSearchResults([])
      setShowResults(false)
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(prev => 
        prev < searchResults.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex >= 0 && searchResults[activeIndex]) {
        window.location.href = searchResults[activeIndex].url
      }
    } else if (e.key === 'Escape') {
      setShowResults(false)
      setSearchTerm('')
    }
  }

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Get category icon and color
  const getCategoryInfo = (category) => {
    const categoryInfo = searchCategories.find(cat => cat.name === category)
    return categoryInfo || { icon: '🔍', color: 'bg-gray-500' }
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto" ref={searchRef}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          onFocus={() => searchTerm.trim() && setShowResults(true)}
          placeholder="Search for services, spare parts, shops, brands, or articles..."
          className="w-full pl-12 pr-4 py-4 text-lg rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#e60012]/20"
          style={{
            backgroundColor: 'var(--panel-gray)',
            borderColor: showResults ? '#e60012' : 'var(--border-color)',
            color: 'var(--text-main)'
          }}
        />
        
        {/* Search button */}
        <button
          onClick={() => searchTerm.trim() && performSearch(searchTerm)}
          className="absolute inset-y-0 right-0 pr-4 flex items-center"
        >
          <div className="bg-[#e60012] text-white p-2 rounded-lg hover:bg-[#d40010] transition-colors">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </button>
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div 
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border z-50 max-h-96 overflow-y-auto"
          style={{ borderColor: 'var(--border-color)' }}
        >
          {/* Loading state */}
          {isSearching && (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#e60012] mx-auto"></div>
              <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>Searching...</p>
            </div>
          )}

          {/* Results */}
          {!isSearching && searchResults.length > 0 && (
            <div className="py-2">
                                  {searchResults.map((result, index) => {
                      const categoryInfo = getCategoryInfo(result.category)
                      return (
                        <Link
                          key={`${result.type}-${result.id}`}
                          href={result.url}
                          className={`block px-4 py-3 hover:bg-gray-50 transition-colors ${
                            index === activeIndex ? 'bg-gray-50' : ''
                          }`}
                          onClick={() => setShowResults(false)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full ${categoryInfo.color} flex items-center justify-center text-white text-sm`}>
                              {categoryInfo.icon}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium" style={{ color: 'var(--text-main)' }}>
                                {result.name}
                              </div>
                              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                {result.category}
                                {result.type === 'inventory' && result.brand && (
                                  <span> • {result.brand}</span>
                                )}
                                {result.type === 'inventory' && result.model && (
                                  <span> • {result.model}</span>
                                )}
                                {result.type === 'part' && result.brand && (
                                  <span> • {result.brand}</span>
                                )}
                                {result.type === 'part' && result.model && (
                                  <span> • {result.model}</span>
                                )}
                                {result.type === 'shop' && result.contactNumber && (
                                  <span> • {result.contactNumber}</span>
                                )}
                                {result.type === 'service' && result.description && (
                                  <span> • {result.description.substring(0, 50)}...</span>
                                )}
                                {result.type === 'brand' && result.description && (
                                  <span> • {result.description.substring(0, 50)}...</span>
                                )}
                                {result.type === 'brand-category' && result.description && (
                                  <span> • {result.description.substring(0, 50)}...</span>
                                )}
                                {result.type === 'article' && result.description && (
                                  <span> • {result.description.substring(0, 50)}...</span>
                                )}
                              </div>
                              {(result.type === 'inventory' || result.type === 'part') && (
                                <div className="text-xs mt-1 flex items-center space-x-2">
                                  {result.type === 'inventory' && (
                                    <span className="px-2 py-1 rounded-full bg-green-100 text-green-700">
                                      Stock: {result.quantity}
                                    </span>
                                  )}
                                  <span className="font-medium text-green-600">
                                    ₹{result.price}
                                    {result.discount && (
                                      <span className="text-xs text-red-500 ml-1">
                                        -{result.discount}%
                                      </span>
                                    )}
                                  </span>
                                </div>
                              )}
                              {result.type === 'service' && (result.minPrice || result.maxPrice) && (
                                <div className="text-xs mt-1 flex items-center space-x-2">
                                  <span className="font-medium text-blue-600">
                                    {result.minPrice && result.maxPrice 
                                      ? `₹${result.minPrice} - ₹${result.maxPrice}`
                                      : result.minPrice 
                                        ? `From ₹${result.minPrice}`
                                        : `Up to ₹${result.maxPrice}`
                                    }
                                  </span>
                                </div>
                              )}
                              {result.type === 'shop' && result.address && (
                                <div className="text-xs mt-1 text-gray-500">
                                  📍 {result.address}
                                </div>
                              )}
                              {result.type === 'brand' && result.categories && result.categories.length > 0 && (
                                <div className="text-xs mt-1 flex flex-wrap gap-1">
                                  {result.categories.slice(0, 3).map((category, idx) => (
                                    <span key={idx} className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">
                                      {category}
                                    </span>
                                  ))}
                                  {result.categories.length > 3 && (
                                    <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                                      +{result.categories.length - 3} more
                                    </span>
                                  )}
                                </div>
                              )}
                              {result.type === 'brand-category' && result.categories && result.categories.length > 0 && (
                                <div className="text-xs mt-1 flex flex-wrap gap-1">
                                  {result.categories.slice(0, 3).map((category, idx) => (
                                    <span key={idx} className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">
                                      {category}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {result.type === 'article' && result.tags && result.tags.length > 0 && (
                                <div className="text-xs mt-1 flex flex-wrap gap-1">
                                  {result.tags.slice(0, 3).map((tag, idx) => (
                                    <span key={idx} className="px-2 py-1 rounded-full bg-teal-100 text-teal-700">
                                      #{tag}
                                    </span>
                                  ))}
                                  {result.tags.length > 3 && (
                                    <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                                      +{result.tags.length - 3} more
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="text-xs px-2 py-1 rounded-full bg-gray-100" style={{ color: 'var(--text-secondary)' }}>
                              {result.type === 'inventory' ? 'My Item' : result.type}
                            </div>
                          </div>
                        </Link>
                      )
                    })}
            </div>
          )}

          {/* No results */}
          {!isSearching && searchTerm.trim() && searchResults.length === 0 && (
            <div className="p-4 text-center">
              <div className="text-4xl mb-2">🔍</div>
              <p className="font-medium" style={{ color: 'var(--text-main)' }}>No results found</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Try searching for different keywords
              </p>
            </div>
          )}

          {/* Quick search suggestions */}
          {!isSearching && !searchTerm.trim() && (
            <div className="p-4">
              <div className="mb-3">
                <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>Popular searches:</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  'iPhone repair', 
                  'Laptop battery', 
                  'TV remote', 
                  'AC service',
                  'Samsung screen',
                  'Mobile repair',
                  'Computer service',
                  'Apple iPhone',
                  'Samsung Galaxy',
                  'iPhone 16 Pro',
                  'Mobile repair guide',
                  'Tech tips',
                  'Apple Mobile',
                  'Samsung Mobile',
                  'LG AC'
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setSearchTerm(suggestion)
                      performSearch(suggestion)
                    }}
                    className="px-3 py-1 text-sm rounded-full border transition-colors hover:bg-gray-50"
                    style={{ 
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-main)'
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 