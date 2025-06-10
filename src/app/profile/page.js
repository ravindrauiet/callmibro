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
import { db } from '@/firebase/config'
import { doc, getDoc, updateDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import Image from 'next/image'

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile')
  const { currentUser, logout } = useAuth()
  const router = useRouter()
  const [userProfile, setUserProfile] = useState(null)
  const [userBookings, setUserBookings] = useState([])
  const [userOrders, setUserOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [error, setError] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  })

  // Fetch user profile and data when component mounts
  useEffect(() => {
    async function fetchUserData() {
      if (!currentUser) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')

        // Fetch user profile
        const userDocRef = doc(db, 'users', currentUser.uid)
        const userDocSnap = await getDoc(userDocRef)
        
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data()
          setUserProfile(userData)
          setFormData({
            name: userData.name || currentUser.displayName || '',
            phone: userData.phone || '',
            address: userData.address || '',
            city: userData.city || '',
            state: userData.state || '',
            pincode: userData.pincode || ''
          })
          // Debug logs
          console.log('Fetched userProfile from Firestore:', userData)
          console.log('Set formData:', {
            name: userData.name || currentUser.displayName || '',
            phone: userData.phone || '',
            address: userData.address || '',
            city: userData.city || '',
            state: userData.state || '',
            pincode: userData.pincode || ''
          })
        } else {
          // Create user profile if it doesn't exist
          const newUserData = {
            name: currentUser.displayName || '',
            email: currentUser.email,
            phone: '',
            address: '',
            city: '',
            state: '',
            pincode: '',
            createdAt: new Date()
          }
          
          // We don't await this as it's not critical for the page load
          updateDoc(userDocRef, newUserData)
          
          setUserProfile(newUserData)
          setFormData({
            name: newUserData.name,
            phone: newUserData.phone,
            address: newUserData.address,
            city: newUserData.city,
            state: newUserData.state,
            pincode: newUserData.pincode
          })
        }

        // Fetch user bookings
        const bookingsRef = collection(db, 'bookings')
        const bookingsQuery = query(
          bookingsRef,
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        )
        
        const bookingsSnap = await getDocs(bookingsQuery)
        const bookingsData = bookingsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setUserBookings(bookingsData)

        // Fetch user orders
        const ordersRef = collection(db, 'orders')
        const ordersQuery = query(
          ordersRef,
          where('userId', '==', currentUser.uid),
          orderBy('date', 'desc')
        )
        
        const ordersSnap = await getDocs(ordersQuery)
        const ordersData = ordersSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setUserOrders(ordersData)
      } catch (error) {
        console.error('Error fetching user data:', error)
        setError('Failed to load user data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [currentUser])

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    
    if (!currentUser) return
    
    try {
      setUpdateLoading(true)
      setError('')
      
      const userDocRef = doc(db, 'users', currentUser.uid)
      await updateDoc(userDocRef, {
        ...formData,
        updatedAt: new Date()
      })
      
      setUserProfile(prev => ({
        ...prev,
        ...formData
      }))
      
      setEditMode(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      setError('Failed to update profile. Please try again.')
    } finally {
      setUpdateLoading(false)
    }
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Error logging out:', error)
      setError('Failed to log out. Please try again.')
    }
  }

  // Handle booking details view
  const handleViewBooking = (bookingId) => {
    router.push(`/services/booking-confirmation?bookingId=${bookingId}`)
  }

  // Handle order details view
  const handleViewOrder = (orderId) => {
    router.push(`/orders?orderId=${orderId}`)
  }

  // If user is not logged in, redirect to login
  useEffect(() => {
    if (!currentUser && !loading) {
      router.push('/')
    }
  }, [currentUser, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[#e60012] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-xl">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return null // Will redirect in useEffect
  }

  // Helper to format Firestore timestamp
  function formatDate(ts) {
    if (!ts) return 'Not set';
    if (typeof ts === 'string') return ts;
    if (ts.toDate) return ts.toDate().toLocaleString();
    if (ts instanceof Date) return ts.toLocaleString();
    return 'Not set';
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
                    Profile
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
                    Orders
                  </button>
                </div>
              </div>
              
              {/* Tab content */}
              {activeTab === 'profile' && (
                <ProfileInfo 
                  userProfile={userProfile}
                  formData={formData}
                  handleChange={handleChange}
                  handleProfileUpdate={handleProfileUpdate}
                  editMode={editMode}
                  setEditMode={setEditMode}
                  updateLoading={updateLoading}
                  error={error}
                />
              )}
              
              {activeTab === 'bookings' && (
                <Bookings />
              )}
              
              {activeTab === 'orders' && (
                <OrderHistory />
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
} 