'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { db } from '@/firebase/config'
import { collection, doc, setDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { toast } from 'react-hot-toast'

const shopCategories = [
  'Mobile Phone Repair',
  'Computer & Laptop Repair',
  'TV & Electronics Repair',
  'Home Appliance Repair',
  'Camera & Audio Repair',
  'Gaming Console Repair',
  'Other'
]

export default function ShopRegistration() {
  const { currentUser, userProfile } = useAuth()
  const { isDarkMode } = useTheme()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    ownerName: '',
    shopName: '',
    shopAddress: '',
    shopEmail: '',
    shopPhone: '',
    shopCategory: '',
    latitude: null,
    longitude: null,
    initialInventory: []
  })
  
  const [loading, setLoading] = useState(false)
  const [locationStatus, setLocationStatus] = useState('idle') // idle, loading, success, error
  const [inventoryItems, setInventoryItems] = useState([
    { name: '', category: '', quantity: '', price: '' }
  ])
  
  // Check if user is already a shop owner and redirect if logged in
  useEffect(() => {
    const checkShopOwnerStatus = async () => {
      if (!currentUser) {
        router.push('/')
        toast.error('Please log in to register your shop')
        return
      }
      
      try {
        // Check if user is already a shop owner
        const shopOwnersRef = collection(db, 'shopOwners')
        const q = query(shopOwnersRef, where('userId', '==', currentUser.uid))
        const querySnapshot = await getDocs(q)
        
        if (!querySnapshot.empty) {
          const shopOwnerDoc = querySnapshot.docs[0]
          const shopOwnerData = shopOwnerDoc.data()
          
          // If shop owner exists and is approved, redirect to inventory
          if (shopOwnerData.status === 'approved') {
            toast('You are already a registered shop owner')
            router.push(`/shop-inventory/${shopOwnerDoc.id}`)
            return
          }
          
          // If shop owner exists but is pending/rejected, show appropriate message
          if (shopOwnerData.status === 'pending') {
            toast('Your shop registration is pending approval')
            router.push('/profile')
            return
          }
          
          if (shopOwnerData.status === 'rejected') {
            toast('Your shop registration was rejected. Please contact support.')
            router.push('/profile')
            return
          }
        }
        
        // If not a shop owner, pre-fill form data
        setFormData(prev => ({
          ...prev,
          ownerName: userProfile?.name || currentUser.displayName || '',
          shopEmail: currentUser.email || ''
        }))
      } catch (error) {
        console.error('Error checking shop owner status:', error)
        toast.error('Error checking shop owner status')
      }
    }
    
    checkShopOwnerStatus()
  }, [currentUser, router, userProfile])
  
  // Get user's location
  const getLocation = () => {
    setLocationStatus('loading')
    
    if (!navigator.geolocation) {
      setLocationStatus('error')
      toast.error('Geolocation is not supported by your browser')
      return
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }))
        setLocationStatus('success')
        toast.success('Location captured successfully')
      },
      (error) => {
        console.error('Error getting location:', error)
        setLocationStatus('error')
        toast.error('Failed to get your location. Please try again.')
      }
    )
  }
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  // Handle inventory item changes
  const handleInventoryChange = (index, field, value) => {
    const newItems = [...inventoryItems]
    newItems[index][field] = value
    setInventoryItems(newItems)
  }
  
  // Add new inventory item field
  const addInventoryItem = () => {
    setInventoryItems([...inventoryItems, { name: '', category: '', quantity: '', price: '' }])
  }
  
  // Remove inventory item field
  const removeInventoryItem = (index) => {
    if (inventoryItems.length > 1) {
      const newItems = [...inventoryItems]
      newItems.splice(index, 1)
      setInventoryItems(newItems)
    }
  }
  
  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!currentUser) {
      toast.error('You must be logged in to register')
      return
    }
    
    // Validate required fields
    if (!formData.shopName || !formData.shopAddress || !formData.shopPhone || !formData.shopCategory) {
      toast.error('Please fill in all required fields')
      return
    }
    
    setLoading(true)
    
    try {
      // Filter out empty inventory items
      const validInventoryItems = inventoryItems.filter(item => 
        item.name && item.category && item.quantity && item.price
      )
      
      // Create shop owner document
      const shopOwnerRef = doc(collection(db, 'shopOwners'))
      await setDoc(shopOwnerRef, {
        userId: currentUser.uid,
        ownerName: formData.ownerName,
        shopName: formData.shopName,
        shopAddress: formData.shopAddress,
        shopEmail: formData.shopEmail,
        shopPhone: formData.shopPhone,
        shopCategory: formData.shopCategory,
        location: formData.latitude && formData.longitude ? {
          latitude: formData.latitude,
          longitude: formData.longitude
        } : null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'pending', // Pending approval by admin
        hasInventory: validInventoryItems.length > 0
      })
      
      // Add inventory items if any
      if (validInventoryItems.length > 0) {
        const inventoryCollectionRef = collection(doc(db, 'shopOwners', shopOwnerRef.id), 'inventory')
        
        // Add each inventory item
        for (const item of validInventoryItems) {
          const itemRef = doc(inventoryCollectionRef)
          await setDoc(itemRef, {
            name: item.name,
            category: item.category,
            quantity: parseInt(item.quantity) || 0,
            price: parseFloat(item.price) || 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          })
        }
      }
      
      toast.success('Shop registered successfully! Pending approval.')
      router.push('/profile')
    } catch (error) {
      console.error('Error registering shop:', error)
      toast.error('Failed to register shop. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <>
      <Header />
      <main className="min-h-screen py-16 px-4 sm:px-8" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-main)' }}>
        <div className="container mx-auto max-w-3xl">
          <div className="bg-gradient-to-r p-1 rounded-xl">
            <div className="rounded-lg p-6 sm:p-8" style={{ backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)' }}>
              <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center" style={{ color: 'var(--text-main)' }}>Register Your Repair Shop</h1>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Owner Details */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold border-b pb-2" style={{ borderColor: 'var(--border-color)', color: 'var(--text-main)' }}>Owner Details</h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="ownerName" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                        Owner Name*
                      </label>
                      <input
                        type="text"
                        id="ownerName"
                        name="ownerName"
                        value={formData.ownerName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                        style={{ 
                          backgroundColor: isDarkMode ? 'var(--panel-gray)' : 'var(--panel-light)',
                          color: 'var(--text-main)',
                          borderColor: 'var(--border-color)'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="shopEmail" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                        Email Address*
                      </label>
                      <input
                        type="email"
                        id="shopEmail"
                        name="shopEmail"
                        value={formData.shopEmail}
                        onChange={handleChange}
                        required
                        disabled
                        className="w-full px-4 py-2 border rounded-lg"
                        style={{ 
                          backgroundColor: isDarkMode ? 'var(--panel-charcoal)' : 'var(--panel-gray)',
                          color: 'var(--text-secondary)',
                          borderColor: 'var(--border-color)'
                        }}
                      />
                      <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                        Using your account email
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Shop Details */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold border-b pb-2" style={{ borderColor: 'var(--border-color)', color: 'var(--text-main)' }}>Shop Details</h2>
                  
                  <div>
                    <label htmlFor="shopName" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Shop Name*
                    </label>
                    <input
                      type="text"
                      id="shopName"
                      name="shopName"
                      value={formData.shopName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                      style={{ 
                        backgroundColor: isDarkMode ? 'var(--panel-gray)' : 'var(--panel-light)',
                        color: 'var(--text-main)',
                        borderColor: 'var(--border-color)'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="shopAddress" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Shop Address*
                    </label>
                    <textarea
                      id="shopAddress"
                      name="shopAddress"
                      value={formData.shopAddress}
                      onChange={handleChange}
                      required
                      rows={3}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                      style={{ 
                        backgroundColor: isDarkMode ? 'var(--panel-gray)' : 'var(--panel-light)',
                        color: 'var(--text-main)',
                        borderColor: 'var(--border-color)'
                      }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="shopPhone" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                        Contact Number*
                      </label>
                      <input
                        type="tel"
                        id="shopPhone"
                        name="shopPhone"
                        value={formData.shopPhone}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                        style={{ 
                          backgroundColor: isDarkMode ? 'var(--panel-gray)' : 'var(--panel-light)',
                          color: 'var(--text-main)',
                          borderColor: 'var(--border-color)'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="shopCategory" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                        Shop Category*
                      </label>
                      <select
                        id="shopCategory"
                        name="shopCategory"
                        value={formData.shopCategory}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                        style={{ 
                          backgroundColor: isDarkMode ? 'var(--panel-gray)' : 'var(--panel-light)',
                          color: 'var(--text-main)',
                          borderColor: 'var(--border-color)'
                        }}
                      >
                        <option value="">Select a category</option>
                        {shopCategories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Shop Location
                    </label>
                    <div className="flex items-center space-x-4">
                      <button
                        type="button"
                        onClick={getLocation}
                        disabled={locationStatus === 'loading'}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                      >
                        {locationStatus === 'loading' ? 'Getting Location...' : 'Get Current Location'}
                      </button>
                      
                      {locationStatus === 'success' && (
                        <span className="text-green-600 text-sm flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Location captured
                        </span>
                      )}
                      
                      {locationStatus === 'error' && (
                        <span className="text-red-600 text-sm">
                          Failed to get location
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                      This helps customers find your shop on the map
                    </p>
                  </div>
                </div>
                
                {/* Initial Inventory (Optional) */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-2" style={{ borderColor: 'var(--border-color)' }}>
                    <h2 className="text-lg font-semibold" style={{ color: 'var(--text-main)' }}>Initial Inventory (Optional)</h2>
                    <button
                      type="button"
                      onClick={addInventoryItem}
                      className="text-sm text-[#e60012] hover:text-[#ff6b6b] focus:outline-none"
                    >
                      + Add Item
                    </button>
                  </div>
                  
                  {inventoryItems.map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3" style={{ borderColor: 'var(--border-color)' }}>
                      <div className="flex justify-between">
                        <h3 className="font-medium" style={{ color: 'var(--text-main)' }}>Item #{index + 1}</h3>
                        {inventoryItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeInventoryItem(index)}
                            className="text-sm text-red-600 hover:text-red-800 focus:outline-none"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                            Product Name
                          </label>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleInventoryChange(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                            style={{ 
                              backgroundColor: isDarkMode ? 'var(--panel-gray)' : 'var(--panel-light)',
                              color: 'var(--text-main)',
                              borderColor: 'var(--border-color)'
                            }}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                            Category
                          </label>
                          <input
                            type="text"
                            value={item.category}
                            onChange={(e) => handleInventoryChange(index, 'category', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                            style={{ 
                              backgroundColor: isDarkMode ? 'var(--panel-gray)' : 'var(--panel-light)',
                              color: 'var(--text-main)',
                              borderColor: 'var(--border-color)'
                            }}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                            Quantity
                          </label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleInventoryChange(index, 'quantity', e.target.value)}
                            min="0"
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                            style={{ 
                              backgroundColor: isDarkMode ? 'var(--panel-gray)' : 'var(--panel-light)',
                              color: 'var(--text-main)',
                              borderColor: 'var(--border-color)'
                            }}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                            Price (₹)
                          </label>
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => handleInventoryChange(index, 'price', e.target.value)}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                            style={{ 
                              backgroundColor: isDarkMode ? 'var(--panel-gray)' : 'var(--panel-light)',
                              color: 'var(--text-main)',
                              borderColor: 'var(--border-color)'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-[#e60012] to-[#ff6b6b] text-white font-medium rounded-lg hover:from-[#d10010] hover:to-[#e55b5b] focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:ring-offset-2 disabled:opacity-70"
                  >
                    {loading ? 'Registering...' : 'Register Shop'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
