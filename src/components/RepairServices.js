'use client'

import ServiceCard from './ServiceCard'
import { useState, useEffect } from 'react'

export default function RepairServices() {
  const [deviceCategory, setDeviceCategory] = useState('Device Category')
  const [subCategory, setSubCategory] = useState('Sub-Category')
  const [location, setLocation] = useState('Location')
  const [filteredServices, setFilteredServices] = useState([])

  // Service card data
  const services = [
    {
      id: 1,
      title: "Mobile Screen Repair",
      description: "Quick and professional screen replacement in 30 mins",
      icon: "/icons/mobile-screen.svg",
      category: "Mobile Phones",
      subCategory: "Screen Repair"
    },
    {
      id: 2,
      title: "TV Diagnostics",
      description: "Expert TV diagnostics and repair services",
      icon: "/icons/tv.svg",
      category: "TVs",
      subCategory: "Diagnostics"
    },
    {
      id: 3,
      title: "AC Gas Refill",
      description: "Professional AC gas refill and maintenance",
      icon: "/icons/ac.svg",
      category: "ACs",
      subCategory: "Gas Refill"
    },
    {
      id: 4,
      title: "Battery Replacement",
      description: "Fast and reliable battery replacement services",
      icon: "/icons/battery.svg",
      category: "Mobile Phones",
      subCategory: "Battery Replacement"
    },
    {
      id: 5,
      title: "Refrigerator Repair",
      description: "Expert refrigerator troubleshooting and repair",
      icon: "/icons/battery2.svg",
      category: "Refrigerators",
      subCategory: "Repair"
    },
    {
      id: 6,
      title: "Speaker Repair",
      description: "Professional audio equipment repair services",
      icon: "/icons/speaker.svg",
      category: "Audio",
      subCategory: "Speaker Repair"
    }
  ]

  // Filter services based on selected filters
  useEffect(() => {
    let result = [...services];
    
    if (deviceCategory !== 'Device Category') {
      result = result.filter(service => service.category === deviceCategory);
    }
    
    if (subCategory !== 'Sub-Category') {
      result = result.filter(service => service.subCategory === subCategory);
    }
    
    setFilteredServices(result);
  }, [deviceCategory, subCategory, services]);

  // Get unique categories and subcategories for filters
  const categories = ['Device Category', ...new Set(services.map(service => service.category))];
  const subCategories = ['Sub-Category', ...new Set(services.map(service => service.subCategory))];

  // Reset subcategory when category changes
  const handleCategoryChange = (e) => {
    setDeviceCategory(e.target.value);
    setSubCategory('Sub-Category');
  };

  return (
    <section className="py-10 sm:py-16 px-4 sm:px-8 bg-black">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">Our Repair Services</h1>
          <p className="text-gray-400 text-sm sm:text-lg">Select your device category and get professional help.</p>
        </div>

        {/* Filter Section */}
        <div className="bg-[#111] rounded-lg p-4 sm:p-6 mb-8 sm:mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="relative">
              <select 
                className="w-full appearance-none bg-[#111] border border-[#333] rounded px-3 sm:px-4 py-2 sm:py-3 pr-8 text-white focus:outline-none focus:border-[#e60012] text-sm sm:text-base"
                value={deviceCategory}
                onChange={handleCategoryChange}
              >
                {categories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>

            <div className="relative">
              <select 
                className="w-full appearance-none bg-[#111] border border-[#333] rounded px-3 sm:px-4 py-2 sm:py-3 pr-8 text-white focus:outline-none focus:border-[#e60012] text-sm sm:text-base"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
              >
                {subCategories.map((subCat, index) => (
                  <option key={index} value={subCat}>{subCat}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>

            <div className="relative">
              <select 
                className="w-full appearance-none bg-[#111] border border-[#333] rounded px-3 sm:px-4 py-2 sm:py-3 pr-8 text-white focus:outline-none focus:border-[#e60012] text-sm sm:text-base"
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
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredServices.length > 0 ? (
            filteredServices.map(service => (
              <ServiceCard 
                key={service.id}
                title={service.title}
                description={service.description}
                icon={service.icon}
              />
            ))
          ) : (
            <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-10">
              <p className="text-gray-400">No services match your filter criteria. Please try different filters.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
} 