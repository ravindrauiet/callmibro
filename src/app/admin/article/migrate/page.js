'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { toast } from 'react-hot-toast'

export default function ArticleMigration() {
  const [brands, setBrands] = useState([])
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [migrating, setMigrating] = useState(false)
  const [migrationProgress, setMigrationProgress] = useState(0)

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
        
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const migrateBrandPages = async () => {
    setMigrating(true)
    setMigrationProgress(0)
    
    try {
      let progress = 0
      const totalBrands = brands.length
      
      for (const brand of brands) {
        // Check if brand page already exists
        const existingPagesSnapshot = await getDocs(
          collection(db, 'brandPages')
        )
        const existingPages = existingPagesSnapshot.docs.map(doc => doc.data())
        const alreadyExists = existingPages.some(page => page.brandId === brand.id)
        
        if (!alreadyExists) {
          // Get models for this brand
          const brandModels = models.filter(model => model.brandId === brand.id)
          
          // Create brand page
          const brandPageData = {
            brandId: brand.id,
            brandName: brand.name,
            seoTitle: `Best ${brand.name} Products - Prices, Reviews & Services`,
            seoDescription: `Discover the best ${brand.name} products, prices, and expert repair services. Find genuine spare parts and professional technicians for all ${brand.name} devices.`,
            seoKeywords: `${brand.name.toLowerCase()}, ${brand.name} products, ${brand.name} repair, ${brand.name} spare parts, ${brand.name} service`,
            overview: `${brand.name} is a leading brand known for quality and innovation. Our expert technicians provide reliable repair services for all ${brand.name} products.`,
            features: `Genuine ${brand.name} spare parts, Expert technicians, Quick service, Warranty on repairs, Competitive pricing`,
            whyChoose: `Choose our service for ${brand.name} products because we offer genuine parts, certified technicians, quick turnaround time, and competitive pricing.`,
            featuredModels: brandModels.map(m => m.id),
            isActive: true,
            slug: brand.name.toLowerCase().replace(/\s+/g, '-'),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }
          
          await addDoc(collection(db, 'brandPages'), brandPageData)
          toast.success(`Created brand page for ${brand.name}`)
        }
        
        progress += 1
        setMigrationProgress((progress / totalBrands) * 100)
      }
      
      toast.success('Brand pages migration completed!')
    } catch (error) {
      console.error('Migration error:', error)
      toast.error('Migration failed')
    } finally {
      setMigrating(false)
    }
  }

  const migrateModelPages = async () => {
    setMigrating(true)
    setMigrationProgress(0)
    
    try {
      let progress = 0
      const totalModels = models.length
      
      for (const model of models) {
        // Check if model page already exists
        const existingPagesSnapshot = await getDocs(
          collection(db, 'modelPages')
        )
        const existingPages = existingPagesSnapshot.docs.map(doc => doc.data())
        const alreadyExists = existingPages.some(page => page.modelId === model.id)
        
        if (!alreadyExists) {
          // Get compatible spare parts
          const sparePartsSnapshot = await getDocs(collection(db, 'spareParts'))
          const allSpareParts = sparePartsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          
          const compatibleParts = allSpareParts.filter(part => 
            part.compatibleModels && part.compatibleModels.includes(model.name)
          )
          
          // Create model page
          const modelPageData = {
            modelId: model.id,
            modelName: model.name,
            brandName: model.brandName,
            category: model.category,
            seoTitle: `${model.brandName} ${model.name} - Price, Specs, Reviews & Spare Parts`,
            seoDescription: `Complete guide to ${model.brandName} ${model.name}. Find specifications, features, compatible spare parts, and expert repair services.`,
            seoKeywords: `${model.brandName.toLowerCase()} ${model.name.toLowerCase()}, ${model.name} price, ${model.name} specs, ${model.name} spare parts, ${model.name} repair`,
            overview: `The ${model.brandName} ${model.name} is a reliable ${model.category} that offers excellent performance and durability. Our expert technicians provide professional repair services for this model.`,
            specifications: {
              'Brand': model.brandName,
              'Model': model.name,
              'Category': model.category,
              'Status': model.isActive ? 'Active' : 'Discontinued'
            },
            features: [
              'High-quality build',
              'Reliable performance',
              'Easy maintenance',
              'Wide spare parts availability'
            ],
            priceComparison: {
              amazon: '',
              flipkart: '',
              croma: ''
            },
            compatibleSpareParts: compatibleParts.map(p => p.id),
            isActive: true,
            slug: model.name.toLowerCase().replace(/\s+/g, '-'),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }
          
          await addDoc(collection(db, 'modelPages'), modelPageData)
          toast.success(`Created model page for ${model.name}`)
        }
        
        progress += 1
        setMigrationProgress((progress / totalModels) * 100)
      }
      
      toast.success('Model pages migration completed!')
    } catch (error) {
      console.error('Migration error:', error)
      toast.error('Migration failed')
    } finally {
      setMigrating(false)
    }
  }

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
          SEO Pages Migration Tool
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Brand Pages Migration */}
        <div className="rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: 'var(--panel-charcoal)' }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-main)' }}>
              Brand Pages Migration
            </h3>
          </div>
          <div className="p-6">
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              Create SEO-optimized brand pages for all existing brands in your database.
            </p>
            <div className="mb-4">
              <span className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>
                Brands to migrate: {brands.length}
              </span>
            </div>
            {migrating && (
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#e60012] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${migrationProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Progress: {Math.round(migrationProgress)}%
                </p>
              </div>
            )}
            <button
              onClick={migrateBrandPages}
              disabled={migrating}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#e60012] hover:bg-[#d40010] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e60012] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ '--tw-ring-offset-color': 'var(--panel-charcoal)' }}
            >
              {migrating ? 'Migrating...' : 'Migrate Brand Pages'}
            </button>
          </div>
        </div>

        {/* Model Pages Migration */}
        <div className="rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: 'var(--panel-charcoal)' }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-main)' }}>
              Model Pages Migration
            </h3>
          </div>
          <div className="p-6">
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              Create SEO-optimized model pages for all existing models in your database.
            </p>
            <div className="mb-4">
              <span className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>
                Models to migrate: {models.length}
              </span>
            </div>
            {migrating && (
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#e60012] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${migrationProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Progress: {Math.round(migrationProgress)}%
                </p>
              </div>
            )}
            <button
              onClick={migrateModelPages}
              disabled={migrating}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#e60012] hover:bg-[#d40010] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e60012] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ '--tw-ring-offset-color': 'var(--panel-charcoal)' }}
            >
              {migrating ? 'Migrating...' : 'Migrate Model Pages'}
            </button>
          </div>
        </div>

      </div>

      {/* Instructions */}
      <div className="rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: 'var(--panel-charcoal)' }}>
        <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-main)' }}>
            Migration Instructions
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <div>
              <h4 className="font-medium mb-2" style={{ color: 'var(--text-main)' }}>What this tool does:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Creates SEO-optimized brand pages for all existing brands</li>
                <li>Creates SEO-optimized model pages for all existing models</li>
                <li>Automatically generates meta titles, descriptions, and keywords</li>
                <li>Links compatible spare parts to model pages</li>
                <li>Creates proper URL slugs for SEO-friendly routing</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2" style={{ color: 'var(--text-main)' }}>After migration:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Review and edit the generated content in the Pages Management section</li>
                <li>Add more detailed specifications and features</li>
                <li>Update price comparison URLs</li>
                <li>Customize SEO content for better search rankings</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2" style={{ color: 'var(--text-main)' }}>Generated URLs:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Brand pages: /brands/[brand-name]</li>
                <li>Model pages: /brands/[brand]/[category]/[model]</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
} 