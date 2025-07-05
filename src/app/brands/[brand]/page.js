import { db } from '@/firebase/config'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export async function generateMetadata({ params }) {
  const { brand } = params
  const decodedBrand = decodeURIComponent(brand)
  
  try {
    // Fetch brand pages data - case insensitive search
    const brandPagesRef = collection(db, 'brandPages')
    const querySnapshot = await getDocs(brandPagesRef)
    
    // Filter by brand name case-insensitively
    const brandPages = querySnapshot.docs
      .map(doc => doc.data())
      .filter(page => page.brandName.toLowerCase() === decodedBrand.toLowerCase())
    
    if (brandPages.length === 0) {
      return {
        title: `${decodedBrand} | CallMiBro`,
        description: `Explore ${decodedBrand} products, services, and support information across all categories.`
      }
    }
    
    return {
      title: `${decodedBrand} - All Categories | CallMiBro`,
      description: `Discover ${decodedBrand} products and services across multiple categories. Find repair services, support, and comprehensive information.`,
      keywords: `${decodedBrand}, repair, service, support, electronics, appliances`,
      robots: 'index, follow'
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: `${decodedBrand} | CallMiBro`,
      description: `Explore ${decodedBrand} products and services.`
    }
  }
}

export default async function BrandPage({ params }) {
  const { brand } = params
  const decodedBrand = decodeURIComponent(brand)
  
  try {
    // Fetch all brand pages - case insensitive search
    const brandPagesRef = collection(db, 'brandPages')
    const querySnapshot = await getDocs(brandPagesRef)
    
    // Filter by brand name case-insensitively
    const brandPages = querySnapshot.docs
      .map(doc => doc.data())
      .filter(page => page.brandName.toLowerCase() === decodedBrand.toLowerCase())
    
    if (brandPages.length === 0) {
      notFound()
    }
    
    // Group by category
    const categories = brandPages.reduce((acc, page) => {
      if (!acc[page.category]) {
        acc[page.category] = []
      }
      acc[page.category].push(page)
      return acc
    }, {})
    
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                {decodedBrand}
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
                Discover {decodedBrand} products and services across all categories
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Categories Grid */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-8 text-gray-900 text-center">
              {decodedBrand} Categories
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(categories).map(([category, pages]) => {
                const page = pages[0] // Use first page for overview
                return (
                  <Link 
                    key={category}
                    href={`/brands/${encodeURIComponent(decodedBrand)}/${encodeURIComponent(category)}`}
                    className="group"
                  >
                    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                      <div className="text-center">
                        <h3 className="text-xl font-semibold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors">
                          {category}
                        </h3>
                        
                        {page.overview && (
                          <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                            {page.overview.substring(0, 150)}...
                          </p>
                        )}
                        
                        {page.keyFeatures && (
                          <div className="text-left">
                            <h4 className="font-medium text-gray-800 mb-2">Key Features:</h4>
                            <p className="text-gray-600 text-sm line-clamp-2">
                              {page.keyFeatures.substring(0, 100)}...
                            </p>
                          </div>
                        )}
                        
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <span className="inline-flex items-center text-blue-600 group-hover:text-blue-700 font-medium">
                            Learn More
                            <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>

          {/* Brand Overview */}
          {brandPages[0]?.overview && (
            <section className="mb-12">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">About {decodedBrand}</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed">{brandPages[0].overview}</p>
                </div>
              </div>
            </section>
          )}

          {/* Service Centers Overview */}
          {brandPages.some(page => page.serviceCenters || page.authorizedDealers) && (
            <section className="mb-12">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Service Centers & Support</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {brandPages.find(page => page.serviceCenters) && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4 text-gray-800">Authorized Service Centers</h3>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700">{brandPages.find(page => page.serviceCenters)?.serviceCenters}</p>
                      </div>
                    </div>
                  )}
                  
                  {brandPages.find(page => page.authorizedDealers) && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4 text-gray-800">Authorized Dealers</h3>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700">{brandPages.find(page => page.authorizedDealers)?.authorizedDealers}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Contact Information */}
                {brandPages.some(page => page.customerCareNumbers || page.emailSupport) && (
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {brandPages.find(page => page.customerCareNumbers) && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Customer Care</h4>
                          <p className="text-gray-600">{brandPages.find(page => page.customerCareNumbers)?.customerCareNumbers}</p>
                        </div>
                      )}
                      
                      {brandPages.find(page => page.emailSupport) && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Email Support</h4>
                          <p className="text-gray-600">{brandPages.find(page => page.emailSupport)?.emailSupport}</p>
                        </div>
                      )}
                      
                      {brandPages.find(page => page.liveChatSupport) && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Live Chat</h4>
                          <p className="text-gray-600">{brandPages.find(page => page.liveChatSupport)?.liveChatSupport}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Call to Action */}
          <section className="text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
              <h2 className="text-3xl font-bold mb-4">Need Help with Your {decodedBrand} Products?</h2>
              <p className="text-xl mb-6">Our expert technicians are here to help with repairs, maintenance, and support for all {decodedBrand} products.</p>
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
    console.error('Error fetching brand pages:', error)
    notFound()
  }
} 