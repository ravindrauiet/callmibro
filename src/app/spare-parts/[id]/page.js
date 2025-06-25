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
  
  // Static data for development
  const getStaticProductById = (id) => {
    const products = [
      {
        id: "1",
        name: "Phone Battery",
        sku: "ASCF5 Y3000A",
        price: 143.00,
        image: "/phone-battery.jpg",
        images: ["/phone-battery.jpg", "/phone-battery-2.jpg"],
        rating: 4.8,
        reviews: 24,
        featured: true,
        category: "Phone Parts",
        stock: 15,
        description: "High-quality replacement battery for smartphones with long-lasting power and safety protection features. Compatible with multiple phone models.",
        specifications: "• Capacity: 3000mAh\n• Voltage: 3.85V\n• Type: Li-ion\n• Dimensions: 58.2 x 97.8 x 4.7mm\n• Weight: 46g\n• Warranty: 6 months",
        compatibility: "Compatible with Samsung Galaxy S10, S10+, S10e, and Note 10 series"
      },
      {
        id: "2",
        name: "Laptop Charger",
        sku: "ASCAS-Y8200A",
        price: 143.00,
        image: "/laptop-charger.jpg",
        images: ["/laptop-charger.jpg", "/laptop-charger-2.jpg"],
        rating: 4.5,
        reviews: 18,
        featured: false,
        category: "Laptop Accessories",
        stock: 8,
        description: "Universal laptop charger with multiple connectors for different laptop models. Features overvoltage protection and energy-efficient design.",
        specifications: "• Input: 100-240V, 50/60Hz\n• Output: 19.5V, 3.34A (65W)\n• Cable Length: 1.8m\n• Connector Tips: 8 different tips included\n• Protection: Short circuit, overvoltage, overcurrent\n• Warranty: 12 months",
        compatibility: "Compatible with most Dell, HP, Lenovo, Acer, and ASUS laptops"
      },
      {
        id: "3",
        name: "TV Remote",
        sku: "ASCAABEIJS2",
        price: 143.00,
        image: "/tv-remote.jpg",
        images: ["/tv-remote.jpg", "/tv-remote-2.jpg"],
        rating: 4.7,
        reviews: 32,
        featured: true,
        category: "TV Accessories",
        stock: 20,
        description: "Universal TV remote control compatible with major TV brands. Easy to set up and use with all standard functions and programmable buttons.",
        specifications: "• Power: 2 x AAA batteries (not included)\n• Range: Up to 10m\n• Buttons: 45 fully programmable buttons\n• Compatibility: Works with over 6000 TV models\n• Warranty: 12 months",
        compatibility: "Compatible with Samsung, LG, Sony, Panasonic, Philips, and other major TV brands"
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
        image: "/phone-battery.jpg",
        category: "Phone Parts"
      },
      {
        id: "2",
        name: "Laptop Charger",
        sku: "ASCAS-Y8200A",
        price: 143.00,
        image: "/laptop-charger.jpg",
        category: "Laptop Accessories"
      },
      {
        id: "3",
        name: "TV Remote",
        sku: "ASCAABEIJS2",
        price: 143.00,
        image: "/tv-remote.jpg",
        category: "TV Accessories"
      },
      {
        id: "4",
        name: "AC Fitter",
        sku: "ASP7.03C3",
        price: 143.00,
        image: "/ac-fitter.jpg",
        category: "AC Parts"
      },
      {
        id: "5",
        name: "TV Remote",
        sku: "TVECFHSS",
        price: 36.90,
        image: "/tv-remote-2.jpg",
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-lg overflow-hidden border" 
                style={{ 
                  backgroundColor: 'var(--panel-gray)',
                  borderColor: 'var(--border-color)'
                }}
              >
                <Image 
                  src={sparePart.images?.[activeImageIndex] || sparePart.image}
                  alt={sparePart.name}
                  fill
                  className="object-contain p-6"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              
              {/* Thumbnail Images */}
              {(sparePart.images?.length > 1 || (sparePart.image && sparePart.images?.length)) && (
                <div className="flex space-x-3">
                  {(sparePart.images || [sparePart.image]).map((img, index) => (
                    <button 
                      key={index}
                      className={`relative w-20 h-20 border rounded-md overflow-hidden ${
                        activeImageIndex === index ? 'border-[#e60012]' : ''
                      }`}
                      style={{ 
                        borderColor: activeImageIndex === index ? '#e60012' : 'var(--border-color)'
                      }}
                      onClick={() => setActiveImageIndex(index)}
                    >
                      <Image 
                        src={img}
                        alt={`${sparePart.name} thumbnail ${index + 1}`}
                        fill
                        className="object-contain p-2"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--text-main)' }}>{sparePart.name}</h1>
                <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>SKU: {sparePart.sku}</p>
                
                {/* Rating */}
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4" fill={i < Math.floor(sparePart.rating) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-2 text-sm" style={{ color: 'var(--text-secondary)' }}>{sparePart.rating} ({sparePart.reviews} reviews)</span>
                </div>
                
                {/* Price */}
                <div className="text-2xl font-bold text-[#e60012] mb-4">₹{sparePart.price.toFixed(2)}</div>
                
                {/* Availability */}
                <div className="flex items-center mb-6">
                  <span className="text-sm mr-2" style={{ color: 'var(--text-main)' }}>Availability:</span>
                  {sparePart.stock > 0 ? (
                    <span className="text-green-500 text-sm font-medium">In Stock ({sparePart.stock} available)</span>
                  ) : (
                    <span className="text-red-500 text-sm font-medium">Out of Stock</span>
                  )}
                </div>
                
                {/* Short Description */}
                <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>{sparePart.description}</p>
                
                {/* Quantity Selector */}
                <div className="flex items-center mb-6">
                  <span className="text-sm mr-4" style={{ color: 'var(--text-main)' }}>Quantity:</span>
                  <div className="flex border rounded-md" style={{ borderColor: 'var(--border-color)' }}>
                    <button 
                      className="px-3 py-1 text-lg border-r"
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
                      className="w-12 text-center bg-transparent border-none focus:outline-none"
                      style={{ color: 'var(--text-main)' }}
                    />
                    <button 
                      className="px-3 py-1 text-lg border-l"
                      style={{ borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= (sparePart.stock || 10)}
                    >
                      +
                    </button>
                  </div>
                </div>
                
                {/* Add to Cart Button */}
                <button 
                  onClick={handleAddToCart}
                  disabled={sparePart.stock <= 0}
                  className={`w-full py-3 rounded-lg text-white text-center font-medium ${
                    sparePart.stock > 0 
                      ? 'bg-gradient-to-r from-[#e60012] to-[#ff6b6b] hover:from-[#d40010] hover:to-[#e55b5b]' 
                      : 'bg-gray-600 cursor-not-allowed'
                  } transition-colors`}
                >
                  {sparePart.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Product Details Tabs */}
      <section className="py-10" style={{ backgroundColor: 'var(--bg-color)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          {/* Tabs */}
          <div className="flex border-b mb-6" style={{ borderColor: 'var(--border-color)' }}>
            <button 
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'description' 
                  ? 'text-[#e60012] border-b-2 border-[#e60012]' 
                  : 'hover:text-white'
              }`}
              style={{ 
                color: activeTab === 'description' ? '#e60012' : 'var(--text-secondary)'
              }}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button 
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'specifications' 
                  ? 'text-[#e60012] border-b-2 border-[#e60012]' 
                  : 'hover:text-white'
              }`}
              style={{ 
                color: activeTab === 'specifications' ? '#e60012' : 'var(--text-secondary)'
              }}
              onClick={() => setActiveTab('specifications')}
            >
              Specifications
            </button>
            <button 
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'compatibility' 
                  ? 'text-[#e60012] border-b-2 border-[#e60012]' 
                  : 'hover:text-white'
              }`}
              style={{ 
                color: activeTab === 'compatibility' ? '#e60012' : 'var(--text-secondary)'
              }}
              onClick={() => setActiveTab('compatibility')}
            >
              Compatibility
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--panel-dark)' }}>
            {activeTab === 'description' && (
              <div>
                <h3 className="text-xl font-medium mb-4" style={{ color: 'var(--text-main)' }}>Product Description</h3>
                <p className="whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>{sparePart.description}</p>
              </div>
            )}
            
            {activeTab === 'specifications' && (
              <div>
                <h3 className="text-xl font-medium mb-4" style={{ color: 'var(--text-main)' }}>Technical Specifications</h3>
                <p className="whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>{sparePart.specifications}</p>
              </div>
            )}
            
            {activeTab === 'compatibility' && (
              <div>
                <h3 className="text-xl font-medium mb-4" style={{ color: 'var(--text-main)' }}>Device Compatibility</h3>
                <p className="whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>{sparePart.compatibility}</p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-10 sm:py-16" style={{ backgroundColor: 'var(--panel-dark)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <h2 className="text-2xl font-bold mb-8" style={{ color: 'var(--text-main)' }}>Related Products</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <Link 
                  key={product.id}
                  href={`/spare-parts/${product.id}`}
                  className="group rounded-xl overflow-hidden transition-all hover:shadow-lg hover:shadow-[#e60012]/10"
                  style={{ 
                    backgroundColor: 'var(--panel-gray)',
                    borderColor: 'var(--border-color)',
                    borderWidth: '1px'
                  }}
                >
                  {/* Image Container */}
                  <div className="relative overflow-hidden aspect-[4/3]">
                    <Image 
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                  
                  {/* Product Details */}
                  <div className="p-4">
                    <h3 className="font-medium text-base group-hover:text-[#e60012] transition-colors" style={{ color: 'var(--text-main)' }}>{product.name}</h3>
                    <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>{product.sku}</p>
                    <div className="text-[#e60012] font-bold text-sm">₹{product.price.toFixed(2)}</div>
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
