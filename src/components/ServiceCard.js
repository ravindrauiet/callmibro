'use client'

import { useRouter } from 'next/navigation'

export default function ServiceCard({ title, description, icon }) {
  const router = useRouter()
  
  const handleBookNow = () => {
    // Create URL-friendly version of title
    const urlTitle = title.toLowerCase().replace(/ /g, '-')
    router.push(`/services/${urlTitle}`)
  }
  
  return (
    <div className="bg-[#111] rounded-lg p-4 sm:p-8 flex flex-col items-center text-center">
      <div className="text-[#e60012] mb-4 sm:mb-6">
        <img src={icon} alt={title} className="h-12 w-12 sm:h-16 sm:w-16" />
      </div>
      <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">{title}</h3>
      <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6">{description}</p>
      <button 
        onClick={handleBookNow}
        className="mt-auto border border-[#e60012] text-[#e60012] hover:bg-[#e60012] hover:text-white transition-colors duration-300 rounded-md px-4 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base"
      >
        Book Now
      </button>
    </div>
  )
} 