'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'react-hot-toast'

export default function ProfileInfo({ userProfile }) {
  const { currentUser, updateUserProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phone: '',
    address: ''
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

  return (
    <div className="bg-gradient-to-b from-[#111] to-[#0a0a0a] border border-[#222] rounded-xl p-6 shadow-lg">
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
              <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-all"
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white opacity-70"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-all"
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Shipping Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#e60012] transition-all"
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
          <div className="bg-[#0d0d0d] rounded-lg p-4 border border-[#222]">
            <p className="text-sm text-gray-400 mb-1">Full Name</p>
            <p className="font-medium">{userProfile?.name || currentUser?.displayName || 'Not set'}</p>
          </div>
          
          <div className="bg-[#0d0d0d] rounded-lg p-4 border border-[#222]">
            <p className="text-sm text-gray-400 mb-1">Email Address</p>
            <p className="font-medium">{userProfile?.email || currentUser?.email || 'Not set'}</p>
          </div>
          
          <div className="bg-[#0d0d0d] rounded-lg p-4 border border-[#222]">
            <p className="text-sm text-gray-400 mb-1">Phone Number</p>
            <p className="font-medium">{userProfile?.phone || 'Not set'}</p>
          </div>
          
          <div className="bg-[#0d0d0d] rounded-lg p-4 border border-[#222]">
            <p className="text-sm text-gray-400 mb-1">Shipping Address</p>
            <p className="font-medium">{userProfile?.address || 'Not set'}</p>
          </div>
          
          <button
            onClick={() => setIsEditing(true)}
            className="mt-2 bg-gradient-to-r from-[#e60012] to-[#ff6b6b] hover:from-[#ff6b6b] hover:to-[#e60012] text-white px-6 py-3 rounded-lg transition-all font-medium shadow-md w-full"
          >
            Edit Profile Information
          </button>
        </div>
      )}
    </div>
  )
} 