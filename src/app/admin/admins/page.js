'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, deleteDoc, doc, query, where } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminUsers() {
  const { currentUser } = useAuth()
  const [admins, setAdmins] = useState([])
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [addingAdmin, setAddingAdmin] = useState(false)
  const [removingAdmin, setRemovingAdmin] = useState(null)

  // Fetch admins
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const adminsSnapshot = await getDocs(collection(db, 'admins'))
        const adminsData = adminsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setAdmins(adminsData)
      } catch (error) {
        console.error('Error fetching admins:', error)
        toast.error('Failed to load admin list')
      } finally {
        setLoading(false)
      }
    }

    fetchAdmins()
  }, [])

  // Add a new admin
  const handleAddAdmin = async (e) => {
    e.preventDefault()
    
    if (!newAdminEmail || !newAdminEmail.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }
    
    setAddingAdmin(true)
    try {
      // Check if admin already exists
      const existingAdminQuery = query(
        collection(db, 'admins'),
        where('email', '==', newAdminEmail)
      )
      const existingAdminSnapshot = await getDocs(existingAdminQuery)
      
      if (!existingAdminSnapshot.empty) {
        toast.error('This email is already an admin')
        return
      }
      
      // Add new admin
      const newAdmin = {
        email: newAdminEmail,
        addedBy: currentUser.email,
        addedAt: new Date()
      }
      
      const docRef = await addDoc(collection(db, 'admins'), newAdmin)
      
      // Update local state
      setAdmins([...admins, { id: docRef.id, ...newAdmin }])
      setNewAdminEmail('')
      toast.success('Admin added successfully')
    } catch (error) {
      console.error('Error adding admin:', error)
      toast.error('Failed to add admin')
    } finally {
      setAddingAdmin(false)
    }
  }

  // Remove an admin
  const handleRemoveAdmin = async (adminId, adminEmail) => {
    if (adminEmail === currentUser?.email) {
      toast.error('You cannot remove yourself from admins')
      return
    }
    
    setRemovingAdmin(adminId)
    try {
      await deleteDoc(doc(db, 'admins', adminId))
      
      // Update local state
      setAdmins(admins.filter(admin => admin.id !== adminId))
      toast.success('Admin removed successfully')
    } catch (error) {
      console.error('Error removing admin:', error)
      toast.error('Failed to remove admin')
    } finally {
      setRemovingAdmin(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e60012]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white">Admin Users Management</h2>
      </div>
      
      {/* Add Admin Form */}
      <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#333] shadow-lg">
        <h3 className="text-xl font-bold text-white mb-4">Add New Admin</h3>
        <form onSubmit={handleAddAdmin}>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="Enter email address"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              className="flex-1 px-4 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
              required
            />
            <button
              type="submit"
              disabled={addingAdmin}
              className="px-6 py-2 bg-[#e60012] text-white rounded-md hover:bg-[#d40010] focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:ring-offset-2 focus:ring-offset-[#1a1a1a] disabled:bg-[#555] disabled:cursor-not-allowed"
            >
              {addingAdmin ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  <span>Adding...</span>
                </div>
              ) : (
                'Add Admin'
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* Admins List */}
      <div className="bg-[#1a1a1a] rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-[#333]">
          <h3 className="text-lg font-medium text-white">Current Admins</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#333]">
            <thead className="bg-[#222]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Added By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Added On
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#1a1a1a] divide-y divide-[#333]">
              {admins.length > 0 ? (
                admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-[#222] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {admin.email}
                      {admin.email === currentUser?.email && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#e60012] text-white">
                          You
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {admin.addedBy || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {admin.addedAt ? new Date(admin.addedAt.seconds * 1000).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <button
                        onClick={() => handleRemoveAdmin(admin.id, admin.email)}
                        disabled={removingAdmin === admin.id || admin.email === currentUser?.email}
                        className={`text-red-400 hover:text-red-500 ${
                          admin.email === currentUser?.email || removingAdmin === admin.id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {removingAdmin === admin.id ? 'Removing...' : 'Remove'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-400">
                    No admins found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 