'use client'

import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'react-hot-toast'

export default function ProfileInfo() {
  const { currentUser, updateUserProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    displayName: currentUser?.displayName || '',
    email: currentUser?.email || '',
    phone: currentUser?.phoneNumber || '',
    address: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      await updateUserProfile({
        displayName: formData.displayName
      })
      
      toast.success('Profile updated successfully')
      setIsEditing(false)
    } catch (error) {
      console.error(error)
      toast.error('Failed to update profile')
    }
  }

  return (
    <div className="bg-[#111] border border-[#222] rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Profile Information</h3>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="text-[#e60012] hover:underline"
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                className="w-full bg-[#222] border border-[#333] rounded p-2 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full bg-[#222] border border-[#333] rounded p-2 text-white opacity-70"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-[#222] border border-[#333] rounded p-2 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Shipping Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                className="w-full bg-[#222] border border-[#333] rounded p-2 text-white"
              ></textarea>
            </div>
            
            <button
              type="submit"
              className="mt-2 bg-[#e60012] text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-400">Full Name</p>
            <p>{currentUser?.displayName || 'Not set'}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-400">Email Address</p>
            <p>{currentUser?.email}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-400">Phone Number</p>
            <p>{currentUser?.phoneNumber || 'Not set'}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-400">Shipping Address</p>
            <p>Not set</p>
          </div>
        </div>
      )}
    </div>
  )
} 