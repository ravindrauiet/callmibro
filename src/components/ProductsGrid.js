'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useTheme } from '@/contexts/ThemeContext'
import Pagination from './Pagination'

export default function ProductsGrid({ filters = {} }) {
  const [isVisible, setIsVisible] = useState(false)
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(6) // Show 6 products per page
  const { isDarkMode } = useTheme()
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setIsVisible(true)
      }
    }, {
      threshold: 0.1
    })
    
    const element = document.getElementById('products-grid')
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
        
        setProducts(productsData)
        setFilteredProducts(productsData)
      } catch (error) {
        console.error('Error fetching products:', error)
        if (!isMounted) return;
        
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

  // Apply filters when filters change
  useEffect(() => {
    if (!products.length) return

    let filtered = [...products]

    // Apply category filter
    if (filters.category && filters.category !== 'all') {
      const categoryMap = {
        'mobile': 'Mobile Phones',
        'tv': 'TVs',
        'ac': 'ACs',
        'refrigerator': 'Refrigerators',
        'laptop': 'Laptops',
        'tablet': 'Tablets'
      }
      
      const targetCategory = categoryMap[filters.category]
      if (targetCategory) {
        filtered = filtered.filter(product => 
          product.deviceCategory === targetCategory
        )
      }
    }

    // Apply device category filter
    if (filters.deviceCategory) {
      filtered = filtered.filter(product => 
        product.deviceCategory === filters.deviceCategory
      )
    }

    // Apply brand filter
    if (filters.brand) {
      filtered = filtered.filter(product => 
        product.brand === filters.brand
      )
    }

    // Apply model filter
    if (filters.model) {
      filtered = filtered.filter(product => 
        product.model === filters.model
      )
    }

    // Apply search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(product => 
        product.name?.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.compatibility?.toLowerCase().includes(searchLower) ||
        product.brand?.toLowerCase().includes(searchLower) ||
        product.model?.toLowerCase().includes(searchLower) ||
        product.category?.toLowerCase().includes(searchLower)
      )
    }

    setFilteredProducts(filtered)
    
    // Reset to first page when filters change
    setCurrentPage(1)
  }, [filters, products])

  // Calculate current page products
  const getCurrentPageProducts = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredProducts.slice(startIndex, endIndex)
  }

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  // Calculate pagination info
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, filteredProducts.length)

  // Static fallback products
  const getStaticProducts = () => [
    {
      id: 1,
      name: "Phone Battery",
      sku: "ASCF5 Y3000A",
      price: 143.00,
      image: "/phone-battery.jpg",
      rating: 4.8,
      reviews: 24,
      featured: true,
      deviceCategory: "Mobile Phones",
      brand: "Samsung",
      model: "Galaxy S10",
      category: "Battery",
      stock: 15
    },
    {
      id: 2,
      name: "Laptop Charger",
      sku: "ASCAS-Y8200A",
      price: 143.00,
      image: "/laptop-charger.jpg",
      rating: 4.5,
      reviews: 18,
      featured: false,
      deviceCategory: "Laptops",
      brand: "Dell",
      model: "Inspiron 15",
      category: "Charger",
      stock: 8
    },
    {
      id: 3,
      name: "TV Remote",
      sku: "ASCAABEIJS2",
      price: 143.00,
      image: "/tv-remote.jpg",
      rating: 4.7,
      reviews: 32,
      featured: true,
      deviceCategory: "TVs",
      brand: "Samsung",
      model: "Smart TV 55",
      category: "Remote",
      stock: 25
    },
    {
      id: 4,
      name: "AC Fitter",
      sku: "ASP7.03C3",
      price: 143.00,
      image: "/ac-fitter.jpg",
      rating: 4.6,
      reviews: 15,
      featured: false,
      deviceCategory: "ACs",
      brand: "Voltas",
      model: "1.5 Ton",
      category: "Fitter",
      stock: 12
    },
    {
      id: 5,
      name: "TV Remote",
      sku: "TVECFHSS",
      price: 36.90,
      image: "/tv-remote-2.jpg",
      rating: 4.3,
      reviews: 9,
      featured: true,
      deviceCategory: "TVs",
      brand: "LG",
      model: "OLED TV",
      category: "Remote",
      stock: 20
    },
    {
      id: 6,
      name: "Refrigerator Shelf",
      sku: "FIDH31000371",
      price: 143.00,
      image: "/refrigerator-shelf.jpg",
      rating: 4.9,
      reviews: 27,
      featured: false,
      deviceCategory: "Refrigerators",
      brand: "Whirlpool",
      model: "Double Door",
      category: "Shelf",
      stock: 10
    },
    {
      id: 7,
      name: "Phone Battery",
      sku: "ASAAY 183BMH",
      price: 143.00,
      image: "/phone-battery-2.jpg",
      rating: 4.4,
      reviews: 21,
      featured: true,
      deviceCategory: "Mobile Phones",
      brand: "Apple",
      model: "iPhone 12",
      category: "Battery",
      stock: 18
    },
    {
      id: 8,
      name: "Laptop Charger",
      sku: "AN/OSTOAAL",
      price: 143.00,
      image: "/laptop-charger-2.jpg",
      rating: 4.7,
      reviews: 14,
      featured: false,
      deviceCategory: "Laptops",
      brand: "HP",
      model: "Pavilion",
      category: "Charger",
      stock: 6
    },
    {
      id: 9,
      name: "Refrigerator Shelf",
      sku: "F3ll430SCO34",
      price: 143.00,
      image: "/refrigerator-shelf-2.jpg",
      rating: 4.8,
      reviews: 19,
      featured: true,
      deviceCategory: "Refrigerators",
      brand: "Godrej",
      model: "Single Door",
      category: "Shelf",
      stock: 14
    }
  ]

  // Render star rating
  const renderRating = (rating) => {
    return (
      <div className="flex items-center">
        <div className="flex text-yellow-400">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"></path>
          </svg>
        </div>
        <span className="ml-1 text-xs text-gray-400">{rating} ({rating})</span>
      </div>
    )
  }

  if (loading) {
    return (
      <section id="products-grid" className="py-10 sm:py-16" style={{ backgroundColor: 'var(--panel-dark)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e60012]"></div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="products-grid" className="py-10 sm:py-16" style={{ backgroundColor: 'var(--panel-dark)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Results count */}
        <div className="mb-6">
          <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
            Showing {getCurrentPageProducts().length} of {filteredProducts.length} products (Page {currentPage} of {Math.ceil(filteredProducts.length / itemsPerPage)})
          </p>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {getCurrentPageProducts().map((product, index) => (
              <Link 
                key={product.id}
                href={`/spare-parts/${product.id}`}
                className={`group rounded-xl overflow-hidden transition-all transform ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                } transition-all duration-700`}
                style={{ 
                  backgroundColor: 'var(--panel-dark)', 
                  borderColor: 'var(--border-color)',
                  borderWidth: '1px',
                  transitionDelay: `${index * 100}ms` 
                }}
              >
                {/* Image Container */}
                <div className="relative overflow-hidden aspect-[4/3]">
                  <Image 
                    src={product.imageURL || product.image}
                    alt={product.name}
                    fill
                    className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    onError={(e) => {
                      e.target.onerror = null;
                      // Try to use a local fallback image
                      if (product.imageURL && !product.imageURL.includes('/')) {
                        e.target.src = product.image || "/phone-battery.jpg";
                      } else {
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' /%3E%3C/svg%3E";
                      }
                    }}
                    unoptimized={product.imageURL && product.imageURL.includes('cloudfront.net')}
                  />
                  
                  {/* Quick View Button (appears on hover) */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <span className="bg-white text-black rounded-full px-4 py-2 text-xs font-medium">
                        Quick View
                      </span>
                    </div>
                  </div>

                  {/* Stock indicator */}
                  {product.stock <= 5 && product.stock > 0 && (
                    <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                      Low Stock
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      Out of Stock
                    </div>
                  )}
                </div>
                
                {/* Product Details */}
                <div className="p-4 sm:p-5">
                  <div className="mb-1">
                    {renderRating(product.rating)}
                  </div>
                  
                  <h3 className="font-medium text-base sm:text-lg group-hover:text-[#e60012] transition-colors" style={{ color: 'var(--text-main)' }}>{product.name}</h3>
                  
                  {/* Device info */}
                  <div className="text-xs sm:text-sm mb-2 space-y-1" style={{ color: 'var(--text-secondary)' }}>
                    <p>{product.sku}</p>
                    {product.deviceCategory && (
                      <p className="text-[#e60012] font-medium">{product.deviceCategory}</p>
                    )}
                    {product.brand && product.model && (
                      <p>{product.brand} {product.model}</p>
                    )}
                  </div>
                  
                  <div className="text-[#e60012] font-bold text-sm sm:text-base mb-3">₹{product.price.toFixed(2)}</div>
                  
                  <div 
                    className={`py-2 px-4 rounded-lg text-center text-white text-sm opacity-80 group-hover:opacity-100 transition-opacity ${
                      product.stock === 0 ? 'bg-gray-500 cursor-not-allowed' : ''
                    }`}
                    style={{ 
                      background: product.featured && product.stock > 0
                        ? 'linear-gradient(to right, var(--accent-color), #ff6b6b)' 
                        : product.stock === 0 ? 'var(--panel-gray)' : 'var(--panel-gray)' 
                    }}
                  >
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </div>
                </div>
              </Link>
            ))}
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
              Try adjusting your filters or search terms
            </p>
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {filteredProducts.length > 0 && totalPages > 1 && (
        <div className="mt-8">
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={filteredProducts.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}
    </section>
  )
} 