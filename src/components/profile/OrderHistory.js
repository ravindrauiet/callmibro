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
        return 'bg-green-900 text-green-300'
      case 'processing':
      case 'in progress':
        return 'bg-blue-900 text-blue-300'
      case 'cancelled':
        return 'bg-red-900 text-red-300'
      case 'shipped':
        return 'bg-purple-900 text-purple-300'
      case 'scheduled':
        return 'bg-yellow-900 text-yellow-300'
      default:
        return 'bg-gray-800 text-gray-300'
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
      <div className="bg-[#111] border border-[#222] rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-6">Order History</h3>
        <div className="text-center py-10">
          <p className="text-gray-400">Loading your orders...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-[#111] border border-[#222] rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-6">Order History</h3>
        <div className="bg-red-900 text-red-100 p-4 rounded mb-6">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 underline"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#111] border border-[#222] rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-6">Order History</h3>
      
      {orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="border border-[#333] rounded-lg overflow-hidden">
              {/* Order header */}
              <div className="bg-[#222] p-4 flex flex-col sm:flex-row justify-between">
                <div>
                  <p className="text-sm text-gray-400">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-sm text-gray-400">Placed on {formatDate(order.date)}</p>
                </div>
                
                <div className="mt-2 sm:mt-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                    {typeof order.status === 'string' 
                      ? order.status.charAt(0).toUpperCase() + order.status.slice(1) 
                      : 'Processing'}
                  </span>
                </div>
              </div>
              
              {/* Order items */}
              <div className="p-4">
                <div className="space-y-3">
                  {order.items && order.items.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <div>
                        <p>{typeof item === 'string' ? item : item.name}</p>
                        {typeof item !== 'string' && (
                          <p className="text-sm text-gray-400">Qty: {item.quantity || 1}</p>
                        )}
                      </div>
                      {typeof item !== 'string' && (
                        <p>{formatPrice(item.price)}</p>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t border-[#333] flex justify-between">
                  <p className="font-medium">Total</p>
                  <p className="font-medium">{formatPrice(order.total)}</p>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-400">Delivery Address</p>
                  <p className="text-sm">{order.address || order.deliveryAddress || 'Not specified'}</p>
                </div>
              </div>
              
              {/* Order actions */}
              <div className="bg-[#222] p-4 flex flex-wrap gap-2">
                <button 
                  onClick={() => router.push(`/orders?orderId=${order.id}`)}
                  className="text-sm bg-[#e60012] text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                >
                  {order.status && order.status.toLowerCase() === 'completed' ? 'View Details' : 'Track Order'}
                </button>
                
                {order.status && (order.status.toLowerCase() === 'completed' || order.status.toLowerCase() === 'delivered') && (
                  <button 
                    onClick={() => router.push('/services')}
                    className="text-sm border border-[#e60012] text-[#e60012] hover:bg-[#e60012] hover:text-white transition-colors px-3 py-1 rounded"
                  >
                    Book Again
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-400 mb-4">You haven't placed any orders yet</p>
          <button 
            onClick={() => router.push('/services')}
            className="bg-[#e60012] text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Book a Service
          </button>
        </div>
      )}
    </div>
  )
} 