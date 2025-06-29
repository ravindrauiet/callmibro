'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { collection, getDocs, query, where, orderBy, limit, startAfter, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { toast } from 'react-hot-toast'

export default function OrdersManagement() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [lastVisible, setLastVisible] = useState(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [noMoreOrders, setNoMoreOrders] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [newStatus, setNewStatus] = useState('')

  const ORDERS_PER_PAGE = 10

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      try {
        let ordersQuery = collection(db, 'orders')
        
        // Apply status filter if not 'all'
        if (filterStatus !== 'all') {
          ordersQuery = query(
            ordersQuery,
            where('status', '==', filterStatus),
            orderBy('createdAt', 'desc'),
            limit(ORDERS_PER_PAGE)
          )
        } else {
          ordersQuery = query(
            ordersQuery,
            orderBy('createdAt', 'desc'),
            limit(ORDERS_PER_PAGE)
          )
        }
        
        const ordersSnapshot = await getDocs(ordersQuery)
        
        if (ordersSnapshot.empty) {
          setOrders([])
          setNoMoreOrders(true)
        } else {
          const ordersData = ordersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          setOrders(ordersData)
          setLastVisible(ordersSnapshot.docs[ordersSnapshot.docs.length - 1])
          setNoMoreOrders(ordersSnapshot.docs.length < ORDERS_PER_PAGE)
        }
      } catch (error) {
        console.error('Error fetching orders:', error)
        toast.error('Failed to load orders')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [filterStatus])

  // Load more orders
  const loadMoreOrders = async () => {
    if (loadingMore || noMoreOrders) return
    
    setLoadingMore(true)
    try {
      let ordersQuery
      
      if (filterStatus !== 'all') {
        ordersQuery = query(
          collection(db, 'orders'),
          where('status', '==', filterStatus),
          orderBy('createdAt', 'desc'),
          startAfter(lastVisible),
          limit(ORDERS_PER_PAGE)
        )
      } else {
        ordersQuery = query(
          collection(db, 'orders'),
          orderBy('createdAt', 'desc'),
          startAfter(lastVisible),
          limit(ORDERS_PER_PAGE)
        )
      }
      
      const ordersSnapshot = await getDocs(ordersQuery)
      
      if (ordersSnapshot.empty) {
        setNoMoreOrders(true)
      } else {
        const newOrders = ordersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        setOrders(prev => [...prev, ...newOrders])
        setLastVisible(ordersSnapshot.docs[ordersSnapshot.docs.length - 1])
        setNoMoreOrders(ordersSnapshot.docs.length < ORDERS_PER_PAGE)
      }
    } catch (error) {
      console.error('Error loading more orders:', error)
      toast.error('Failed to load more orders')
    } finally {
      setLoadingMore(false)
    }
  }

  // Handle status change
  const openStatusModal = (order) => {
    setSelectedOrder(order)
    setNewStatus(order.status)
    setShowStatusModal(true)
  }

  const updateOrderStatus = async () => {
    if (!selectedOrder || !newStatus) return
    
    try {
      await updateDoc(doc(db, 'orders', selectedOrder.id), {
        status: newStatus,
        updatedAt: new Date()
      })
      
      // Update order in state
      setOrders(prev => 
        prev.map(order => 
          order.id === selectedOrder.id 
            ? { ...order, status: newStatus } 
            : order
        )
      )
      
      toast.success('Order status updated successfully')
      setShowStatusModal(false)
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('Failed to update order status')
    }
  }

  // Filter orders based on search term
  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerPhone?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>Orders Management</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1 rounded-md text-sm ${
              filterStatus === 'all' 
                ? 'bg-[#e60012] text-white' 
                : 'hover:bg-opacity-20 hover:bg-gray-600'
            }`}
            style={{ 
              backgroundColor: filterStatus === 'all' ? '#e60012' : 'var(--panel-gray)',
              color: filterStatus === 'all' ? '#ffffff' : 'var(--text-secondary)'
            }}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1 rounded-md text-sm ${
              filterStatus === 'pending' 
                ? 'bg-[#e60012] text-white' 
                : 'hover:bg-opacity-20 hover:bg-gray-600'
            }`}
            style={{ 
              backgroundColor: filterStatus === 'pending' ? '#e60012' : 'var(--panel-gray)',
              color: filterStatus === 'pending' ? '#ffffff' : 'var(--text-secondary)'
            }}
          >
            Pending
          </button>
          <button
            onClick={() => setFilterStatus('processing')}
            className={`px-3 py-1 rounded-md text-sm ${
              filterStatus === 'processing' 
                ? 'bg-[#e60012] text-white' 
                : 'hover:bg-opacity-20 hover:bg-gray-600'
            }`}
            style={{ 
              backgroundColor: filterStatus === 'processing' ? '#e60012' : 'var(--panel-gray)',
              color: filterStatus === 'processing' ? '#ffffff' : 'var(--text-secondary)'
            }}
          >
            Processing
          </button>
          <button
            onClick={() => setFilterStatus('shipped')}
            className={`px-3 py-1 rounded-md text-sm ${
              filterStatus === 'shipped' 
                ? 'bg-[#e60012] text-white' 
                : 'hover:bg-opacity-20 hover:bg-gray-600'
            }`}
            style={{ 
              backgroundColor: filterStatus === 'shipped' ? '#e60012' : 'var(--panel-gray)',
              color: filterStatus === 'shipped' ? '#ffffff' : 'var(--text-secondary)'
            }}
          >
            Shipped
          </button>
          <button
            onClick={() => setFilterStatus('delivered')}
            className={`px-3 py-1 rounded-md text-sm ${
              filterStatus === 'delivered' 
                ? 'bg-[#e60012] text-white' 
                : 'hover:bg-opacity-20 hover:bg-gray-600'
            }`}
            style={{ 
              backgroundColor: filterStatus === 'delivered' ? '#e60012' : 'var(--panel-gray)',
              color: filterStatus === 'delivered' ? '#ffffff' : 'var(--text-secondary)'
            }}
          >
            Delivered
          </button>
          <button
            onClick={() => setFilterStatus('cancelled')}
            className={`px-3 py-1 rounded-md text-sm ${
              filterStatus === 'cancelled' 
                ? 'bg-[#e60012] text-white' 
                : 'hover:bg-opacity-20 hover:bg-gray-600'
            }`}
            style={{ 
              backgroundColor: filterStatus === 'cancelled' ? '#e60012' : 'var(--panel-gray)',
              color: filterStatus === 'cancelled' ? '#ffffff' : 'var(--text-secondary)'
            }}
          >
            Cancelled
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search orders by ID, customer name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
          style={{ 
            backgroundColor: 'var(--panel-gray)', 
            borderColor: 'var(--border-color)',
            color: 'var(--text-main)'
          }}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--text-secondary)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: 'var(--panel-charcoal)' }}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y" style={{ borderColor: 'var(--border-color)' }}>
            <thead style={{ backgroundColor: 'var(--panel-gray)' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Total
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
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-opacity-20 hover:bg-gray-600 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {order.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm" style={{ color: 'var(--text-main)' }}>{order.customerName || 'N/A'}</div>
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{order.customerEmail || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-main)' }}>
                      ₹{order.totalAmount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <Link 
                          href={`/admin/orders/${order.id}`}
                          className="text-[#e60012] hover:text-[#ff6b6b]"
                        >
                          View
                        </Link>
                        <button 
                          onClick={() => openStatusModal(order)}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          Update Status
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {searchTerm ? 'No orders found matching your search' : 'No orders found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Load More Button */}
        {!noMoreOrders && (
          <div className="px-6 py-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <button
              onClick={loadMoreOrders}
              disabled={loadingMore}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#e60012] hover:bg-[#d40010] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e60012] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ '--tw-ring-offset-color': 'var(--panel-charcoal)' }}
            >
              {loadingMore ? 'Loading...' : 'Load More Orders'}
            </button>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Update Order Status</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order ID: {selectedOrder?.id.substring(0, 8)}...
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={updateOrderStatus}
                className="px-4 py-2 text-sm font-medium text-white bg-[#e60012] rounded-md hover:bg-[#d40010]"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }) {
  const { bgColor, textColor } = getStatusColor(status, 'badge')
  
  return (
    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}>
      {formatStatus(status)}
    </span>
  )
}

function formatStatus(status) {
  if (!status) return 'Unknown'
  
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function getStatusColor(status, type) {
  switch (status) {
    case 'pending':
      return { bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' }
    case 'processing':
      return { bgColor: 'bg-blue-100', textColor: 'text-blue-800' }
    case 'shipped':
      return { bgColor: 'bg-purple-100', textColor: 'text-purple-800' }
    case 'delivered':
      return { bgColor: 'bg-green-100', textColor: 'text-green-800' }
    case 'cancelled':
      return { bgColor: 'bg-red-100', textColor: 'text-red-800' }
    default:
      return { bgColor: 'bg-gray-100', textColor: 'text-gray-800' }
  }
} 