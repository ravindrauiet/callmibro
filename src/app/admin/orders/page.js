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
        <h2 className="text-2xl font-bold text-white">Orders Management</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1 rounded-md text-sm ${
              filterStatus === 'all' 
                ? 'bg-[#e60012] text-white' 
                : 'bg-[#222] text-gray-300 hover:bg-[#333]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1 rounded-md text-sm ${
              filterStatus === 'pending' 
                ? 'bg-yellow-500 text-white' 
                : 'bg-[#222] text-gray-300 hover:bg-[#333]'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilterStatus('processing')}
            className={`px-3 py-1 rounded-md text-sm ${
              filterStatus === 'processing' 
                ? 'bg-blue-500 text-white' 
                : 'bg-[#222] text-gray-300 hover:bg-[#333]'
            }`}
          >
            Processing
          </button>
          <button
            onClick={() => setFilterStatus('shipped')}
            className={`px-3 py-1 rounded-md text-sm ${
              filterStatus === 'shipped' 
                ? 'bg-purple-500 text-white' 
                : 'bg-[#222] text-gray-300 hover:bg-[#333]'
            }`}
          >
            Shipped
          </button>
          <button
            onClick={() => setFilterStatus('delivered')}
            className={`px-3 py-1 rounded-md text-sm ${
              filterStatus === 'delivered' 
                ? 'bg-green-500 text-white' 
                : 'bg-[#222] text-gray-300 hover:bg-[#333]'
            }`}
          >
            Delivered
          </button>
          <button
            onClick={() => setFilterStatus('cancelled')}
            className={`px-3 py-1 rounded-md text-sm ${
              filterStatus === 'cancelled' 
                ? 'bg-red-500 text-white' 
                : 'bg-[#222] text-gray-300 hover:bg-[#333]'
            }`}
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
          className="w-full px-4 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#1a1a1a] rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#333]">
            <thead className="bg-[#222]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#1a1a1a] divide-y divide-[#333]">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#222] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {order.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div>
                        <div className="font-medium">{order.customerName || 'N/A'}</div>
                        <div className="text-gray-400">{order.customerEmail || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      ₹{order.totalAmount?.toLocaleString() || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => openStatusModal(order)}
                        className="px-2 py-1 rounded-full text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1a1a1a]"
                        style={{
                          backgroundColor: getStatusColor(order.status, 'bg'),
                          color: getStatusColor(order.status, 'text'),
                          borderColor: getStatusColor(order.status, 'border')
                        }}
                      >
                        {formatStatus(order.status)}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <Link 
                          href={`/admin/orders/${order.id}`}
                          className="text-indigo-500 hover:text-indigo-600"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => openStatusModal(order)}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          Update
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-400">
                    {searchTerm 
                      ? 'No orders found matching your search' 
                      : filterStatus !== 'all' 
                        ? `No ${filterStatus} orders found` 
                        : 'No orders found'
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Load More Button */}
        {!noMoreOrders && (
          <div className="px-6 py-3 border-t border-[#333] flex justify-center">
            <button
              onClick={loadMoreOrders}
              disabled={loadingMore}
              className={`px-4 py-2 text-sm font-medium text-white bg-[#333] hover:bg-[#444] rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e60012] ${loadingMore ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loadingMore ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </span>
              ) : (
                'Load More'
              )}
            </button>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-medium text-white mb-4">Update Order Status</h3>
            <p className="text-gray-300 mb-4">
              Order ID: <span className="font-medium">{selectedOrder?.id.substring(0, 8)}...</span>
            </p>
            
            <div className="mb-6">
              <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">
                Status
              </label>
              <select
                id="status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
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
                className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={updateOrderStatus}
                className="px-4 py-2 bg-[#e60012] rounded-md text-white hover:bg-[#d40010] focus:outline-none"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function to format status
function formatStatus(status) {
  if (!status) return 'Unknown'
  
  const formatted = status.charAt(0).toUpperCase() + status.slice(1)
  return formatted
}

// Helper function to get status color
function getStatusColor(status, type) {
  switch (status) {
    case 'pending':
      return type === 'bg' ? 'rgba(245, 158, 11, 0.2)' : 
             type === 'text' ? '#fcd34d' : 
             'rgba(245, 158, 11, 0.5)'
    case 'processing':
      return type === 'bg' ? 'rgba(59, 130, 246, 0.2)' : 
             type === 'text' ? '#93c5fd' : 
             'rgba(59, 130, 246, 0.5)'
    case 'shipped':
      return type === 'bg' ? 'rgba(168, 85, 247, 0.2)' : 
             type === 'text' ? '#c4b5fd' : 
             'rgba(168, 85, 247, 0.5)'
    case 'delivered':
      return type === 'bg' ? 'rgba(16, 185, 129, 0.2)' : 
             type === 'text' ? '#6ee7b7' : 
             'rgba(16, 185, 129, 0.5)'
    case 'cancelled':
      return type === 'bg' ? 'rgba(239, 68, 68, 0.2)' : 
             type === 'text' ? '#fca5a5' : 
             'rgba(239, 68, 68, 0.5)'
    default:
      return type === 'bg' ? 'rgba(156, 163, 175, 0.2)' : 
             type === 'text' ? '#d1d5db' : 
             'rgba(156, 163, 175, 0.5)'
  }
} 