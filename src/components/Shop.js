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
  const { isDarkMode } = useTheme()
  
  // Filter states
  const [deviceCategory, setDeviceCategory] = useState('')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  
  // Available filter options
  const [deviceCategories, setDeviceCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [models, setModels] = useState([])
  const [availableBrands, setAvailableBrands] = useState([])
  const [availableModels, setAvailableModels] = useState([])
  
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
  }, [])

  // Fetch products from database
  useEffect(() => {
    let isMounted = true;
    
    const fetchProducts = async () => {
      setLoading(true)
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
        // Fallback to static data if database fails
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
      // Reset brand and model when device category changes
      setBrand('')
      setModel('')
    } else {
      setAvailableBrands(brands)
    }
  }, [deviceCategory, brands])

  // Update available models when brand changes
  useEffect(() => {
    if (brand) {
      // Filter models based on selected brand and device category
      const filteredModels = models.filter(model => {
        // This is a simplified filter - in a real app you'd have a more sophisticated relationship
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
  }, [deviceCategory, brand, model, products])

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

  return (
    <section id="shop-section" className="py-20 sm:py-28 px-4 sm:px-8 relative overflow-hidden">
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
          className={`mb-12 md:mb-16 text-center transform transition-all duration-700 ${
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
        
        {/* Filter Options */}
        <div 
          className={`transform transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="rounded-xl p-6 mb-8 border shadow-lg" style={{ 
            background: 'var(--panel-dark)', 
            borderColor: 'var(--border-color)' 
          }}>
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex-1">
                <label style={{ color: 'var(--text-secondary)' }} className="block text-sm mb-2 font-medium">Device Category</label>
                <select 
                  value={deviceCategory}
                  onChange={(e) => handleFilterChange('deviceCategory', e.target.value)}
                  className="w-full p-2.5 border rounded-lg text-sm appearance-none focus:border-[#e60012] focus:outline-none focus:ring-1 focus:ring-[#e60012]" 
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
              
              <div className="flex-1">
                <label style={{ color: 'var(--text-secondary)' }} className="block text-sm mb-2 font-medium">Brand</label>
                <select 
                  value={brand}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                  className="w-full p-2.5 border rounded-lg text-sm appearance-none focus:border-[#e60012] focus:outline-none focus:ring-1 focus:ring-[#e60012]" 
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
              
              <div className="flex-1">
                <label style={{ color: 'var(--text-secondary)' }} className="block text-sm mb-2 font-medium">Model</label>
                <select 
                  value={model}
                  onChange={(e) => handleFilterChange('model', e.target.value)}
                  className="w-full p-2.5 border rounded-lg text-sm appearance-none focus:border-[#e60012] focus:outline-none focus:ring-1 focus:ring-[#e60012]" 
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
              
              {/* Clear Filters Button */}
              {(deviceCategory || brand || model) && (
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2.5 text-sm rounded-lg border transition-colors duration-300 font-medium"
                    style={{ 
                      borderColor: 'var(--border-color)', 
                      color: 'var(--text-secondary)',
                      backgroundColor: 'var(--panel-gray)'
                    }}
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
            
            {/* Active Filters Display */}
            {(deviceCategory || brand || model) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {deviceCategory && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#e60012]/10 text-[#e60012]">
                    Device: {deviceCategory}
                    <button
                      onClick={() => handleFilterChange('deviceCategory', '')}
                      className="ml-2 text-[#e60012] hover:text-[#d40010]"
                    >
                      ×
                    </button>
                  </span>
                )}
                {brand && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#e60012]/10 text-[#e60012]">
                    Brand: {brand}
                    <button
                      onClick={() => handleFilterChange('brand', '')}
                      className="ml-2 text-[#e60012] hover:text-[#d40010]"
                    >
                      ×
                    </button>
                  </span>
                )}
                {model && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#e60012]/10 text-[#e60012]">
                    Model: {model}
                    <button
                      onClick={() => handleFilterChange('model', '')}
                      className="ml-2 text-[#e60012] hover:text-[#d40010]"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e60012]"></div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="overflow-x-auto pb-4 hide-scrollbar">
            <div className="flex gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 lg:gap-8 min-w-max sm:min-w-0">
              {filteredProducts.slice(0, 6).map((product, index) => (
                <div key={product.id} className="w-72 sm:w-auto flex-shrink-0 sm:flex-shrink">
                  <Link 
                    href={`/spare-parts/${product.id}`}
                    className={`group rounded-xl overflow-hidden transition-all hover:border-[#e60012] hover:shadow-lg hover:shadow-[#e60012]/10 transform ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    } transition-all duration-700 border block h-full`}
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
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/phone-battery.jpg";
                        }}
                      />
                      
                      {/* Badge */}
                      {product.featured && (
                        <div className="absolute top-3 left-3 bg-white text-black text-xs font-bold px-2 py-1 rounded-md">
                          Featured
                        </div>
                      )}
                      
                      {/* Stock indicator */}
                      {product.stock <= 5 && product.stock > 0 && (
                        <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                          Low Stock
                        </div>
                      )}
                      {product.stock === 0 && (
                        <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          Out of Stock
                        </div>
                      )}
                      
                      {/* Quick View Button (appears on hover) */}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          <span className="bg-white text-black rounded-full px-4 py-2 text-sm font-medium">
                            Quick View
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Product Details */}
                    <div className="p-5">
                      <div className="flex items-center mb-2 text-sm">
                        <div className="flex text-yellow-400">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"></path>
                          </svg>
                          <span className="ml-1">{product.rating}</span>
                        </div>
                        <span style={{ color: 'var(--text-secondary)' }} className="mx-2">•</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{product.reviews} reviews</span>
                      </div>
                      
                      <h3 className="text-lg font-bold mb-1 group-hover:text-[#e60012] transition-colors">{product.name}</h3>
                      
                      {/* Device info */}
                      <div className="text-xs mb-2 space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        {product.deviceCategory && (
                          <p className="text-[#e60012] font-medium">{product.deviceCategory}</p>
                        )}
                        {product.brand && product.model && (
                          <p>{product.brand} {product.model}</p>
                        )}
                      </div>
                      
                      <div className="text-[#e60012] font-medium mb-4">₹{product.price.toLocaleString()}</div>
                      
                      <div className={`mt-2 py-2 px-4 rounded-lg text-center text-white ${product.featured ? 'bg-gradient-to-r from-[#e60012] to-[#ff6b6b]' : ''} opacity-80 group-hover:opacity-100 transition-opacity`}
                        style={!product.featured ? { background: 'var(--panel-gray)' } : {}}
                      >
                        View Details
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No products found</h3>
            <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
              Try adjusting your filters or check back later
            </p>
          </div>
        )}
        
        {/* "View All" Button */}
        <div className="mt-12 text-center">
          <Link 
            href="/spare-parts" 
            className="inline-block bg-transparent border-2 border-[#e60012] hover:bg-[#e60012] px-6 py-3 rounded-full transition-colors duration-300"
            style={{ color: 'var(--text-main)' }}
          >
            Browse All Spare Parts
          </Link>
        </div>
      </div>
    </section>
  )
} 