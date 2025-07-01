'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '@/firebase/config'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useTheme } from '@/contexts/ThemeContext'
import Link from 'next/link'

export default function ShopsPage() {
  const [shops, setShops] = useState([])
  const [filteredShops, setFilteredShops] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { isDarkMode } = useTheme()
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [sortBy, setSortBy] = useState('rating') // default sort by rating
  
  // Available filter options
  const categories = [
    'All Categories',
    'Mobile Phone Repair',
    'Computer & Laptop Repair',
    'TV & Electronics Repair',
    'Home Appliance Repair',
    'Camera & Audio Repair',
    'Gaming Console Repair',
    'AC Repair',
    'Other'
  ]
  
  const locations = [
    'All Locations',
    'Mumbai',
    'Delhi',
    'Bangalore',
    'Chennai',
    'Hyderabad',
    'Kolkata',
    'Pune',
    'Ahmedabad',
    'Jaipur',
    'Other'
  ]
  
  const sortOptions = [
    { value: 'rating', label: 'Highest Rated' },
    { value: 'reviews', label: 'Most Reviewed' },
    { value: 'newest', label: 'Newest First' },
    { value: 'name', label: 'Name A-Z' }
  ]
  
  useEffect(() => {
    const fetchShops = async () => {
      setLoading(true)
      try {
        // Query for approved shop owners
        const shopsQuery = query(
          collection(db, 'shopOwners'), 
          where('status', '==', 'approved')
        )
        
        const snapshot = await getDocs(shopsQuery)
        
        if (snapshot.empty) {
          // Use fallback data if no shops are found
          const fallbackShops = getFallbackShops()
          setShops(fallbackShops)
          setFilteredShops(fallbackShops)
        } else {
          const shopsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Default values for missing fields
            rating: doc.data().rating || 4.5,
            reviews: doc.data().reviews || Math.floor(Math.random() * 50) + 5,
            services: doc.data().services || ['Mobile Repair', 'Laptop Repair'],
            verified: doc.data().verified || false,
            location: doc.data().shopAddress?.split(',').pop()?.trim() || 'Mumbai',
            createdAt: doc.data().createdAt?.toDate() || new Date()
          }))
          setShops(shopsData)
          setFilteredShops(shopsData)
        }
      } catch (err) {
        console.error('Error fetching shops:', err)
        setError(err.message)
        // Use fallback data if fetch fails
        const fallbackShops = getFallbackShops()
        setShops(fallbackShops)
        setFilteredShops(fallbackShops)
      } finally {
        setLoading(false)
      }
    }
    
    fetchShops()
  }, [])
  
  // Apply filters when they change
  useEffect(() => {
    let filtered = [...shops]
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(shop => 
        (shop.shopName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (shop.ownerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (shop.shopAddress || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Apply category filter
    if (categoryFilter && categoryFilter !== 'All Categories') {
      filtered = filtered.filter(shop => 
        shop.shopCategory === categoryFilter
      )
    }
    
    // Apply location filter
    if (locationFilter && locationFilter !== 'All Locations') {
      filtered = filtered.filter(shop => 
        shop.location?.includes(locationFilter) || 
        shop.shopAddress?.includes(locationFilter)
      )
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating
        case 'reviews':
          return b.reviews - a.reviews
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt)
        case 'name':
          return a.shopName?.localeCompare(b.shopName)
        default:
          return b.rating - a.rating
      }
    })
    
    setFilteredShops(filtered)
  }, [shops, searchTerm, categoryFilter, locationFilter, sortBy])
  
  // Handle search input
  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }
  
  // Fallback data for shops
  const getFallbackShops = () => [
    {
      id: 'shop1',
      shopName: "TechFix Solutions",
      ownerName: "Raj Patel",
      shopAddress: "123 Tech Street, Mumbai",
      shopCategory: "Mobile Phone Repair",
      rating: 4.9,
      reviews: 124,
      services: ['iPhone Repair', 'Android Fix', 'Screen Replacement'],
      verified: true,
      imageUrl: "https://images.unsplash.com/photo-1588702547919-26089e690ecc?q=80",
      featured: true,
      location: "Mumbai",
      createdAt: new Date('2023-11-15')
    },
    {
      id: 'shop2',
      shopName: "Laptop Care Center",
      ownerName: "Amit Kumar",
      shopAddress: "456 Digital Avenue, Delhi",
      shopCategory: "Computer & Laptop Repair",
      rating: 4.7,
      reviews: 98,
      services: ['Hardware Repair', 'Software Issues', 'Upgrades'],
      verified: true,
      imageUrl: "https://images.unsplash.com/photo-1581092921461-eab10380699b?q=80",
      featured: true,
      location: "Delhi",
      createdAt: new Date('2023-10-20')
    },
    {
      id: 'shop3',
      shopName: "Cool Tech AC Repair",
      ownerName: "Priya Singh",
      shopAddress: "789 Cooling Lane, Chennai",
      shopCategory: "Home Appliance Repair",
      rating: 4.8,
      reviews: 156,
      services: ['AC Service', 'Gas Refill', 'Installation'],
      verified: false,
      imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80",
      featured: false,
      location: "Chennai",
      createdAt: new Date('2023-09-05')
    },
    {
      id: 'shop4',
      shopName: "ScreenMasters",
      ownerName: "Sanjay Gupta",
      shopAddress: "101 Display Road, Bangalore",
      shopCategory: "TV & Electronics Repair",
      rating: 4.6,
      reviews: 87,
      services: ['TV Repair', 'Display Replacement', 'Remote Fix'],
      verified: true,
      imageUrl: "https://images.unsplash.com/photo-1576269483449-3b8b8d528ae1?q=80",
      featured: false,
      location: "Bangalore",
      createdAt: new Date('2023-12-01')
    }
  ]

  return (
    <>
      <Header activePage="shops" />
      <main className="min-h-screen py-16 px-4 sm:px-8" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-main)' }}>
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Repair Shops</h1>
          <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>Find trusted repair shops in your area</p>
          
          {/* Filters section */}
          <div className="mb-8 p-4 sm:p-6 rounded-xl border" style={{ backgroundColor: 'var(--panel-dark)', borderColor: 'var(--border-color)' }}>
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search input */}
              <div className="flex-grow">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search shops by name or location..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full p-3 pr-10 rounded-lg border"
                    style={{ 
                      backgroundColor: 'var(--panel-charcoal)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-main)'
                    }}
                  />
                  <div className="absolute right-3 top-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--text-secondary)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Category filter */}
              <div className="w-full md:w-48">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full p-3 rounded-lg border"
                  style={{ 
                    backgroundColor: 'var(--panel-charcoal)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-main)'
                  }}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              {/* Location filter */}
              <div className="w-full md:w-48">
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full p-3 rounded-lg border"
                  style={{ 
                    backgroundColor: 'var(--panel-charcoal)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-main)'
                  }}
                >
                  {locations.map((location) => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
              
              {/* Sort options */}
              <div className="w-full md:w-48">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-3 rounded-lg border"
                  style={{ 
                    backgroundColor: 'var(--panel-charcoal)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-main)'
                  }}
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="mb-8 p-4 bg-red-900/20 border border-red-900/50 rounded-lg text-center">
              <p className="text-red-400 text-sm">
                {error}. Please refresh the page to try again.
              </p>
            </div>
          )}
          
          {/* Results count and info */}
          <div className="mb-6 flex justify-between items-center">
            <p style={{ color: 'var(--text-secondary)' }}>
              {loading ? 'Searching...' : `${filteredShops.length} shops found`}
            </p>
            {searchTerm || categoryFilter !== '' || locationFilter !== '' ? (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setCategoryFilter('')
                  setLocationFilter('')
                  setSortBy('rating')
                }}
                className="text-[#e60012] text-sm flex items-center"
              >
                Clear filters
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            ) : null}
          </div>
          
          {/* Shops Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div 
                  key={i}
                  className="rounded-xl border animate-pulse"
                  style={{ 
                    height: '320px',
                    backgroundColor: 'var(--panel-dark)', 
                    borderColor: 'var(--border-color)' 
                  }}
                ></div>
              ))}
            </div>
          ) : filteredShops.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredShops.map((shop) => (
                <div
                  key={shop.id}
                  className="rounded-xl border overflow-hidden hover:shadow-lg hover:shadow-[#e60012]/10"
                  style={{ 
                    backgroundColor: 'var(--panel-dark)', 
                    borderColor: shop.featured ? '#e60012' : 'var(--border-color)'
                  }}
                >
                  {/* Shop Image */}
                  <div className="relative h-48 overflow-hidden">
                    <div 
                      className="absolute inset-0 bg-cover bg-center" 
                      style={{ 
                        backgroundImage: `url(${shop.imageUrl || 'https://images.unsplash.com/photo-1581092921461-eab10380699b?q=80'})`
                      }}
                    >
                      <div className="absolute inset-0 bg-black/50"></div>
                    </div>
                    {shop.featured && (
                      <div className="absolute top-4 right-4 bg-[#e60012] text-white text-xs font-bold px-2 py-1 rounded-full">
                        Featured
                      </div>
                    )}
                    {shop.verified && (
                      <div className="absolute top-4 left-4 bg-blue-500/80 text-white text-xs px-2 py-1 rounded-full flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white text-xl font-bold truncate">{shop.shopName}</h3>
                      <p className="text-white/80 text-sm truncate">{shop.shopAddress}</p>
                    </div>
                  </div>
                  
                  {/* Shop Details */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{shop.shopCategory}</span>
                      <div className="flex items-center text-yellow-500">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm font-medium">{shop.rating}</span>
                        <span className="text-xs ml-1" style={{ color: 'var(--text-secondary)' }}>({shop.reviews})</span>
                      </div>
                    </div>
                    
                    {/* Services */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {shop.services && shop.services.slice(0, 3).map((service, idx) => (
                          <span 
                            key={idx} 
                            className="px-2 py-1 text-xs rounded-full" 
                            style={{ 
                              background: 'var(--panel-charcoal)',
                              color: 'var(--text-secondary)'
                            }}
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Shop Owner */}
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 rounded-full bg-[#e60012] flex items-center justify-center text-white text-sm font-bold mr-2">
                        {shop.ownerName?.charAt(0) || 'O'}
                      </div>
                      <div>
                        <p className="text-sm font-medium">Owned by</p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{shop.ownerName}</p>
                      </div>
                    </div>
                    
                    {/* View Shop button */}
                    <Link 
                      href={`/shop-inventory/${shop.id}/share`}
                      className="w-full py-2 text-center block rounded-lg transition-colors border text-sm font-medium"
                      style={{ 
                        backgroundColor: shop.featured ? '#e60012' : 'var(--panel-charcoal)',
                        color: shop.featured ? 'white' : 'var(--text-main)',
                        borderColor: shop.featured ? '#e60012' : 'var(--border-color)'
                      }}
                    >
                      View Shop
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">😔</div>
              <h3 className="text-xl font-medium mb-2">No shops found</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your filters or search terms</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
} 