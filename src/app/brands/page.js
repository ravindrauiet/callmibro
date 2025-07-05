import { db } from '@/firebase/config'
import { collection, getDocs } from 'firebase/firestore'
import Link from 'next/link'

export async function generateMetadata() {
  return {
    title: 'All Brands | CallMiBro',
    description: 'Explore all brands and their products. Find repair services, support, and comprehensive information for your favorite brands.',
    keywords: 'brands, electronics, appliances, repair, service, support',
    robots: 'index, follow'
  }
}

export default async function BrandsPage() {
  try {
    // Fetch all brand pages
    const brandPagesRef = collection(db, 'brandPages')
    const querySnapshot = await getDocs(brandPagesRef)
    
    const brandPages = querySnapshot.docs.map(doc => doc.data())
    
    // Group by brand - case insensitive
    const brands = brandPages.reduce((acc, page) => {
      const brandNameLower = page.brandName.toLowerCase()
      if (!acc[brandNameLower]) {
        acc[brandNameLower] = {
          name: page.brandName, // Keep original case for display
          categories: [],
          overview: page.overview,
          brandLogo: page.brandLogo,
          serviceCenters: page.serviceCenters,
          customerCareNumbers: page.customerCareNumbers
        }
      }
      
      if (!acc[brandNameLower].categories.includes(page.category)) {
        acc[brandNameLower].categories.push(page.category)
      }
      
      return acc
    }, {})
    
    const brandsList = Object.values(brands)
    
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                All Brands
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
                Discover comprehensive information about your favorite brands
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Debug Section - Show Available Brand Pages */}
          {brandPages.length === 0 && (
            <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Brand Pages Created Yet</h3>
              <p className="text-yellow-700 mb-4">
                To see brand pages, you need to create them first in the admin panel.
              </p>
              <a 
                href="/admin/article/brands" 
                className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
              >
                Go to Brand Page Management
              </a>
            </div>
          )}

          {/* Available Brand Pages Debug */}
          {brandPages.length > 0 && (
            <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Available Brand Pages ({brandPages.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {brandPages.map((page, index) => (
                  <div key={index} className="bg-white p-3 rounded border">
                    <p className="font-medium">{page.brandName} - {page.category}</p>
                    <p className="text-sm text-gray-600">SEO Title: {page.seoTitle}</p>
                    <a 
                      href={`/brands/${encodeURIComponent(page.brandName)}/${encodeURIComponent(page.category)}`}
                      target="_blank"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View Page
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Brands Grid */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-8 text-gray-900 text-center">
              Explore Brands
            </h2>
            
            {brandsList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {brandsList.map((brand) => (
                  <Link 
                    key={brand.name}
                    href={`/brands/${encodeURIComponent(brand.name)}`}
                    className="group"
                  >
                    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                      <div className="text-center">
                        {brand.brandLogo && (
                          <div className="mb-4">
                            <img 
                              src={brand.brandLogo} 
                              alt={`${brand.name} logo`}
                              className="h-12 mx-auto"
                            />
                          </div>
                        )}
                        
                        <h3 className="text-xl font-semibold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors">
                          {brand.name}
                        </h3>
                        
                        {brand.overview && (
                          <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                            {brand.overview.substring(0, 150)}...
                          </p>
                        )}
                        
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-800 mb-2">Categories:</h4>
                          <div className="flex flex-wrap gap-2 justify-center">
                            {brand.categories.map((category) => (
                              <span 
                                key={category}
                                className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                              >
                                {category}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <span className="inline-flex items-center text-blue-600 group-hover:text-blue-700 font-medium">
                            Explore {brand.name}
                            <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No brand pages available yet.</p>
                <a 
                  href="/admin/article/brands" 
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Your First Brand Page
                </a>
              </div>
            )}
          </section>

          {/* Service Information */}
          <section className="mb-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-3xl font-bold mb-6 text-gray-900 text-center">
                Professional Repair Services
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">Expert Technicians</h3>
                  <p className="text-gray-600">Certified professionals with years of experience in repairing all major brands.</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">Quick Service</h3>
                  <p className="text-gray-600">Fast turnaround times with same-day service available for urgent repairs.</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">Warranty</h3>
                  <p className="text-gray-600">All repairs come with our comprehensive warranty for your peace of mind.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
              <h2 className="text-3xl font-bold mb-4">Need Professional Repair Services?</h2>
              <p className="text-xl mb-6">Our expert technicians are here to help with repairs, maintenance, and support for all major brands.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/services/booking" 
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
                >
                  Book a Service
                </a>
                <a 
                  href="/contact" 
                  className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
                >
                  Contact Us
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error fetching brands:', error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Brands</h1>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    )
  }
} 