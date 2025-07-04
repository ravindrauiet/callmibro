'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useTheme } from '@/contexts/ThemeContext'

export default function BundleDeals() {
  const [isVisible, setIsVisible] = useState(false)
  const [bundles, setBundles] = useState([])
  const [loading, setLoading] = useState(true)
  const { isDarkMode } = useTheme()
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setIsVisible(true)
      }
    }, {
      threshold: 0.2
    })
    
    const element = document.getElementById('bundle-deals-section')
    if (element) observer.observe(element)
    
    return () => {
      if (element) observer.unobserve(element)
    }
  }, [])

  // Fetch bundle deals from database
  useEffect(() => {
    const fetchBundleDeals = async () => {
      setLoading(true)
      try {
        const bundleDealsSnapshot = await getDocs(
          query(collection(db, 'bundleDeals'), where('isActive', '==', true), orderBy('createdAt', 'desc'))
        )
        
        const bundleDealsData = bundleDealsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        setBundles(bundleDealsData)
      } catch (error) {
        console.error('Error fetching bundle deals:', error)
        // Fallback to static data if database fails
        setBundles(getStaticBundles())
      } finally {
        setLoading(false)
      }
    }

    fetchBundleDeals()
  }, [])

  // Static fallback bundles
  const getStaticBundles = () => [
    {
      id: 1,
      title: "Device Protection Pack",
      description: "Screen protector, case & extended warranty",
      imageURL: "/product-deals.jpg",
      discount: "20% OFF",
      url: "/deals/protection-pack",
      featured: true,
      originalPrice: 2999,
      discountedPrice: 2399
    },
    {
      id: 2,
      title: "Complete Repair Bundle",
      description: "Screen, battery & diagnostic service",
      imageURL: "/bundle-deals.jpg",
      discount: "15% OFF",
      url: "/deals/repair-bundle",
      featured: false,
      originalPrice: 4999,
      discountedPrice: 4249
    }
  ]

  if (loading) {
    return (
      <section id="bundle-deals-section" className="py-20 sm:py-28 px-4 sm:px-8 relative overflow-hidden" style={{ 
        background: isDarkMode 
          ? 'linear-gradient(to bottom, var(--bg-color), var(--panel-dark))' 
          : 'linear-gradient(to bottom, var(--bg-color), var(--panel-charcoal))'
      }}>
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e60012]"></div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="bundle-deals-section" className="py-20 sm:py-28 px-4 sm:px-8 relative overflow-hidden" style={{ 
      background: isDarkMode 
        ? 'linear-gradient(to bottom, var(--bg-color), var(--panel-dark))' 
        : 'linear-gradient(to bottom, var(--bg-color), var(--panel-charcoal))'
    }}>
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-[#e60012]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-[#e60012]/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto max-w-6xl">
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
            <span className="text-[#e60012] text-sm font-medium">Special Offers</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Premium <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e60012] to-[#ff6b6b]">Bundle Deals</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)' }} className="max-w-2xl mx-auto">
            Save with our specially curated packages designed to give you maximum value
          </p>
        </div>
        
        {bundles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {bundles.map((bundle, index) => (
              <Link 
                href={bundle.url || '#'}
                key={bundle.id} 
                className={`group rounded-xl overflow-hidden transition-all hover:border-[#e60012] hover:shadow-lg hover:shadow-[#e60012]/10 transform ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                } transition-all duration-700 border`}
                style={{ 
                  transitionDelay: `${index * 100}ms`,
                  background: 'var(--panel-dark)',
                  borderColor: 'var(--border-color)'
                }}
              >
                <div className="relative h-48 sm:h-56 overflow-hidden">
                  {/* Image */}
                  <Image 
                    src={bundle.imageURL || bundle.image || "/product-deals.jpg"} 
                    alt={bundle.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/product-deals.jpg";
                    }}
                  />
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                  
                  {/* Discount Badge */}
                  {bundle.discount && (
                    <div className="absolute top-4 right-4 bg-white text-[#111] px-3 py-1 rounded-full font-bold text-sm">
                      {bundle.discount}
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-[#e60012] transition-colors">{bundle.title}</h3>
                  <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-5">{bundle.description}</p>
                  
                  {/* Price Display */}
                  {bundle.originalPrice && bundle.discountedPrice && (
                    <div className="mb-4">
                      <span className="line-through text-gray-500 text-sm">₹{bundle.originalPrice.toFixed(2)}</span>
                      <span className="text-[#e60012] font-bold text-lg ml-2">₹{bundle.discountedPrice.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <div className={`px-4 py-2 rounded-lg text-white ${bundle.featured ? 'bg-gradient-to-r from-[#e60012] to-[#ff6b6b]' : ''} flex items-center`}
                      style={!bundle.featured ? { background: 'var(--panel-gray)' } : {}}
                    >
                      <span className="font-medium">View Deal</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 transform group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No Bundle Deals Available</h3>
            <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
              Check back soon for amazing deals and offers!
            </p>
          </div>
        )}
      </div>
    </section>
  )
} 