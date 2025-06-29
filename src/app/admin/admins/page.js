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
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>Admin Users Management</h2>
      </div>
      
      {/* Add Admin Form */}
      <div className="rounded-lg p-6 border shadow-lg" style={{ backgroundColor: 'var(--panel-charcoal)', borderColor: 'var(--border-color)' }}>
        <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-main)' }}>Add New Admin</h3>
        <form onSubmit={handleAddAdmin}>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="Enter email address"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
              style={{ 
                backgroundColor: 'var(--panel-gray)', 
                borderColor: 'var(--border-color)',
                color: 'var(--text-main)'
              }}
              required
            />
            <button
              type="submit"
              disabled={addingAdmin}
              className="px-6 py-2 bg-[#e60012] text-white rounded-md hover:bg-[#d40010] focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ '--tw-ring-offset-color': 'var(--panel-charcoal)' }}
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
      <div className="rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: 'var(--panel-charcoal)' }}>
        <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h3 className="text-lg font-medium" style={{ color: 'var(--text-main)' }}>Current Admins</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y" style={{ borderColor: 'var(--border-color)' }}>
            <thead style={{ backgroundColor: 'var(--panel-gray)' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Added By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Added On
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ backgroundColor: 'var(--panel-charcoal)', borderColor: 'var(--border-color)' }}>
              {admins.length > 0 ? (
                admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-opacity-20 hover:bg-gray-600 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {admin.email}
                      {admin.email === currentUser?.email && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#e60012] text-white">
                          You
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {admin.addedBy || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {admin.addedAt ? new Date(admin.addedAt.seconds * 1000).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-secondary)' }}>
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
                  <td colSpan={4} className="px-6 py-4 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
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