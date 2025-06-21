'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore'
import { db } from '@/firebase/config'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalUsers: 0,
    totalTechnicians: 0,
    totalProducts: 0,
    totalOrders: 0,
    revenue: 0
  })
  
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch bookings stats
        const bookingsSnapshot = await getDocs(collection(db, 'bookings'))
        const bookings = bookingsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        const pendingBookings = bookings.filter(booking => 
          booking.status === 'scheduled' || booking.status === 'confirmed'
        )
        
        const completedBookings = bookings.filter(booking => 
          booking.status === 'completed'
        )
        
        // Fetch recent bookings
        const recentBookingsQuery = query(
          collection(db, 'bookings'),
          orderBy('createdAt', 'desc'),
          limit(5)
        )
        const recentBookingsSnapshot = await getDocs(recentBookingsQuery)
        const recentBookingsData = recentBookingsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        // Fetch users count
        const usersSnapshot = await getDocs(collection(db, 'users'))
        
        // Fetch technicians count
        const techniciansQuery = query(
          collection(db, 'technicians')
        )
        const techniciansSnapshot = await getDocs(techniciansQuery)
        
        // Fetch products count
        const productsSnapshot = await getDocs(collection(db, 'products'))
        
        // Fetch orders
        const ordersSnapshot = await getDocs(collection(db, 'orders'))
        const orders = ordersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        // Calculate revenue
        const revenue = orders.reduce((total, order) => {
          return total + (order.totalAmount || 0)
        }, 0)
        
        // Update stats
        setStats({
          totalBookings: bookings.length,
          pendingBookings: pendingBookings.length,
          completedBookings: completedBookings.length,
          totalUsers: usersSnapshot.size,
          totalTechnicians: techniciansSnapshot.size,
          totalProducts: productsSnapshot.size,
          totalOrders: orders.length,
          revenue
        })
        
        setRecentBookings(recentBookingsData)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [])

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
        <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
        <div className="text-sm text-gray-400">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Bookings" 
          value={stats.totalBookings} 
          icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          color="from-blue-500 to-blue-600"
          link="/admin/bookings"
        />
        <StatCard 
          title="Pending Bookings" 
          value={stats.pendingBookings} 
          icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          color="from-amber-500 to-amber-600"
          link="/admin/bookings?status=pending"
        />
        <StatCard 
          title="Completed Services" 
          value={stats.completedBookings} 
          icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          color="from-green-500 to-green-600"
          link="/admin/bookings?status=completed"
        />
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers} 
          icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          color="from-purple-500 to-purple-600"
          link="/admin/users"
        />
        <StatCard 
          title="Technicians" 
          value={stats.totalTechnicians} 
          icon="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          color="from-indigo-500 to-indigo-600"
          link="/admin/technicians"
        />
        <StatCard 
          title="Products" 
          value={stats.totalProducts} 
          icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          color="from-pink-500 to-pink-600"
          link="/admin/products"
        />
        <StatCard 
          title="Orders" 
          value={stats.totalOrders} 
          icon="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          color="from-yellow-500 to-yellow-600"
          link="/admin/orders"
        />
        <StatCard 
          title="Revenue" 
          value={`₹${stats.revenue.toLocaleString()}`} 
          icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          color="from-emerald-500 to-emerald-600"
          link="/admin/orders"
        />
      </div>
      
      {/* Recent Bookings */}
      <div className="bg-[#1a1a1a] rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-[#333] flex justify-between items-center">
          <h3 className="text-lg font-medium text-white">Recent Bookings</h3>
          <Link href="/admin/bookings" className="text-sm text-[#e60012] hover:text-[#ff6b6b]">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#333]">
            <thead className="bg-[#222]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Date
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
              {recentBookings.length > 0 ? (
                recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-[#222] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {booking.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {booking.serviceName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {booking.contactInfo?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {booking.schedule?.date ? new Date(booking.schedule.date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <Link 
                        href={`/admin/bookings/${booking.id}`}
                        className="text-[#e60012] hover:text-[#ff6b6b]"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-400">
                    No recent bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickAction 
          title="Add New Service" 
          description="Create a new service offering for your customers"
          icon="M12 6v6m0 0v6m0-6h6m-6 0H6"
          link="/admin/services/new"
          color="from-blue-500 to-blue-600"
        />
        <QuickAction 
          title="Add New Technician" 
          description="Register a new technician to your team"
          icon="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
          link="/admin/technicians/new"
          color="from-green-500 to-green-600"
        />
        <QuickAction 
          title="Add New Product" 
          description="Add a new product to your inventory"
          icon="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z"
          link="/admin/products/new"
          color="from-purple-500 to-purple-600"
        />
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color, link }) {
  return (
    <Link href={link} className="block">
      <div className="bg-[#1a1a1a] rounded-lg shadow-md p-6 border border-[#333] hover:border-[#444] transition-colors">
        <div className="flex items-center">
          <div className={`p-3 rounded-md bg-gradient-to-br ${color}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
            </svg>
          </div>
          <div className="ml-5">
            <p className="text-sm font-medium text-gray-400">{title}</p>
            <p className="text-2xl font-semibold text-white mt-1">{value}</p>
          </div>
        </div>
      </div>
    </Link>
  )
}

function QuickAction({ title, description, icon, link, color }) {
  return (
    <Link href={link} className="block">
      <div className="bg-[#1a1a1a] rounded-lg shadow-md p-6 border border-[#333] hover:border-[#444] transition-colors h-full">
        <div className={`p-3 rounded-md bg-gradient-to-br ${color} inline-flex`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-white mt-4">{title}</h3>
        <p className="text-sm text-gray-400 mt-1">{description}</p>
      </div>
    </Link>
  )
}

function StatusBadge({ status }) {
  let bgColor = 'bg-gray-500'
  let textColor = 'text-gray-100'
  
  switch (status) {
    case 'scheduled':
      bgColor = 'bg-blue-500'
      textColor = 'text-blue-100'
      break
    case 'confirmed':
      bgColor = 'bg-yellow-500'
      textColor = 'text-yellow-100'
      break
    case 'in_progress':
      bgColor = 'bg-purple-500'
      textColor = 'text-purple-100'
      break
    case 'completed':
      bgColor = 'bg-green-500'
      textColor = 'text-green-100'
      break
    case 'cancelled':
      bgColor = 'bg-red-500'
      textColor = 'text-red-100'
      break
    default:
      break
  }
  
  return (
    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}>
      {status?.charAt(0).toUpperCase() + status?.slice(1).replace('_', ' ') || 'Unknown'}
    </span>
  )
} 