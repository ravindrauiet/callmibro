import ServiceCard from './ServiceCard'
import { useState } from 'react'

export default function RepairServices() {
  const [deviceCategory, setDeviceCategory] = useState('Device Category')
  const [subCategory, setSubCategory] = useState('Sub-Category')
  const [location, setLocation] = useState('Location')

  // Service card data
  const services = [
    {
      id: 1,
      title: "Mobile Screen Repair",
      description: "Quick screen replacement in 30 mins",
      icon: "/icons/mobile-screen.svg",
    },
    {
      id: 2,
      title: "TV Diagnostics",
      description: "Quick screen replacement in 30 mins",
      icon: "/icons/tv.svg",
    },
    {
      id: 3,
      title: "AC Gas Refill",
      description: "Quick screen replacement in 30 mins",
      icon: "/icons/ac.svg",
    },
    {
      id: 4,
      title: "Battery Replacement",
      description: "Quick screen repaint-ment in 30 mins",
      icon: "/icons/battery.svg",
    },
    {
      id: 5,
      title: "Battery Replace-ment",
      description: "Quick [action] replacement in 30 mins",
      icon: "/icons/battery2.svg",
    },
    {
      id: 6,
      title: "Speaker Repair",
      description: "Quick repair-up repair in 30 mins",
      icon: "/icons/speaker.svg",
    }
  ]

  return (
    <section className="py-16 px-8 bg-black">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Our Repair Services</h1>
          <p className="text-gray-400 text-lg">Select your device category and get professional help.</p>
        </div>

        {/* Filter Section */}
        <div className="bg-[#111] rounded-lg p-6 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <select 
                className="w-full appearance-none bg-[#111] border border-[#333] rounded px-4 py-3 pr-8 text-white focus:outline-none focus:border-[#e60012]"
                value={deviceCategory}
                onChange={(e) => setDeviceCategory(e.target.value)}
              >
                <option>Device Category</option>
                <option>Mobile Phones</option>
                <option>TVs</option>
                <option>ACs</option>
                <option>Refrigerators</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>

            <div className="relative">
              <select 
                className="w-full appearance-none bg-[#111] border border-[#333] rounded px-4 py-3 pr-8 text-white focus:outline-none focus:border-[#e60012]"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
              >
                <option>Sub-Category</option>
                <option>Screen Repair</option>
                <option>Battery Replacement</option>
                <option>Speaker Repair</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>

            <div className="relative">
              <select 
                className="w-full appearance-none bg-[#111] border border-[#333] rounded px-4 py-3 pr-8 text-white focus:outline-none focus:border-[#e60012]"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option>Location</option>
                <option>New York</option>
                <option>Los Angeles</option>
                <option>Chicago</option>
                <option>Houston</option>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(service => (
            <ServiceCard 
              key={service.id}
              title={service.title}
              description={service.description}
              icon={service.icon}
            />
          ))}
        </div>
      </div>
    </section>
  )
} 