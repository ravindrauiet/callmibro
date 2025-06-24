'use client'

import Header from '../components/Header'
import Hero from '../components/Hero'
import Services from '../components/Services'
import BundleDeals from '../components/BundleDeals'
import Shop from '../components/Shop'
import Timeline from '../components/Timeline'
import Testimonial from '../components/Testimonial'
import Footer from '../components/Footer'
import { useTheme } from '@/contexts/ThemeContext'

export default function Home() {
  const { isDarkMode } = useTheme()
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header activePage="home" />
      <Hero />
      <Services />
      <Timeline />
      <BundleDeals />
      <Shop />
      <Testimonial />
      <Footer />
    </div>
  )
}
