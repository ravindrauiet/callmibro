import Header from '../../components/Header'
import Footer from '../../components/Footer'
import SparePartsHero from '../../components/SparePartsHero'
import FilterSearchBar from '../../components/FilterSearchBar'
import ProductsGrid from '../../components/ProductsGrid'
import Pagination from '../../components/Pagination'
import BundleDeals from '../../components/BundleDeals'

export default function SparePartsPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Header activePage="spare-parts" />
      <SparePartsHero />
      <FilterSearchBar />
      <ProductsGrid />
      <Pagination />
      <BundleDeals />
      <Footer />
    </main>
  )
} 