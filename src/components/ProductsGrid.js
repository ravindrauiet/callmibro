'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTheme } from '@/contexts/ThemeContext'

export default function ProductsGrid() {
  const [isVisible, setIsVisible] = useState(false)
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
  
  // Product data matching the image
  const products = [
    {
      id: 1,
      name: "Phone Battery",
      sku: "ASCF5 Y3000A",
      price: "₹143.00",
      image: "/phone-battery.jpg",
      rating: 4.8,
      reviews: 24,
      featured: true
    },
    {
      id: 2,
      name: "Laptop Charger",
      sku: "ASCAS-Y8200A",
      price: "₹143.00",
      image: "/laptop-charger.jpg",
      rating: 4.5,
      reviews: 18,
      featured: false
    },
    {
      id: 3,
      name: "TV Remote",
      sku: "ASCAABEIJS2",
      price: "₹143.00",
      image: "/tv-remote.jpg",
      rating: 4.7,
      reviews: 32,
      featured: true
    },
    {
      id: 4,
      name: "AC Fitter",
      sku: "ASP7.03C3",
      price: "₹143.00",
      image: "/ac-fitter.jpg",
      rating: 4.6,
      reviews: 15,
      featured: false
    },
    {
      id: 5,
      name: "TV Remote",
      sku: "TVECFHSS",
      price: "₹36.90",
      image: "/tv-remote-2.jpg",
      rating: 4.3,
      reviews: 9,
      featured: true
    },
    {
      id: 6,
      name: "Refrigerator Shelf",
      sku: "FIDH31000371",
      price: "₹143.00",
      image: "/refrigerator-shelf.jpg",
      rating: 4.9,
      reviews: 27,
      featured: false
    },
    {
      id: 7,
      name: "Phone Battery",
      sku: "ASAAY 183BMH",
      price: "₹143.00",
      image: "/phone-battery-2.jpg",
      rating: 4.4,
      reviews: 21,
      featured: true
    },
    {
      id: 8,
      name: "Laptop Charger",
      sku: "AN/OSTOAAL",
      price: "₹143.00",
      image: "/laptop-charger-2.jpg",
      rating: 4.7,
      reviews: 14,
      featured: false
    },
    {
      id: 9,
      name: "Refrigerator Shelf",
      sku: "F3ll430SCO34",
      price: "₹143.00",
      image: "/refrigerator-shelf-2.jpg",
      rating: 4.8,
      reviews: 19,
      featured: true
    }
  ];

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

  return (
    <section id="products-grid" className="py-10 sm:py-16" style={{ backgroundColor: 'var(--panel-dark)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {products.map((product, index) => (
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
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                
                {/* Quick View Button (appears on hover) */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <span className="bg-white text-black rounded-full px-4 py-2 text-xs font-medium">
                      Quick View
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Product Details */}
              <div className="p-4 sm:p-5">
                <div className="mb-1">
                  {renderRating(product.rating)}
                </div>
                
                <h3 className="font-medium text-base sm:text-lg group-hover:text-[#e60012] transition-colors" style={{ color: 'var(--text-main)' }}>{product.name}</h3>
                <p className="text-xs sm:text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>{product.sku}</p>
                <div className="text-[#e60012] font-bold text-sm sm:text-base mb-3">{product.price}</div>
                
                <div 
                  className={`py-2 px-4 rounded-lg text-center text-white text-sm opacity-80 group-hover:opacity-100 transition-opacity`}
                  style={{ 
                    background: product.featured 
                      ? 'linear-gradient(to right, var(--accent-color), #ff6b6b)' 
                      : 'var(--panel-gray)' 
                  }}
                >
                  Add to Cart
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
} 