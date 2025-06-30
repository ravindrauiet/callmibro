'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { db } from '@/firebase/config'
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp, query, where } from 'firebase/firestore'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { toast } from 'react-hot-toast'

export default function ShopInventoryPage({ params }) {
  const shopId = params.id
  const { currentUser } = useAuth()
  const { isDarkMode } = useTheme()
  const router = useRouter()
  
  const [shopData, setShopData] = useState(null)
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentItem, setCurrentItem] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    price: '',
    description: ''
  })
  
  // Fetch shop data and inventory
  useEffect(() => {
    const fetchShopData = async () => {
      if (!currentUser) {
        router.push('/')
        return
      }
      
      try {
        setLoading(true)
        
        // Get shop data
        const shopRef = doc(db, 'shopOwners', shopId)
        const shopSnap = await getDoc(shopRef)
        
        if (!shopSnap.exists()) {
          toast.error('Shop not found')
          router.push('/profile')
          return
        }
        
        const shopData = {
          id: shopSnap.id,
          ...shopSnap.data()
        }
        
        // Check if current user is the shop owner
        if (shopData.userId !== currentUser.uid) {
          toast.error('You do not have permission to view this page')
          router.push('/profile')
          return
        }
        
        setShopData(shopData)
        
        // Get inventory items
        const inventoryRef = collection(db, 'shopOwners', shopId, 'inventory')
        const inventorySnap = await getDocs(inventoryRef)
        
        const inventoryItems = inventorySnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        setInventory(inventoryItems)
      } catch (error) {
        console.error('Error fetching shop data:', error)
        toast.error('Failed to load shop data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchShopData()
  }, [currentUser, shopId, router])
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  // Open modal for adding new item
  const openAddModal = () => {
    setFormData({
      name: '',
      category: '',
      quantity: '',
      price: '',
      description: ''
    })
    setIsEditing(false)
    setIsModalOpen(true)
  }
  
  // Open modal for editing item
  const openEditModal = (item) => {
    setFormData({
      name: item.name || '',
      category: item.category || '',
      quantity: item.quantity || '',
      price: item.price || '',
      description: item.description || ''
    })
    setCurrentItem(item)
    setIsEditing(true)
    setIsModalOpen(true)
  }
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (isEditing && currentItem) {
        // Update existing item
        const itemRef = doc(db, 'shopOwners', shopId, 'inventory', currentItem.id)
        await updateDoc(itemRef, {
          name: formData.name,
          category: formData.category,
          quantity: parseInt(formData.quantity) || 0,
          price: parseFloat(formData.price) || 0,
          description: formData.description || '',
          updatedAt: serverTimestamp()
        })
        
        // Update local state
        setInventory(prev => 
          prev.map(item => 
            item.id === currentItem.id 
              ? { 
                  ...item, 
                  name: formData.name,
                  category: formData.category,
                  quantity: parseInt(formData.quantity) || 0,
                  price: parseFloat(formData.price) || 0,
                  description: formData.description || ''
                } 
              : item
          )
        )
        
        toast.success('Item updated successfully')
      } else {
        // Add new item
        const inventoryRef = collection(db, 'shopOwners', shopId, 'inventory')
        const newItem = {
          name: formData.name,
          category: formData.category,
          quantity: parseInt(formData.quantity) || 0,
          price: parseFloat(formData.price) || 0,
          description: formData.description || '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
        
        const docRef = await addDoc(inventoryRef, newItem)
        
        // Update local state
        setInventory(prev => [...prev, { id: docRef.id, ...newItem }])
        
        // Update shop hasInventory flag if this is the first item
        if (inventory.length === 0) {
          const shopRef = doc(db, 'shopOwners', shopId)
          await updateDoc(shopRef, { hasInventory: true })
        }
        
        toast.success('Item added successfully')
      }
      
      // Close modal
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error saving inventory item:', error)
      toast.error('Failed to save item')
    }
  }
  
  // Handle item deletion
  const handleDeleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return
    }
    
    try {
      const itemRef = doc(db, 'shopOwners', shopId, 'inventory', itemId)
      await deleteDoc(itemRef)
      
      // Update local state
      setInventory(prev => prev.filter(item => item.id !== itemId))
      
      // Update shop hasInventory flag if this was the last item
      if (inventory.length === 1) {
        const shopRef = doc(db, 'shopOwners', shopId)
        await updateDoc(shopRef, { hasInventory: false })
      }
      
      toast.success('Item deleted successfully')
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('Failed to delete item')
    }
  }
  
  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-color)' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e60012]"></div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen py-16 px-4 sm:px-8" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-main)' }}>
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--text-main)' }}>Inventory Management</h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {shopData?.shopName} - {shopData?.shopCategory}
                </p>
              </div>
              
              <button
                onClick={openAddModal}
                className="mt-4 sm:mt-0 px-6 py-2 bg-[#e60012] text-white rounded-lg hover:bg-[#d10010] focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:ring-offset-2 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add New Item
              </button>
            </div>
            
            {shopData?.status === 'pending' && (
              <div className="mt-4 p-4 bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100 rounded-lg">
                <p className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Your shop registration is pending approval. You can still manage your inventory, but it won't be visible to customers until approved.
                </p>
              </div>
            )}
          </div>
          
          {/* Inventory Table */}
          <div className="rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)' }}>
            {inventory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y" style={{ borderColor: 'var(--border-color)' }}>
                  <thead style={{ backgroundColor: isDarkMode ? 'var(--panel-charcoal)' : 'var(--panel-gray)' }}>
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                        Product
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                        Quantity
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                        Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)', borderColor: 'var(--border-color)' }}>
                    {inventory.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700" style={{ borderColor: 'var(--border-color)' }}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>{item.name}</div>
                          {item.description && (
                            <div className="text-xs truncate max-w-[200px]" style={{ color: 'var(--text-secondary)' }}>
                              {item.description}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.category}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.quantity}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>₹{item.price}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => openEditModal(item)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--text-secondary)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h3 className="mt-4 text-lg font-medium" style={{ color: 'var(--text-main)' }}>No inventory items</h3>
                <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Get started by adding your first inventory item.</p>
                <button
                  onClick={openAddModal}
                  className="mt-6 px-4 py-2 bg-[#e60012] text-white rounded-lg hover:bg-[#d10010] focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:ring-offset-2"
                >
                  Add Item
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Add/Edit Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="rounded-lg shadow-xl max-w-md w-full" style={{ backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)' }}>
            <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <h3 className="text-lg font-medium" style={{ color: 'var(--text-main)' }}>
                {isEditing ? 'Edit Inventory Item' : 'Add New Inventory Item'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Product Name*
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                    style={{ 
                      backgroundColor: isDarkMode ? 'var(--panel-gray)' : 'var(--panel-light)',
                      color: 'var(--text-main)',
                      borderColor: 'var(--border-color)'
                    }}
                  />
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Category*
                  </label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                    style={{ 
                      backgroundColor: isDarkMode ? 'var(--panel-gray)' : 'var(--panel-light)',
                      color: 'var(--text-main)',
                      borderColor: 'var(--border-color)'
                    }}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Quantity*
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                      min="0"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                      style={{ 
                        backgroundColor: isDarkMode ? 'var(--panel-gray)' : 'var(--panel-light)',
                        color: 'var(--text-main)',
                        borderColor: 'var(--border-color)'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Price (₹)*
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                      style={{ 
                        backgroundColor: isDarkMode ? 'var(--panel-gray)' : 'var(--panel-light)',
                        color: 'var(--text-main)',
                        borderColor: 'var(--border-color)'
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                    style={{ 
                      backgroundColor: isDarkMode ? 'var(--panel-gray)' : 'var(--panel-light)',
                      color: 'var(--text-main)',
                      borderColor: 'var(--border-color)'
                    }}
                  ></textarea>
                </div>
              </div>
              
              <div className="px-6 py-4 flex justify-end space-x-3 rounded-b-lg" style={{ backgroundColor: isDarkMode ? 'var(--panel-charcoal)' : 'var(--panel-gray)' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  style={{ 
                    backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)',
                    color: 'var(--text-main)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#e60012] text-white rounded-md hover:bg-[#d10010] focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:ring-offset-2"
                >
                  {isEditing ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <Footer />
    </>
  )
}
