'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function ServiceCard({ title, description, icon, color = "from-[#e60012] to-[#ff6b6b]" }) {
  // Create URL-friendly version of title for the link
  const urlTitle = title.toLowerCase().replace(/ /g, '-')
  const targetUrl = `/services/${urlTitle}`
  
  return (
    <div className="group bg-[#111] rounded-xl h-full border border-[#222] hover:border-[#e60012] hover:shadow-lg hover:shadow-[#e60012]/10 transition-all duration-300 overflow-hidden flex flex-col">
      <div className="p-6 flex-1 flex flex-col">
        {/* Icon */}
        <div className={`w-16 h-16 mb-6 p-3 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
          <Image 
            src={icon} 
            alt={title} 
            width={30} 
            height={30}
            className="brightness-[10]"
          />
        </div>
        
        {/* Content */}
        <h3 className="text-xl font-bold mb-2 group-hover:text-[#e60012] transition-colors">
          {title}
        </h3>
        <p className="text-gray-400 text-sm mb-6 flex-1">
          {description}
        </p>
        
        {/* Action Button - Link component */}
        <Link 
          href={targetUrl}
          className={`mt-auto bg-gradient-to-r ${color} text-white px-4 py-3 rounded-lg font-medium transform transition-all opacity-90 hover:opacity-100 hover:shadow-lg hover:shadow-[#e60012]/20 w-full flex items-center justify-center`}
        >
          <span>Book Service</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
    </div>
  )
} 