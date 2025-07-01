'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { db } from '@/firebase/config'
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp, query, where, orderBy } from 'firebase/firestore'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ShareDropdown from '@/components/ShareDropdown'
import { toast } from 'react-hot-toast'

export default function ShopInventoryPage({ params }) {
  const shopId = params.id
  const { currentUser } = useAuth()
  const { isDarkMode } = useTheme()
  const router = useRouter()
  
  const [shopData, setShopData] = useState(null)
  const [inventory, setInventory] = useState([])
  const [filteredInventory, setFilteredInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentItem, setCurrentItem] = useState(null)
  
  // Enhanced form data with more fields
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    brand: '',
    model: '',
    quantity: '',
    price: '',
    costPrice: '',
    description: '',
    sku: '',
    minStockLevel: '',
    maxStockLevel: '',
    supplier: '',
    location: '',
    condition: 'new',
    warranty: '',
    tags: ''
  })
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [brandFilter, setBrandFilter] = useState('')
  const [stockFilter, setStockFilter] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  
  // Bulk operations
  const [selectedItems, setSelectedItems] = useState([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  
  // Analytics states
  const [analytics, setAnalytics] = useState({
    totalItems: 0,
    totalValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    categories: {},
    topBrands: []
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

  // Condition options
  const conditionOptions = [
    { value: 'new', label: 'New' },
    { value: 'refurbished', label: 'Refurbished' },
    { value: 'used', label: 'Used' },
    { value: 'damaged', label: 'Damaged' }
  ]

  // Calculate analytics
  const calculateAnalytics = (inventoryData) => {
    const totalItems = inventoryData.length
    const totalValue = inventoryData.reduce((sum, item) => sum + (item.quantity * item.price), 0)
    const lowStockItems = inventoryData.filter(item => 
      item.quantity <= (item.minStockLevel || 5)
    ).length
    const outOfStockItems = inventoryData.filter(item => item.quantity === 0).length
    
    // Category distribution
    const categories = {}
    inventoryData.forEach(item => {
      categories[item.category] = (categories[item.category] || 0) + 1
    })
    
    // Top brands
    const brandCounts = {}
    inventoryData.forEach(item => {
      brandCounts[item.brand] = (brandCounts[item.brand] || 0) + 1
    })
    const topBrands = Object.entries(brandCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([brand, count]) => ({ brand, count }))
    
    setAnalytics({
      totalItems,
      totalValue,
      lowStockItems,
      outOfStockItems,
      categories,
      topBrands
    })
  }

  // Filter and sort inventory
  const filterAndSortInventory = () => {
    let filtered = [...inventory]
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.brand || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.model || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.sku || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter(item => item.category === categoryFilter)
    }
    
    // Apply brand filter
    if (brandFilter) {
      filtered = filtered.filter(item => item.brand === brandFilter)
    }
    
    // Apply stock filter
    if (stockFilter) {
      switch (stockFilter) {
        case 'low':
          filtered = filtered.filter(item => item.quantity <= (item.minStockLevel || 5))
          break
        case 'out':
          filtered = filtered.filter(item => item.quantity === 0)
          break
        case 'in':
          filtered = filtered.filter(item => item.quantity > (item.minStockLevel || 5))
          break
      }
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]
      
      if (sortBy === 'price' || sortBy === 'quantity' || sortBy === 'costPrice') {
        aValue = parseFloat(aValue) || 0
        bValue = parseFloat(bValue) || 0
      } else {
        aValue = String(aValue || '').toLowerCase()
        bValue = String(bValue || '').toLowerCase()
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
    
    setFilteredInventory(filtered)
  }

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
        setFilteredInventory(inventoryItems)
        calculateAnalytics(inventoryItems)
      } catch (error) {
        console.error('Error fetching shop data:', error)
        toast.error('Failed to load shop data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchShopData()
  }, [currentUser, shopId, router])

  // Apply filters when search/filter states change
  useEffect(() => {
    filterAndSortInventory()
  }, [searchTerm, categoryFilter, brandFilter, stockFilter, sortBy, sortOrder, inventory])

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
      costPrice: '',
      description: '',
      sku: '',
      minStockLevel: '',
      maxStockLevel: '',
      supplier: '',
      location: '',
      condition: 'new',
      warranty: '',
      tags: ''
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
      costPrice: item.costPrice || '',
      description: item.description || '',
      sku: item.sku || '',
      minStockLevel: item.minStockLevel || '',
      maxStockLevel: item.maxStockLevel || '',
      supplier: item.supplier || '',
      location: item.location || '',
      condition: item.condition || 'new',
      warranty: item.warranty || '',
      tags: item.tags || ''
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
          costPrice: parseFloat(formData.costPrice) || 0,
          description: formData.description || '',
          sku: formData.sku || '',
          minStockLevel: parseInt(formData.minStockLevel) || 0,
          maxStockLevel: parseInt(formData.maxStockLevel) || 0,
          supplier: formData.supplier || '',
          location: formData.location || '',
          condition: formData.condition || 'new',
          warranty: formData.warranty || '',
          tags: formData.tags || '',
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
                  costPrice: parseFloat(formData.costPrice) || 0,
                  description: formData.description || '',
                  sku: formData.sku || '',
                  minStockLevel: parseInt(formData.minStockLevel) || 0,
                  maxStockLevel: parseInt(formData.maxStockLevel) || 0,
                  supplier: formData.supplier || '',
                  location: formData.location || '',
                  condition: formData.condition || 'new',
                  warranty: formData.warranty || '',
                  tags: formData.tags || '',
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
          costPrice: parseFloat(formData.costPrice) || 0,
          description: formData.description || '',
          sku: formData.sku || '',
          minStockLevel: parseInt(formData.minStockLevel) || 0,
          maxStockLevel: parseInt(formData.maxStockLevel) || 0,
          supplier: formData.supplier || '',
          location: formData.location || '',
          condition: formData.condition || 'new',
          warranty: formData.warranty || '',
          tags: formData.tags || '',
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

  // Add new function for updating quantity directly
  const handleQuantityUpdate = async (itemId, newQuantity) => {
    if (newQuantity < 0) return; // Don't allow negative quantities
    
    try {
      const itemRef = doc(db, 'shopOwners', shopId, 'inventory', itemId);
      await updateDoc(itemRef, {
        quantity: newQuantity,
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      setInventory(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, quantity: newQuantity } 
            : item
        )
      );
      
      toast.success('Quantity updated');
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

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
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header with Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>
                {shopData?.shopName || 'Shop'} Inventory
              </h1>
              <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
                Manage your inventory items and track stock levels
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
              <ShareDropdown 
                shopId={shopId}
                shopName={shopData?.shopName || 'Shop'}
                contactNumber={shopData?.contactNumber}
                inventory={filteredInventory}
              />
              <button
                onClick={openAddModal}
                className="px-4 py-2 bg-[#e60012] text-white rounded-lg hover:bg-[#d10010] focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:ring-offset-2 transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Item
              </button>
            </div>
          </div>

          {/* Analytics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)' }}>
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                  <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Total Items</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>{analytics.totalItems}</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)' }}>
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                  <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Total Value</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>₹{analytics.totalValue.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)' }}>
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900">
                  <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Low Stock</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>{analytics.lowStockItems}</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)' }}>
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-red-100 dark:bg-red-900">
                  <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Out of Stock</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>{analytics.outOfStockItems}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="mb-6 p-4 rounded-lg shadow-md" style={{ backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Search</label>
                <input
                  type="text"
                  placeholder="Search by name, brand, model, or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                  style={{ 
                    backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                    color: 'var(--text-main)',
                    borderColor: 'var(--border-color)'
                  }}
                />
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                  style={{ 
                    backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                    color: 'var(--text-main)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  <option value="">All Categories</option>
                  {Object.keys(analytics.categories).map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Stock Filter */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Stock Status</label>
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                  style={{ 
                    backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                    color: 'var(--text-main)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  <option value="">All Items</option>
                  <option value="low">Low Stock</option>
                  <option value="out">Out of Stock</option>
                  <option value="in">In Stock</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Sort By</label>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-')
                    setSortBy(field)
                    setSortOrder(order)
                  }}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                  style={{ 
                    backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                    color: 'var(--text-main)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="price-asc">Price (Low-High)</option>
                  <option value="price-desc">Price (High-Low)</option>
                  <option value="quantity-asc">Quantity (Low-High)</option>
                  <option value="quantity-desc">Quantity (High-Low)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {showBulkActions && (
            <div className="mb-4 p-4 rounded-lg shadow-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>
                  {selectedItems.length} items selected
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {/* Implement bulk edit */}}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Bulk Edit
                  </button>
                  <button
                    onClick={() => {/* Implement bulk delete */}}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Bulk Delete
                  </button>
                  <button
                    onClick={() => {
                      setSelectedItems([])
                      setShowBulkActions(false)
                    }}
                    className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Inventory Table */}
          <div className="rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)' }}>
            {filteredInventory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y" style={{ borderColor: 'var(--border-color)' }}>
                  <thead style={{ backgroundColor: isDarkMode ? 'var(--panel-charcoal)' : 'var(--panel-gray)' }}>
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                        <input
                          type="checkbox"
                          checked={selectedItems.length === filteredInventory.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItems(filteredInventory.map(item => item.id))
                              setShowBulkActions(true)
                            } else {
                              setSelectedItems([])
                              setShowBulkActions(false)
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                      </th>
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
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ backgroundColor: isDarkMode ? 'var(--panel-dark)' : 'var(--panel-light)', borderColor: 'var(--border-color)' }}>
                    {filteredInventory.map((item) => (
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
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItems([...selectedItems, item.id])
                                setShowBulkActions(true)
                              } else {
                                const newSelected = selectedItems.filter(id => id !== item.id)
                                setSelectedItems(newSelected)
                                setShowBulkActions(newSelected.length > 0)
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>{item.name}</div>
                          {item.sku && (
                            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>SKU: {item.sku}</div>
                          )}
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
                          <div className="text-sm flex items-center" style={{ color: 'var(--text-secondary)' }}>
                            <button 
                              onClick={() => handleQuantityUpdate(item.id, Math.max(0, item.quantity - 1))}
                              className="w-6 h-6 flex items-center justify-center rounded-full border mr-2 transition-colors duration-200"
                              style={{ 
                                borderColor: 'var(--border-color)',
                                backgroundColor: isDarkMode ? 'var(--panel-charcoal)' : 'var(--panel-gray)'
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            
                            <span className="mx-1 min-w-[24px] text-center">{item.quantity}</span>
                            
                            <button 
                              onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center rounded-full border ml-2 transition-colors duration-200"
                              style={{ 
                                borderColor: 'var(--border-color)',
                                backgroundColor: isDarkMode ? 'var(--panel-charcoal)' : 'var(--panel-gray)'
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12M6 12h12" />
                              </svg>
                            </button>
                            
                            {item.minStockLevel && item.quantity <= item.minStockLevel && (
                              <span className="ml-1 text-red-500">⚠️</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>₹{item.price}</div>
                          {item.costPrice && (
                            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                              Cost: ₹{item.costPrice}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item.quantity === 0 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : item.quantity <= (item.minStockLevel || 5)
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }`}>
                            {item.quantity === 0 ? 'Out of Stock' : item.quantity <= (item.minStockLevel || 5) ? 'Low Stock' : 'In Stock'}
                          </span>
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
                <h3 className="mt-4 text-lg font-medium" style={{ color: 'var(--text-main)' }}>
                  {inventory.length === 0 ? 'No inventory items' : 'No items match your filters'}
                </h3>
                <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {inventory.length === 0 ? 'Get started by adding your first inventory item.' : 'Try adjusting your search or filter criteria.'}
                </p>
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

                {/* SKU */}
                <div>
                  <label htmlFor="sku" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    SKU (Stock Keeping Unit)
                  </label>
                  <input
                    type="text"
                    id="sku"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                    style={{ 
                      backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                      color: 'var(--text-main)',
                      borderColor: 'var(--border-color)'
                    }}
                    placeholder="e.g., IPHONE13-BAT-001"
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

                {/* Quantity and Price Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      Selling Price (₹)*
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
                  <label htmlFor="costPrice" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Cost Price (₹)*
                  </label>
                  <input
                    type="number"
                    id="costPrice"
                    name="costPrice"
                    value={formData.costPrice}
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

                {/* Stock Levels Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="minStockLevel" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Minimum Stock Level
                    </label>
                    <input
                      type="number"
                      id="minStockLevel"
                      name="minStockLevel"
                      value={formData.minStockLevel}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                      style={{ 
                        backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                        color: 'var(--text-main)',
                        borderColor: 'var(--border-color)'
                      }}
                      placeholder="Default: 5"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="maxStockLevel" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Maximum Stock Level
                    </label>
                    <input
                      type="number"
                      id="maxStockLevel"
                      name="maxStockLevel"
                      value={formData.maxStockLevel}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                      style={{ 
                        backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                        color: 'var(--text-main)',
                        borderColor: 'var(--border-color)'
                      }}
                      placeholder="Optional"
                    />
                  </div>
                </div>

                {/* Supplier and Location Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="supplier" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Supplier
                    </label>
                    <input
                      type="text"
                      id="supplier"
                      name="supplier"
                      value={formData.supplier}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                      style={{ 
                        backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                        color: 'var(--text-main)',
                        borderColor: 'var(--border-color)'
                      }}
                      placeholder="e.g., ABC Electronics"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Storage Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                      style={{ 
                        backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                        color: 'var(--text-main)',
                        borderColor: 'var(--border-color)'
                      }}
                      placeholder="e.g., Shelf A1, Drawer 3"
                    />
                  </div>
                </div>

                {/* Condition and Warranty Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="condition" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Condition
                    </label>
                    <select
                      id="condition"
                      name="condition"
                      value={formData.condition}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                      style={{ 
                        backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                        color: 'var(--text-main)',
                        borderColor: 'var(--border-color)'
                      }}
                    >
                      {conditionOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="warranty" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Warranty
                    </label>
                    <input
                      type="text"
                      id="warranty"
                      name="warranty"
                      value={formData.warranty}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                      style={{ 
                        backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                        color: 'var(--text-main)',
                        borderColor: 'var(--border-color)'
                      }}
                      placeholder="e.g., 1 year, 6 months"
                    />
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label htmlFor="tags" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Tags
                  </label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
                    style={{ 
                      backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                      color: 'var(--text-main)',
                      borderColor: 'var(--border-color)'
                    }}
                    placeholder="e.g., popular, fast-moving, seasonal (comma separated)"
                  />
                </div>
                
                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Description
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
                    placeholder="Additional details about the product..."
                  />
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
