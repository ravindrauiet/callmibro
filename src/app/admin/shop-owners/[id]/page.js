'use client'

import { useState, useEffect } from 'react'
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/firebase/config'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function AdminShopOwnerDetailPage() {
  const params = useParams()
  const shopId = params.id
  
  const [shopOwner, setShopOwner] = useState(null)
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchShopOwnerDetails = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch shop owner details
        const shopDoc = await getDoc(doc(db, 'shopOwners', shopId))
        
        if (!shopDoc.exists()) {
          setError('Shop owner not found')
          return
        }
        
        const shopData = {
          id: shopDoc.id,
          ...shopDoc.data(),
          createdAt: shopDoc.data().createdAt?.toDate().toLocaleDateString('en-US') || 'Unknown',
          updatedAt: shopDoc.data().updatedAt?.toDate().toLocaleDateString('en-US') || 'Unknown'
        }
        
        setShopOwner(shopData)
        
        // Fetch inventory if shop has inventory
        if (shopData.hasInventory) {
          const inventoryQuery = query(collection(db, 'shopOwners', shopId, 'inventory'))
          const inventorySnapshot = await getDocs(inventoryQuery)
          
          const inventoryData = inventorySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate().toLocaleDateString('en-US') || 'Unknown',
            updatedAt: doc.data().updatedAt?.toDate().toLocaleDateString('en-US') || 'Unknown'
          }))
          
          setInventory(inventoryData)
        }
        
      } catch (error) {
        console.error('Error fetching shop owner details:', error)
        setError('Failed to load shop owner details')
      } finally {
        setLoading(false)
      }
    }
    
    if (shopId) {
      fetchShopOwnerDetails()
    }
  }, [shopId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e60012]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>Shop Owner Details</h2>
          <Link 
            href="/admin/shop-owners"
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Back to Shop Owners
          </Link>
        </div>
        <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
          {error}
        </div>
      </div>
    )
  }

  if (!shopOwner) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>Shop Owner Details</h2>
          <Link 
            href="/admin/shop-owners"
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Back to Shop Owners
          </Link>
        </div>
        <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
          Shop owner not found
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>Shop Owner Details</h2>
        <Link 
          href="/admin/shop-owners"
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          Back to Shop Owners
        </Link>
      </div>

      {/* Shop Owner Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: 'var(--panel-charcoal)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-main)' }}>Basic Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Shop Name</label>
                <p className="text-sm" style={{ color: 'var(--text-main)' }}>{shopOwner.shopName}</p>
              </div>
              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Owner Name</label>
                <p className="text-sm" style={{ color: 'var(--text-main)' }}>{shopOwner.ownerName}</p>
              </div>
              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Shop Category</label>
                <p className="text-sm" style={{ color: 'var(--text-main)' }}>{shopOwner.shopCategory}</p>
              </div>
              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Status</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  shopOwner.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                  shopOwner.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100' :
                  'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                }`}>
                  {shopOwner.status.charAt(0).toUpperCase() + shopOwner.status.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: 'var(--panel-charcoal)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-main)' }}>Contact Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Email</label>
                <p className="text-sm" style={{ color: 'var(--text-main)' }}>{shopOwner.shopEmail}</p>
              </div>
              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Phone</label>
                <p className="text-sm" style={{ color: 'var(--text-main)' }}>{shopOwner.shopPhone}</p>
              </div>
              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Address</label>
                <p className="text-sm" style={{ color: 'var(--text-main)' }}>{shopOwner.shopAddress}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Location Information */}
          <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: 'var(--panel-charcoal)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-main)' }}>Location Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>City</label>
                <p className="text-sm" style={{ color: 'var(--text-main)' }}>{shopOwner.city}</p>
              </div>
              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>State</label>
                <p className="text-sm" style={{ color: 'var(--text-main)' }}>{shopOwner.state}</p>
              </div>
              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Pincode</label>
                <p className="text-sm" style={{ color: 'var(--text-main)' }}>{shopOwner.pincode}</p>
              </div>
              {shopOwner.location && (
                <div>
                  <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Location (Map)</label>
                  <p className="text-sm" style={{ color: 'var(--text-main)' }}>
                    Latitude: {shopOwner.location.latitude}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-main)' }}>
                    Longitude: {shopOwner.location.longitude}
                  </p>
                </div>
              )}
              {shopOwner.latitude && shopOwner.longitude && !shopOwner.location && (
                <div>
                  <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Coordinates</label>
                  <p className="text-sm" style={{ color: 'var(--text-main)' }}>
                    {shopOwner.latitude}, {shopOwner.longitude}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Registration Information */}
          <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: 'var(--panel-charcoal)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-main)' }}>Registration Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Registration Date</label>
                <p className="text-sm" style={{ color: 'var(--text-main)' }}>{shopOwner.createdAt}</p>
              </div>
              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Last Updated</label>
                <p className="text-sm" style={{ color: 'var(--text-main)' }}>{shopOwner.updatedAt}</p>
              </div>
              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Has Inventory</label>
                <p className="text-sm" style={{ color: 'var(--text-main)' }}>
                  {shopOwner.hasInventory ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Section */}
      {shopOwner.hasInventory && (
        <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: 'var(--panel-charcoal)' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-main)' }}>Inventory ({inventory.length} items)</h3>
          
          {inventory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y" style={{ borderColor: 'var(--border-color)' }}>
                <thead style={{ backgroundColor: 'var(--panel-dark)' }}>
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      Item
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      Brand
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      Model
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      Quantity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                  {inventory.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium" style={{ color: 'var(--text-main)' }}>{item.name}</span>
                          {item.description && (
                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.description}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-main)' }}>{item.category}</td>
                      <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-main)' }}>{item.brand}</td>
                      <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-main)' }}>{item.model}</td>
                      <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-main)' }}>{item.quantity}</td>
                      <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-main)' }}>₹{item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-4" style={{ color: 'var(--text-secondary)' }}>
              No inventory items found
            </p>
          )}
        </div>
      )}
    </div>
  )
} 