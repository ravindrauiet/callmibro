'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { toast } from 'react-hot-toast'
import { FiHome, FiMapPin, FiPlus, FiEdit2, FiTrash2, FiCheck } from 'react-icons/fi'

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
  }, [userProfile, currentUser])

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

  return (
    <div className="rounded-xl p-6 shadow-lg" style={{ 
      background: isDarkMode 
        ? 'linear-gradient(to bottom, var(--panel-dark), var(--panel-charcoal))' 
        : 'var(--panel-dark)',
      borderColor: 'var(--border-color)',
      borderWidth: '1px'
    }}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold bg-gradient-to-r from-[#e60012] to-[#ff6b6b] bg-clip-text text-transparent">Profile Information</h3>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="text-transparent bg-gradient-to-r from-[#e60012] to-[#ff6b6b] bg-clip-text hover:underline transition-all"
          disabled={loading}
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="animate-fadeIn">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                className="w-full rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-all"
                style={{ 
                  backgroundColor: 'var(--panel-gray)',
                  color: 'var(--text-main)',
                  borderColor: 'var(--border-color)',
                  borderWidth: '1px'
                }}
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full rounded-lg p-3 opacity-70"
                style={{ 
                  backgroundColor: 'var(--panel-gray)',
                  color: 'var(--text-main)',
                  borderColor: 'var(--border-color)',
                  borderWidth: '1px'
                }}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Email cannot be changed</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-all"
                style={{ 
                  backgroundColor: 'var(--panel-gray)',
                  color: 'var(--text-main)',
                  borderColor: 'var(--border-color)',
                  borderWidth: '1px'
                }}
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Shipping Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                className="w-full rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-all"
                style={{ 
                  backgroundColor: 'var(--panel-gray)',
                  color: 'var(--text-main)',
                  borderColor: 'var(--border-color)',
                  borderWidth: '1px'
                }}
                required
                disabled={loading}
              ></textarea>
            </div>
            
            <button
              type="submit"
              className="mt-2 bg-gradient-to-r from-[#e60012] to-[#ff6b6b] hover:from-[#ff6b6b] hover:to-[#e60012] text-white px-6 py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md w-full"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="rounded-lg p-4" style={{ 
            backgroundColor: 'var(--panel-gray)',
            borderColor: 'var(--border-color)',
            borderWidth: '1px'
          }}>
            <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Full Name</p>
            <p className="font-medium" style={{ color: 'var(--text-main)' }}>{userProfile?.name || currentUser?.displayName || 'Not set'}</p>
          </div>
          
          <div className="rounded-lg p-4" style={{ 
            backgroundColor: 'var(--panel-gray)',
            borderColor: 'var(--border-color)',
            borderWidth: '1px'
          }}>
            <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Email Address</p>
            <p className="font-medium" style={{ color: 'var(--text-main)' }}>{userProfile?.email || currentUser?.email || 'Not set'}</p>
          </div>
          
          <div className="rounded-lg p-4" style={{ 
            backgroundColor: 'var(--panel-gray)',
            borderColor: 'var(--border-color)',
            borderWidth: '1px'
          }}>
            <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Phone Number</p>
            <p className="font-medium" style={{ color: 'var(--text-main)' }}>{userProfile?.phone || 'Not set'}</p>
          </div>
          
          <div className="rounded-lg p-4" style={{ 
            backgroundColor: 'var(--panel-gray)',
            borderColor: 'var(--border-color)',
            borderWidth: '1px'
          }}>
            <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Shipping Address</p>
            <p className="font-medium" style={{ color: 'var(--text-main)' }}>{userProfile?.address || 'Not set'}</p>
          </div>
          
          <button
            onClick={() => setIsEditing(true)}
            className="mt-2 bg-gradient-to-r from-[#e60012] to-[#ff6b6b] hover:from-[#ff6b6b] hover:to-[#e60012] text-white px-6 py-3 rounded-lg transition-all font-medium shadow-md w-full"
          >
            Edit Profile Information
          </button>
        </div>
      )}

      {/* Saved Addresses Section */}
      <div className="mt-10 pt-8" style={{ borderTopWidth: '1px', borderColor: 'var(--border-color)' }}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold bg-gradient-to-r from-[#e60012] to-[#ff6b6b] bg-clip-text text-transparent">
            Saved Addresses
          </h3>
          <button 
            onClick={() => openAddressModal()}
            className="flex items-center gap-1 text-white bg-gradient-to-r from-[#e60012] to-[#ff6b6b] hover:from-[#d40010] hover:to-[#e55b5b] px-3 py-2 rounded-md transition-all text-sm font-medium"
            disabled={loading}
          >
            <FiPlus size={16} />
            Add New
          </button>
        </div>

        {savedAddresses && savedAddresses.length > 0 ? (
          <div className="space-y-4">
            {savedAddresses.map((address) => (
              <div key={address.id} className="rounded-lg p-4 relative" style={{ 
                backgroundColor: 'var(--panel-gray)',
                borderColor: 'var(--border-color)',
                borderWidth: '1px'
              }}>
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <FiHome size={18} className="text-[#e60012]" />
                    <p className="font-medium" style={{ color: 'var(--text-main)' }}>{address.name}</p>
                    {address.isDefault && (
                      <span className="bg-[#e60012]/20 text-[#ff6b6b] text-xs px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => openAddressModal(address)}
                      className="hover:text-[#e60012]" 
                      style={{ color: 'var(--text-secondary)' }}
                      title="Edit"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteAddress(address.id)}
                      className="hover:text-red-500" 
                      style={{ color: 'var(--text-secondary)' }}
                      title="Delete"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="mt-2 pl-6" style={{ color: 'var(--text-secondary)' }}>{address.fullAddress}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg p-6 text-center" style={{ 
            backgroundColor: 'var(--panel-gray)',
            borderColor: 'var(--border-color)',
            borderWidth: '1px'
          }}>
            <FiMapPin size={32} className="mx-auto mb-3" style={{ color: 'var(--text-secondary)' }} />
            <p style={{ color: 'var(--text-secondary)' }}>You haven't saved any addresses yet</p>
            <button
              onClick={() => openAddressModal()}
              className="mt-4 text-[#e60012] hover:text-[#ff6b6b] text-sm font-medium"
            >
              + Add New Address
            </button>
          </div>
        )}
      </div>

      {/* Address Modal */}
      {addressModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="rounded-xl p-6 max-w-md w-full animate-fadeIn" style={{ 
            backgroundColor: 'var(--panel-dark)',
            borderColor: 'var(--border-color)',
            borderWidth: '1px'
          }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-main)' }}>
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h3>
            
            <form onSubmit={handleAddressSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Address Name</label>
                  <input
                    type="text"
                    name="name"
                    value={addressForm.name}
                    onChange={handleAddressChange}
                    placeholder="Home, Work, etc."
                    className="w-full rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-all"
                    style={{ 
                      backgroundColor: 'var(--panel-gray)',
                      color: 'var(--text-main)',
                      borderColor: 'var(--border-color)',
                      borderWidth: '1px'
                    }}
                    required
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Full Address</label>
                    <button 
                      type="button" 
                      onClick={getCurrentLocation}
                      className="text-xs flex items-center gap-1 text-[#e60012] hover:text-[#ff6b6b]"
                    >
                      <FiMapPin size={12} />
                      Use my location
                    </button>
                  </div>
                  <textarea
                    name="fullAddress"
                    value={addressForm.fullAddress}
                    onChange={handleAddressChange}
                    placeholder="Enter complete address"
                    rows="3"
                    className="w-full rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-all"
                    style={{ 
                      backgroundColor: 'var(--panel-gray)',
                      color: 'var(--text-main)',
                      borderColor: 'var(--border-color)',
                      borderWidth: '1px'
                    }}
                    required
                    disabled={loading}
                  ></textarea>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefault"
                    name="isDefault"
                    checked={addressForm.isDefault}
                    onChange={handleAddressCheckbox}
                    className="h-4 w-4 text-[#e60012] focus:ring-[#e60012] rounded"
                    style={{ 
                      backgroundColor: 'var(--panel-gray)',
                      borderColor: 'var(--border-color)'
                    }}
                  />
                  <label htmlFor="isDefault" className="ml-2 block text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Set as default address
                  </label>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setAddressModalOpen(false)}
                  className="flex-1 text-white px-4 py-2 rounded-lg transition-all font-medium"
                  style={{ backgroundColor: 'var(--panel-gray)' }}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#e60012] to-[#ff6b6b] hover:from-[#d40010] hover:to-[#e55b5b] text-white px-4 py-2 rounded-lg transition-all font-medium"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 