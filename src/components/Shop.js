'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useTheme } from '@/contexts/ThemeContext'

export default function Shop() {
  const [isVisible, setIsVisible] = useState(false)
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { isDarkMode } = useTheme()
  
  // Filter states
  const [activeFilter, setActiveFilter] = useState('all')
  const [deviceCategory, setDeviceCategory] = useState('')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  // Available filter options
  const [deviceCategories, setDeviceCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [models, setModels] = useState([])
  const [availableBrands, setAvailableBrands] = useState([])
  const [availableModels, setAvailableModels] = useState([])
  
  // Quick filter categories
  const quickFilters = [
    { id: 'all', label: 'All Parts', icon: '🔧' },
    { id: 'mobile', label: 'Mobile', icon: '📱' },
    { id: 'laptop', label: 'Laptop', icon: '💻' },
    { id: 'tv', label: 'TV', icon: '📺' },
    { id: 'ac', label: 'AC', icon: '❄️' },
    { id: 'featured', label: 'Featured', icon: '⭐' }
  ]
  
  // Predefined brand options for each device category
  const brandOptions = {
    'Mobile Phones': ['Apple', 'Samsung', 'Xiaomi', 'OnePlus', 'OPPO', 'Vivo', 'Realme', 'Nothing', 'Google', 'Motorola'],
    'TVs': ['Samsung', 'LG', 'Sony', 'Panasonic', 'TCL', 'Mi', 'OnePlus', 'VU', 'Thomson', 'BPL'],
    'ACs': ['Voltas', 'Blue Star', 'Carrier', 'Daikin', 'Hitachi', 'LG', 'Samsung', 'Panasonic', 'Whirlpool', 'Godrej'],
    'Refrigerators': ['LG', 'Samsung', 'Whirlpool', 'Godrej', 'Haier', 'Panasonic', 'Hitachi', 'Bosch', 'BPL', 'Voltas'],
    'Washing Machines': ['LG', 'Samsung', 'Whirlpool', 'IFB', 'Bosch', 'Haier', 'Panasonic', 'Godrej', 'BPL', 'Voltas'],
    'Laptops': ['Dell', 'HP', 'Lenovo', 'Apple', 'ASUS', 'Acer', 'MSI', 'Razer', 'Alienware', 'Gigabyte'],
    'Tablets': ['Apple', 'Samsung', 'Xiaomi', 'Lenovo', 'Realme', 'OPPO', 'OnePlus', 'Amazon', 'Google', 'Huawei']
  }
  
  useEffect(() => {
    try {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true)
        }
      }, {
        threshold: 0.2
      })
      
      const element = document.getElementById('shop-section')
      if (element) observer.observe(element)
      
      return () => {
        if (element) observer.unobserve(element)
      }
    } catch (err) {
      console.error('Error in Shop intersection observer:', err)
      setIsVisible(true)
    }
  }, [])

  // Fetch products from database
  useEffect(() => {
    let isMounted = true;
    
    const fetchProducts = async () => {
      setLoading(true)
      setError(null)
      try {
        const productsSnapshot = await getDocs(
          query(collection(db, 'spareParts'), where('isActive', '==', true), orderBy('createdAt', 'desc'))
        )
        
        if (!isMounted) return;
        
        const productsData = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          price: doc.data().price ? parseFloat(doc.data().price) : 0,
          stock: doc.data().stock || 0,
          rating: doc.data().rating || 4.5,
          reviews: doc.data().reviews || Math.floor(Math.random() * 50) + 5,
          featured: doc.data().featured || false
        }))
        
        console.log('Shop: Fetched products:', productsData.length, 'items')
        
        setProducts(productsData)
        setFilteredProducts(productsData)
        
        // Extract unique values for filters
        const uniqueDeviceCategories = [...new Set(productsData.map(part => part.deviceCategory))]
          .filter(Boolean)
          .sort()
        
        const uniqueBrands = [...new Set(productsData.map(part => part.brand))]
          .filter(Boolean)
          .sort()
        
        const uniqueModels = [...new Set(productsData.map(part => part.model))]
          .filter(Boolean)
          .sort()
        
        setDeviceCategories(uniqueDeviceCategories)
        setBrands(uniqueBrands)
        setModels(uniqueModels)
        setAvailableBrands(uniqueBrands)
        setAvailableModels(uniqueModels)
        
      } catch (error) {
        console.error('Shop: Error fetching products:', error)
        setError('Failed to load products. Using fallback data.')
        const staticData = getStaticProducts()
        setProducts(staticData)
        setFilteredProducts(staticData)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchProducts()
    
    return () => {
      isMounted = false;
    }
  }, [])

  // Update available brands when device category changes
  useEffect(() => {
    if (deviceCategory) {
      const categoryBrands = brandOptions[deviceCategory] || []
      setAvailableBrands(categoryBrands)
      setBrand('')
      setModel('')
    } else {
      setAvailableBrands(brands)
    }
  }, [deviceCategory, brands])

  // Update available models when brand changes
  useEffect(() => {
    if (brand) {
      const filteredModels = models.filter(model => {
        return true
      })
      setAvailableModels(filteredModels)
    } else {
      setAvailableModels(models)
    }
  }, [brand, models])

  // Apply filters when filter states change
  useEffect(() => {
    let filtered = [...products]

    // Apply quick filter
    if (activeFilter !== 'all') {
      if (activeFilter === 'featured') {
        filtered = filtered.filter(product => product.featured)
      } else {
        filtered = filtered.filter(product => 
          product.deviceCategory?.toLowerCase().includes(activeFilter) ||
          product.brand?.toLowerCase().includes(activeFilter)
        )
      }
    }

    // Apply device category filter
    if (deviceCategory) {
      filtered = filtered.filter(product => 
        product.deviceCategory === deviceCategory
      )
    }

    // Apply brand filter
    if (brand) {
      filtered = filtered.filter(product => 
        product.brand === brand
      )
    }

    // Apply model filter
    if (model) {
      filtered = filtered.filter(product => 
        product.model === model
      )
    }

    setFilteredProducts(filtered)
  }, [activeFilter, deviceCategory, brand, model, products])

  // Handle quick filter changes
  const handleQuickFilter = (filterId) => {
    setActiveFilter(filterId)
    setDeviceCategory('')
    setBrand('')
    setModel('')
  }

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'deviceCategory':
        setDeviceCategory(value)
        break
      case 'brand':
        setBrand(value)
        break
      case 'model':
        setModel(value)
        break
      default:
        break
    }
  }

  // Clear all filters
  const clearFilters = () => {
    setActiveFilter('all')
    setDeviceCategory('')
    setBrand('')
    setModel('')
  }

  // Static fallback products
  const getStaticProducts = () => [
    {
      id: 1,
      name: "iPhone Battery",
      price: 1999.99,
      imageURL: "/phone-battery.jpg",
      rating: 4.8,
      reviews: 126,
      url: "/spare-parts/1",
      featured: true,
      badge: "Bestseller",
      deviceCategory: "Mobile Phones",
      brand: "Apple",
      model: "iPhone 14"
    },
    {
      id: 2,
      name: "Laptop Charger",
      price: 599.99,
      imageURL: "/laptop-charger.jpg",
      rating: 4.5,
      reviews: 84,
      url: "/spare-parts/2",
      featured: false,
      deviceCategory: "Laptops",
      brand: "Dell",
      model: "Inspiron 15"
    },
    {
      id: 3,
      name: "TV Remote",
      price: 499.99,
      imageURL: "/tv-remote.jpg",
      rating: 4.7,
      reviews: 52,
      url: "/spare-parts/3",
      featured: true,
      badge: "New",
      deviceCategory: "TVs",
      brand: "Samsung",
      model: "Smart TV 55"
    }
  ]

  // Handle image error
  const handleImageError = (e) => {
    console.error('Failed to load product image')
    e.target.onerror = null;
    e.target.src = "/phone-battery.jpg";
  }

  // Helper to get first part of product name (for compact display)
  const getFirstPartOfName = (name) => {
    if (!name) return '';
    if (name.length <= 25) return name;
    const words = name.split(' ');
    let result = '';
    for (let word of words) {
      if ((result + ' ' + word).length <= 25) {
        result += (result ? ' ' : '') + word;
      } else {
        break;
      }
    }
    return result || name.substring(0, 25);
  }

  return (
    <section id="shop-section" className="py-16 px-4 sm:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10" style={{ 
        background: isDarkMode 
          ? 'linear-gradient(to bottom, var(--panel-dark), var(--bg-color))' 
          : 'linear-gradient(to bottom, var(--panel-charcoal), var(--bg-color))'
      }}></div>
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#e60012]/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-32 -right-32 w-72 h-72 bg-[#e60012]/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Section Heading */}
        <div 
          className={`mb-8 text-center transform transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="inline-block px-4 py-1 rounded-full mb-4 border" style={{ 
            background: 'var(--panel-dark)', 
            borderColor: 'var(--border-color)' 
          }}>
            <span className="text-[#e60012] text-sm font-medium">Quality Parts</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Genuine <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e60012] to-[#ff6b6b]">Spare Parts</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)' }} className="max-w-2xl mx-auto">
            Original components with warranty for all your device repair needs
          </p>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-900/50 rounded-lg text-center">
            <p className="text-red-400 text-sm">
              {error}
            </p>
          </div>
        )}
        
        {/* Quick Filter Tabs */}
        <div 
          className={`mb-6 transform transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {quickFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => handleQuickFilter(filter.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeFilter === filter.id
                    ? 'bg-[#e60012] text-white shadow-lg shadow-[#e60012]/25'
                    : 'bg-transparent border hover:bg-[#e60012]/10'
                }`}
                style={{ 
                  borderColor: activeFilter === filter.id ? 'transparent' : 'var(--border-color)',
                  color: activeFilter === filter.id ? 'white' : 'var(--text-main)'
                }}
              >
                <span className="text-base">{filter.icon}</span>
                <span>{filter.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <div 
          className={`mb-6 transform transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="flex justify-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 hover:bg-[#e60012]/10"
              style={{ 
                borderColor: 'var(--border-color)',
                color: 'var(--text-main)'
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="text-sm font-medium">
                {showFilters ? 'Hide' : 'Show'} Advanced Filters
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-[#e60012]/10 text-[#e60012]">
                {[deviceCategory, brand, model].filter(Boolean).length}
              </span>
            </button>
          </div>
        </div>
        
        {/* Advanced Filters Panel */}
        {showFilters && (
          <div 
            className={`mb-6 transform transition-all duration-500 ${
              showFilters ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="rounded-xl p-4 sm:p-6 border shadow-lg" style={{ 
              background: 'var(--panel-dark)', 
              borderColor: 'var(--border-color)' 
            }}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label style={{ color: 'var(--text-secondary)' }} className="block text-sm mb-2 font-medium">Device Category</label>
                  <select 
                    value={deviceCategory}
                    onChange={(e) => handleFilterChange('deviceCategory', e.target.value)}
                    className="w-full p-3 border rounded-lg text-sm focus:border-[#e60012] focus:outline-none focus:ring-1 focus:ring-[#e60012]" 
                    style={{ 
                      background: 'var(--bg-color)', 
                      color: 'var(--text-main)',
                      borderColor: 'var(--border-color)' 
                    }}
                  >
                    <option value="">All Categories</option>
                    {deviceCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label style={{ color: 'var(--text-secondary)' }} className="block text-sm mb-2 font-medium">Brand</label>
                  <select 
                    value={brand}
                    onChange={(e) => handleFilterChange('brand', e.target.value)}
                    className="w-full p-3 border rounded-lg text-sm focus:border-[#e60012] focus:outline-none focus:ring-1 focus:ring-[#e60012]" 
                    style={{ 
                      background: 'var(--bg-color)', 
                      color: 'var(--text-main)',
                      borderColor: 'var(--border-color)' 
                    }}
                  >
                    <option value="">All Brands</option>
                    {availableBrands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label style={{ color: 'var(--text-secondary)' }} className="block text-sm mb-2 font-medium">Model</label>
                  <select 
                    value={model}
                    onChange={(e) => handleFilterChange('model', e.target.value)}
                    className="w-full p-3 border rounded-lg text-sm focus:border-[#e60012] focus:outline-none focus:ring-1 focus:ring-[#e60012]" 
                    style={{ 
                      background: 'var(--bg-color)', 
                      color: 'var(--text-main)',
                      borderColor: 'var(--border-color)' 
                    }}
                  >
                    <option value="">All Models</option>
                    {availableModels.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Clear Filters Button */}
              {(deviceCategory || brand || model) && (
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-sm rounded-lg border transition-colors duration-300 font-medium hover:bg-red-500 hover:text-white"
                    style={{ 
                      borderColor: 'var(--border-color)', 
                      color: 'var(--text-secondary)',
                      backgroundColor: 'var(--panel-gray)'
                    }}
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Products Grid */}
        {loading ? (
          <div>
            {/* Mobile: Horizontal scroll */}
            <div className="md:hidden overflow-x-auto pb-4 -mx-4 px-4 hide-scrollbar snap-x snap-mandatory">
              <div className="flex gap-3 min-w-max">
                {[...Array(6)].map((_, index) => (
                  <div 
                    key={index} 
                    className="w-[220px] flex-shrink-0 snap-start rounded-lg overflow-hidden border animate-pulse" 
                    style={{ 
                      backgroundColor: 'var(--panel-dark)', 
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    <div className="aspect-[4/3] bg-gray-700"></div>
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                      <div className="h-2 bg-gray-700 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Tablet: 2-column grid */}
            <div className="hidden md:grid lg:hidden md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, index) => (
                <div 
                  key={index} 
                  className="rounded-xl overflow-hidden border animate-pulse" 
                  style={{ 
                    backgroundColor: 'var(--panel-dark)', 
                    borderColor: 'var(--border-color)'
                  }}
                >
                  <div className="aspect-[4/3] bg-gray-700"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                    <div className="h-6 bg-gray-700 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Desktop: 4-column grid */}
            <div className="hidden lg:grid lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div 
                  key={index} 
                  className="rounded-xl overflow-hidden border animate-pulse" 
                  style={{ 
                    backgroundColor: 'var(--panel-dark)', 
                    borderColor: 'var(--border-color)'
                  }}
                >
                  <div className="aspect-[4/3] bg-gray-700"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                    <div className="h-6 bg-gray-700 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div>
            {/* Mobile: Horizontal scroll */}
            <div className="md:hidden overflow-x-auto pb-4 -mx-4 px-4 hide-scrollbar snap-x snap-mandatory">
              <div className="flex gap-3 min-w-max">
                {filteredProducts.slice(0, 6).map((product, index) => (
                  <div key={product.id} className="w-[220px] flex-shrink-0 snap-start group">
                    <Link 
                      href={`/spare-parts/${product.id}`}
                      className={`block rounded-lg overflow-hidden transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#e60012]/20 ${
                        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                      } transition-all duration-700 border h-full`}
                      style={{ 
                        transitionDelay: `${index * 100 + 400}ms`,
                        background: 'var(--panel-dark)',
                        borderColor: 'var(--border-color)'
                      }}
                    >
                      {/* Image Container */}
                      <div className="relative overflow-hidden aspect-[4/3]">
                        <Image 
                          src={product.imageURL || product.image || "/phone-battery.jpg"}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          sizes="220px"
                          onError={handleImageError}
                        />
                        
                        {/* Badge */}
                        {product.featured && (
                          <div className="absolute top-2 left-2 bg-gradient-to-r from-[#e60012] to-[#ff6b6b] text-white text-xs font-bold px-2 py-1 rounded-full">
                            ⭐
                          </div>
                        )}
                        
                        {/* Stock indicator */}
                        {product.stock <= 5 && product.stock > 0 && (
                          <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                            ⚠️
                          </div>
                        )}
                        {product.stock === 0 && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                            ❌
                          </div>
                        )}
                        
                        {/* Quick View Overlay */}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            <span className="bg-white text-black rounded-full px-4 py-2 text-xs font-medium">
                              👁️ View
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Product Details */}
                      <div className="p-3">
                        <div className="flex items-center mb-1.5 text-xs">
                          <div className="flex text-yellow-400">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"></path>
                            </svg>
                            <span className="ml-0.5 text-xs">{product.rating}</span>
                          </div>
                          <span style={{ color: 'var(--text-secondary)' }} className="mx-1">•</span>
                          <span style={{ color: 'var(--text-secondary)' }} className="text-xs">{product.reviews}</span>
                        </div>
                        
                        <h3 className="text-sm font-bold mb-1.5 group-hover:text-[#e60012] transition-colors line-clamp-2">{product.name}</h3>
                        
                        {/* Device info */}
                        <div className="text-xs mb-2 space-y-0.5" style={{ color: 'var(--text-secondary)' }}>
                          {product.deviceCategory && (
                            <p className="text-[#e60012] font-medium text-xs">{product.deviceCategory}</p>
                          )}
                          {product.brand && product.model && (
                            <p className="text-xs">{product.brand} {product.model}</p>
                          )}
                        </div>
                        
                        <div className="text-[#e60012] font-bold text-base mb-2">₹{product.price.toLocaleString()}</div>
                        
                        <div className="w-full py-2 px-3 rounded-lg text-center text-white bg-gradient-to-r from-[#e60012] to-[#ff6b6b] opacity-90 group-hover:opacity-100 transition-opacity text-xs">
                          View Details →
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Tablet: 2-column grid */}
            <div className="hidden md:grid lg:hidden md:grid-cols-2 gap-6">
              {filteredProducts.slice(0, 6).map((product, index) => (
                <div key={product.id} className="group">
                  <Link 
                    href={`/spare-parts/${product.id}`}
                    className={`block rounded-xl overflow-hidden transition-all hover:scale-105 hover:shadow-xl hover:shadow-[#e60012]/20 ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    } transition-all duration-700 border h-full`}
                    style={{ 
                      transitionDelay: `${index * 100 + 400}ms`,
                      background: 'var(--panel-dark)',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    {/* Image Container */}
                    <div className="relative overflow-hidden aspect-[4/3]">
                      <Image 
                        src={product.imageURL || product.image || "/phone-battery.jpg"}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 1024px) 50vw, 33vw"
                        onError={handleImageError}
                      />
                      
                      {/* Badge */}
                      {product.featured && (
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-[#e60012] to-[#ff6b6b] text-white text-xs font-bold px-3 py-1 rounded-full">
                          ⭐ Featured
                        </div>
                      )}
                      
                      {/* Stock indicator */}
                      {product.stock <= 5 && product.stock > 0 && (
                        <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                          ⚠️ Low Stock
                        </div>
                      )}
                      {product.stock === 0 && (
                        <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          ❌ Out of Stock
                        </div>
                      )}
                      
                      {/* Quick View Overlay */}
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          <span className="bg-white text-black rounded-full px-6 py-3 text-sm font-medium">
                            👁️ Quick View
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Product Details */}
                    <div className="p-3 flex flex-col h-full">
                      <div className="flex items-center mb-1.5 text-xs">
                        <div className="flex text-yellow-400">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"></path>
                          </svg>
                          <span className="ml-0.5 text-xs">{product.rating}</span>
                        </div>
                        <span style={{ color: 'var(--text-secondary)' }} className="mx-1">•</span>
                        <span style={{ color: 'var(--text-secondary)' }} className="text-xs">{product.reviews}</span>
                      </div>
                      
                      <h3 className="text-sm font-bold mb-1.5 group-hover:text-[#e60012] transition-colors line-clamp-2 flex-grow">{getFirstPartOfName(product.name)}</h3>
                      
                      {/* Device info */}
                      <div className="text-xs mb-2 space-y-0.5" style={{ color: 'var(--text-secondary)' }}>
                        {product.deviceCategory && (
                          <p className="text-[#e60012] font-medium text-xs line-clamp-1">{product.deviceCategory}</p>
                        )}
                        {product.brand && product.model && (
                          <p className="text-xs line-clamp-1">{product.brand} {product.model}</p>
                        )}
                      </div>
                      
                      <div className="text-[#e60012] font-bold text-base mb-2">₹{product.price.toLocaleString()}</div>
                      
                      <div className="w-full py-2 px-3 rounded-lg text-center text-white bg-gradient-to-r from-[#e60012] to-[#ff6b6b] opacity-90 group-hover:opacity-100 transition-opacity text-xs mt-auto">
                        View Details →
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
            
            {/* Desktop: 4-column grid */}
            <div className="hidden lg:grid lg:grid-cols-4 gap-6">
              {filteredProducts.slice(0, 8).map((product, index) => (
                <div key={product.id} className="group">
                  <Link 
                    href={`/spare-parts/${product.id}`}
                    className={`block rounded-xl overflow-hidden transition-all hover:scale-105 hover:shadow-xl hover:shadow-[#e60012]/20 ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    } transition-all duration-700 border h-full`}
                    style={{ 
                      transitionDelay: `${index * 100 + 400}ms`,
                      background: 'var(--panel-dark)',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    {/* Image Container */}
                    <div className="relative overflow-hidden aspect-[4/3]">
                      <Image 
                        src={product.imageURL || product.image || "/phone-battery.jpg"}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 1024px) 50vw, 33vw"
                        onError={handleImageError}
                      />
                      
                      {/* Badge */}
                      {product.featured && (
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-[#e60012] to-[#ff6b6b] text-white text-xs font-bold px-3 py-1 rounded-full">
                          ⭐ Featured
                        </div>
                      )}
                      
                      {/* Stock indicator */}
                      {product.stock <= 5 && product.stock > 0 && (
                        <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                          ⚠️ Low Stock
                        </div>
                      )}
                      {product.stock === 0 && (
                        <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          ❌ Out of Stock
                        </div>
                      )}
                      
                      {/* Quick View Overlay */}
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          <span className="bg-white text-black rounded-full px-6 py-3 text-sm font-medium">
                            👁️ Quick View
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Product Details */}
                    <div className="p-4">
                      <div className="flex items-center mb-2 text-xs">
                        <div className="flex text-yellow-400">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"></path>
                          </svg>
                          <span className="ml-1">{product.rating}</span>
                        </div>
                        <span style={{ color: 'var(--text-secondary)' }} className="mx-2">•</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{product.reviews} reviews</span>
                      </div>
                      
                      <h3 className="text-lg font-bold mb-2 group-hover:text-[#e60012] transition-colors">{getFirstPartOfName(product.name)}</h3>
                      
                      {/* Device info */}
                      <div className="text-xs mb-3 space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        {product.deviceCategory && (
                          <p className="text-[#e60012] font-medium">{product.deviceCategory}</p>
                        )}
                        {product.brand && product.model && (
                          <p>{product.brand} {product.model}</p>
                        )}
                      </div>
                      
                      <div className="text-[#e60012] font-bold text-lg mb-3">₹{product.price.toLocaleString()}</div>
                      
                      <div className="w-full py-3 px-4 rounded-lg text-center text-white bg-gradient-to-r from-[#e60012] to-[#ff6b6b] opacity-90 group-hover:opacity-100 transition-opacity">
                        View Details →
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2">No products found</h3>
            <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-4">
              Try adjusting your filters or check back later
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-[#e60012] text-white rounded-full hover:bg-[#d10010] transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
        
        {/* "View All" Button */}
        <div className="mt-12 text-center">
          <Link 
            href="/spare-parts" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#e60012] to-[#ff6b6b] hover:from-[#d10010] hover:to-[#ff5252] px-8 py-4 rounded-full transition-all duration-300 text-white font-medium shadow-lg shadow-[#e60012]/25 hover:shadow-xl hover:shadow-[#e60012]/30 transform hover:scale-105"
          >
            Browse All Spare Parts
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
} 