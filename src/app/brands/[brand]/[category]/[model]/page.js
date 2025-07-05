'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/firebase/config'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function ModelPage() {
  const params = useParams()
  const { brand, category, model } = params
  const modelSlug = model
  
  const [modelPage, setModelPage] = useState(null)
  const [compatibleSpareParts, setCompatibleSpareParts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchModelPage = async () => {
      try {
        // Get model page data
        const modelPagesRef = collection(db, 'modelPages')
        const q = query(modelPagesRef, where('slug', '==', modelSlug))
        const modelPagesSnapshot = await getDocs(q)
        
        if (!modelPagesSnapshot.empty) {
          const pageData = modelPagesSnapshot.docs[0].data()
          setModelPage(pageData)
          
          // Get compatible spare parts
          if (pageData.compatibleSpareParts && pageData.compatibleSpareParts.length > 0) {
            const sparePartsSnapshot = await getDocs(collection(db, 'spareParts'))
            const allSpareParts = sparePartsSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }))
            
            const compatible = allSpareParts.filter(part => 
              pageData.compatibleSpareParts.includes(part.id)
            )
            setCompatibleSpareParts(compatible)
          }
        }
      } catch (error) {
        console.error('Error fetching model page:', error)
      } finally {
        setLoading(false)
      }
    }

    if (modelSlug) {
      fetchModelPage()
    }
  }, [modelSlug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e60012]"></div>
      </div>
    )
  }

  if (!modelPage) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">Model Not Found</h1>
          <p className="text-gray-600 mb-8">The model page you're looking for doesn't exist.</p>
          <Link href="/" className="text-[#e60012] hover:underline">
            Return to Home
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <Link href="/" className="text-gray-500 hover:text-gray-700">
                  Home
                </Link>
              </li>
              <li>
                <span className="text-gray-400 mx-2">/</span>
              </li>
              <li>
                <Link href={`/brands/${brand}`} className="text-gray-500 hover:text-gray-700">
                  {modelPage.brandName}
                </Link>
              </li>
              <li>
                <span className="text-gray-400 mx-2">/</span>
              </li>
              <li>
                <Link href={`/brands/${brand}/${category}`} className="text-gray-500 hover:text-gray-700">
                  {modelPage.category}
                </Link>
              </li>
              <li>
                <span className="text-gray-400 mx-2">/</span>
              </li>
              <li className="text-gray-900 font-medium">
                {modelPage.modelName}
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#e60012] to-[#d40010] text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {modelPage.modelName}
            </h1>
            <p className="text-xl md:text-2xl mb-6 opacity-90">
              {modelPage.brandName} • {modelPage.category}
            </p>
            <p className="text-lg opacity-80">
              {modelPage.seoDescription || `Complete guide to ${modelPage.modelName} - specifications, features, and spare parts`}
            </p>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Content */}
            <div className="lg:col-span-2">
              
              {/* Overview Section */}
              {modelPage.overview && (
                <section className="mb-12">
                  <h2 className="text-3xl font-bold mb-6 text-gray-900">
                    Overview
                  </h2>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      {modelPage.overview}
                    </p>
                  </div>
                </section>
              )}

              {/* Features Section */}
              {modelPage.features && modelPage.features.length > 0 && (
                <section className="mb-12">
                  <h2 className="text-3xl font-bold mb-6 text-gray-900">
                    Key Features
                  </h2>
                  <ul className="space-y-3">
                    {modelPage.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="h-6 w-6 text-[#e60012] mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Specifications Section */}
              {modelPage.specifications && Object.keys(modelPage.specifications).length > 0 && (
                <section className="mb-12">
                  <h2 className="text-3xl font-bold mb-6 text-gray-900">
                    Specifications
                  </h2>
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="divide-y divide-gray-200">
                      {Object.entries(modelPage.specifications).map(([key, value]) => (
                        <div key={key} className="px-6 py-4">
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-900">{key}</span>
                            <span className="text-gray-700">{value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* Compatible Spare Parts */}
              {compatibleSpareParts.length > 0 && (
                <section className="mb-12">
                  <h2 className="text-3xl font-bold mb-6 text-gray-900">
                    Compatible Spare Parts
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {compatibleSpareParts.map((part) => (
                      <div key={part.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold mb-2 text-gray-900">
                                {part.name}
                              </h3>
                              <p className="text-gray-600 mb-3">
                                {part.description}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-2xl font-bold text-[#e60012]">
                                  ₹{part.price?.toLocaleString()}
                                </span>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  part.availability === 'In Stock' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {part.availability || 'Check Availability'}
                                </span>
                              </div>
                            </div>
                            {part.imageURL && (
                              <div className="ml-4">
                                <img 
                                  src={part.imageURL} 
                                  alt={part.name}
                                  className="w-16 h-16 object-cover rounded-md"
                                />
                              </div>
                            )}
                          </div>
                          <div className="mt-4">
                            <Link 
                              href={`/spare-parts/${part.id}`}
                              className="inline-block bg-[#e60012] text-white px-4 py-2 rounded-md hover:bg-[#d40010] transition-colors"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              
              {/* Price Comparison */}
              {modelPage.priceComparison && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h3 className="text-xl font-bold mb-4 text-gray-900">
                    Price Comparison
                  </h3>
                  <div className="space-y-3">
                    {modelPage.priceComparison.amazon && (
                      <a 
                        href={modelPage.priceComparison.amazon}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 bg-orange-50 rounded-md hover:bg-orange-100 transition-colors"
                      >
                        <span className="font-medium">Amazon</span>
                        <svg className="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                    {modelPage.priceComparison.flipkart && (
                      <a 
                        href={modelPage.priceComparison.flipkart}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                      >
                        <span className="font-medium">Flipkart</span>
                        <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                    {modelPage.priceComparison.croma && (
                      <a 
                        href={modelPage.priceComparison.croma}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 bg-purple-50 rounded-md hover:bg-purple-100 transition-colors"
                      >
                        <span className="font-medium">Croma</span>
                        <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Call to Action */}
              <div className="bg-[#e60012] rounded-lg p-6 text-white">
                <h3 className="text-xl font-bold mb-4">
                  Need Service?
                </h3>
                <p className="mb-6 text-red-100">
                  Our expert technicians can help you with repairs and maintenance for your {modelPage.modelName}.
                </p>
                <div className="space-y-3">
                  <Link 
                    href="/services"
                    className="block w-full bg-white text-[#e60012] text-center py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Book Service
                  </Link>
                  <Link 
                    href="/spare-parts"
                    className="block w-full border border-white text-white text-center py-3 rounded-md font-semibold hover:bg-white hover:text-[#e60012] transition-colors"
                  >
                    Find Spare Parts
                  </Link>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
} 