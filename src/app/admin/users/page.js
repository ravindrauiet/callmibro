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
        <h2 className="text-2xl font-bold text-white">Users Management</h2>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search users by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#1a1a1a] rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#333]">
            <thead className="bg-[#222]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#1a1a1a] divide-y divide-[#333]">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#222] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#333] flex items-center justify-center text-white">
                          {user.photoURL ? (
                            <img 
                              src={user.photoURL} 
                              alt={user.name} 
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <span className="text-lg font-medium">
                              {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{user.name || 'N/A'}</div>
                          <div className="text-sm text-gray-400">{user.phone || 'No phone'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div className="flex items-center">
                        {user.email}
                        {user.emailVerified && (
                          <span className="ml-2 flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(user.lastLogin)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : user.role === 'technician'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role || 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => openUserModal(user)}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          Edit Role
                        </button>
                        <button 
                          onClick={() => openDeleteModal(user)}
                          className="text-red-500 hover:text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-400">
                    {searchTerm ? 'No users found matching your search' : 'No users found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Load More Button */}
        {!noMoreUsers && (
          <div className="px-6 py-3 border-t border-[#333] flex justify-center">
            <button
              onClick={loadMoreUsers}
              disabled={loadingMore}
              className={`px-4 py-2 text-sm font-medium text-white bg-[#333] hover:bg-[#444] rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e60012] ${loadingMore ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loadingMore ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </span>
              ) : (
                'Load More'
              )}
            </button>
          </div>
        )}
      </div>

      {/* User Role Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-medium text-white mb-4">Update User Role</h3>
            <p className="text-gray-300 mb-2">
              User: <span className="font-medium">{selectedUser?.name || selectedUser?.email}</span>
            </p>
            <p className="text-gray-400 text-sm mb-4">
              Email: {selectedUser?.email}
            </p>
            
            <div className="mb-6">
              <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-1">
                Role
              </label>
              <select
                id="role"
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                className="w-full px-3 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
              >
                <option value="user">User</option>
                <option value="technician">Technician</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={updateUserRole}
                className="px-4 py-2 bg-[#e60012] rounded-md text-white hover:bg-[#d40010] focus:outline-none"
              >
                Update Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-medium text-white mb-4">Confirm Delete</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete the user "{userToDelete?.name || userToDelete?.email}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={deleteUser}
                className="px-4 py-2 bg-red-600 rounded-md text-white hover:bg-red-700 focus:outline-none"
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