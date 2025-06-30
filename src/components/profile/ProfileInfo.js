'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { toast } from 'react-hot-toast'
import { FiHome, FiMapPin, FiPlus, FiEdit2, FiTrash2, FiCheck } from 'react-icons/fi'
import { db } from '@/firebase/config'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import Link from 'next/link'

export default function ProfileInfo() {
  const { currentUser, userProfile, updateUserProfile, saveUserAddress, updateUserAddress, deleteUserAddress } = useAuth()
  const { isDarkMode } = useTheme()
  const [isEditing, setIsEditing] = useState(false)
  const [addressModalOpen, setAddressModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [savedAddresses, setSavedAddresses] = useState([])
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
  const [loading, setLoading] = useState(true)
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
    const fetchShopOwnerData = async () => {
      if (!currentUser) return
      
      try {
        setLoadingShopData(true)
        
        // Query the shopOwners collection for this user
        const shopOwnersRef = doc(db, 'shopOwners', currentUser.uid)
        const shopOwnersSnapshot = await getDoc(shopOwnersRef)
        
        // If no document exists with the user's ID, try querying by userId field
        if (!shopOwnersSnapshot.exists()) {
          // Query all shop owners where userId matches the current user's ID
          const shopOwnersCollection = collection(db, 'shopOwners')
          const q = query(shopOwnersCollection, where('userId', '==', currentUser.uid))
          const querySnapshot = await getDocs(q)
          
          if (!querySnapshot.empty) {
            // Get the first shop owner document
            const shopOwnerDoc = querySnapshot.docs[0]
            setShopOwnerData({
              id: shopOwnerDoc.id,
              ...shopOwnerDoc.data()
            })
          }
        } else {
          // Document exists with user's ID as the document ID
          setShopOwnerData({
            id: shopOwnersSnapshot.id,
            ...shopOwnersSnapshot.data()
          })
        }
      } catch (error) {
        console.error('Error fetching shop owner data:', error)
      } finally {
        setLoadingShopData(false)
      }
    }
    
    fetchShopOwnerData()
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

  if (!currentUser) {
    return (
      <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)', color: 'var(--text-main)' }}>
        <p className="text-center">Please log in to view your profile.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)', color: 'var(--text-main)' }}>
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full bg-gradient-to-r from-[#e60012] to-[#ff6b6b] flex items-center justify-center text-white text-xl font-bold">
            {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-main)' }}>
              {currentUser.displayName || 'User'}
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>{currentUser.email}</p>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--text-main)' }}>Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Name</p>
              <p style={{ color: 'var(--text-main)' }}>{userProfile?.name || currentUser.displayName || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Phone</p>
              <p style={{ color: 'var(--text-main)' }}>{userProfile?.phone || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Email</p>
              <p style={{ color: 'var(--text-main)' }}>{currentUser.email}</p>
            </div>
            <div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Member Since</p>
              <p style={{ color: 'var(--text-main)' }}>
                {userProfile?.createdAt 
                  ? new Date(userProfile.createdAt.seconds * 1000).toLocaleDateString() 
                  : new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        
        {/* Shop Owner Section */}
        {shopOwnerData && (
          <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium" style={{ color: 'var(--text-main)' }}>Shop Owner Information</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                shopOwnerData.status === 'approved' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                  : shopOwnerData.status === 'rejected'
                  ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
              }`}>
                {shopOwnerData.status.charAt(0).toUpperCase() + shopOwnerData.status.slice(1)}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Shop Name</p>
                <p style={{ color: 'var(--text-main)' }}>{shopOwnerData.shopName}</p>
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Category</p>
                <p style={{ color: 'var(--text-main)' }}>{shopOwnerData.shopCategory}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Address</p>
                <p style={{ color: 'var(--text-main)' }}>{shopOwnerData.shopAddress}</p>
              </div>
            </div>
            
            {shopOwnerData.status === 'approved' && (
              <div className="mt-4">
                <Link 
                  href={`/shop-inventory/${shopOwnerData.id}`}
                  className="inline-flex items-center px-4 py-2 bg-[#e60012] text-white rounded-lg hover:bg-[#d10010] transition-colors"
                >
                  Manage Inventory
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            )}
            
            {shopOwnerData.status === 'pending' && (
              <div className="mt-4 p-4 bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100 rounded-lg">
                <p className="text-sm">
                  Your shop registration is pending approval. We'll notify you once it's approved.
                </p>
              </div>
            )}
            
            {shopOwnerData.status === 'rejected' && (
              <div className="mt-4 p-4 bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100 rounded-lg">
                <p className="text-sm">
                  Your shop registration was rejected. Please contact support for more information.
                </p>
              </div>
            )}
          </div>
        )}
        
        {!shopOwnerData && !loading && (
          <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium" style={{ color: 'var(--text-main)' }}>Become a Shop Owner</h3>
            </div>
            <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
              Register your repair shop with CallMiBro and reach more customers.
            </p>
            <Link 
              href="/shop-registration"
              className="inline-flex items-center px-4 py-2 bg-[#e60012] text-white rounded-lg hover:bg-[#d10010] transition-colors"
            >
              Register Your Shop
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
} 