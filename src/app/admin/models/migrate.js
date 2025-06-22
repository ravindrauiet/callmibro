// Migration script to move models from brand subcollections to a separate models collection
'use client'

import { useState } from 'react'
import { collection, getDocs, doc, addDoc, serverTimestamp, query, where } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { toast } from 'react-hot-toast'

export default function MigrateModels() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [migrationComplete, setMigrationComplete] = useState(false)

  const runMigration = async () => {
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
            This utility will migrate model data from brand subcollections to the new standalone models collection.
            This is a one-time operation and should only be run once.
          </p>
          
          <div className="bg-[#222] border border-[#333] rounded-md p-4 mb-4">
            <h4 className="text-md font-medium text-white mb-2">Important Notes:</h4>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li>This migration will copy data to the new structure without removing the old data.</li>
              <li>Make sure you have a backup of your database before proceeding.</li>
              <li>The migration may take some time depending on the amount of data.</li>
              <li>Do not refresh or close this page during migration.</li>
            </ul>
          </div>
          
          <button
            onClick={runMigration}
            disabled={loading || migrationComplete}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
              ${loading 
                ? 'bg-gray-600 cursor-not-allowed' 
                : migrationComplete 
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-[#e60012] hover:bg-[#d40010]'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e60012]`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Running Migration...
              </>
            ) : migrationComplete ? (
              'Migration Completed'
            ) : (
              'Start Migration'
            )}
          </button>
        </div>
        
        {results && (
          <div className="border-t border-[#333] pt-4">
            <h3 className="text-lg font-medium text-white mb-2">Migration Results</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-[#222] border border-[#333] rounded-md p-4">
                <div className="text-2xl font-bold text-white">{results.migrated}</div>
                <div className="text-sm text-gray-400">Models Migrated</div>
              </div>
              
              <div className="bg-[#222] border border-[#333] rounded-md p-4">
                <div className={`text-2xl font-bold ${results.errors > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {results.errors}
                </div>
                <div className="text-sm text-gray-400">Errors</div>
              </div>
            </div>
            
            <div className="bg-[#222] border border-[#333] rounded-md p-4 mt-4">
              <h4 className="text-md font-medium text-white mb-2">Migration Log:</h4>
              <div className="max-h-80 overflow-y-auto font-mono text-sm">
                {results.logs.map((log, index) => (
                  <div 
                    key={index} 
                    className={`py-1 border-b border-[#333] last:border-b-0 ${log.isError ? 'text-red-400' : 'text-gray-300'}`}
                  >
                    <span className="text-gray-500">
                      [{log.timestamp.toLocaleTimeString()}]
                    </span>{' '}
                    {log.message}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 