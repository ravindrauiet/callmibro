'use client'

import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

export default function OrderHistory() {
  const { currentUser } = useAuth()
  const [orders, setOrders] = useState([
    // Sample data - in a real app, fetch from Firebase
    {
      id: 'ord123',
      date: '2023-10-05',
      status: 'delivered',
      items: [
        { name: 'Samsung AC Compressor', price: '₹5,200', quantity: 1 }
      ],
      total: '₹5,200',
      deliveryAddress: '123 Main St, Mumbai'
    },
    {
      id: 'ord456',
      date: '2023-11-12',
      status: 'processing',
      items: [
        { name: 'LG Washing Machine Motor', price: '₹3,800', quantity: 1 },
        { name: 'Water Inlet Valve', price: '₹850', quantity: 2 }
      ],
      total: '₹5,500',
      deliveryAddress: '456 Park Ave, Mumbai'
    }
  ])

  const getStatusBadge = (status) => {
    switch(status) {
      case 'delivered':
        return 'bg-green-900 text-green-300'
      case 'processing':
        return 'bg-blue-900 text-blue-300'
      case 'cancelled':
        return 'bg-red-900 text-red-300'
      case 'shipped':
        return 'bg-purple-900 text-purple-300'
      default:
        return 'bg-gray-800 text-gray-300'
    }
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
                  <p className="text-sm text-gray-400">Order #{order.id}</p>
                  <p className="text-sm text-gray-400">Placed on {order.date}</p>
                </div>
                
                <div className="mt-2 sm:mt-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
              
              {/* Order items */}
              <div className="p-4">
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <div>
                        <p>{item.name}</p>
                        <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                      </div>
                      <p>{item.price}</p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t border-[#333] flex justify-between">
                  <p className="font-medium">Total</p>
                  <p className="font-medium">{order.total}</p>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-400">Delivery Address</p>
                  <p className="text-sm">{order.deliveryAddress}</p>
                </div>
              </div>
              
              {/* Order actions */}
              <div className="bg-[#222] p-4 flex flex-wrap gap-2">
                <button className="text-sm bg-[#e60012] text-white px-3 py-1 rounded hover:bg-red-700 transition-colors">
                  Track Order
                </button>
                
                {order.status === 'delivered' && (
                  <button className="text-sm border border-[#e60012] text-[#e60012] hover:bg-[#e60012] hover:text-white transition-colors px-3 py-1 rounded">
                    Write Review
                  </button>
                )}
                
                <button className="text-sm border border-gray-600 text-gray-400 hover:bg-gray-700 transition-colors px-3 py-1 rounded">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-400 mb-4">You haven't placed any orders yet</p>
          <button className="bg-[#e60012] text-white px-4 py-2 rounded hover:bg-red-700 transition-colors">
            Shop Spare Parts
          </button>
        </div>
      )}
    </div>
  )
} 