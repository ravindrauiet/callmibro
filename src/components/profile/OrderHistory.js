'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '@/firebase/config'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'

export default function OrderHistory() {
  const { currentUser } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch user orders from Firebase
  useEffect(() => {
    async function fetchOrders() {
      if (!currentUser) {
        setLoading(false)
        return
      }
      
      try {
        setLoading(true)
        setError(null)
        
        // Create a query to get orders for the current user
        const ordersRef = collection(db, 'orders')
        const q = query(
          ordersRef,
          where('userId', '==', currentUser.uid),
          orderBy('date', 'desc')
        )
        
        const querySnapshot = await getDocs(q)
        
        if (querySnapshot.empty) {
          setOrders([])
        } else {
          const ordersData = querySnapshot.docs.map(doc => {
            const data = doc.data()
            // Convert Firestore timestamps to JavaScript Date objects
            const orderDate = data.date?.toDate?.() || data.date
            
            return {
              id: doc.id,
              ...data,
              date: orderDate,
              // Ensure items array is properly formatted
              items: Array.isArray(data.items) ? data.items.map(item => ({
                ...item,
                price: typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0
              })) : [],
              // Ensure total is a number
              total: typeof data.total === 'number' ? data.total : parseFloat(data.total) || 0
            }
          })
          setOrders(ordersData)
        }
      } catch (error) {
        console.error('Error fetching orders:', error)
        setError('Failed to load your orders. Please try again.')
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    if (currentUser) {
      fetchOrders()
    }
  }, [currentUser])

  const getStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'bg-gradient-to-r from-green-800 to-green-900 text-green-100'
      case 'processing':
      case 'in progress':
        return 'bg-gradient-to-r from-[#e60012] to-[#ff6b6b] text-white'
      case 'cancelled':
        return 'bg-gradient-to-r from-gray-700 to-gray-800 text-gray-300'
      case 'shipped':
        return 'bg-gradient-to-r from-purple-800 to-purple-900 text-purple-100'
      case 'scheduled':
        return 'bg-gradient-to-r from-yellow-700 to-yellow-800 text-yellow-100'
      default:
        return 'bg-gradient-to-r from-gray-700 to-gray-800 text-gray-300'
    }
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    
    try {
      // If date is a timestamp or Date object
      if (date instanceof Date) {
        return date.toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }
      
      // If date is already a string
      if (typeof date === 'string') {
        return new Date(date).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }
      
      // If date is a Firestore timestamp
      if (date && typeof date.toDate === 'function') {
        return date.toDate().toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }
      
      return 'N/A'
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'N/A'
    }
  }

  const formatPrice = (price) => {
    try {
      if (typeof price !== 'number') {
        price = parseFloat(price) || 0
      }
      return `₹${price.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`
    } catch (error) {
      console.error('Error formatting price:', error)
      return '₹0.00'
    }
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-b from-[#111] to-[#0a0a0a] border border-[#222] rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-semibold bg-gradient-to-r from-[#e60012] to-[#ff6b6b] bg-clip-text text-transparent mb-6">Order History</h3>
        <div className="text-center py-10">
          <div className="animate-spin w-10 h-10 border-4 border-t-transparent rounded-full mx-auto mb-4 bg-gradient-to-r from-[#e60012] to-[#ff6b6b]"></div>
          <p className="text-gray-400">Loading your orders...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gradient-to-b from-[#111] to-[#0a0a0a] border border-[#222] rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-semibold bg-gradient-to-r from-[#e60012] to-[#ff6b6b] bg-clip-text text-transparent mb-6">Order History</h3>
        <div className="bg-gradient-to-r from-red-900 to-red-800 text-red-100 p-4 rounded-lg mb-6">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 underline hover:text-white transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-b from-[#111] to-[#0a0a0a] border border-[#222] rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-semibold bg-gradient-to-r from-[#e60012] to-[#ff6b6b] bg-clip-text text-transparent mb-6">Order History</h3>
      
      {orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="border border-[#333] rounded-xl overflow-hidden hover:shadow-md transition-all bg-[#0d0d0d]">
              {/* Order header */}
              <div className="bg-gradient-to-r from-[#161616] to-[#0d0d0d] p-4 flex flex-col sm:flex-row justify-between">
                <div>
                  <p className="text-sm text-gray-400">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-sm text-gray-400">Placed on {formatDate(order.date)}</p>
                </div>
                
                <div className="mt-2 sm:mt-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${getStatusBadge(order.status)}`}>
                    {typeof order.status === 'string' 
                      ? order.status.charAt(0).toUpperCase() + order.status.slice(1) 
                      : 'Processing'}
                  </span>
                </div>
              </div>
              
              {/* Order items */}
              <div className="p-5">
                <div className="space-y-3">
                  {order.items && order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-[#161616] p-3 rounded-lg">
                      <div>
                        <p className="font-medium">{typeof item === 'string' ? item : item.name}</p>
                        {typeof item !== 'string' && (
                          <p className="text-sm text-gray-400">Qty: {item.quantity || 1}</p>
                        )}
                      </div>
                      {typeof item !== 'string' && (
                        <p className="font-medium">{formatPrice(item.price)}</p>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-5 pt-4 border-t border-[#333] flex justify-between">
                  <p className="font-medium">Total</p>
                  <p className="font-medium text-lg bg-gradient-to-r from-[#e60012] to-[#ff6b6b] bg-clip-text text-transparent">{formatPrice(order.total)}</p>
                </div>
                
                <div className="mt-4 bg-[#161616] p-3 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Delivery Address</p>
                  <p className="text-sm">{order.address || order.deliveryAddress || 'Not specified'}</p>
                </div>
              </div>
              
              {/* Order actions */}
              <div className="bg-gradient-to-r from-[#161616] to-[#0d0d0d] p-4 flex flex-wrap gap-3">
                <button 
                  onClick={() => router.push(`/orders?orderId=${order.id}`)}
                  className="text-sm bg-gradient-to-r from-[#e60012] to-[#ff6b6b] hover:from-[#ff6b6b] hover:to-[#e60012] text-white px-4 py-2 rounded-lg transition-all font-medium shadow-sm"
                >
                  {order.status && order.status.toLowerCase() === 'completed' ? 'View Details' : 'Track Order'}
                </button>
                
                {order.status && (order.status.toLowerCase() === 'completed' || order.status.toLowerCase() === 'delivered') && (
                  <button 
                    onClick={() => router.push('/services')}
                    className="text-sm border border-[#e60012] text-[#e60012] hover:bg-[#e60012] hover:text-white transition-all px-4 py-2 rounded-lg"
                  >
                    Book Again
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-[#0d0d0d] rounded-xl border border-[#222]">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#e60012] to-[#ff6b6b] flex items-center justify-center opacity-70">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h4 className="text-xl font-medium mb-2">No orders yet</h4>
          <p className="text-gray-400 mb-6">You haven't placed any orders yet.</p>
          <button 
            onClick={() => router.push('/spare-parts')}
            className="bg-gradient-to-r from-[#e60012] to-[#ff6b6b] hover:from-[#ff6b6b] hover:to-[#e60012] text-white transition-all px-6 py-3 rounded-lg font-medium shadow-md"
          >
            Shop Now
          </button>
        </div>
      )}
    </div>
  )
} 