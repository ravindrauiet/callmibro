'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore'
import { db } from '@/firebase/config'
import Link from 'next/link'

export default function AdminShopOwnersPage() {
  const [shopOwners, setShopOwners] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [processingId, setProcessingId] = useState(null)

  useEffect(() => {
    const fetchShopOwners = async () => {
      try {
        setLoading(true)
        const shopOwnersQuery = query(collection(db, 'shopOwners'), orderBy('createdAt', 'desc'))
        const snapshot = await getDocs(shopOwnersQuery)
        
        const shopOwnersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate().toLocaleDateString('en-US') || 'Unknown'
        }))
        
        setShopOwners(shopOwnersData)
      } catch (error) {
        console.error('Error fetching shop owners:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchShopOwners()
  }, [])
  
  const handleStatusChange = async (shopId, newStatus) => {
    setProcessingId(shopId)
    
    try {
      const shopRef = doc(db, 'shopOwners', shopId)
      await updateDoc(shopRef, {
        status: newStatus,
        updatedAt: new Date()
      })
      
      // Update local state
      setShopOwners(prevOwners => 
        prevOwners.map(owner => 
          owner.id === shopId ? { ...owner, status: newStatus } : owner
        )
      )
    } catch (error) {
      console.error('Error updating shop status:', error)
    } finally {
      setProcessingId(null)
    }
  }
  
  // Filter shop owners based on status and search term
  const filteredShopOwners = shopOwners.filter(shop => {
    const matchesStatus = statusFilter === 'all' || shop.status === statusFilter
    const matchesSearch = searchTerm === '' || 
      shop.shopName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.shopEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesStatus && matchesSearch
  })
  
  // Get counts for status filters
  const statusCounts = {
    all: shopOwners.length,
    pending: shopOwners.filter(shop => shop.status === 'pending').length,
    approved: shopOwners.filter(shop => shop.status === 'approved').length,
    rejected: shopOwners.filter(shop => shop.status === 'rejected').length
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>Shop Owners</h2>
        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Total: {shopOwners.length} shop owners
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              statusFilter === 'all' 
                ? 'bg-[#e60012] text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
            }`}
          >
            All ({statusCounts.all})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              statusFilter === 'pending' 
                ? 'bg-amber-500 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
            }`}
          >
            Pending ({statusCounts.pending})
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              statusFilter === 'approved' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
            }`}
          >
            Approved ({statusCounts.approved})
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              statusFilter === 'rejected' 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
            }`}
          >
            Rejected ({statusCounts.rejected})
          </button>
        </div>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Search shop owners..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
            style={{ backgroundColor: 'var(--panel-charcoal)' }}
          />
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2" 
            style={{ color: 'var(--text-secondary)' }}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      
      {/* Shop Owners Table */}
      <div className="overflow-x-auto rounded-lg shadow-md" style={{ backgroundColor: 'var(--panel-charcoal)' }}>
        <table className="min-w-full divide-y" style={{ borderColor: 'var(--border-color)' }}>
          <thead style={{ backgroundColor: 'var(--panel-dark)' }}>
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Shop Details
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Owner
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Contact
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
            {filteredShopOwners.length > 0 ? (
              filteredShopOwners.map((shop) => (
                <tr key={shop.id}>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium" style={{ color: 'var(--text-main)' }}>{shop.shopName}</span>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{shop.shopCategory}</span>
                      <span className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Registered: {shop.createdAt}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm" style={{ color: 'var(--text-main)' }}>{shop.ownerName}</div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{shop.shopEmail}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm" style={{ color: 'var(--text-main)' }}>{shop.shopPhone}</div>
                    <div className="text-sm truncate max-w-[200px]" style={{ color: 'var(--text-secondary)' }}>{shop.shopAddress}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      shop.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                      shop.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100' :
                      'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                    }`}>
                      {shop.status.charAt(0).toUpperCase() + shop.status.slice(1)}
                    </span>
                    <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                      {shop.hasInventory ? 'Has inventory' : 'No inventory'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium space-y-2">
                    <div className="flex flex-col space-y-2">
                      <Link 
                        href={`/admin/shop-owners/${shop.id}`}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        View Details
                      </Link>
                      
                      {shop.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(shop.id, 'approved')}
                            disabled={processingId === shop.id}
                            className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
                          >
                            {processingId === shop.id ? 'Processing...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleStatusChange(shop.id, 'rejected')}
                            disabled={processingId === shop.id}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                          >
                            {processingId === shop.id ? 'Processing...' : 'Reject'}
                          </button>
                        </>
                      )}
                      
                      {shop.status === 'approved' && (
                        <button
                          onClick={() => handleStatusChange(shop.id, 'rejected')}
                          disabled={processingId === shop.id}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                        >
                          {processingId === shop.id ? 'Processing...' : 'Suspend'}
                        </button>
                      )}
                      
                      {shop.status === 'rejected' && (
                        <button
                          onClick={() => handleStatusChange(shop.id, 'approved')}
                          disabled={processingId === shop.id}
                          className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
                        >
                          {processingId === shop.id ? 'Processing...' : 'Reinstate'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center" style={{ color: 'var(--text-secondary)' }}>
                  No shop owners found matching the filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
