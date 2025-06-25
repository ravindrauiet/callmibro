'use client'

import { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

export default function FilterSearchBar() {
  const [activeFilter, setActiveFilter] = useState('all')
  const { isDarkMode } = useTheme()
  
  const filters = [
    { id: 'all', name: 'All Parts' },
    { id: 'mobile', name: 'Mobile' },
    { id: 'tv', name: 'TV' },
    { id: 'ac', name: 'AC' },
    { id: 'refrigerator', name: 'Refrigerator' }
  ]

  return (
    <section id="products" className="py-6 sm:py-8 border-t border-b" 
      style={{ 
        backgroundColor: 'var(--panel-dark)',
        borderColor: 'var(--border-color)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Category Filters */}
        <div className="flex items-center justify-center mb-6 overflow-x-auto pb-2 hide-scrollbar">
          <div className="flex space-x-2">
            {filters.map(filter => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  activeFilter === filter.id
                    ? 'bg-gradient-to-r from-[#e60012] to-[#ff6b6b] text-white'
                    : 'hover:bg-[#333]'
                }`}
                style={{ 
                  backgroundColor: activeFilter === filter.id ? '' : 'var(--panel-gray)',
                  color: activeFilter === filter.id ? 'white' : 'var(--text-secondary)'
                }}
              >
                {filter.name}
              </button>
            ))}
          </div>
        </div>
      
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row flex-1 gap-3 sm:gap-4">
            <select 
              className="p-2.5 text-sm rounded-lg focus:outline-none focus:border-[#e60012] focus:ring-1 focus:ring-[#e60012] appearance-none cursor-pointer"
              style={{ 
                backgroundColor: 'var(--panel-gray)',
                color: 'var(--text-main)',
                borderColor: 'var(--border-color)',
                borderWidth: '1px'
              }}
            >
              <option>Device Category</option>
              <option>Mobile Phones</option>
              <option>TVs</option>
              <option>ACs</option>
              <option>Refrigerators</option>
            </select>
            
            <select 
              className="p-2.5 text-sm rounded-lg focus:outline-none focus:border-[#e60012] focus:ring-1 focus:ring-[#e60012] appearance-none cursor-pointer"
              style={{ 
                backgroundColor: 'var(--panel-gray)',
                color: 'var(--text-main)',
                borderColor: 'var(--border-color)',
                borderWidth: '1px'
              }}
            >
              <option>Brand</option>
              <option>Samsung</option>
              <option>Apple</option>
              <option>LG</option>
              <option>Sony</option>
            </select>
            
            <select 
              className="p-2.5 text-sm rounded-lg focus:outline-none focus:border-[#e60012] focus:ring-1 focus:ring-[#e60012] appearance-none cursor-pointer"
              style={{ 
                backgroundColor: 'var(--panel-gray)',
                color: 'var(--text-main)',
                borderColor: 'var(--border-color)',
                borderWidth: '1px'
              }}
            >
              <option>Model</option>
              <option>iPhone 13</option>
              <option>Galaxy S21</option>
              <option>LG C1</option>
            </select>
          </div>
          
          <div className="flex flex-1 sm:max-w-xs">
            <div className="relative w-full">
              <input 
                type="text" 
                placeholder="Search part name or SKU" 
                className="w-full p-2.5 pl-10 text-sm rounded-lg focus:border-[#e60012] focus:outline-none focus:ring-1 focus:ring-[#e60012]"
                style={{ 
                  backgroundColor: 'var(--panel-gray)',
                  color: 'var(--text-main)',
                  borderColor: 'var(--border-color)',
                  borderWidth: '1px'
                }}
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <button className="absolute inset-y-0 right-0 flex items-center px-4 text-white bg-gradient-to-r from-[#e60012] to-[#ff6b6b] rounded-r-lg hover:opacity-90 transition-opacity">
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 