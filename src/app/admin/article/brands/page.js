'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs, doc, addDoc, updateDoc, serverTimestamp, query, where, orderBy } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { toast } from 'react-hot-toast'

export default function BrandArticleManagement() {
  const [brands, setBrands] = useState([])
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedModels, setSelectedModels] = useState([])
  const [brandPages, setBrandPages] = useState([])
  
  // Form state
  const [brandPageForm, setBrandPageForm] = useState({
    brandId: '',
    brandName: '',
    category: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    metaRobots: 'index, follow',
    canonicalUrl: '',
    overview: '',
    brandHistory: '',
    brandMission: '',
    brandVision: '',
    keyFeatures: '',
    whyChoose: '',
    brandStrengths: '',
    productRange: '',
    serviceAreas: '',
    warrantyInfo: '',
    customerSupport: '',
    awardsRecognition: '',
    certifications: '',
    partnerships: '',
    sustainability: '',
    innovation: '',
    qualityAssurance: '',
    afterSalesService: '',
    sparePartsAvailability: '',
    technicalSupport: '',
    installationServices: '',
    maintenanceTips: '',
    troubleshooting: '',
    faq: '',
    testimonials: '',
    // New Service Centers fields
    serviceCenters: '',
    authorizedDealers: '',
    repairCenters: '',
    customerCareNumbers: '',
    emailSupport: '',
    liveChatSupport: '',
    onlineBooking: '',
    emergencySupport: '',
    // Additional comprehensive fields
    brandLogo: '',
    brandWebsite: '',
    socialMediaLinks: '',
    pressReleases: '',
    annualReports: '',
    investorRelations: '',
    corporateResponsibility: '',
    environmentalPolicy: '',
    dataPrivacy: '',
    termsOfService: '',
    returnPolicy: '',
    shippingInfo: '',
    paymentOptions: '',
    financingOptions: '',
    tradeInProgram: '',
    loyaltyProgram: '',
    referralProgram: '',
    warrantyExtension: '',
    insuranceOptions: '',
    extendedService: '',
    preventiveMaintenance: '',
    energyEfficiency: '',
    smartFeatures: '',
    connectivity: '',
    securityFeatures: '',
    accessibility: '',
    customization: '',
    integration: '',
    compatibility: '',
    performance: '',
    reliability: '',
    durability: '',
    safety: '',
    compliance: '',
    standards: '',
    regulations: '',
    industryAwards: '',
    mediaCoverage: '',
    expertReviews: '',
    userRatings: '',
    marketShare: '',
    globalPresence: '',
    manufacturing: '',
    supplyChain: '',
    researchDevelopment: '',
    patents: '',
    trademarks: '',
    copyrights: '',
    licensing: '',
    distribution: '',
    retailPartners: '',
    onlineStores: '',
    mobileApps: '',
    smartHome: '',
    iotIntegration: '',
    cloudServices: '',
    dataBackup: '',
    remoteMonitoring: '',
    predictiveMaintenance: '',
    aiFeatures: '',
    voiceControl: '',
    automation: '',
    energySaving: '',
    ecoFriendly: '',
    recyclable: '',
    carbonFootprint: '',
    greenCertification: '',
    featuredModels: [],
    isActive: true
  })

  // Categories
  const categories = [
    'AC',
    'TV',
    'Refrigerator', 
    'Washing Machine',
    'Mobile',
    'Laptop',
    'Other'
  ]

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get brands
        const brandsSnapshot = await getDocs(collection(db, 'brands'))
        const brandsData = brandsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setBrands(brandsData)
        
        // Get models
        const modelsSnapshot = await getDocs(collection(db, 'models'))
        const modelsData = modelsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setModels(modelsData)
        
        // Get existing brand pages
        const brandPagesSnapshot = await getDocs(collection(db, 'brandPages'))
        const brandPagesData = brandPagesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setBrandPages(brandPagesData)
        
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    setSelectedBrand('')
    setSelectedModels([])
    setBrandPageForm(prev => ({
      ...prev,
      category,
      brandId: '',
      brandName: ''
    }))
  }

  // Handle brand change
  const handleBrandChange = (brandId) => {
    const brand = brands.find(b => b.id === brandId)
    if (brand) {
      setSelectedBrand(brandId)
      setBrandPageForm(prev => ({
        ...prev,
        brandId: brand.id,
        brandName: brand.name
      }))
      
      // Get models for this brand
      const brandModels = models.filter(model => model.brandId === brandId)
      setSelectedModels(brandModels.map(m => m.id))
    }
  }

  // Handle model selection
  const handleModelSelection = (modelId, isSelected) => {
    if (isSelected) {
      setSelectedModels(prev => [...prev, modelId])
    } else {
      setSelectedModels(prev => prev.filter(id => id !== modelId))
    }
  }

  // Auto-generate SEO content
  const generateSEOContent = () => {
    if (!brandPageForm.brandName || !brandPageForm.category) return
    
    const brand = brandPageForm.brandName
    const category = brandPageForm.category
    
    setBrandPageForm(prev => ({
      ...prev,
      seoTitle: `Best ${brand} ${category} Products - Prices, Reviews & Repair Services`,
      seoDescription: `Discover the best ${brand} ${category} products, prices, and expert repair services. Find genuine spare parts and professional technicians for all ${brand} ${category} devices.`,
      seoKeywords: `${brand.toLowerCase()}, ${category.toLowerCase()}, ${brand.toLowerCase()} ${category.toLowerCase()}, ${brand.toLowerCase()} repair, ${brand.toLowerCase()} spare parts, ${brand.toLowerCase()} service`,
      canonicalUrl: `https://callmibro.com/brands/${brand.toLowerCase().replace(/\s+/g, '-')}`
    }))
  }

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!brandPageForm.brandId || !brandPageForm.seoTitle) {
      toast.error('Brand and SEO title are required')
      return
    }
    
    try {
      const pageData = {
        ...brandPageForm,
        featuredModels: selectedModels,
        slug: brandPageForm.brandName.toLowerCase().replace(/\s+/g, '-'),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      // Check if page already exists
      const existingPage = brandPages.find(page => page.brandId === brandPageForm.brandId)
      
      if (existingPage) {
        // Update existing page
        await updateDoc(doc(db, 'brandPages', existingPage.id), {
          ...pageData,
          updatedAt: serverTimestamp()
        })
        
        setBrandPages(prev => prev.map(page => 
          page.id === existingPage.id 
            ? { ...page, ...pageData, updatedAt: new Date() }
            : page
        ))
        
        toast.success('Brand page updated successfully')
      } else {
        // Create new page
        const docRef = await addDoc(collection(db, 'brandPages'), pageData)
        
        setBrandPages(prev => [...prev, {
          id: docRef.id,
          ...pageData,
          createdAt: new Date(),
          updatedAt: new Date()
        }])
        
        toast.success('Brand page created successfully')
      }
      
      // Reset form
      setBrandPageForm({
        brandId: '',
        brandName: '',
        category: '',
        seoTitle: '',
        seoDescription: '',
        seoKeywords: '',
        metaRobots: 'index, follow',
        canonicalUrl: '',
        overview: '',
        brandHistory: '',
        brandMission: '',
        brandVision: '',
        keyFeatures: '',
        whyChoose: '',
        brandStrengths: '',
        productRange: '',
        serviceAreas: '',
        warrantyInfo: '',
        customerSupport: '',
        awardsRecognition: '',
        certifications: '',
        partnerships: '',
        sustainability: '',
        innovation: '',
        qualityAssurance: '',
        afterSalesService: '',
        sparePartsAvailability: '',
        technicalSupport: '',
        installationServices: '',
        maintenanceTips: '',
        troubleshooting: '',
        faq: '',
        testimonials: '',
        // New Service Centers fields
        serviceCenters: '',
        authorizedDealers: '',
        repairCenters: '',
        customerCareNumbers: '',
        emailSupport: '',
        liveChatSupport: '',
        onlineBooking: '',
        emergencySupport: '',
        // Additional comprehensive fields
        brandLogo: '',
        brandWebsite: '',
        socialMediaLinks: '',
        pressReleases: '',
        annualReports: '',
        investorRelations: '',
        corporateResponsibility: '',
        environmentalPolicy: '',
        dataPrivacy: '',
        termsOfService: '',
        returnPolicy: '',
        shippingInfo: '',
        paymentOptions: '',
        financingOptions: '',
        tradeInProgram: '',
        loyaltyProgram: '',
        referralProgram: '',
        warrantyExtension: '',
        insuranceOptions: '',
        extendedService: '',
        preventiveMaintenance: '',
        energyEfficiency: '',
        smartFeatures: '',
        connectivity: '',
        securityFeatures: '',
        accessibility: '',
        customization: '',
        integration: '',
        compatibility: '',
        performance: '',
        reliability: '',
        durability: '',
        safety: '',
        compliance: '',
        standards: '',
        regulations: '',
        industryAwards: '',
        mediaCoverage: '',
        expertReviews: '',
        userRatings: '',
        marketShare: '',
        globalPresence: '',
        manufacturing: '',
        supplyChain: '',
        researchDevelopment: '',
        patents: '',
        trademarks: '',
        copyrights: '',
        licensing: '',
        distribution: '',
        retailPartners: '',
        onlineStores: '',
        mobileApps: '',
        smartHome: '',
        iotIntegration: '',
        cloudServices: '',
        dataBackup: '',
        remoteMonitoring: '',
        predictiveMaintenance: '',
        aiFeatures: '',
        voiceControl: '',
        automation: '',
        energySaving: '',
        ecoFriendly: '',
        recyclable: '',
        carbonFootprint: '',
        greenCertification: '',
        featuredModels: [],
        isActive: true
      })
      setSelectedCategory('')
      setSelectedBrand('')
      setSelectedModels([])
      setShowForm(false)
      
    } catch (error) {
      console.error('Error saving brand page:', error)
      toast.error('Failed to save brand page')
    }
  }

  // Get brands for selected category
  const filteredBrands = selectedCategory 
    ? brands.filter(brand => brand.category === selectedCategory)
    : []

  // Get models for selected brand
  const brandModels = selectedBrand 
    ? models.filter(model => model.brandId === selectedBrand)
    : []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e60012]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>
          Brand Page Management
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#e60012] hover:bg-[#d40010] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e60012]"
          style={{ '--tw-ring-offset-color': 'var(--panel-charcoal)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Brand Page
        </button>
      </div>

      {/* Existing Brand Pages */}
      <div className="rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: 'var(--panel-charcoal)' }}>
        <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-main)' }}>
            Existing Brand Pages ({brandPages.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y" style={{ borderColor: 'var(--border-color)' }}>
            <thead style={{ backgroundColor: 'var(--panel-gray)' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Brand
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  SEO Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Featured Models
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ backgroundColor: 'var(--panel-charcoal)', borderColor: 'var(--border-color)' }}>
              {brandPages.length > 0 ? (
                brandPages.map((page) => (
                  <tr key={page.id} className="hover:bg-opacity-20 hover:bg-gray-600 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>
                        {page.brandName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {page.category}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {page.seoTitle}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {page.featuredModels?.length || 0} models
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        page.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {page.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => {
                            setBrandPageForm(page)
                            setSelectedCategory(page.category)
                            setSelectedBrand(page.brandId)
                            setSelectedModels(page.featuredModels || [])
                            setShowForm(true)
                          }}
                          className="text-blue-500 hover:text-blue-600 font-medium"
                        >
                          Edit
                        </button>
                        <a
                          href={`/brands/${encodeURIComponent(page.brandName.toLowerCase())}/${encodeURIComponent(page.category.toLowerCase())}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-700 font-medium underline cursor-pointer"
                        >
                          View
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                    No brand pages created yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {brandPageForm.brandId ? 'Edit Brand Page' : 'Create Brand Page'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Basic Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-4 text-gray-900">Basic Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Category *
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      required
                    >
                      <option value="">Choose a category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  {/* Brand Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Brand *
                    </label>
                    <select
                      value={selectedBrand}
                      onChange={(e) => handleBrandChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      disabled={!selectedCategory}
                      required
                    >
                      <option value="">Choose a brand</option>
                      {filteredBrands.map(brand => (
                        <option key={brand.id} value={brand.id}>{brand.name}</option>
                      ))}
                    </select>
                    {!selectedCategory && (
                      <p className="text-sm text-gray-500 mt-1">Please select a category first</p>
                    )}
                  </div>
                </div>

                {selectedBrand && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={generateSEOContent}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Auto-Generate SEO Content
                    </button>
                  </div>
                )}
              </div>

              {/* SEO Section */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-4 text-gray-900">SEO & Meta Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SEO Title *
                    </label>
                    <input
                      type="text"
                      value={brandPageForm.seoTitle}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, seoTitle: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="Best Samsung phones, prices, and reviews"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SEO Keywords
                    </label>
                    <input
                      type="text"
                      value={brandPageForm.seoKeywords}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, seoKeywords: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="samsung, phones, mobile, smartphones"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Description
                  </label>
                  <textarea
                    value={brandPageForm.seoDescription}
                    onChange={(e) => setBrandPageForm({ ...brandPageForm, seoDescription: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                    placeholder="Meta description for search engines..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Robots
                    </label>
                    <input
                      type="text"
                      value={brandPageForm.metaRobots}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, metaRobots: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="index, follow"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Canonical URL
                    </label>
                    <input
                      type="url"
                      value={brandPageForm.canonicalUrl}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, canonicalUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="https://callmibro.com/brands/samsung"
                    />
                  </div>
                </div>
              </div>

              {/* Brand Information */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-4 text-gray-900">Brand Information</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand Overview
                    </label>
                    <textarea
                      value={brandPageForm.overview}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, overview: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="Detailed brand overview and history..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Brand History
                      </label>
                      <textarea
                        value={brandPageForm.brandHistory}
                        onChange={(e) => setBrandPageForm({ ...brandPageForm, brandHistory: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                        placeholder="Brand history and milestones..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Brand Mission
                      </label>
                      <textarea
                        value={brandPageForm.brandMission}
                        onChange={(e) => setBrandPageForm({ ...brandPageForm, brandMission: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                        placeholder="Brand mission statement..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand Vision
                    </label>
                    <textarea
                      value={brandPageForm.brandVision}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, brandVision: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="Brand vision and future goals..."
                    />
                  </div>
                </div>
              </div>

              {/* Features & Benefits */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-4 text-gray-900">Features & Benefits</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Key Features
                    </label>
                    <textarea
                      value={brandPageForm.keyFeatures}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, keyFeatures: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="Key features and benefits of this brand..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Why Choose This Brand
                    </label>
                    <textarea
                      value={brandPageForm.whyChoose}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, whyChoose: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="Reasons to choose this brand..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand Strengths
                    </label>
                    <textarea
                      value={brandPageForm.brandStrengths}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, brandStrengths: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="Key strengths and competitive advantages..."
                    />
                  </div>
                </div>
              </div>

              {/* Products & Services */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-4 text-gray-900">Products & Services</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Range
                    </label>
                    <textarea
                      value={brandPageForm.productRange}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, productRange: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="Available product range and categories..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Areas
                    </label>
                    <textarea
                      value={brandPageForm.serviceAreas}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, serviceAreas: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="Geographic service coverage..."
                    />
                  </div>
                </div>
              </div>

              {/* Support & Services */}
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-4 text-gray-900">Support & Services</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Warranty Information
                    </label>
                    <textarea
                      value={brandPageForm.warrantyInfo}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, warrantyInfo: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="Warranty terms and conditions..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Support
                    </label>
                    <textarea
                      value={brandPageForm.customerSupport}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, customerSupport: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="Customer support details..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      After Sales Service
                    </label>
                    <textarea
                      value={brandPageForm.afterSalesService}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, afterSalesService: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="After sales service information..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Spare Parts Availability
                    </label>
                    <textarea
                      value={brandPageForm.sparePartsAvailability}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, sparePartsAvailability: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="Spare parts availability and sourcing..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Technical Support
                    </label>
                    <textarea
                      value={brandPageForm.technicalSupport}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, technicalSupport: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="Technical support services..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Installation Services
                    </label>
                    <textarea
                      value={brandPageForm.installationServices}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, installationServices: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="Installation and setup services..."
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-pink-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-4 text-gray-900">Additional Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Awards & Recognition
                    </label>
                    <textarea
                      value={brandPageForm.awardsRecognition}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, awardsRecognition: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="Awards, certifications, and recognition..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Certifications
                    </label>
                    <textarea
                      value={brandPageForm.certifications}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, certifications: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="Industry certifications and standards..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Partnerships
                    </label>
                    <textarea
                      value={brandPageForm.partnerships}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, partnerships: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="Strategic partnerships and collaborations..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sustainability
                    </label>
                    <textarea
                      value={brandPageForm.sustainability}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, sustainability: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="Environmental initiatives and sustainability..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Innovation
                    </label>
                    <textarea
                      value={brandPageForm.innovation}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, innovation: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="Innovation and R&D initiatives..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quality Assurance
                    </label>
                    <textarea
                      value={brandPageForm.qualityAssurance}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, qualityAssurance: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="Quality assurance processes..."
                    />
                  </div>
                </div>
              </div>

              {/* Help & Resources */}
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-4 text-gray-900">Help & Resources</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maintenance Tips
                    </label>
                    <textarea
                      value={brandPageForm.maintenanceTips}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, maintenanceTips: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="Maintenance tips and best practices..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Troubleshooting
                    </label>
                    <textarea
                      value={brandPageForm.troubleshooting}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, troubleshooting: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="Common troubleshooting guides..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      FAQ
                    </label>
                    <textarea
                      value={brandPageForm.faq}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, faq: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="Frequently asked questions..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Testimonials
                    </label>
                    <textarea
                      value={brandPageForm.testimonials}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, testimonials: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="Customer testimonials and reviews..."
                    />
                  </div>
                </div>
              </div>

              {/* Service Centers */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-4 text-gray-900">Service Centers</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Centers
                    </label>
                    <textarea
                      value={brandPageForm.serviceCenters}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, serviceCenters: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="List of authorized service centers..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Authorized Dealers
                    </label>
                    <textarea
                      value={brandPageForm.authorizedDealers}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, authorizedDealers: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="List of authorized dealers..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Repair Centers
                    </label>
                    <textarea
                      value={brandPageForm.repairCenters}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, repairCenters: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="List of repair centers..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Care Numbers
                    </label>
                    <textarea
                      value={brandPageForm.customerCareNumbers}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, customerCareNumbers: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="Customer care numbers for different regions..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Support
                    </label>
                    <textarea
                      value={brandPageForm.emailSupport}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, emailSupport: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="Email addresses for customer support..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Live Chat Support
                    </label>
                    <textarea
                      value={brandPageForm.liveChatSupport}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, liveChatSupport: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="Live chat platforms for support..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Online Booking
                    </label>
                    <textarea
                      value={brandPageForm.onlineBooking}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, onlineBooking: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="Online booking platforms..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Emergency Support
                    </label>
                    <textarea
                      value={brandPageForm.emergencySupport}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, emergencySupport: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="Emergency support contact details..."
                    />
                  </div>
                </div>
              </div>

              {/* Brand Details & Links */}
              <div className="bg-cyan-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-4 text-gray-900">Brand Details & Links</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand Logo URL
                    </label>
                    <input
                      type="url"
                      value={brandPageForm.brandLogo}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, brandLogo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand Website
                    </label>
                    <input
                      type="url"
                      value={brandPageForm.brandWebsite}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, brandWebsite: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="https://brand.com"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Social Media Links
                  </label>
                  <textarea
                    value={brandPageForm.socialMediaLinks}
                    onChange={(e) => setBrandPageForm({ ...brandPageForm, socialMediaLinks: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                    placeholder="Facebook, Twitter, Instagram, LinkedIn, YouTube links..."
                  />
                </div>
              </div>

              {/* Policies & Legal */}
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-4 text-gray-900">Policies & Legal</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Terms of Service
                    </label>
                    <textarea
                      value={brandPageForm.termsOfService}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, termsOfService: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="Terms of service information..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Return Policy
                    </label>
                    <textarea
                      value={brandPageForm.returnPolicy}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, returnPolicy: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="Return and refund policy..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data Privacy
                    </label>
                    <textarea
                      value={brandPageForm.dataPrivacy}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, dataPrivacy: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="Data privacy and protection policies..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shipping Information
                    </label>
                    <textarea
                      value={brandPageForm.shippingInfo}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, shippingInfo: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="Shipping and delivery information..."
                    />
                  </div>
                </div>
              </div>

              {/* Payment & Financing */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-4 text-gray-900">Payment & Financing</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Options
                    </label>
                    <textarea
                      value={brandPageForm.paymentOptions}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, paymentOptions: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="Accepted payment methods..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Financing Options
                    </label>
                    <textarea
                      value={brandPageForm.financingOptions}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, financingOptions: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="EMI and financing options..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trade-In Program
                    </label>
                    <textarea
                      value={brandPageForm.tradeInProgram}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, tradeInProgram: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="Trade-in and exchange programs..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loyalty Program
                    </label>
                    <textarea
                      value={brandPageForm.loyaltyProgram}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, loyaltyProgram: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="Loyalty and rewards programs..."
                    />
                  </div>
                </div>
              </div>

              {/* Product Features */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-4 text-gray-900">Product Features</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Smart Features
                    </label>
                    <textarea
                      value={brandPageForm.smartFeatures}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, smartFeatures: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="Smart and intelligent features..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Connectivity
                    </label>
                    <textarea
                      value={brandPageForm.connectivity}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, connectivity: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="Connectivity options and protocols..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Security Features
                    </label>
                    <textarea
                      value={brandPageForm.securityFeatures}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, securityFeatures: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="Security and safety features..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Energy Efficiency
                    </label>
                    <textarea
                      value={brandPageForm.energyEfficiency}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, energyEfficiency: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="Energy efficiency ratings and features..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      AI Features
                    </label>
                    <textarea
                      value={brandPageForm.aiFeatures}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, aiFeatures: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="Artificial intelligence features..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Voice Control
                    </label>
                    <textarea
                      value={brandPageForm.voiceControl}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, voiceControl: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="Voice control and assistant features..."
                    />
                  </div>
                </div>
              </div>

              {/* Environmental & Corporate */}
              <div className="bg-emerald-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-4 text-gray-900">Environmental & Corporate</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Environmental Policy
                    </label>
                    <textarea
                      value={brandPageForm.environmentalPolicy}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, environmentalPolicy: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="Environmental policies and initiatives..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Corporate Responsibility
                    </label>
                    <textarea
                      value={brandPageForm.corporateResponsibility}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, corporateResponsibility: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="Corporate social responsibility initiatives..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Eco-Friendly Features
                    </label>
                    <textarea
                      value={brandPageForm.ecoFriendly}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, ecoFriendly: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="Eco-friendly and sustainable features..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Green Certification
                    </label>
                    <textarea
                      value={brandPageForm.greenCertification}
                      onChange={(e) => setBrandPageForm({ ...brandPageForm, greenCertification: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      placeholder="Green certifications and standards..."
                    />
                  </div>
                </div>
              </div>

              {/* Featured Models Selection */}
              {selectedBrand && brandModels.length > 0 && (
                <div className="bg-teal-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold mb-4 text-gray-900">Featured Models</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto border rounded-md p-3" style={{ borderColor: 'var(--border-color)' }}>
                    {brandModels.map(model => (
                      <label key={model.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedModels.includes(model.id)}
                          onChange={(e) => handleModelSelection(model.id, e.target.checked)}
                          className="h-4 w-4 text-[#e60012] focus:ring-[#e60012] border-gray-300 rounded"
                        />
                        <span className="text-sm" style={{ color: 'var(--text-main)' }}>
                          {model.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={brandPageForm.isActive}
                    onChange={(e) => setBrandPageForm({ ...brandPageForm, isActive: e.target.checked })}
                    className="h-4 w-4 text-[#e60012] focus:ring-[#e60012] border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                    Active
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#e60012] rounded-md hover:bg-[#d40010]"
                >
                  {brandPageForm.brandId ? 'Update' : 'Create'} Brand Page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 