'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function ServiceCard({ title, description, icon, color = "from-[#e60012] to-[#ff6b6b]" }) {
  // Create URL-friendly version of title for the link
  const urlTitle = title.toLowerCase().replace(/ /g, '-')
  const targetUrl = `/services/${urlTitle}`
  
  return (
    <div className="group bg-[#111] rounded-xl h-full border border-[#222] hover:border-[#e60012] hover:shadow-lg hover:shadow-[#e60012]/10 transition-all duration-300 overflow-hidden flex flex-col">
      <div className="p-4 sm:p-5 md:p-6 flex-1 flex flex-col">
        {/* Icon */}
        <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mb-4 sm:mb-5 md:mb-6 p-2 sm:p-3 rounded-lg bg-gradient-to-br  flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
          <Image 
            src={icon} 
            alt={`${title} icon`}
            width={30} 
            height={30}
            className="brightness-0 invert"
          />
        </div>
        
        {/* Content */}
        <h3 className="text-lg sm:text-xl font-bold mb-2 group-hover:text-[#e60012] transition-colors">
          {title}
        </h3>
        <p className="text-sm text-gray-400 mb-4 sm:mb-6 flex-1">
          {description}
        </p>
        
        {/* Action Button - Link component with improved accessibility */}
        <Link 
          href={targetUrl}
          className={`mt-auto bg-gradient-to-r ${color} text-white px-4 py-3 rounded-lg font-medium transform transition-all opacity-90 hover:opacity-100 focus:opacity-100 hover:shadow-lg focus:shadow-lg hover:shadow-[#e60012]/20 focus:shadow-[#e60012]/20 w-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:ring-offset-2 focus:ring-offset-[#111]`}
          aria-label={`Book ${title} service`}
        >
          <span>Book Service</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
    </div>
  )
} 