'use client'

import { Suspense, lazy } from 'react'
import Header from '../components/Header'
import Hero from '../components/Hero'
import { useTheme } from '@/contexts/ThemeContext'

// Lazy load non-critical components
const Services = lazy(() => import('../components/Services'))
const BundleDeals = lazy(() => import('../components/BundleDeals'))
const Shop = lazy(() => import('../components/Shop'))
const Timeline = lazy(() => import('../components/Timeline'))
const Testimonial = lazy(() => import('../components/Testimonial'))
const Footer = lazy(() => import('../components/Footer'))

// Loading fallbacks
const ServicesSkeleton = () => (
  <section className="relative py-16 sm:py-20 px-4 sm:px-8 overflow-hidden">
    <div className="container mx-auto max-w-6xl">
      <div className="mb-10 md:mb-12 text-center">
        <div className="h-6 w-48 bg-gray-700 rounded animate-shimmer mx-auto mb-4"></div>
        <div className="h-10 w-3/4 bg-gray-700 rounded animate-shimmer mx-auto mb-4"></div>
        <div className="h-4 w-1/2 bg-gray-700 rounded animate-shimmer mx-auto"></div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border animate-shimmer" style={{ height: '200px', backgroundColor: 'var(--panel-dark)', borderColor: 'var(--border-color)' }}></div>
        ))}
      </div>
    </div>
  </section>
)

const GenericSkeleton = () => (
  <section className="py-16 sm:py-20 px-4">
    <div className="container mx-auto max-w-6xl">
      <div className="h-8 w-64 bg-gray-700 rounded animate-shimmer mx-auto mb-8"></div>
      <div className="h-64 bg-gray-800 rounded-lg animate-shimmer"></div>
    </div>
  </section>
)

export default function Home() {
  const { isDarkMode } = useTheme()
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header activePage="home" />
      <Hero />
      
      <Suspense fallback={<ServicesSkeleton />}>
        <Services />
      </Suspense>
      
      <Suspense fallback={<GenericSkeleton />}>
        <Timeline />
      </Suspense>
      
      <Suspense fallback={<GenericSkeleton />}>
        <BundleDeals />
      </Suspense>
      
      <Suspense fallback={<GenericSkeleton />}>
        <Shop />
      </Suspense>
      
      <Suspense fallback={<GenericSkeleton />}>
        <Testimonial />
      </Suspense>
      
      <Suspense fallback={<GenericSkeleton />}>
        <Footer />
      </Suspense>
    </div>
  )
}
