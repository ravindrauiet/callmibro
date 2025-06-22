// Migration script to move models from brand subcollections to a separate models collection
'use client'

import { useState } from 'react'
// import { collection, getDocs, doc, addDoc, serverTimestamp, query, where } from 'firebase/firestore'
// import { db } from '@/firebase/config'
import { toast } from 'react-hot-toast'

export default function MigrateModels() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [migrationComplete, setMigrationComplete] = useState(false)

  const runMigration = async () => {
    // Migration functionality disabled
    toast.error('Migration functionality has been disabled by administrator')
    
    /* 
    Migration code has been commented out as requested by the administrator.
    This feature is not intended to be used in the current version.
    
    if (loading) return
    if (migrationComplete) {
      toast.error('Migration has already been completed')
      return
    }

    setLoading(true)
    setResults({ migrated: 0, errors: 0, logs: [] })

    try {
      // Step 1: Fetch all brands
      const brandsSnapshot = await getDocs(collection(db, 'brands'))
      const brandsData = brandsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      addLog(`Found ${brandsData.length} brands to process`)
      
      // Step 2: For each brand, fetch its models and migrate them
      let migratedCount = 0
      let errorCount = 0
      
      for (const brand of brandsData) {
        try {
          addLog(`Processing brand: ${brand.name} (${brand.category || 'No Category'})`)
          
          // Get models for this brand
          const modelsSnapshot = await getDocs(collection(db, 'brands', brand.id, 'models'))
          
          if (modelsSnapshot.empty) {
            addLog(`No models found for brand: ${brand.name}`)
            continue
          }
          
          addLog(`Found ${modelsSnapshot.size} models for brand: ${brand.name}`)
          
          // Migrate each model to the new collection
          for (const modelDoc of modelsSnapshot.docs) {
            try {
              const modelData = modelDoc.data()
              
              // Create the new model document in the models collection
              await addDoc(collection(db, 'models'), {
                id: modelDoc.id,
                brandId: brand.id,
                brandName: brand.name,
                category: brand.category || 'Uncategorized',
                name: modelData.name,
                description: modelData.description || '',
                photoURL: modelData.photoURL || '',
                isActive: modelData.isActive !== false,
                price: modelData.price || null, // Not showing standard price in frontend
                createdAt: modelData.createdAt || serverTimestamp(),
                updatedAt: serverTimestamp()
              })
              
              migratedCount++
              addLog(`Migrated model: ${modelData.name}`)
            } catch (modelError) {
              errorCount++
              addLog(`Error migrating model ${modelDoc.id}: ${modelError.message}`, true)
            }
          }
        } catch (brandError) {
          errorCount++
          addLog(`Error processing brand ${brand.id}: ${brandError.message}`, true)
        }
      }
      
      addLog(`Migration completed. Migrated ${migratedCount} models with ${errorCount} errors.`)
      setResults(prev => ({ ...prev, migrated: migratedCount, errors: errorCount }))
      setMigrationComplete(true)
      
      if (errorCount === 0) {
        toast.success(`Successfully migrated ${migratedCount} models`)
      } else {
        toast.warning(`Migration completed with ${errorCount} errors. See log for details.`)
      }
    } catch (error) {
      addLog(`Migration failed: ${error.message}`, true)
      toast.error('Migration failed. See console for details.')
      console.error('Migration error:', error)
    } finally {
      setLoading(false)
    }
    */
  }
  
  const addLog = (message, isError = false) => {
    console.log(isError ? `ERROR: ${message}` : message)
    setResults(prev => ({
      ...prev,
      logs: [...(prev?.logs || []), { message, isError, timestamp: new Date() }]
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white">Models Migration Utility</h2>
      </div>
      
      <div className="bg-[#1a1a1a] rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-2">Data Migration Tool</h3>
          <p className="text-gray-300 mb-4">
            This utility has been disabled by the administrator.
          </p>
          
          <div className="bg-[#222] border border-[#333] rounded-md p-4 mb-4">
            <h4 className="text-md font-medium text-white mb-2">Notice:</h4>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li>The migration functionality has been disabled.</li>
              <li>Please contact system administrator for more information.</li>
            </ul>
          </div>
          
          <button
            onClick={runMigration}
            disabled={true}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 cursor-not-allowed focus:outline-none"
          >
            Migration Disabled
          </button>
        </div>
      </div>
    </div>
  )
} 