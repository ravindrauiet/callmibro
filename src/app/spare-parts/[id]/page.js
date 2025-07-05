'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useTheme } from '@/contexts/ThemeContext'
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { toast } from 'react-hot-toast'

export default function SparePartDetail() {
  const { id } = useParams()
  const { isDarkMode } = useTheme()
  
  const [sparePart, setSparePart] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [activeTab, setActiveTab] = useState('description')
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [showFullSpecifications, setShowFullSpecifications] = useState(false)
  const [showFullCompatibility, setShowFullCompatibility] = useState(false)
  
  // Fetch spare part data
  useEffect(() => {
    const fetchSparePartData = async () => {
      try {
        setLoading(true)
        
        // Get spare part document
        const sparePartDoc = await getDoc(doc(db, 'spareParts', id))
        
        if (sparePartDoc.exists()) {
          const sparePartData = {
            id: sparePartDoc.id,
            ...sparePartDoc.data()
          }
          
          setSparePart(sparePartData)
          
          // Fetch related products in the same category
          if (sparePartData.category) {
            const relatedQuery = query(
              collection(db, 'spareParts'),
              where('category', '==', sparePartData.category),
              where('__name__', '!=', id),
              limit(4)
            )
            
            const relatedSnapshot = await getDocs(relatedQuery)
            const relatedData = relatedSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }))
            
            setRelatedProducts(relatedData)
          }
        } else {
          // If no document found, use static data for development
          const staticProduct = getStaticProductById(id)
          setSparePart(staticProduct)
          setRelatedProducts(getStaticRelatedProducts(staticProduct.category, id))
        }
      } catch (error) {
        console.error('Error fetching spare part:', error)
        toast.error('Failed to load product details')
        
        // Fallback to static data
        const staticProduct = getStaticProductById(id)
        setSparePart(staticProduct)
        setRelatedProducts(getStaticRelatedProducts(staticProduct.category, id))
      } finally {
        setLoading(false)
      }
    }
    
    fetchSparePartData()
  }, [id])
  
  // Handle quantity change
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= (sparePart?.stock || 10)) {
      setQuantity(newQuantity)
    }
  }
  
  // Add to cart function
  const handleAddToCart = () => {
    toast.success(`Added ${quantity} ${sparePart.name} to cart`)
    // Here you would implement actual cart functionality
  }
  
  // Handle image error
  const handleImageError = (e) => {
    console.error('Failed to load image:', e.target.src)
    e.target.onerror = null // Prevent infinite loop
    e.target.src = '/phone-battery.jpg' // Fallback image
  }

  // Handle image load success
  const handleImageLoad = (e) => {
    console.log('Image loaded successfully:', e.target.src)
  }
  
  // Static data for development
  const getStaticProductById = (id) => {
    const products = [
      {
        id: "1",
        name: "Phone Battery",
        sku: "ASCF5 Y3000A",
        price: 143.00,
        discount: 15,
        image: "/phone-battery.jpg",
        imageURL: null,
        images: ["/phone-battery.jpg", "/phone-battery-2.jpg"],
        rating: 4.8,
        reviews: 24,
        featured: true,
        category: "Phone Parts",
        stock: 15,
        description: "High-quality replacement battery for smartphones with long-lasting power and safety protection features. Compatible with multiple phone models.",
        specifications: "• Capacity: 3000mAh\n• Voltage: 3.85V\n• Type: Li-ion\n• Dimensions: 58.2 x 97.8 x 4.7mm\n• Weight: 46g\n• Warranty: 6 months",
        compatibility: "Compatible with Samsung Galaxy S10, S10+, S10e, and Note 10 series",
        warranty: "6 months",
        dimensions: "58.2 x 97.8 x 4.7mm",
        weight: "46g",
        color: "Black",
        material: "Lithium-ion",
        minOrderQuantity: 1,
        maxOrderQuantity: 10,
        leadTime: "2-3 business days",
        returnPolicy: "30 days return policy",
        installationGuide: "Professional installation recommended",
        safetyNotes: "Handle with care. Do not puncture or expose to extreme temperatures.",
        certifications: "CE, RoHS certified",
        countryOfOrigin: "China",
        manufacturer: "Samsung Electronics"
      },
      {
        id: "2",
        name: "Laptop Charger",
        sku: "ASCAS-Y8200A",
        price: 143.00,
        discount: 0,
        image: "/laptop-charger.jpg",
        imageURL: null,
        images: ["/laptop-charger.jpg", "/laptop-charger-2.jpg"],
        rating: 4.5,
        reviews: 18,
        featured: false,
        category: "Laptop Accessories",
        stock: 8,
        description: "Universal laptop charger with multiple connectors for different laptop models. Features overvoltage protection and energy-efficient design.",
        specifications: "• Input: 100-240V, 50/60Hz\n• Output: 19.5V, 3.34A (65W)\n• Cable Length: 1.8m\n• Connector Tips: 8 different tips included\n• Protection: Short circuit, overvoltage, overcurrent\n• Warranty: 12 months",
        compatibility: "Compatible with most Dell, HP, Lenovo, Acer, and ASUS laptops",
        warranty: "12 months",
        dimensions: "120 x 60 x 35mm",
        weight: "250g",
        color: "Black",
        material: "Plastic and metal",
        minOrderQuantity: 1,
        maxOrderQuantity: 5,
        leadTime: "1-2 business days",
        returnPolicy: "30 days return policy",
        installationGuide: "Plug and play - no installation required",
        safetyNotes: "Use only with compatible devices. Do not use in wet conditions.",
        certifications: "CE, FCC certified",
        countryOfOrigin: "China",
        manufacturer: "Universal Power Solutions"
      },
      {
        id: "3",
        name: "TV Remote",
        sku: "ASCAABEIJS2",
        price: 143.00,
        discount: 25,
        image: "/tv-remote.jpg",
        imageURL: null,
        images: ["/tv-remote.jpg", "/tv-remote-2.jpg"],
        rating: 4.7,
        reviews: 32,
        featured: true,
        category: "TV Accessories",
        stock: 20,
        description: "Universal TV remote control compatible with major TV brands. Easy to set up and use with all standard functions and programmable buttons.",
        specifications: "• Power: 2 x AAA batteries (not included)\n• Range: Up to 10m\n• Buttons: 45 fully programmable buttons\n• Compatibility: Works with over 6000 TV models\n• Warranty: 12 months",
        compatibility: "Compatible with Samsung, LG, Sony, Panasonic, Philips, and other major TV brands",
        warranty: "12 months",
        dimensions: "150 x 50 x 15mm",
        weight: "80g",
        color: "Black",
        material: "Plastic",
        minOrderQuantity: 1,
        maxOrderQuantity: 20,
        leadTime: "Same day dispatch",
        returnPolicy: "30 days return policy",
        installationGuide: "Insert batteries and follow setup instructions",
        safetyNotes: "Keep away from children. Dispose of batteries properly.",
        certifications: "CE, RoHS certified",
        countryOfOrigin: "China",
        manufacturer: "Universal Electronics"
      }
    ]
    
    const product = products.find(p => p.id === id) || products[0]
    return product
  }
  
  const getStaticRelatedProducts = (category, currentId) => {
    const products = [
      {
        id: "1",
        name: "Phone Battery",
        sku: "ASCF5 Y3000A",
        price: 143.00,
        discount: 15,
        image: "/phone-battery.jpg",
        imageURL: null,
        category: "Phone Parts"
      },
      {
        id: "2",
        name: "Laptop Charger",
        sku: "ASCAS-Y8200A",
        price: 143.00,
        discount: 0,
        image: "/laptop-charger.jpg",
        imageURL: null,
        category: "Laptop Accessories"
      },
      {
        id: "3",
        name: "TV Remote",
        sku: "ASCAABEIJS2",
        price: 143.00,
        discount: 25,
        image: "/tv-remote.jpg",
        imageURL: null,
        category: "TV Accessories"
      },
      {
        id: "4",
        name: "AC Fitter",
        sku: "ASP7.03C3",
        price: 143.00,
        discount: 10,
        image: "/ac-fitter.jpg",
        imageURL: null,
        category: "AC Parts"
      },
      {
        id: "5",
        name: "TV Remote",
        sku: "TVECFHSS",
        price: 36.90,
        discount: 5,
        image: "/tv-remote-2.jpg",
        imageURL: null,
        category: "TV Accessories"
      }
    ]
    
    return products
      .filter(p => p.category === category && p.id !== currentId)
      .slice(0, 4)
  }
  
  if (loading) {
    return (
      <main className="min-h-screen">
        <Header activePage="spare-parts" />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e60012]"></div>
        </div>
        <Footer />
      </main>
    )
  }
  
  if (!sparePart) {
    return (
      <main className="min-h-screen">
        <Header activePage="spare-parts" />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-main)' }}>Product Not Found</h1>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>The spare part you're looking for doesn't exist or has been removed.</p>
          <Link 
            href="/spare-parts" 
            className="inline-block bg-[#e60012] text-white px-6 py-3 rounded-full hover:bg-[#d40010] transition-colors"
          >
            Back to Spare Parts
          </Link>
        </div>
        <Footer />
      </main>
    )
  }
  
  // Get all images including additional images
  const getAllImages = () => {
    const images = []
    
    // Add main image
    if (sparePart.imageURL) {
      images.push(sparePart.imageURL)
    } else if (sparePart.image) {
      images.push(sparePart.image)
    }
    
    // Add additional images
    if (sparePart.additionalImages && Array.isArray(sparePart.additionalImages)) {
      images.push(...sparePart.additionalImages.filter(url => url && url.trim()))
    }
    
    // Add images array if exists
    if (sparePart.images && Array.isArray(sparePart.images)) {
      images.push(...sparePart.images.filter(url => url && url.trim()))
    }
    
    return [...new Set(images)] // Remove duplicates
  }

  const allImages = getAllImages()
  
  return (
    <main className="min-h-screen">
      <Header activePage="spare-parts" />
      
      {/* Breadcrumbs */}
      <div className="py-3" style={{ backgroundColor: 'var(--panel-dark)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center text-sm">
            <Link href="/" className="hover:text-[#e60012]" style={{ color: 'var(--text-secondary)' }}>Home</Link>
            <span className="mx-2" style={{ color: 'var(--text-secondary)' }}>/</span>
            <Link href="/spare-parts" className="hover:text-[#e60012]" style={{ color: 'var(--text-secondary)' }}>Spare Parts</Link>
            <span className="mx-2" style={{ color: 'var(--text-secondary)' }}>/</span>
            <span className="text-[#e60012]">{sparePart.name}</span>
          </div>
        </div>
      </div>
      
      {/* Product Details Section */}
      <section className="py-10 sm:py-16" style={{ backgroundColor: 'var(--panel-dark)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Add custom styles for scrollbar */}
            <style jsx>{`
              .scrollbar-hide {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
              .line-clamp-3 {
                display: -webkit-box;
                -webkit-line-clamp: 3;
                -webkit-box-orient: vertical;
                overflow: hidden;
              }
              .line-clamp-4 {
                display: -webkit-box;
                -webkit-line-clamp: 4;
                -webkit-box-orient: vertical;
                overflow: hidden;
              }
              .line-clamp-2 {
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
              }
            `}</style>
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square rounded-xl overflow-hidden border shadow-lg group" 
                style={{ 
                  backgroundColor: 'var(--panel-gray)',
                  borderColor: 'var(--border-color)'
                }}
              >
                <Image 
                  src={allImages[activeImageIndex] || sparePart.imageURL || sparePart.image}
                  alt={sparePart.name}
                  fill
                  className="object-contain p-6 transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                  unoptimized
                  priority
                />
                
                {/* Enhanced overlay with zoom effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                
                {/* Navigation arrows */}
                {allImages.length > 1 && (
                  <>
                    <button 
                      onClick={() => setActiveImageIndex(activeImageIndex > 0 ? activeImageIndex - 1 : allImages.length - 1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => setActiveImageIndex(activeImageIndex < allImages.length - 1 ? activeImageIndex + 1 : 0)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
                
                {/* Image counter */}
                {allImages.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                    {activeImageIndex + 1} / {allImages.length}
                  </div>
                )}
                
                {/* Stock indicator */}
                {sparePart.stock <= 5 && sparePart.stock > 0 && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                    ⚠️ Low Stock
                  </div>
                )}
                {sparePart.stock === 0 && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                    ❌ Out of Stock
                  </div>
                )}
                
                {/* Featured badge */}
                {sparePart.featured && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                    ⭐ Featured
                  </div>
                )}
              </div>
              
              {/* Enhanced Thumbnail Images */}
              {allImages.length > 1 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>Product Images ({allImages.length})</h3>
                  <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                    {allImages.map((img, index) => (
                      <button 
                        key={index}
                        className={`relative w-16 h-16 border rounded-lg overflow-hidden flex-shrink-0 transition-all duration-300 group ${
                          activeImageIndex === index 
                            ? 'border-[#e60012] shadow-md scale-105' 
                            : 'border-gray-300 hover:border-[#e60012]/50 hover:scale-105'
                        }`}
                        onClick={() => setActiveImageIndex(index)}
                      >
                        <Image 
                          src={img}
                          alt={`${sparePart.name} thumbnail ${index + 1}`}
                          fill
                          className="object-contain p-2 transition-transform duration-300 group-hover:scale-110"
                          onError={handleImageError}
                          onLoad={handleImageLoad}
                          unoptimized
                        />
                        
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        {/* Active indicator */}
                        {activeImageIndex === index && (
                          <div className="absolute top-1 right-1 w-3 h-3 bg-[#e60012] rounded-full"></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Product Info */}
            <div className="space-y-6">
              {/* Product Header */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  {sparePart.sku && (
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
                      SKU: {sparePart.sku}
                    </span>
                  )}
                  {sparePart.category && (
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full font-medium">
                      {sparePart.category}
                    </span>
                  )}
                </div>
                
                <h1 className="text-3xl sm:text-4xl font-bold leading-tight" style={{ color: 'var(--text-main)' }}>
                  {sparePart.name}
                </h1>
                
                {/* Rating and Reviews */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5" fill={i < Math.floor(sparePart.rating) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      {sparePart.rating} ({sparePart.reviews} reviews)
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Price Section */}
              <div className="bg-gradient-to-r from-[#e60012] to-[#ff6b6b] rounded-xl p-6 text-white shadow-xl relative overflow-hidden">
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12"></div>
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-baseline space-x-2 mb-2">
                    <span className="text-4xl font-bold">₹{sparePart.price.toFixed(2)}</span>
                    <span className="text-sm opacity-90">+ GST</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="flex items-center space-x-1">
                      <span className="text-green-300">🚚</span>
                      <span className="opacity-90">Free shipping</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-300">⚡</span>
                      <span className="opacity-90">Fast delivery</span>
                    </div>
                  </div>
                  
                  {/* Price comparison */}
                  {sparePart.discount && sparePart.discount > 0 && (
                    <div className="mt-3 text-xs opacity-75">
                      <span className="line-through">₹{(sparePart.price / (1 - sparePart.discount / 100)).toFixed(2)}</span>
                      <span className="ml-2 bg-green-500 px-2 py-1 rounded-full">Save {sparePart.discount}%</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Compact Availability */}
              <div className="flex items-center justify-between p-3 rounded-lg border" style={{ 
                backgroundColor: 'var(--panel-gray)',
                borderColor: 'var(--border-color)'
              }}>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>Availability:</span>
                  {sparePart.stock > 0 ? (
                    <span className="text-green-500 text-sm">✓ In Stock ({sparePart.stock})</span>
                  ) : (
                    <span className="text-red-500 text-sm">✗ Out of Stock</span>
                  )}
                </div>
                {sparePart.leadTime && (
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Lead: {sparePart.leadTime}</span>
                )}
              </div>
              
              {/* Enhanced Product Info Cards */}
              {(sparePart.brand || sparePart.model || sparePart.deviceCategory || sparePart.warranty) && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium flex items-center" style={{ color: 'var(--text-main)' }}>
                    <span className="mr-2">📋</span> Product Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {sparePart.deviceCategory && (
                      <div className="p-3 rounded-lg border transition-all hover:shadow-md" style={{ 
                        backgroundColor: 'var(--panel-gray)',
                        borderColor: 'var(--border-color)'
                      }}>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full">📱</span>
                          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Category</span>
                        </div>
                        <p className="font-medium text-sm" style={{ color: 'var(--text-main)' }}>{sparePart.deviceCategory}</p>
                      </div>
                    )}
                    {sparePart.brand && (
                      <div className="p-3 rounded-lg border transition-all hover:shadow-md" style={{ 
                        backgroundColor: 'var(--panel-gray)',
                        borderColor: 'var(--border-color)'
                      }}>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded-full">🏷️</span>
                          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Brand</span>
                        </div>
                        <p className="font-medium text-sm" style={{ color: 'var(--text-main)' }}>{sparePart.brand}</p>
                      </div>
                    )}
                    {sparePart.model && (
                      <div className="p-3 rounded-lg border transition-all hover:shadow-md" style={{ 
                        backgroundColor: 'var(--panel-gray)',
                        borderColor: 'var(--border-color)'
                      }}>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-600 rounded-full">📐</span>
                          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Model</span>
                        </div>
                        <p className="font-medium text-sm" style={{ color: 'var(--text-main)' }}>{sparePart.model}</p>
                      </div>
                    )}
                    {sparePart.warranty && (
                      <div className="p-3 rounded-lg border transition-all hover:shadow-md" style={{ 
                        backgroundColor: 'var(--panel-gray)',
                        borderColor: 'var(--border-color)'
                      }}>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-600 rounded-full">🛡️</span>
                          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Warranty</span>
                        </div>
                        <p className="font-medium text-sm" style={{ color: 'var(--text-main)' }}>{sparePart.warranty}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Short Description */}
              <div className="p-4 rounded-xl border" style={{ 
                backgroundColor: 'var(--panel-gray)',
                borderColor: 'var(--border-color)'
              }}>
                <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>Description</h3>
                <div className={`${!showFullDescription && sparePart.description.length > 150 ? 'line-clamp-2' : ''}`}>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{sparePart.description}</p>
                </div>
                {sparePart.description.length > 150 && (
                  <button 
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="mt-2 text-[#e60012] hover:text-[#d40010] font-medium transition-colors text-xs"
                  >
                    {showFullDescription ? 'Show Less' : 'Read More'}
                  </button>
                )}
              </div>
              
              {/* Quantity Selector */}
              <div className="space-y-3">
                <label className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>Quantity:</label>
                <div className="flex items-center space-x-3">
                  <div className="flex border rounded-lg overflow-hidden" style={{ borderColor: 'var(--border-color)' }}>
                    <button 
                      className="px-4 py-2 text-lg border-r hover:bg-gray-100 transition-colors"
                      style={{ borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <input 
                      type="number" 
                      min="1"
                      max={sparePart.stock || 10}
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      className="w-16 text-center bg-transparent border-none focus:outline-none font-medium"
                      style={{ color: 'var(--text-main)' }}
                    />
                    <button 
                      className="px-4 py-2 text-lg border-l hover:bg-gray-100 transition-colors"
                      style={{ borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= (sparePart.stock || 10)}
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {sparePart.stock} available
                  </span>
                </div>
              </div>
              
              {/* Enhanced Action Buttons */}
              <div className="space-y-4">
                <button 
                  onClick={handleAddToCart}
                  disabled={sparePart.stock <= 0}
                  className={`w-full py-4 rounded-xl text-white text-center font-semibold text-lg transition-all duration-300 transform relative overflow-hidden ${
                    sparePart.stock > 0 
                      ? 'bg-gradient-to-r from-[#e60012] to-[#ff6b6b] hover:from-[#d40010] hover:to-[#e55b5b] hover:shadow-xl hover:scale-105 active:scale-95' 
                      : 'bg-gray-600 cursor-not-allowed'
                  }`}
                >
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
                  
                  <div className="relative flex items-center justify-center space-x-3">
                    <span className="text-2xl">🛒</span>
                    <span>{sparePart.stock > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
                    {sparePart.stock > 0 && <span className="text-sm opacity-75">→</span>}
                  </div>
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    className="w-full py-3 rounded-xl border text-center font-medium transition-all duration-300 hover:bg-blue-50 hover:scale-105 active:scale-95 text-sm group"
                    style={{ 
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-main)'
                    }}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-lg group-hover:scale-110 transition-transform">💬</span>
                      <span>Support</span>
                    </div>
                  </button>
                  
                  <button 
                    className="w-full py-3 rounded-xl border text-center font-medium transition-all duration-300 hover:bg-red-50 hover:scale-105 active:scale-95 text-sm group"
                    style={{ 
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-main)'
                    }}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-lg group-hover:scale-110 transition-transform">❤️</span>
                      <span>Wishlist</span>
                    </div>
                  </button>
                </div>
                
                {/* Quick features */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center p-2 rounded-lg bg-green-50 text-green-700">
                    <div className="text-lg mb-1">🚚</div>
                    <div>Free Shipping</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-blue-50 text-blue-700">
                    <div className="text-lg mb-1">🔄</div>
                    <div>Easy Returns</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-purple-50 text-purple-700">
                    <div className="text-lg mb-1">🛡️</div>
                    <div>Warranty</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Product Details Tabs */}
      <section className="py-10" style={{ backgroundColor: 'var(--bg-color)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          {/* Tabs */}
          <div className="flex flex-wrap border-b mb-8 overflow-x-auto scrollbar-hide" style={{ borderColor: 'var(--border-color)' }}>
            <button 
              className={`px-4 sm:px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                activeTab === 'description' 
                  ? 'text-[#e60012] border-b-2 border-[#e60012]' 
                  : 'hover:text-white'
              }`}
              style={{ 
                color: activeTab === 'description' ? '#e60012' : 'var(--text-secondary)'
              }}
              onClick={() => setActiveTab('description')}
            >
              📝 Description
            </button>
            <button 
              className={`px-4 sm:px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                activeTab === 'specifications' 
                  ? 'text-[#e60012] border-b-2 border-[#e60012]' 
                  : 'hover:text-white'
              }`}
              style={{ 
                color: activeTab === 'specifications' ? '#e60012' : 'var(--text-secondary)'
              }}
              onClick={() => setActiveTab('specifications')}
            >
              ⚙️ Specs
            </button>
            <button 
              className={`px-4 sm:px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                activeTab === 'compatibility' 
                  ? 'text-[#e60012] border-b-2 border-[#e60012]' 
                  : 'hover:text-white'
              }`}
              style={{ 
                color: activeTab === 'compatibility' ? '#e60012' : 'var(--text-secondary)'
              }}
              onClick={() => setActiveTab('compatibility')}
            >
              🔧 Compat
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="rounded-2xl p-8" style={{ backgroundColor: 'var(--panel-dark)' }}>
            {activeTab === 'description' && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <h3 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>📝 Product Description</h3>
                  <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    Detailed Info
                  </div>
                </div>
                
                <div className="space-y-6">
                  {/* Main Description */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="text-2xl">📖</span>
                      <h4 className="text-lg font-semibold" style={{ color: 'var(--text-main)' }}>About This Product</h4>
                    </div>
                    
                    <div className={`${!showFullDescription && sparePart.description.length > 200 ? 'line-clamp-3' : ''}`}>
                      <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{sparePart.description}</p>
                    </div>
                    
                    {sparePart.description.length > 200 && (
                      <button 
                        onClick={() => setShowFullDescription(!showFullDescription)}
                        className="mt-4 text-[#e60012] hover:text-[#d40010] font-medium transition-colors flex items-center space-x-1"
                      >
                        <span>{showFullDescription ? 'Show Less' : 'Read More'}</span>
                        <span className="text-sm">{showFullDescription ? '↑' : '↓'}</span>
                      </button>
                    )}
                  </div>
                  
                  {/* Product Features */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="text-2xl">✨</span>
                      <h4 className="text-lg font-semibold" style={{ color: 'var(--text-main)' }}>Key Features</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <div className="flex items-start space-x-2">
                        <span className="text-blue-500 mt-1">✓</span>
                        <span>High-quality replacement part</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-blue-500 mt-1">✓</span>
                        <span>Compatible with multiple devices</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-blue-500 mt-1">✓</span>
                        <span>Easy installation process</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-blue-500 mt-1">✓</span>
                        <span>Warranty included</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Additional product details */}
                  {(sparePart.material || sparePart.color || sparePart.dimensions || sparePart.weight) && (
                    <div className="bg-white rounded-xl border shadow-sm" style={{ borderColor: 'var(--border-color)' }}>
                      <div className="p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">📐</span>
                          <h4 className="text-lg font-semibold" style={{ color: 'var(--text-main)' }}>Physical Details</h4>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6">
                        {sparePart.material && (
                          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                            <span className="text-lg">🏭</span>
                            <div>
                              <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Material</p>
                              <p className="font-medium" style={{ color: 'var(--text-main)' }}>{sparePart.material}</p>
                            </div>
                          </div>
                        )}
                        {sparePart.color && (
                          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                            <span className="text-lg">🎨</span>
                            <div>
                              <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Color</p>
                              <p className="font-medium" style={{ color: 'var(--text-main)' }}>{sparePart.color}</p>
                            </div>
                          </div>
                        )}
                        {sparePart.dimensions && (
                          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                            <span className="text-lg">📏</span>
                            <div>
                              <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Dimensions</p>
                              <p className="font-medium" style={{ color: 'var(--text-main)' }}>{sparePart.dimensions}</p>
                            </div>
                          </div>
                        )}
                        {sparePart.weight && (
                          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                            <span className="text-lg">⚖️</span>
                            <div>
                              <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Weight</p>
                              <p className="font-medium" style={{ color: 'var(--text-main)' }}>{sparePart.weight}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'specifications' && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <h3 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>⚙️ Technical Specifications</h3>
                  <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    Premium Quality
                  </div>
                </div>
                
                <div className="space-y-6">
                  {/* Main Specifications */}
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="text-2xl">📊</span>
                      <h4 className="text-lg font-semibold" style={{ color: 'var(--text-main)' }}>Key Specifications</h4>
                    </div>
                    
                    <div className={`${!showFullSpecifications && sparePart.specifications.length > 300 ? 'line-clamp-4' : ''}`}>
                      <div className="whitespace-pre-line text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {sparePart.specifications}
                      </div>
                    </div>
                    
                    {sparePart.specifications.length > 300 && (
                      <button 
                        onClick={() => setShowFullSpecifications(!showFullSpecifications)}
                        className="mt-4 text-[#e60012] hover:text-[#d40010] font-medium transition-colors flex items-center space-x-1"
                      >
                        <span>{showFullSpecifications ? 'Show Less' : 'Read More'}</span>
                        <span className="text-sm">{showFullSpecifications ? '↑' : '↓'}</span>
                      </button>
                    )}
                  </div>
                  
                  {/* Specifications table */}
                  {(sparePart.manufacturer || sparePart.countryOfOrigin || sparePart.certifications) && (
                    <div className="bg-white rounded-xl border shadow-sm" style={{ borderColor: 'var(--border-color)' }}>
                      <div className="p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">🏭</span>
                          <h4 className="text-lg font-semibold" style={{ color: 'var(--text-main)' }}>Manufacturing Details</h4>
                        </div>
                      </div>
                      
                      <div className="overflow-hidden">
                        <table className="min-w-full">
                          <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                            {sparePart.manufacturer && (
                              <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-main)' }}>🏭 Manufacturer</td>
                                <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{sparePart.manufacturer}</td>
                              </tr>
                            )}
                            {sparePart.countryOfOrigin && (
                              <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-main)' }}>🌍 Country of Origin</td>
                                <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{sparePart.countryOfOrigin}</td>
                              </tr>
                            )}
                            {sparePart.certifications && (
                              <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-main)' }}>🏆 Certifications</td>
                                <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{sparePart.certifications}</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  
                  {/* Quality Assurance */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="text-2xl">✅</span>
                      <h4 className="text-lg font-semibold" style={{ color: 'var(--text-main)' }}>Quality Assurance</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <div className="flex items-center space-x-2">
                        <span className="text-green-500">✓</span>
                        <span>Rigorous Testing</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-green-500">✓</span>
                        <span>Quality Control</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-green-500">✓</span>
                        <span>Warranty Coverage</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'compatibility' && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <h3 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>🔧 Device Compatibility</h3>
                  <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    ✓ Verified
                  </div>
                </div>
                
                <div className="space-y-6">
                  {/* Compatibility Overview */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="text-2xl">📱</span>
                      <h4 className="text-lg font-semibold" style={{ color: 'var(--text-main)' }}>Compatible Devices</h4>
                    </div>
                    
                    <div className={`${!showFullCompatibility && sparePart.compatibility.length > 300 ? 'line-clamp-4' : ''}`}>
                      <div className="whitespace-pre-line text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {sparePart.compatibility}
                      </div>
                    </div>
                    
                    {sparePart.compatibility.length > 300 && (
                      <button 
                        onClick={() => setShowFullCompatibility(!showFullCompatibility)}
                        className="mt-4 text-[#e60012] hover:text-[#d40010] font-medium transition-colors flex items-center space-x-1"
                      >
                        <span>{showFullCompatibility ? 'Show Less' : 'Read More'}</span>
                        <span className="text-sm">{showFullCompatibility ? '↑' : '↓'}</span>
                      </button>
                    )}
                  </div>
                  
                  {/* Installation and safety info */}
                  {(sparePart.installationGuide || sparePart.safetyNotes) && (
                    <div className="space-y-4">
                      {sparePart.installationGuide && (
                        <div className="p-6 rounded-xl border transition-all hover:shadow-lg" style={{ 
                          backgroundColor: 'var(--panel-gray)',
                          borderColor: 'var(--border-color)'
                        }}>
                          <div className="flex items-center space-x-3 mb-4">
                            <span className="text-2xl">📋</span>
                            <h4 className="text-lg font-semibold" style={{ color: 'var(--text-main)' }}>Installation Guide</h4>
                          </div>
                          <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{sparePart.installationGuide}</p>
                        </div>
                      )}
                      
                      {sparePart.safetyNotes && (
                        <div className="p-6 rounded-xl border border-orange-200 transition-all hover:shadow-lg" style={{ 
                          backgroundColor: 'rgba(251, 191, 36, 0.1)'
                        }}>
                          <div className="flex items-center space-x-3 mb-4">
                            <span className="text-2xl">⚠️</span>
                            <h4 className="text-lg font-semibold text-orange-800">Safety Notes</h4>
                          </div>
                          <p className="text-base leading-relaxed text-orange-700">{sparePart.safetyNotes}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Compatibility Tips */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="text-2xl">💡</span>
                      <h4 className="text-lg font-semibold" style={{ color: 'var(--text-main)' }}>Pro Tips</h4>
                    </div>
                    <div className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <div className="flex items-start space-x-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Always verify your device model before purchase</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Professional installation recommended for complex parts</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Contact our support team for compatibility questions</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-10 sm:py-16" style={{ backgroundColor: 'var(--panel-dark)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: 'var(--text-main)' }}>Related Products</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <Link 
                  key={product.id}
                  href={`/spare-parts/${product.id}`}
                  className="group rounded-2xl overflow-hidden transition-all hover:shadow-xl hover:shadow-[#e60012]/10 hover:scale-105"
                  style={{ 
                    backgroundColor: 'var(--panel-gray)',
                    borderColor: 'var(--border-color)',
                    borderWidth: '1px'
                  }}
                >
                  {/* Image Container */}
                  <div className="relative overflow-hidden aspect-[4/3]">
                    <Image 
                      src={product.imageURL || product.image}
                      alt={product.name}
                      fill
                      className="object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      onError={handleImageError}
                      onLoad={handleImageLoad}
                      unoptimized
                    />
                    
                    {/* Quick View Overlay */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <span className="bg-white text-black rounded-full px-4 py-2 text-xs font-medium">
                          View Details
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Product Details */}
                  <div className="p-4">
                    <h3 className="font-semibold text-base group-hover:text-[#e60012] transition-colors mb-2" style={{ color: 'var(--text-main)' }}>
                      {product.name}
                    </h3>
                    <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>{product.sku}</p>
                    <div className="text-[#e60012] font-bold text-lg">₹{product.price.toFixed(2)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      
      <Footer />
    </main>
  )
} 
