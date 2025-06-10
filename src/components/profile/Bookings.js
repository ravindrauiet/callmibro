'use client'

import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

export default function Bookings() {
  const { currentUser } = useAuth()
  const [bookings, setBookings] = useState([
    // Sample data - in a real app, fetch from Firebase
    {
      id: 'bk1',
      service: 'AC Service',
      date: '2023-09-15',
      time: '10:00 AM',
      status: 'completed',
      technician: 'John Doe',
      address: '123 Main St, Mumbai',
      price: '₹1,500'
    },
    {
      id: 'bk2',
      service: 'Washing Machine Repair',
      date: '2023-10-22',
      time: '02:30 PM',
      status: 'scheduled',
      technician: 'Mike Smith',
      address: '456 Park Ave, Mumbai',
      price: '₹2,200'
    }
  ])

  const getStatusStyle = (status) => {
    switch(status) {
      case 'completed':
        return 'bg-green-900 text-green-300'
      case 'scheduled':
        return 'bg-blue-900 text-blue-300'
      case 'cancelled':
        return 'bg-red-900 text-red-300'
      default:
        return 'bg-gray-800 text-gray-300'
    }
  }

  return (
    <div className="bg-[#111] border border-[#222] rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-6">Your Service Bookings</h3>
      
      {bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map(booking => (
            <div key={booking.id} className="border border-[#333] rounded-lg p-4">
              <div className="flex flex-col md:flex-row justify-between mb-4">
                <div>
                  <h4 className="font-medium text-lg">{booking.service}</h4>
                  <p className="text-gray-400">
                    {booking.date} • {booking.time}
                  </p>
                </div>
                
                <div className="mt-2 md:mt-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(booking.status)}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Technician</p>
                  <p>{booking.technician}</p>
                </div>
                
                <div>
                  <p className="text-gray-400">Address</p>
                  <p>{booking.address}</p>
                </div>
                
                <div>
                  <p className="text-gray-400">Price</p>
                  <p>{booking.price}</p>
                </div>
              </div>
              
              <div className="mt-4 flex space-x-3">
                {booking.status === 'scheduled' && (
                  <>
                    <button className="text-sm border border-[#e60012] text-[#e60012] hover:bg-[#e60012] hover:text-white transition-colors px-3 py-1 rounded">
                      Reschedule
                    </button>
                    <button className="text-sm border border-gray-600 text-gray-400 hover:bg-gray-700 transition-colors px-3 py-1 rounded">
                      Cancel
                    </button>
                  </>
                )}
                
                {booking.status === 'completed' && (
                  <button className="text-sm border border-[#e60012] text-[#e60012] hover:bg-[#e60012] hover:text-white transition-colors px-3 py-1 rounded">
                    Leave Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-400 mb-4">You don't have any service bookings yet</p>
          <button className="bg-[#e60012] text-white px-4 py-2 rounded hover:bg-red-700 transition-colors">
            Book a Service
          </button>
        </div>
      )}
    </div>
  )
} 