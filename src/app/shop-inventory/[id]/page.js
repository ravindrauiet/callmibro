'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { db } from '@/firebase/config'
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp, query, where, orderBy } from 'firebase/firestore'
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
  
  // Enhanced form data with structured fields
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    brand: '',
    model: '',
    quantity: '',
    price: '',
    description: ''
  })
  
  // Autocomplete data
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [models, setModels] = useState([])
  const [filteredCategories, setFilteredCategories] = useState([])
  const [filteredBrands, setFilteredBrands] = useState([])
  const [filteredModels, setFilteredModels] = useState([])
  
  // Autocomplete states
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false)
  const [showBrandSuggestions, setShowBrandSuggestions] = useState(false)
  const [showModelSuggestions, setShowModelSuggestions] = useState(false)
  
  // Predefined categories for fallback
  const predefinedCategories = [
    'Mobile Phone Repair',
    'Computer & Laptop Repair',
    'TV & Electronics Repair',
    'Home Appliance Repair',
    'Camera & Audio Repair',
    'Gaming Console Repair',
    'AC Repair',
    'Refrigerator Repair',
    'Washing Machine Repair',
    'Other'
  ]

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

  // Fetch categories, brands, and models for autocomplete
  useEffect(() => {
    const fetchAutocompleteData = async () => {
      try {
        // First, fetch from dedicated collections (prioritize these)
        let allBrands = []
        let allModels = []
        let allCategories = []
        
        // Fetch brands from brands collection
        try {
          const brandsSnapshot = await getDocs(collection(db, 'brands'))
          const brandsData = brandsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          
          allBrands = brandsData.map(brand => brand.name).filter(Boolean)
          allCategories = [...new Set(brandsData.map(brand => brand.category).filter(Boolean))]
          
          console.log('Fetched brands from brands collection:', allBrands.length, 'items')
          console.log('Fetched categories from brands collection:', allCategories.length, 'items')
        } catch (error) {
          console.log('Brands collection not available')
        }
        
        // Fetch models from models collection
        try {
          const modelsSnapshot = await getDocs(collection(db, 'models'))
          const modelsData = modelsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          
          allModels = modelsData.map(model => model.name).filter(Boolean)
          
          // Add categories from models if not already present
          const modelCategories = modelsData.map(model => model.category).filter(Boolean)
          allCategories = [...new Set([...allCategories, ...modelCategories])]
          
          console.log('Fetched models from models collection:', allModels.length, 'items')
        } catch (error) {
          console.log('Models collection not available')
        }
        
        // If we don't have enough data from dedicated collections, fetch from spare parts as fallback
        if (allBrands.length === 0 || allModels.length === 0) {
          try {
            const sparePartsSnapshot = await getDocs(collection(db, 'spareParts'))
            const sparePartsData = sparePartsSnapshot.docs.map(doc => doc.data())
            
            // Only add spare parts data if we don't have enough from dedicated collections
            if (allBrands.length === 0) {
              const sparePartsBrands = [...new Set(sparePartsData.map(part => part.brand))].filter(Boolean)
              allBrands = [...allBrands, ...sparePartsBrands]
              console.log('Added brands from spare parts:', sparePartsBrands.length, 'items')
            }
            
            if (allModels.length === 0) {
              const sparePartsModels = [...new Set(sparePartsData.map(part => part.model))].filter(Boolean)
              allModels = [...allModels, ...sparePartsModels]
              console.log('Added models from spare parts:', sparePartsModels.length, 'items')
            }
            
            if (allCategories.length === 0) {
              const sparePartsCategories = [...new Set(sparePartsData.map(part => part.category))].filter(Boolean)
              allCategories = [...allCategories, ...sparePartsCategories]
              console.log('Added categories from spare parts:', sparePartsCategories.length, 'items')
            }
          } catch (error) {
            console.log('Spare parts collection not available')
          }
        }
        
        // Sort and set the data
        setCategories(allCategories.sort())
        setBrands(allBrands.sort())
        setModels(allModels.sort())
        
        console.log('Final data - Categories:', allCategories.length, 'Brands:', allBrands.length, 'Models:', allModels.length)
        
      } catch (error) {
        console.error('Error fetching autocomplete data:', error)
        // Set minimal fallback data
        setCategories(['Mobile', 'TV', 'AC', 'Laptop', 'Other'])
        setBrands(['Apple', 'Samsung', 'Other'])
        setModels(['iPhone 12', 'Galaxy S21', 'Other'])
      }
    }
    
    fetchAutocompleteData()
  }, []) // Fixed dependency array

  // Filter brands based on selected category
  useEffect(() => {
    const filterBrandsByCategory = async () => {
      if (!formData.category) {
        setFilteredBrands([])
        return
      }
      
      try {
        // Fetch brands from the database that match the selected category
        const brandsSnapshot = await getDocs(collection(db, 'brands'))
        const brandsData = brandsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        // Filter brands by category
        const categoryBrands = brandsData
          .filter(brand => brand.category === formData.category)
          .map(brand => brand.name)
          .filter(Boolean)
        
        console.log(`Brands for category ${formData.category}:`, categoryBrands)
        setFilteredBrands(categoryBrands)
        
      } catch (error) {
        console.error('Error filtering brands by category:', error)
        setFilteredBrands([])
      }
    }
    
    filterBrandsByCategory()
  }, [formData.category])

  // Filter models based on selected category and brand
  useEffect(() => {
    const filterModelsByCategoryAndBrand = async () => {
      if (!formData.category || !formData.brand) {
        setFilteredModels([])
        return
      }
      
      try {
        // First, get the brand ID from the brands collection
        const brandsSnapshot = await getDocs(collection(db, 'brands'))
        const brandsData = brandsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        const selectedBrand = brandsData.find(brand => 
          brand.name === formData.brand && brand.category === formData.category
        )
        
        if (!selectedBrand) {
          console.log('Brand not found in database for category:', formData.category, 'and brand:', formData.brand)
          setFilteredModels([])
          return
        }
        
        // Fetch models from the database that match the selected brand and category
        const modelsSnapshot = await getDocs(collection(db, 'models'))
        const modelsData = modelsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        // Filter models by brand ID and category
        const filteredModels = modelsData
          .filter(model => 
            model.brandId === selectedBrand.id && 
            model.category === formData.category
          )
          .map(model => model.name)
          .filter(Boolean)
        
        console.log(`Models for category ${formData.category} and brand ${formData.brand}:`, filteredModels)
        setFilteredModels(filteredModels)
        
      } catch (error) {
        console.error('Error filtering models by category and brand:', error)
        setFilteredModels([])
      }
    }
    
    filterModelsByCategoryAndBrand()
  }, [formData.category, formData.brand])

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Reset dependent fields when category or brand changes
    if (name === 'category') {
      setFormData(prev => ({
        ...prev,
        category: value,
        brand: '',
        model: ''
      }))
    } else if (name === 'brand') {
      setFormData(prev => ({
        ...prev,
        brand: value,
        model: ''
      }))
    }
  }
  
  // Autocomplete functions
  const handleCategoryInput = (value) => {
    setFormData(prev => ({ ...prev, category: value }))
    
    if (value.trim() === '') {
      setFilteredCategories(categories)
      setShowCategorySuggestions(true)
      return
    }
    
    const filtered = categories.filter(cat => 
      cat.toLowerCase().includes(value.toLowerCase())
    )
    setFilteredCategories(filtered)
    setShowCategorySuggestions(true)
  }
  
  const handleBrandInput = (value) => {
    setFormData(prev => ({ ...prev, brand: value }))
    
    if (value.trim() === '') {
      // Show all brands if no category selected, otherwise show filtered brands
      const optionsToShow = formData.category ? filteredBrands : brands.map(b => b.name)
      setFilteredBrands(optionsToShow)
      setShowBrandSuggestions(true)
      return
    }
    
    // Get the current list of brands to filter from
    const currentBrands = formData.category ? filteredBrands : brands.map(b => b.name)
    
    // Filter brands by the input value
    const filtered = currentBrands.filter(brandName => 
      brandName.toLowerCase().includes(value.toLowerCase())
    )
    
    setFilteredBrands(filtered)
    setShowBrandSuggestions(true)
  }
  
  const handleModelInput = (value) => {
    setFormData(prev => ({ ...prev, model: value }))
    
    if (value.trim() === '') {
      // Show filtered models if both category and brand are selected, otherwise show all models
      const optionsToShow = (formData.category && formData.brand) ? filteredModels : models.map(m => m.name)
      setFilteredModels(optionsToShow)
      setShowModelSuggestions(true)
      return
    }
    
    // Get the current list of models to filter from
    const currentModels = (formData.category && formData.brand) ? filteredModels : models.map(m => m.name)
    
    // Filter models by the input value
    const filtered = currentModels.filter(modelName => 
      modelName.toLowerCase().includes(value.toLowerCase())
    )
    
    setFilteredModels(filtered)
    setShowModelSuggestions(true)
  }
  
  const selectCategory = (category) => {
    console.log('selectCategory called with:', category)
    console.log('Current formData before:', formData)
    setFormData(prev => ({ ...prev, category }))
    setShowCategorySuggestions(false)
    console.log('Category selected:', category)
  }
  
  const selectBrand = (brand) => {
    console.log('selectBrand called with:', brand)
    console.log('Current formData before:', formData)
    setFormData(prev => ({ ...prev, brand }))
    setShowBrandSuggestions(false)
    console.log('Brand selected:', brand)
  }
  
  const selectModel = (model) => {
    console.log('selectModel called with:', model)
    console.log('Current formData before:', formData)
    setFormData(prev => ({ ...prev, model }))
    setShowModelSuggestions(false)
    console.log('Model selected:', model)
  }

  // Handle autocomplete selection
  const handleAutocompleteSelect = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Hide suggestions
    setShowCategorySuggestions(false)
    setShowBrandSuggestions(false)
    setShowModelSuggestions(false)
  }

  // Handle adding new category/brand/model
  const handleAddNew = async (field, value) => {
    if (!value.trim()) {
      toast.error('Please enter a value')
      return
    }

    try {
      if (field === 'category') {
        // Add to local state (categories are predefined)
        if (!categories.includes(value)) {
          setCategories(prev => [...prev, value].sort())
        }
        handleAutocompleteSelect('category', value)
      } else if (field === 'brand') {
        // Add new brand to database
        const brandData = {
          name: value,
          category: formData.category,
          isActive: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
        
        const docRef = await addDoc(collection(db, 'brands'), brandData)
        const newBrand = { id: docRef.id, ...brandData }
        
        setBrands(prev => [...prev, newBrand])
        setFilteredBrands(prev => [...prev, newBrand])
        handleAutocompleteSelect('brand', value)
        
        toast.success('Brand added successfully')
      } else if (field === 'model') {
        // Add new model to database
        const selectedBrand = brands.find(b => b.name === formData.brand)
        if (!selectedBrand) {
          toast.error('Please select a brand first')
          return
        }
        
        const modelData = {
          name: value,
          brandId: selectedBrand.id,
          brandName: selectedBrand.name,
          category: formData.category,
          isActive: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
        
        const docRef = await addDoc(collection(db, 'models'), modelData)
        const newModel = { id: docRef.id, ...modelData }
        
        setModels(prev => [...prev, newModel])
        setFilteredModels(prev => [...prev, newModel])
        handleAutocompleteSelect('model', value)
        
        toast.success('Model added successfully')
      }
    } catch (error) {
      console.error('Error adding new item:', error)
      toast.error('Failed to add new item')
    }
  }

  // Open modal for adding new item
  const openAddModal = () => {
    setFormData({
      name: '',
      category: '',
      brand: '',
      model: '',
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
      brand: item.brand || '',
      model: item.model || '',
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
          brand: formData.brand,
          model: formData.model,
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
                  brand: formData.brand,
                  model: formData.model,
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
          brand: formData.brand,
          model: formData.model,
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
                        Brand
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                        Model
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
                      <tr 
                        key={item.id} 
                        className="transition-colors duration-200"
                        style={{ 
                          borderColor: 'var(--border-color)',
                          '--hover-bg-light': 'var(--panel-gray)',
                          '--hover-bg-dark': 'var(--panel-charcoal)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = isDarkMode ? 'var(--hover-bg-dark)' : 'var(--hover-bg-light)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)'
                        }}
                      >
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
                          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.brand}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.model}</div>
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
                            className="mr-4 transition-colors duration-200"
                            style={{ 
                              color: isDarkMode ? 'var(--accent-blue)' : '#2563eb',
                              '--hover-color-light': '#1d4ed8',
                              '--hover-color-dark': 'var(--accent-blue-light)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = isDarkMode ? 'var(--hover-color-dark)' : 'var(--hover-color-light)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = isDarkMode ? 'var(--accent-blue)' : '#2563eb'
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="transition-colors duration-200"
                            style={{ 
                              color: isDarkMode ? 'var(--accent-red)' : '#dc2626',
                              '--hover-color-light': '#b91c1c',
                              '--hover-color-dark': 'var(--accent-red-light)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = isDarkMode ? 'var(--hover-color-dark)' : 'var(--hover-color-light)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = isDarkMode ? 'var(--accent-red)' : '#dc2626'
                            }}
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
      
      {/* Enhanced Add/Edit Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: isDarkMode ? '#1f2937' : '#ffffff' }}>
            <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <h3 className="text-lg font-medium" style={{ color: 'var(--text-main)' }}>
                {isEditing ? 'Edit Inventory Item' : 'Add New Inventory Item'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 space-y-4">
                {/* Product Name */}
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
                      backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                      color: 'var(--text-main)',
                      borderColor: 'var(--border-color)'
                    }}
                  />
                </div>
                
                {/* Category with Autocomplete */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Category*
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={(e) => handleCategoryInput(e.target.value)}
                      onFocus={() => {
                        // Show all categories when focusing
                        setFilteredCategories(categories)
                        setShowCategorySuggestions(true)
                      }}
                      onBlur={() => {
                        // Delay hiding to allow click events to fire
                        setTimeout(() => setShowCategorySuggestions(false), 300)
                      }}
                      required
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                      style={{ 
                        backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                        color: 'var(--text-main)',
                        borderColor: 'var(--border-color)'
                      }}
                      placeholder="Type to search or add new category"
                    />
                    {showCategorySuggestions && (
                      <>
                        {console.log('Rendering category suggestions:', filteredCategories)}
                        <div className="absolute z-50 w-full mt-1 border rounded-md shadow-lg max-h-60 overflow-y-auto" 
                          style={{ 
                            backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                            borderColor: 'var(--border-color)',
                            boxShadow: isDarkMode ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                          }}>
                        {filteredCategories.length > 0 ? (
                          filteredCategories.map((category) => (
                            <button
                              key={category}
                              type="button"
                              onClick={(e) => {
                                console.log('Category button clicked:', category)
                                console.log('Event:', e)
                                e.preventDefault()
                                e.stopPropagation()
                                console.log('About to call selectCategory with:', category)
                                selectCategory(category)
                              }}
                              onMouseDown={(e) => {
                                console.log('Category button mousedown:', category)
                                e.preventDefault()
                                e.stopPropagation()
                              }}
                              className="w-full px-3 py-2 text-left focus:outline-none transition-colors duration-200"
                              style={{ 
                                color: 'var(--text-main)',
                                backgroundColor: 'transparent'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = isDarkMode ? '#4b5563' : '#f3f4f6'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent'
                              }}
                            >
                              {category}
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            No suggestions found. Type to add new category.
                          </div>
                        )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Brand with Autocomplete */}
                <div>
                  <label htmlFor="brand" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Brand*
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="brand"
                      name="brand"
                      value={formData.brand}
                      onChange={(e) => handleBrandInput(e.target.value)}
                      onFocus={() => {
                        // Show appropriate brands when focusing
                        const optionsToShow = formData.category ? filteredBrands : brands.map(b => b.name)
                        setFilteredBrands(optionsToShow)
                        setShowBrandSuggestions(true)
                      }}
                      onBlur={() => {
                        // Delay hiding to allow click events to fire
                        setTimeout(() => setShowBrandSuggestions(false), 150)
                      }}
                      required
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                      style={{ 
                        backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                        color: 'var(--text-main)',
                        borderColor: 'var(--border-color)'
                      }}
                      placeholder="Type to search or add new brand"
                    />
                    {showBrandSuggestions && (
                      <div className="absolute z-50 w-full mt-1 border rounded-md shadow-lg max-h-60 overflow-y-auto" 
                        style={{ 
                          backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                          borderColor: 'var(--border-color)',
                          boxShadow: isDarkMode ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}>
                        {filteredBrands.length > 0 ? (
                          filteredBrands.map((brand) => (
                            <button
                              key={brand}
                              type="button"
                              onClick={(e) => {
                                console.log('Brand button clicked:', brand)
                                console.log('Event:', e)
                                e.preventDefault()
                                e.stopPropagation()
                                console.log('About to call selectBrand with:', brand)
                                selectBrand(brand)
                              }}
                              onMouseDown={(e) => {
                                console.log('Brand button mousedown:', brand)
                                e.preventDefault()
                                e.stopPropagation()
                              }}
                              className="w-full px-3 py-2 text-left focus:outline-none transition-colors duration-200"
                              style={{ 
                                color: 'var(--text-main)',
                                backgroundColor: 'transparent'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = isDarkMode ? '#4b5563' : '#f3f4f6'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent'
                              }}
                            >
                              {brand}
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {formData.category ? 'No brands found for this category.' : 'No suggestions found. Type to add new brand.'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Model with Autocomplete */}
                <div>
                  <label htmlFor="model" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Model*
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="model"
                      name="model"
                      value={formData.model}
                      onChange={(e) => handleModelInput(e.target.value)}
                      onFocus={() => {
                        // Show appropriate models when focusing
                        const optionsToShow = (formData.category && formData.brand) ? filteredModels : models.map(m => m.name)
                        setFilteredModels(optionsToShow)
                        setShowModelSuggestions(true)
                      }}
                      onBlur={() => {
                        // Delay hiding to allow click events to fire
                        setTimeout(() => setShowModelSuggestions(false), 150)
                      }}
                      required
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                      style={{ 
                        backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                        color: 'var(--text-main)',
                        borderColor: 'var(--border-color)'
                      }}
                      placeholder="Type to search or add new model"
                    />
                    {showModelSuggestions && (
                      <div className="absolute z-50 w-full mt-1 border rounded-md shadow-lg max-h-60 overflow-y-auto" 
                        style={{ 
                          backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                          borderColor: 'var(--border-color)',
                          boxShadow: isDarkMode ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}>
                        {filteredModels.length > 0 ? (
                          filteredModels.map((model) => (
                            <button
                              key={model}
                              type="button"
                              onClick={(e) => {
                                console.log('Model button clicked:', model)
                                console.log('Event:', e)
                                e.preventDefault()
                                e.stopPropagation()
                                console.log('About to call selectModel with:', model)
                                selectModel(model)
                              }}
                              onMouseDown={(e) => {
                                console.log('Model button mousedown:', model)
                                e.preventDefault()
                                e.stopPropagation()
                              }}
                              className="w-full px-3 py-2 text-left focus:outline-none transition-colors duration-200"
                              style={{ 
                                color: 'var(--text-main)',
                                backgroundColor: 'transparent'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = isDarkMode ? '#4b5563' : '#f3f4f6'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent'
                              }}
                            >
                              {model}
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {formData.brand ? 'No models found for this brand.' : 'No suggestions found. Type to add new model.'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
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
                        backgroundColor: isDarkMode ? '#374151' : '#ffffff',
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
                        backgroundColor: isDarkMode ? '#374151' : '#ffffff',
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
                      backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                      color: 'var(--text-main)',
                      borderColor: 'var(--border-color)'
                    }}
                  ></textarea>
                </div>
              </div>
              
              <div className="px-6 py-4 flex justify-end space-x-3 rounded-b-lg" style={{ backgroundColor: isDarkMode ? '#374151' : '#f9fafb' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
                  style={{ 
                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                    color: 'var(--text-main)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#e60012] text-white rounded-md hover:bg-[#d10010] focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:ring-offset-2 transition-colors duration-200"
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
