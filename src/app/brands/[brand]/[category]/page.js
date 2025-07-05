import { db } from '@/firebase/config'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
  const { brand, category } = params
  
  try {
    // Fetch brand page data - case insensitive search
    const brandPagesRef = collection(db, 'brandPages')
    const querySnapshot = await getDocs(brandPagesRef)
    
    // Filter by brand name and category case-insensitively
    const brandPages = querySnapshot.docs
      .map(doc => doc.data())
      .filter(page => 
        page.brandName.toLowerCase() === decodeURIComponent(brand).toLowerCase() &&
        page.category.toLowerCase() === decodeURIComponent(category).toLowerCase()
      )
    
    if (brandPages.length === 0) {
      return {
        title: `${decodeURIComponent(brand)} - ${decodeURIComponent(category)} | CallMiBro`,
        description: `Explore ${decodeURIComponent(brand)} ${decodeURIComponent(category)} products, services, and support information.`
      }
    }
    
    const brandPage = brandPages[0]
    
    return {
      title: brandPage.seoTitle || `${decodeURIComponent(brand)} ${decodeURIComponent(category)} | CallMiBro`,
      description: brandPage.seoDescription || `Discover ${decodeURIComponent(brand)} ${decodeURIComponent(category)} products, features, and comprehensive support information.`,
      keywords: brandPage.seoKeywords || `${decodeURIComponent(brand)}, ${decodeURIComponent(category)}, repair, service, support`,
      robots: brandPage.metaRobots || 'index, follow',
      alternates: {
        canonical: brandPage.canonicalUrl || `https://callmibro.com/brands/${brand}/${category}`
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: `${decodeURIComponent(brand)} - ${decodeURIComponent(category)} | CallMiBro`,
      description: `Explore ${decodeURIComponent(brand)} ${decodeURIComponent(category)} products and services.`
    }
  }
}

export default async function BrandCategoryPage({ params }) {
  const { brand, category } = params
  const decodedBrand = decodeURIComponent(brand)
  const decodedCategory = decodeURIComponent(category)
  
  try {
    // Fetch brand page data - case insensitive search
    const brandPagesRef = collection(db, 'brandPages')
    const querySnapshot = await getDocs(brandPagesRef)
    
    // Filter by brand name and category case-insensitively
    const brandPages = querySnapshot.docs
      .map(doc => doc.data())
      .filter(page => 
        page.brandName.toLowerCase() === decodedBrand.toLowerCase() &&
        page.category.toLowerCase() === decodedCategory.toLowerCase()
      )
    
    if (brandPages.length === 0) {
      notFound()
    }
    
    const brandPage = brandPages[0]
    
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                {brandPage.brandName} {brandPage.category}
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
                {brandPage.overview || `Discover the world of ${brandPage.brandName} ${brandPage.category} products and services.`}
              </p>
              {brandPage.brandLogo && (
                <div className="mb-8">
                  <img 
                    src={brandPage.brandLogo} 
                    alt={`${brandPage.brandName} logo`}
                    className="h-16 mx-auto"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Brand Overview */}
          {brandPage.overview && (
            <section className="mb-12">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">About {brandPage.brandName}</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed">{brandPage.overview}</p>
                </div>
              </div>
            </section>
          )}

          {/* Key Features */}
          {brandPage.keyFeatures && (
            <section className="mb-12">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Key Features</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed">{brandPage.keyFeatures}</p>
                </div>
              </div>
            </section>
          )}

          {/* Service Centers */}
          {(brandPage.serviceCenters || brandPage.authorizedDealers || brandPage.repairCenters) && (
            <section className="mb-12">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Service Centers & Support</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {brandPage.serviceCenters && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4 text-gray-800">Authorized Service Centers</h3>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700">{brandPage.serviceCenters}</p>
                      </div>
                    </div>
                  )}
                  
                  {brandPage.authorizedDealers && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4 text-gray-800">Authorized Dealers</h3>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700">{brandPage.authorizedDealers}</p>
                      </div>
                    </div>
                  )}
                  
                  {brandPage.repairCenters && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4 text-gray-800">Repair Centers</h3>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700">{brandPage.repairCenters}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Contact Information */}
                {(brandPage.customerCareNumbers || brandPage.emailSupport || brandPage.liveChatSupport) && (
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {brandPage.customerCareNumbers && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Customer Care</h4>
                          <p className="text-gray-600">{brandPage.customerCareNumbers}</p>
                        </div>
                      )}
                      
                      {brandPage.emailSupport && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Email Support</h4>
                          <p className="text-gray-600">{brandPage.emailSupport}</p>
                        </div>
                      )}
                      
                      {brandPage.liveChatSupport && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Live Chat</h4>
                          <p className="text-gray-600">{brandPage.liveChatSupport}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Product Features */}
          {(brandPage.smartFeatures || brandPage.connectivity || brandPage.securityFeatures || brandPage.energyEfficiency) && (
            <section className="mb-12">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Product Features</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {brandPage.smartFeatures && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4 text-gray-800">Smart Features</h3>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700">{brandPage.smartFeatures}</p>
                      </div>
                    </div>
                  )}
                  
                  {brandPage.connectivity && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4 text-gray-800">Connectivity</h3>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700">{brandPage.connectivity}</p>
                      </div>
                    </div>
                  )}
                  
                  {brandPage.securityFeatures && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4 text-gray-800">Security Features</h3>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700">{brandPage.securityFeatures}</p>
                      </div>
                    </div>
                  )}
                  
                  {brandPage.energyEfficiency && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4 text-gray-800">Energy Efficiency</h3>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700">{brandPage.energyEfficiency}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Warranty & Support */}
          {(brandPage.warrantyInfo || brandPage.customerSupport || brandPage.afterSalesService) && (
            <section className="mb-12">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Warranty & Support</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {brandPage.warrantyInfo && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4 text-gray-800">Warranty Information</h3>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700">{brandPage.warrantyInfo}</p>
                      </div>
                    </div>
                  )}
                  
                  {brandPage.customerSupport && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4 text-gray-800">Customer Support</h3>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700">{brandPage.customerSupport}</p>
                      </div>
                    </div>
                  )}
                  
                  {brandPage.afterSalesService && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4 text-gray-800">After-Sales Service</h3>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700">{brandPage.afterSalesService}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* FAQ */}
          {brandPage.faq && (
            <section className="mb-12">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Frequently Asked Questions</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed">{brandPage.faq}</p>
                </div>
              </div>
            </section>
          )}

          {/* Call to Action */}
          <section className="text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
              <h2 className="text-3xl font-bold mb-4">Need Help with Your {brandPage.brandName} {brandPage.category}?</h2>
              <p className="text-xl mb-6">Our expert technicians are here to help with repairs, maintenance, and support.</p>
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
    console.error('Error fetching brand page:', error)
    notFound()
  }
} 