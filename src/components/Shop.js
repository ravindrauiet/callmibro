'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Shop() {
  const [isVisible, setIsVisible] = useState(false)
  
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
  
  const products = [
    {
      name: "iPhone Battery",
      price: 1999.99,
      image: "/phone-battery.jpg",
      rating: 4.8,
      reviews: 126,
      url: "/spare-parts/phone-battery",
      featured: true,
      badge: "Bestseller"
    },
    {
      name: "Laptop Charger",
      price: 599.99,
      image: "/laptop-charger.jpg",
      rating: 4.5,
      reviews: 84,
      url: "/spare-parts/laptop-charger",
      featured: false
    },
    {
      name: "TV Remote",
      price: 499.99,
      image: "/tv-remote.jpg",
      rating: 4.7,
      reviews: 52,
      url: "/spare-parts/tv-remote",
      featured: true,
      badge: "New"
    }
  ]

  return (
    <section id="shop-section" className="py-20 sm:py-28 px-4 sm:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#111] to-black -z-10"></div>
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#e60012]/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-32 -right-32 w-72 h-72 bg-[#e60012]/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Section Heading */}
        <div 
          className={`mb-12 md:mb-16 text-center transform transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="inline-block bg-[#111] px-4 py-1 rounded-full mb-4 border border-[#333]">
            <span className="text-[#e60012] text-sm font-medium">Quality Parts</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Genuine <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e60012] to-[#ff6b6b]">Spare Parts</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Original components with warranty for all your device repair needs
          </p>
        </div>
        
        {/* Filter Options */}
        <div 
          className={`transform transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="bg-[#111] rounded-xl p-6 mb-8 border border-[#222] shadow-lg">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex-1">
                <label className="block text-sm text-gray-400 mb-2 font-medium">Device Category</label>
                <select className="w-full bg-black text-white p-2.5 border border-[#333] rounded-lg text-sm appearance-none focus:border-[#e60012] focus:outline-none focus:ring-1 focus:ring-[#e60012]">
                  <option>All Categories</option>
                  <option>Phones</option>
                  <option>Laptops</option>
                  <option>TVs</option>
                </select>
              </div>
              
              <div className="flex-1">
                <label className="block text-sm text-gray-400 mb-2 font-medium">Brand</label>
                <select className="w-full bg-black text-white p-2.5 border border-[#333] rounded-lg text-sm appearance-none focus:border-[#e60012] focus:outline-none focus:ring-1 focus:ring-[#e60012]">
                  <option>All Brands</option>
                  <option>Apple</option>
                  <option>Samsung</option>
                  <option>LG</option>
                </select>
              </div>
              
              <div className="flex-1">
                <label className="block text-sm text-gray-400 mb-2 font-medium">Model</label>
                <select className="w-full bg-black text-white p-2.5 border border-[#333] rounded-lg text-sm appearance-none focus:border-[#e60012] focus:outline-none focus:ring-1 focus:ring-[#e60012]">
                  <option>All Models</option>
                  <option>iPhone 14</option>
                  <option>Galaxy S22</option>
                  <option>OLED C2</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {products.map((product, index) => (
            <Link 
              href={product.url}
              key={index} 
              className={`group bg-[#111] border border-[#222] rounded-xl overflow-hidden transition-all hover:border-[#e60012] hover:shadow-lg hover:shadow-[#e60012]/10 transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              } transition-all duration-700`}
              style={{ transitionDelay: `${index * 100 + 400}ms` }}
            >
              {/* Image Container */}
              <div className="relative overflow-hidden aspect-[4/3]">
                <Image 
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                
                {/* Badge */}
                {product.badge && (
                  <div className="absolute top-3 left-3 bg-white text-black text-xs font-bold px-2 py-1 rounded-md">
                    {product.badge}
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
                  <span className="text-gray-500 mx-2">•</span>
                  <span className="text-gray-500">{product.reviews} reviews</span>
                </div>
                
                <h3 className="text-lg font-bold mb-1 group-hover:text-[#e60012] transition-colors">{product.name}</h3>
                <div className="text-[#e60012] font-medium mb-4">₹{product.price.toLocaleString()}</div>
                
                <div className={`mt-2 py-2 px-4 rounded-lg text-center text-white ${product.featured ? 'bg-gradient-to-r from-[#e60012] to-[#ff6b6b]' : 'bg-[#333]'} opacity-80 group-hover:opacity-100 transition-opacity`}>
                  View Details
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {/* "View All" Button */}
        <div className="mt-12 text-center">
          <Link 
            href="/spare-parts" 
            className="inline-block bg-transparent border-2 border-[#e60012] text-white hover:bg-[#e60012] px-6 py-3 rounded-full transition-colors duration-300"
          >
            Browse All Spare Parts
          </Link>
        </div>
      </div>
    </section>
  )
} 