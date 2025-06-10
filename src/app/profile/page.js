'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import ProfileInfo from '../../components/profile/ProfileInfo'
import Bookings from '../../components/profile/Bookings'
import OrderHistory from '../../components/profile/OrderHistory'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'react-hot-toast'

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile')
  const { currentUser } = useAuth()
  const router = useRouter()

  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser) {
      router.push('/')
      toast.error('Please login to view your profile')
    }
  }, [currentUser, router])

  if (!currentUser) {
    return null // Don't render anything if not logged in (will redirect)
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Header activePage="profile" />
      
      <main className="flex-grow py-10">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">My Account</h1>
          <p className="text-gray-400 text-center mb-10">Manage your details, bookings, & orders</p>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Profile sidebar */}
            <div className="lg:w-1/3">
              <div className="bg-[#111] border border-[#222] rounded-lg p-6 text-center">
                <div className="w-32 h-32 mx-auto bg-[#e60012] rounded-full flex items-center justify-center mb-4">
                  <span className="text-4xl font-bold">
                    {currentUser.displayName 
                      ? currentUser.displayName.charAt(0).toUpperCase() 
                      : currentUser.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                
                <h2 className="text-2xl font-bold mb-1">
                  {currentUser.displayName || currentUser.email.split('@')[0]}
                </h2>
                <p className="text-gray-400 mb-4">{currentUser.email}</p>
                
                <button className="border border-[#e60012] text-[#e60012] hover:bg-[#e60012] hover:text-white transition-colors px-4 py-2 rounded w-full">
                  Edit Profile
                </button>
              </div>
            </div>
            
            {/* Content area */}
            <div className="lg:w-2/3">
              {/* Tabs */}
              <div className="border-b border-[#333] mb-6">
                <div className="flex">
                  <button 
                    className={`pb-3 px-4 font-medium ${activeTab === 'profile' 
                      ? 'text-[#e60012] border-b-2 border-[#e60012]' 
                      : 'text-gray-400 hover:text-white'}`}
                    onClick={() => setActiveTab('profile')}
                  >
                    Profile Info
                  </button>
                  <button 
                    className={`pb-3 px-4 font-medium ${activeTab === 'bookings' 
                      ? 'text-[#e60012] border-b-2 border-[#e60012]' 
                      : 'text-gray-400 hover:text-white'}`}
                    onClick={() => setActiveTab('bookings')}
                  >
                    Bookings
                  </button>
                  <button 
                    className={`pb-3 px-4 font-medium ${activeTab === 'orders' 
                      ? 'text-[#e60012] border-b-2 border-[#e60012]' 
                      : 'text-gray-400 hover:text-white'}`}
                    onClick={() => setActiveTab('orders')}
                  >
                    Order History
                  </button>
                </div>
              </div>
              
              {/* Tab content */}
              {activeTab === 'profile' && <ProfileInfo />}
              {activeTab === 'bookings' && <Bookings />}
              {activeTab === 'orders' && <OrderHistory />}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
} 