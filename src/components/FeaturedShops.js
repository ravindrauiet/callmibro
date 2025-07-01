'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTheme } from '@/contexts/ThemeContext'
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { db } from '@/firebase/config'

export default function FeaturedShops() {
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isVisible, setIsVisible] = useState(false)
  const { isDarkMode } = useTheme()

  useEffect(() => {
    try {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true)
        }
      }, {
        threshold: 0.2
      })
      
      const element = document.getElementById('featured-shops-section')
      if (element) observer.observe(element)
      
      return () => {
        if (element) observer.unobserve(element)
      }
    } catch (err) {
      console.error('Error in FeaturedShops intersection observer:', err)
      // Default to visible if observer fails
      setIsVisible(true)
    }
  }, [])

  useEffect(() => {
    const fetchShops = async () => {
      setLoading(true)
      try {
        // Query for approved shop owners, ordered by rating
        const shopsQuery = query(
          collection(db, 'shopOwners'), 
          where('status', '==', 'approved'), 
          orderBy('rating', 'desc'), 
          limit(6)
        )
        
        const snapshot = await getDocs(shopsQuery)
        
        if (snapshot.empty) {
          // Use fallback data if no shops are found
          setShops(getFallbackShops())
        } else {
          const shopsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Default values for missing fields
            rating: doc.data().rating || 4.5,
            reviews: doc.data().reviews || Math.floor(Math.random() * 50) + 5,
            services: doc.data().services || ['Mobile Repair', 'Laptop Repair'],
            verified: doc.data().verified || false
          }))
          setShops(shopsData)
        }
      } catch (err) {
        console.error('Error fetching featured shops:', err)
        setError(err.message)
        // Use fallback data if fetch fails
        setShops(getFallbackShops())
      } finally {
        setLoading(false)
      }
    }
    
    fetchShops()
  }, [])

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
      imageUrl: "https://images.unsplash.com/photo-1588702547919-26089e690ecc?q=80&w=2070",
      featured: true
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
      imageUrl: "https://images.unsplash.com/photo-1581092921461-eab10380699b?q=80&w=2070",
      featured: true
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
      imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2070",
      featured: false
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
      imageUrl: "https://images.unsplash.com/photo-1576269483449-3b8b8d528ae1?q=80&w=2070",
      featured: false
    },
  ]

  return (
    <section id="featured-shops-section" className="py-16 px-4 sm:px-8">
      <div className="container mx-auto max-w-6xl">
        {/* Section Heading */}
        <div 
          className={`mb-10 text-center transform transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="inline-block px-4 py-1 rounded-full mb-4 border" style={{ 
            background: 'var(--panel-dark)', 
            borderColor: 'var(--border-color)' 
          }}>
            <span className="text-[#e60012] text-sm font-medium">Trusted Partners</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
            Featured <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e60012] to-[#ff6b6b]">Repair Shops</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)' }} className="max-w-2xl mx-auto text-sm sm:text-base">
            Discover top-rated repair shops in your area with expert technicians and quality service
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-8 p-4 bg-red-900/20 border border-red-900/50 rounded-lg text-center">
            <p className="text-red-400 text-sm">
              {error}. Please refresh the page to try again.
            </p>
          </div>
        )}

        {/* Shops Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop, index) => (
              <div
                key={shop.id}
                className={`rounded-xl border overflow-hidden transform transition-all duration-700 ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                } hover:shadow-lg hover:shadow-[#e60012]/10`}
                style={{ 
                  transitionDelay: `${index * 100}ms`,
                  backgroundColor: 'var(--panel-dark)', 
                  borderColor: shop.featured ? '#e60012' : 'var(--border-color)'
                }}
              >
                {/* Shop Image */}
                <div className="relative h-48 overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-cover bg-center" 
                    style={{ 
                      backgroundImage: `url(${shop.imageUrl || 'https://images.unsplash.com/photo-1581092921461-eab10380699b?q=80&w=2070'})` 
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
        )}
        
        {/* View All Button */}
        <div className="mt-10 text-center">
          <Link 
            href="/shops"
            className="inline-flex items-center px-6 py-2 rounded-full bg-gradient-to-r from-[#e60012] to-[#ff6b6b] text-white font-medium transition-transform hover:scale-105"
          >
            View All Shops
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
} 