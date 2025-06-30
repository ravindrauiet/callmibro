'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useTheme } from '@/contexts/ThemeContext'

export default function FilterSearchBar({ onFiltersChange }) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [deviceCategory, setDeviceCategory] = useState('')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [loading, setLoading] = useState(false)
  const { isDarkMode } = useTheme()
  
  // Data states
  const [deviceCategories, setDeviceCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [models, setModels] = useState([])
  const [availableBrands, setAvailableBrands] = useState([])
  const [availableModels, setAvailableModels] = useState([])
  
  const filters = [
    { id: 'all', name: 'All Parts' },
    { id: 'mobile', name: 'Mobile' },
    { id: 'tv', name: 'TV' },
    { id: 'ac', name: 'AC' },
    { id: 'refrigerator', name: 'Refrigerator' },
    { id: 'laptop', name: 'Laptop' },
    { id: 'tablet', name: 'Tablet' }
  ]

  // Predefined brand options for each device category
  const brandOptions = {
    'Mobile Phones': ['Apple', 'Samsung', 'Xiaomi', 'OnePlus', 'OPPO', 'Vivo', 'Realme', 'Nothing', 'Google', 'Motorola'],
    'TVs': ['Samsung', 'LG', 'Sony', 'Panasonic', 'TCL', 'Mi', 'OnePlus', 'VU', 'Thomson', 'BPL'],
    'ACs': ['Voltas', 'Blue Star', 'Carrier', 'Daikin', 'Hitachi', 'LG', 'Samsung', 'Panasonic', 'Whirlpool', 'Godrej'],
    'Refrigerators': ['LG', 'Samsung', 'Whirlpool', 'Godrej', 'Haier', 'Panasonic', 'Hitachi', 'Bosch', 'BPL', 'Voltas'],
    'Washing Machines': ['LG', 'Samsung', 'Whirlpool', 'IFB', 'Bosch', 'Haier', 'Panasonic', 'Godrej', 'BPL', 'Voltas'],
    'Laptops': ['Dell', 'HP', 'Lenovo', 'Apple', 'ASUS', 'Acer', 'MSI', 'Razer', 'Alienware', 'Gigabyte'],
    'Tablets': ['Apple', 'Samsung', 'Xiaomi', 'Lenovo', 'Realme', 'OPPO', 'OnePlus', 'Amazon', 'Google', 'Huawei']
  }

  // Fetch filter data from database
  useEffect(() => {
    let isMounted = true;
    
    const fetchFilterData = async () => {
      setLoading(true)
      try {
        const sparePartsSnapshot = await getDocs(
          query(collection(db, 'spareParts'), where('isActive', '==', true), orderBy('createdAt', 'desc'))
        )
        
        if (!isMounted) return;
        
        const sparePartsData = sparePartsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        // Extract unique values
        const uniqueDeviceCategories = [...new Set(sparePartsData.map(part => part.deviceCategory))]
          .filter(Boolean)
          .sort()
        
        const uniqueBrands = [...new Set(sparePartsData.map(part => part.brand))]
          .filter(Boolean)
          .sort()
        
        const uniqueModels = [...new Set(sparePartsData.map(part => part.model))]
          .filter(Boolean)
          .sort()
        
        setDeviceCategories(uniqueDeviceCategories)
        setBrands(uniqueBrands)
        setModels(uniqueModels)
      } catch (error) {
        console.error('FilterSearchBar: Error fetching filter data:', error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchFilterData()
    
    return () => {
      isMounted = false;
    }
  }, [])

  // Update available brands when device category changes
  useEffect(() => {
    if (deviceCategory) {
      const categoryBrands = brandOptions[deviceCategory] || []
      setAvailableBrands(categoryBrands)
      // Reset brand and model when device category changes
      setBrand('')
      setModel('')
    } else {
      setAvailableBrands(brands)
    }
  }, [deviceCategory, brands])

  // Update available models when brand changes
  useEffect(() => {
    if (brand) {
      // Filter models based on selected brand and device category
      const filteredModels = models.filter(model => {
        // This is a simplified filter - in a real app you'd have a more sophisticated relationship
        return true
      })
      setAvailableModels(filteredModels)
    } else {
      setAvailableModels(models)
    }
  }, [brand, models])

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'category':
        setActiveFilter(value)
        break
      case 'deviceCategory':
        setDeviceCategory(value)
        break
      case 'brand':
        setBrand(value)
        break
      case 'model':
        setModel(value)
        break
      case 'search':
        setSearchTerm(value)
        break
      default:
        break
    }
  }

  // Apply filters
  const applyFilters = () => {
    const filters = {
      category: activeFilter,
      deviceCategory,
      brand,
      model,
      searchTerm
    }
    
    if (onFiltersChange) {
      onFiltersChange(filters)
    }
  }

  // Clear all filters
  const clearFilters = () => {
    setActiveFilter('all')
    setSearchTerm('')
    setDeviceCategory('')
    setBrand('')
    setModel('')
    
    if (onFiltersChange) {
      onFiltersChange({
        category: 'all',
        deviceCategory: '',
        brand: '',
        model: '',
        searchTerm: ''
      })
    }
  }

  // Auto-apply filters when any filter changes - with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      applyFilters()
    }, 100)
    
    return () => clearTimeout(timeoutId)
  }, [activeFilter, deviceCategory, brand, model, searchTerm])

  return (
    <section id="products" className="py-4 sm:py-6 border-t border-b" 
      style={{ 
        backgroundColor: 'var(--panel-dark)',
        borderColor: 'var(--border-color)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Category Filters */}
        <div className="flex items-center justify-center mb-4 sm:mb-6 overflow-x-auto pb-2 hide-scrollbar">
          <div className="flex space-x-1.5 sm:space-x-2">
            {filters.map(filter => (
              <button
                key={filter.id}
                onClick={() => handleFilterChange('category', filter.id)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap`}
                style={{ 
                  backgroundColor: activeFilter === filter.id ? '' : 'var(--panel-gray)',
                  color: activeFilter === filter.id ? 'white' : 'var(--text-secondary)'
                }}
                onMouseEnter={(e) => {
                  if (activeFilter !== filter.id) {
                    e.target.style.backgroundColor = isDarkMode ? 'var(--panel-charcoal)' : 'var(--panel-light)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeFilter !== filter.id) {
                    e.target.style.backgroundColor = 'var(--panel-gray)'
                  }
                }}
              >
                {filter.name}
              </button>
            ))}
          </div>
        </div>
      
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row flex-1 gap-3 sm:gap-4">
            {/* Device Category */}
            <select 
              value={deviceCategory}
              onChange={(e) => handleFilterChange('deviceCategory', e.target.value)}
              className="p-2 sm:p-2.5 text-xs sm:text-sm rounded-lg focus:outline-none focus:border-[#e60012] focus:ring-1 focus:ring-[#e60012] appearance-none cursor-pointer"
              style={{ 
                backgroundColor: 'var(--panel-gray)',
                color: 'var(--text-main)',
                borderColor: 'var(--border-color)',
                borderWidth: '1px'
              }}
            >
              <option value="">Device Category</option>
              {deviceCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            {/* Brand */}
            <select 
              value={brand}
              onChange={(e) => handleFilterChange('brand', e.target.value)}
              className="p-2 sm:p-2.5 text-xs sm:text-sm rounded-lg focus:outline-none focus:border-[#e60012] focus:ring-1 focus:ring-[#e60012] appearance-none cursor-pointer"
              style={{ 
                backgroundColor: 'var(--panel-gray)',
                color: 'var(--text-main)',
                borderColor: 'var(--border-color)',
                borderWidth: '1px'
              }}
            >
              <option value="">Brand</option>
              {availableBrands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
            
            {/* Model */}
            <select 
              value={model}
              onChange={(e) => handleFilterChange('model', e.target.value)}
              className="p-2 sm:p-2.5 text-xs sm:text-sm rounded-lg focus:outline-none focus:border-[#e60012] focus:ring-1 focus:ring-[#e60012] appearance-none cursor-pointer"
              style={{ 
                backgroundColor: 'var(--panel-gray)',
                color: 'var(--text-main)',
                borderColor: 'var(--border-color)',
                borderWidth: '1px'
              }}
            >
              <option value="">Model</option>
              {availableModels.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>
          
          {/* Search Bar */}
          <div className="flex flex-1 lg:max-w-xs">
            <div className="relative w-full">
              <input 
                type="text" 
                placeholder="Search part name or SKU" 
                value={searchTerm}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full p-2 sm:p-2.5 pl-9 sm:pl-10 text-xs sm:text-sm rounded-lg focus:border-[#e60012] focus:outline-none focus:ring-1 focus:ring-[#e60012]"
                style={{ 
                  backgroundColor: 'var(--panel-gray)',
                  color: 'var(--text-main)',
                  borderColor: 'var(--border-color)',
                  borderWidth: '1px'
                }}
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-2.5 sm:pl-3 pointer-events-none">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Clear Filters Button */}
          {(deviceCategory || brand || model || searchTerm || activeFilter !== 'all') && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 sm:py-2.5 text-xs sm:text-sm rounded-lg border transition-colors duration-300 font-medium"
              style={{ 
                borderColor: 'var(--border-color)', 
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--panel-gray)'
              }}
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Active Filters Display */}
        {(deviceCategory || brand || model || searchTerm) && (
          <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
            {deviceCategory && (
              <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-[#e60012]/10 text-[#e60012]">
                Device: {deviceCategory}
                <button
                  onClick={() => handleFilterChange('deviceCategory', '')}
                  className="ml-1 sm:ml-2 text-[#e60012] hover:text-[#d40010]"
                >
                  ×
                </button>
              </span>
            )}
            {brand && (
              <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-[#e60012]/10 text-[#e60012]">
                Brand: {brand}
                <button
                  onClick={() => handleFilterChange('brand', '')}
                  className="ml-1 sm:ml-2 text-[#e60012] hover:text-[#d40010]"
                >
                  ×
                </button>
              </span>
            )}
            {model && (
              <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-[#e60012]/10 text-[#e60012]">
                Model: {model}
                <button
                  onClick={() => handleFilterChange('model', '')}
                  className="ml-1 sm:ml-2 text-[#e60012] hover:text-[#d40010]"
                >
                  ×
                </button>
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-[#e60012]/10 text-[#e60012]">
                Search: "{searchTerm}"
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="ml-1 sm:ml-2 text-[#e60012] hover:text-[#d40010]"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </section>
  )
} 