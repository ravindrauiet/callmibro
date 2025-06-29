'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs, query, orderBy, limit, startAfter, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { toast } from 'react-hot-toast'

export default function UsersManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [lastVisible, setLastVisible] = useState(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [noMoreUsers, setNoMoreUsers] = useState(false)
  const [showUserModal, setShowUserModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [userRole, setUserRole] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)

  const USERS_PER_PAGE = 15

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      try {
        const usersQuery = query(
          collection(db, 'users'),
          orderBy('createdAt', 'desc'),
          limit(USERS_PER_PAGE)
        )
        
        const usersSnapshot = await getDocs(usersQuery)
        
        if (usersSnapshot.empty) {
          setUsers([])
          setNoMoreUsers(true)
        } else {
          const usersData = usersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          setUsers(usersData)
          setLastVisible(usersSnapshot.docs[usersSnapshot.docs.length - 1])
          setNoMoreUsers(usersSnapshot.docs.length < USERS_PER_PAGE)
        }
      } catch (error) {
        console.error('Error fetching users:', error)
        toast.error('Failed to load users')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // Load more users
  const loadMoreUsers = async () => {
    if (loadingMore || noMoreUsers) return
    
    setLoadingMore(true)
    try {
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc'),
        startAfter(lastVisible),
        limit(USERS_PER_PAGE)
      )
      
      const usersSnapshot = await getDocs(usersQuery)
      
      if (usersSnapshot.empty) {
        setNoMoreUsers(true)
      } else {
        const newUsers = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        setUsers(prev => [...prev, ...newUsers])
        setLastVisible(usersSnapshot.docs[usersSnapshot.docs.length - 1])
        setNoMoreUsers(usersSnapshot.docs.length < USERS_PER_PAGE)
      }
    } catch (error) {
      console.error('Error loading more users:', error)
      toast.error('Failed to load more users')
    } finally {
      setLoadingMore(false)
    }
  }

  // Open user role modal
  const openUserModal = (user) => {
    setSelectedUser(user)
    setUserRole(user.role || 'user')
    setShowUserModal(true)
  }

  // Update user role
  const updateUserRole = async () => {
    if (!selectedUser) return
    
    try {
      await updateDoc(doc(db, 'users', selectedUser.id), {
        role: userRole,
        updatedAt: new Date()
      })
      
      // Update user in state
      setUsers(prev => 
        prev.map(user => 
          user.id === selectedUser.id 
            ? { ...user, role: userRole } 
            : user
        )
      )
      
      toast.success('User role updated successfully')
      setShowUserModal(false)
    } catch (error) {
      console.error('Error updating user role:', error)
      toast.error('Failed to update user role')
    }
  }

  // Open delete confirmation modal
  const openDeleteModal = (user) => {
    setUserToDelete(user)
    setShowDeleteModal(true)
  }

  // Delete user
  const deleteUser = async () => {
    if (!userToDelete) return
    
    try {
      await deleteDoc(doc(db, 'users', userToDelete.id))
      
      // Remove user from state
      setUsers(prev => prev.filter(user => user.id !== userToDelete.id))
      
      toast.success('User deleted successfully')
      setShowDeleteModal(false)
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
    }
  }

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>Users Management</h2>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search users by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
          style={{ 
            backgroundColor: 'var(--panel-gray)', 
            borderColor: 'var(--border-color)',
            color: 'var(--text-main)'
          }}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--text-secondary)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: 'var(--panel-charcoal)' }}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y" style={{ borderColor: 'var(--border-color)' }}>
            <thead style={{ backgroundColor: 'var(--panel-gray)' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ backgroundColor: 'var(--panel-charcoal)', borderColor: 'var(--border-color)' }}>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-opacity-20 hover:bg-gray-600 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--panel-gray)' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--text-secondary)' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>
                            {user.name || 'N/A'}
                          </div>
                          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {user.phone || 'No phone'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {formatDate(user.lastLoginAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openUserModal(user)}
                        className="text-[#e60012] hover:text-[#ff6b6b] mr-4"
                      >
                        Edit Role
                      </button>
                      <button
                        onClick={() => openDeleteModal(user)}
                        className="text-red-400 hover:text-red-500"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {searchTerm ? 'No users found matching your search' : 'No users found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Load More Button */}
        {!noMoreUsers && (
          <div className="px-6 py-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <button
              onClick={loadMoreUsers}
              disabled={loadingMore}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#e60012] hover:bg-[#d40010] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e60012] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ '--tw-ring-offset-color': 'var(--panel-charcoal)' }}
            >
              {loadingMore ? 'Loading...' : 'Load More Users'}
            </button>
          </div>
        )}
      </div>

      {/* User Role Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Update User Role</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User: {selectedUser?.name || selectedUser?.email}
              </label>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={updateUserRole}
                className="px-4 py-2 text-sm font-medium text-white bg-[#e60012] rounded-md hover:bg-[#d40010]"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete User</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete {userToDelete?.name || userToDelete?.email}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={deleteUser}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 