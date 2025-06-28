'use client'

import { useState } from 'react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import SparePartsHero from '../../components/SparePartsHero'
import FilterSearchBar from '../../components/FilterSearchBar'
import ProductsGrid from '../../components/ProductsGrid'
import BundleDeals from '../../components/BundleDeals'
import { useTheme } from '@/contexts/ThemeContext'

export default function SparePartsPage() {
  const { isDarkMode } = useTheme()
  const [filters, setFilters] = useState({
    category: 'all',
    deviceCategory: '',
    brand: '',
    model: '',
    searchTerm: ''
  })
  
  const handleFiltersChange = (newFilters) => {
    console.log('SparePartsPage: Received new filters:', newFilters)
    setFilters(newFilters)
  }
  
  return (
    <main className="min-h-screen">
      <Header activePage="spare-parts" />
      <SparePartsHero />
      
      {/* Debug Info - Remove this after testing */}
      {/* <div className="bg-yellow-100 p-4 text-black text-sm">
        <strong>Debug Info:</strong> Current filters: {JSON.stringify(filters)}
      </div> */}
      
      <FilterSearchBar onFiltersChange={handleFiltersChange} />
      <ProductsGrid filters={filters} />
      <BundleDeals />
      <Footer />
    </main>
  )
} 