'use client'

import { useState } from 'react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import SparePartsHero from '../../components/SparePartsHero'
import FilterSearchBar from '../../components/FilterSearchBar'
import ProductsGrid from '../../components/ProductsGrid'
import Pagination from '../../components/Pagination'
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
    setFilters(newFilters)
  }
  
  return (
    <main className="min-h-screen">
      <Header activePage="spare-parts" />
      <SparePartsHero />
      <FilterSearchBar onFiltersChange={handleFiltersChange} />
      <ProductsGrid filters={filters} />
      <Pagination />
      <BundleDeals />
      <Footer />
    </main>
  )
} 