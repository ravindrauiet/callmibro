'use client'

import ServiceCard from './ServiceCard'
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'

// Service card data - moved outside the component to prevent recreation on each render
const servicesData = [
  {
    id: 1,
    title: "Mobile Screen Repair",
    description: "Quick and professional screen replacement in 30 mins",
    icon: "/icons/mobile-screen.svg",
    category: "Mobile Phones",
    subCategory: "Screen Repair",
    color: "from-[#ff4b4b] to-[#ff7676]"
  },
  {
    id: 2,
    title: "TV Diagnostics",
    description: "Expert TV diagnostics and repair services",
    icon: "/icons/tv.svg",
    category: "TVs",
    subCategory: "Diagnostics",
    color: "from-[#3366ff] to-[#5c8aff]"
  },
  {
    id: 3,
    title: "AC Gas Refill",
    description: "Professional AC gas refill and maintenance",
    icon: "/icons/ac.svg",
    category: "ACs",
    subCategory: "Gas Refill",
    color: "from-[#00ccb8] to-[#39e5d5]"
  },
  {
    id: 4,
    title: "Battery Replacement",
    description: "Fast and reliable battery replacement services",
    icon: "/icons/battery.svg",
    category: "Mobile Phones",
    subCategory: "Battery Replacement",
    color: "from-[#ff4b4b] to-[#ff7676]"
  },
  {
    id: 5,
    title: "Refrigerator Repair",
    description: "Expert refrigerator troubleshooting and repair",
    icon: "/icons/battery2.svg",
    category: "Refrigerators",
    subCategory: "Repair",
    color: "from-[#6b46c1] to-[#8a63d2]"
  },
  {
    id: 6,
    title: "Speaker Repair",
    description: "Professional audio equipment repair services",
    icon: "/icons/speaker.svg",
    category: "Audio",
    subCategory: "Speaker Repair",
    color: "from-[#00ccb8] to-[#39e5d5]"
  }
]

export default function RepairServices() {
  const [deviceCategory, setDeviceCategory] = useState('Device Category')
  const [subCategory, setSubCategory] = useState('Sub-Category')
  const [location, setLocation] = useState('Location')
  const [filteredServices, setFilteredServices] = useState([])
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setIsVisible(true)
      }
    }, {
      threshold: 0.1
    })
    
    const element = document.getElementById('repair-services-section')
    if (element) observer.observe(element)
    
    return () => {
      if (element) observer.unobserve(element)
    }
  }, [])

  // Get unique categories and subcategories for filters
  const categories = useMemo(() => {
    return ['Device Category', ...new Set(servicesData.map(service => service.category))];
  }, []);
  
  const subCategories = useMemo(() => {
    return ['Sub-Category', ...new Set(servicesData.map(service => service.subCategory))];
  }, []);

  // Filter services based on selected filters
  useEffect(() => {
    let result = [...servicesData];
    
    if (deviceCategory !== 'Device Category') {
      result = result.filter(service => service.category === deviceCategory);
    }
    
    if (subCategory !== 'Sub-Category') {
      result = result.filter(service => service.subCategory === subCategory);
    }
    
    setFilteredServices(result);
  }, [deviceCategory, subCategory]); // Removed services from dependency array

  // Reset subcategory when category changes
  const handleCategoryChange = (e) => {
    setDeviceCategory(e.target.value);
    setSubCategory('Sub-Category');
  };

  return (
    <section id="repair-services-section" className="py-20 sm:py-28 px-4 sm:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-black to-[#111] -z-10"></div>
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#e60012]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#e60012]/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Section Heading */}
        <div 
          className={`mb-12 md:mb-16 text-center transform transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Find Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e60012] to-[#ff6b6b]">Repair Service</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Select your device category and get connected with our professional technicians
          </p>
        </div>

        {/* Filter Section */}
        <div 
          className={`bg-[#111] rounded-xl p-6 md:p-8 mb-12 border border-[#222] shadow-lg transform transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col">
              <label className="text-sm text-gray-400 mb-2 font-medium">Device Category</label>
              <div className="relative">
                <select 
                  className="w-full appearance-none bg-black border border-[#333] rounded-lg px-4 py-3 pr-10 text-white focus:outline-none focus:border-[#e60012] focus:ring-1 focus:ring-[#e60012]"
                  value={deviceCategory}
                  onChange={handleCategoryChange}
                >
                  {categories.map((category, index) => (
                    <option key={index} value={category}>{category}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-400 mb-2 font-medium">Service Type</label>
              <div className="relative">
                <select 
                  className="w-full appearance-none bg-black border border-[#333] rounded-lg px-4 py-3 pr-10 text-white focus:outline-none focus:border-[#e60012] focus:ring-1 focus:ring-[#e60012]"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                >
                  {subCategories.map((subCat, index) => (
                    <option key={index} value={subCat}>{subCat}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-400 mb-2 font-medium">Your Location</label>
              <div className="relative">
                <select 
                  className="w-full appearance-none bg-black border border-[#333] rounded-lg px-4 py-3 pr-10 text-white focus:outline-none focus:border-[#e60012] focus:ring-1 focus:ring-[#e60012]"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                >
                  <option>Location</option>
                  <option>Mumbai</option>
                  <option>Delhi</option>
                  <option>Bangalore</option>
                  <option>Hyderabad</option>
                  <option>Chennai</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredServices.length > 0 ? (
            filteredServices.map((service, index) => (
              <div 
                key={service.id}
                className={`transform transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 100 + 600}ms` }}
              >
                <ServiceCard 
                  title={service.title}
                  description={service.description}
                  icon={service.icon}
                  color={service.color}
                />
              </div>
            ))
          ) : (
            <div 
              className={`col-span-1 sm:col-span-2 lg:col-span-3 bg-[#111] border border-[#222] rounded-xl p-12 text-center transform transition-all duration-700 delay-600 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="text-gray-400 text-lg mb-4">No services match your filter criteria.</p>
              <button 
                onClick={() => {
                  setDeviceCategory('Device Category');
                  setSubCategory('Sub-Category');
                }}
                className="text-[#e60012] font-medium hover:text-white hover:underline"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
} 