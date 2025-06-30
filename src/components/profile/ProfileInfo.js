'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { toast } from 'react-hot-toast'
import { FiHome, FiMapPin, FiPlus, FiEdit2, FiTrash2, FiCheck } from 'react-icons/fi'
import { db } from '@/firebase/config'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import Link from 'next/link'

export default function ProfileInfo({ userProfile }) {
  const { currentUser, updateUserProfile, saveUserAddress, updateUserAddress, deleteUserAddress } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [addressModalOpen, setAddressModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [savedAddresses, setSavedAddresses] = useState([])
  const { isDarkMode } = useTheme()
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phone: '',
    address: ''
  })
  const [addressForm, setAddressForm] = useState({
    name: '',
    fullAddress: '',
    isDefault: false
  })
  const [loading, setLoading] = useState(false)
  const [shopOwnerData, setShopOwnerData] = useState(null)
  const [loadingShopData, setLoadingShopData] = useState(true)

  // Initialize form data when userProfile or currentUser changes
  useEffect(() => {
    if (userProfile && currentUser) {
      setFormData({
        displayName: userProfile.name || currentUser.displayName || '',
        email: userProfile.email || currentUser.email || '',
        phone: userProfile.phone || '',
        address: userProfile.address || ''
      })
      
      // Set saved addresses
      if (userProfile.savedAddresses) {
        setSavedAddresses(userProfile.savedAddresses)
      }
    } else if (currentUser) {
      setFormData({
        displayName: currentUser.displayName || '',
        email: currentUser.email || '',
        phone: '',
        address: ''
      })
    }
    
    // Check if user is a shop owner
    const checkShopOwner = async () => {
      if (!currentUser) return
      
      setLoadingShopData(true)
      try {
        const shopQuery = query(
          collection(db, 'shopOwners'),
          where('userId', '==', currentUser.uid)
        )
        
        const shopSnapshot = await getDocs(shopQuery)
        
        if (!shopSnapshot.empty) {
          const shopData = shopSnapshot.docs[0].data()
          shopData.id = shopSnapshot.docs[0].id
          setShopOwnerData(shopData)
        }
      } catch (error) {
        console.error('Error checking shop owner status:', error)
      } finally {
        setLoadingShopData(false)
      }
    }
    
    checkShopOwner()
  }, [currentUser, userProfile])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddressChange = (e) => {
    const { name, value } = e.target
    setAddressForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddressCheckbox = (e) => {
    setAddressForm(prev => ({
      ...prev,
      isDefault: e.target.checked
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!currentUser) {
      toast.error('You must be logged in to update your profile')
      return
    }

    try {
      setLoading(true)
      
      // Only send the fields that have changed
      const updateData = {
        displayName: formData.displayName,
        phone: formData.phone,
        address: formData.address
      }

      await updateUserProfile(updateData)
      
      toast.success('Profile updated successfully')
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const openAddressModal = (address = null) => {
    if (address) {
      // Editing existing address
      setEditingAddress(address.id)
      setAddressForm({
        name: address.name || '',
        fullAddress: address.fullAddress || '',
        isDefault: address.isDefault || false
      })
    } else {
      // Adding new address
      setEditingAddress(null)
      setAddressForm({
        name: '',
        fullAddress: '',
        isDefault: false
      })
    }
    setAddressModalOpen(true)
  }

  const handleAddressSubmit = async (e) => {
    e.preventDefault()
    
    if (!currentUser) {
      toast.error('You must be logged in to save addresses')
      return
    }

    try {
      setLoading(true)
      
      if (!addressForm.name.trim() || !addressForm.fullAddress.trim()) {
        toast.error('Please fill in all address fields')
        return
      }

      if (editingAddress) {
        // Update existing address
        await updateUserAddress(editingAddress, addressForm)
        toast.success('Address updated successfully')
      } else {
        // Create new address
        await saveUserAddress(addressForm)
        toast.success('Address saved successfully')
      }
      
      setAddressModalOpen(false)
      setEditingAddress(null)
      setAddressForm({
        name: '',
        fullAddress: '',
        isDefault: false
      })
    } catch (error) {
      console.error('Error saving address:', error)
      toast.error('Failed to save address. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return
    }
    
    try {
      setLoading(true)
      await deleteUserAddress(addressId)
      toast.success('Address deleted successfully')
    } catch (error) {
      console.error('Error deleting address:', error)
      toast.error('Failed to delete address. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Use geolocation to get current coordinates
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          
          // In a real app, we would use a geocoding service to get the address
          // For demo purposes, just append the coordinates
          toast.success("Location detected")
          setAddressForm(prev => ({
            ...prev,
            fullAddress: `${prev.fullAddress} [Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}]`
          }))
        },
        (error) => {
          toast.error(`Error getting location: ${error.message}`)
        }
      )
    } else {
      toast.error("Geolocation is not supported by your browser")
    }
  }

  if (!currentUser || !userProfile) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Profile Information</h2>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="text-[#e60012] hover:text-[#ff6b6b] font-medium"
          >
            Edit
          </button>
        )}
      </div>
      
      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-2 border rounded-lg bg-gray-100 dark:bg-gray-700"
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="address" className="block text-sm font-medium mb-1">
                Shipping Address
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
              ></textarea>
            </div>
            
            <div className="flex space-x-4 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-[#e60012] text-white rounded-lg hover:bg-[#d10010] focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:ring-offset-2"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
            <p className="font-medium">{userProfile.name || 'Not provided'}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Email Address</p>
            <p className="font-medium">{formData.email}</p>
            {!currentUser.emailVerified && (
              <p className="text-sm text-amber-600 mt-1">
                Email not verified. Please check your inbox.
              </p>
            )}
          </div>
          
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Phone Number</p>
            <p className="font-medium">{userProfile.phone || 'Not provided'}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Shipping Address</p>
            <p className="font-medium">{formData.address || 'Not provided'}</p>
          </div>
          
          {/* Shop Owner Section */}
          <div className="pt-4 mt-4 border-t">
            <h3 className="font-medium text-lg mb-3">Shop Owner Status</h3>
            
            {loadingShopData ? (
              <div className="animate-pulse flex space-x-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            ) : shopOwnerData ? (
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                    Registered Shop Owner
                  </span>
                  
                  {shopOwnerData.status === 'pending' && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100">
                      Pending Approval
                    </span>
                  )}
                  
                  {shopOwnerData.status === 'approved' && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                      Approved
                    </span>
                  )}
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Shop Name</p>
                  <p className="font-medium">{shopOwnerData.shopName}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
                  <p>{shopOwnerData.shopCategory}</p>
                </div>
                
                {shopOwnerData.status === 'approved' && (
                  <div className="pt-2">
                    <Link 
                      href={`/shop-inventory/${shopOwnerData.id}`}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                      </svg>
                      Manage Inventory
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-gray-600 dark:text-gray-300">
                  You haven't registered as a shop owner yet.
                </p>
                
                <Link 
                  href="/shop-registration"
                  className="inline-flex items-center px-4 py-2 bg-[#e60012] text-white rounded-lg hover:bg-[#d10010] focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:ring-offset-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Register Your Shop
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 