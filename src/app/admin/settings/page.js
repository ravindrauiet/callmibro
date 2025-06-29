'use client'

import { useState, useEffect } from 'react'
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { toast } from 'react-hot-toast'
import { useTheme } from '@/contexts/ThemeContext'

export default function SettingsPage() {
  const { isDarkMode, toggleTheme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState({
    general: {
      siteName: 'CallMiBro',
      siteDescription: 'Professional appliance repair services',
      contactEmail: 'contact@callmibro.com',
      contactPhone: '+91 98765 43210',
      address: '123 Main Street, City, State 12345',
      workingHours: 'Mon-Fri: 9AM-6PM, Sat: 10AM-4PM'
    },
    appearance: {
      primaryColor: '#e60012',
      secondaryColor: '#ff6b6b',
      enableAnimations: true,
      enableNotifications: true
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      bookingConfirmations: true,
      serviceUpdates: true,
      promotionalEmails: false
    }
  })

  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'siteSettings'))
        
        if (settingsDoc.exists()) {
          const data = settingsDoc.data()
          setSettings(prev => ({
            ...prev,
            ...data
          }))
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
        toast.error('Failed to load settings')
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  // Handle input change
  const handleChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  // Handle checkbox change
  const handleCheckboxChange = (section, field) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: !prev[section][field]
      }
    }))
  }

  // Save settings
  const saveSettings = async () => {
    setSaving(true)
    try {
      await setDoc(doc(db, 'settings', 'siteSettings'), settings, { merge: true })
      toast.success('Settings saved successfully')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>Settings</h2>
      </div>

      <div className="rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: 'var(--panel-charcoal)' }}>
        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: 'var(--border-color)' }}>
          <button
            onClick={() => setActiveTab('general')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'general'
                ? 'text-[#e60012] border-b-2 border-[#e60012]'
                : 'hover:text-white'
            }`}
            style={{ color: activeTab === 'general' ? '#e60012' : 'var(--text-secondary)' }}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'appearance'
                ? 'text-[#e60012] border-b-2 border-[#e60012]'
                : 'hover:text-white'
            }`}
            style={{ color: activeTab === 'appearance' ? '#e60012' : 'var(--text-secondary)' }}
          >
            Appearance
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'notifications'
                ? 'text-[#e60012] border-b-2 border-[#e60012]'
                : 'hover:text-white'
            }`}
            style={{ color: activeTab === 'notifications' ? '#e60012' : 'var(--text-secondary)' }}
          >
            Notifications
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={settings.general.siteName}
                    onChange={(e) => handleChange('general', 'siteName', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                    style={{ 
                      backgroundColor: 'var(--panel-gray)', 
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-main)'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Site Description
                  </label>
                  <input
                    type="text"
                    value={settings.general.siteDescription}
                    onChange={(e) => handleChange('general', 'siteDescription', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                    style={{ 
                      backgroundColor: 'var(--panel-gray)', 
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-main)'
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={settings.general.contactEmail}
                    onChange={(e) => handleChange('general', 'contactEmail', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                    style={{ 
                      backgroundColor: 'var(--panel-gray)', 
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-main)'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={settings.general.contactPhone}
                    onChange={(e) => handleChange('general', 'contactPhone', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                    style={{ 
                      backgroundColor: 'var(--panel-gray)', 
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-main)'
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Address
                </label>
                <textarea
                  value={settings.general.address}
                  onChange={(e) => handleChange('general', 'address', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                  style={{ 
                    backgroundColor: 'var(--panel-gray)', 
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-main)'
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Working Hours
                </label>
                <input
                  type="text"
                  value={settings.general.workingHours}
                  onChange={(e) => handleChange('general', 'workingHours', e.target.value)}
                  placeholder="e.g. Mon-Fri: 9AM-6PM, Sat: 10AM-4PM"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                  style={{ 
                    backgroundColor: 'var(--panel-gray)', 
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-main)'
                  }}
                />
              </div>
            </div>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              {/* Theme Toggle */}
              <div className="p-4 border rounded-md" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium" style={{ color: 'var(--text-main)' }}>Site Theme</h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Toggle between light and dark mode for the entire website</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isDarkMode} 
                      onChange={toggleTheme}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e60012]"></div>
                    <span className="ml-3 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                    </span>
                  </label>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Primary Color
                  </label>
                  <div className="flex items-center">
                    <input
                      type="color"
                      value={settings.appearance.primaryColor}
                      onChange={(e) => handleChange('appearance', 'primaryColor', e.target.value)}
                      className="h-10 w-10 rounded border-0 p-0"
                    />
                    <input
                      type="text"
                      value={settings.appearance.primaryColor}
                      onChange={(e) => handleChange('appearance', 'primaryColor', e.target.value)}
                      className="ml-2 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      style={{ 
                        backgroundColor: 'var(--panel-gray)', 
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-main)'
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Secondary Color
                  </label>
                  <div className="flex items-center">
                    <input
                      type="color"
                      value={settings.appearance.secondaryColor}
                      onChange={(e) => handleChange('appearance', 'secondaryColor', e.target.value)}
                      className="h-10 w-10 rounded border-0 p-0"
                    />
                    <input
                      type="text"
                      value={settings.appearance.secondaryColor}
                      onChange={(e) => handleChange('appearance', 'secondaryColor', e.target.value)}
                      className="ml-2 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012]"
                      style={{ 
                        backgroundColor: 'var(--panel-gray)', 
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-main)'
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableAnimations"
                    checked={settings.appearance.enableAnimations}
                    onChange={() => handleCheckboxChange('appearance', 'enableAnimations')}
                    className="h-4 w-4 text-[#e60012] focus:ring-[#e60012] border-gray-300 rounded"
                  />
                  <label htmlFor="enableAnimations" className="ml-2 block text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Enable animations and transitions
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableNotifications"
                    checked={settings.appearance.enableNotifications}
                    onChange={() => handleCheckboxChange('appearance', 'enableNotifications')}
                    className="h-4 w-4 text-[#e60012] focus:ring-[#e60012] border-gray-300 rounded"
                  />
                  <label htmlFor="enableNotifications" className="ml-2 block text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Enable browser notifications
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    checked={settings.notifications.emailNotifications}
                    onChange={() => handleCheckboxChange('notifications', 'emailNotifications')}
                    className="h-4 w-4 text-[#e60012] focus:ring-[#e60012] border-gray-300 rounded"
                  />
                  <label htmlFor="emailNotifications" className="ml-2 block text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Email notifications
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="smsNotifications"
                    checked={settings.notifications.smsNotifications}
                    onChange={() => handleCheckboxChange('notifications', 'smsNotifications')}
                    className="h-4 w-4 text-[#e60012] focus:ring-[#e60012] border-gray-300 rounded"
                  />
                  <label htmlFor="smsNotifications" className="ml-2 block text-sm" style={{ color: 'var(--text-secondary)' }}>
                    SMS notifications
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="pushNotifications"
                    checked={settings.notifications.pushNotifications}
                    onChange={() => handleCheckboxChange('notifications', 'pushNotifications')}
                    className="h-4 w-4 text-[#e60012] focus:ring-[#e60012] border-gray-300 rounded"
                  />
                  <label htmlFor="pushNotifications" className="ml-2 block text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Push notifications
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="bookingConfirmations"
                    checked={settings.notifications.bookingConfirmations}
                    onChange={() => handleCheckboxChange('notifications', 'bookingConfirmations')}
                    className="h-4 w-4 text-[#e60012] focus:ring-[#e60012] border-gray-300 rounded"
                  />
                  <label htmlFor="bookingConfirmations" className="ml-2 block text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Booking confirmations
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="serviceUpdates"
                    checked={settings.notifications.serviceUpdates}
                    onChange={() => handleCheckboxChange('notifications', 'serviceUpdates')}
                    className="h-4 w-4 text-[#e60012] focus:ring-[#e60012] border-gray-300 rounded"
                  />
                  <label htmlFor="serviceUpdates" className="ml-2 block text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Service updates and reminders
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="promotionalEmails"
                    checked={settings.notifications.promotionalEmails}
                    onChange={() => handleCheckboxChange('notifications', 'promotionalEmails')}
                    className="h-4 w-4 text-[#e60012] focus:ring-[#e60012] border-gray-300 rounded"
                  />
                  <label htmlFor="promotionalEmails" className="ml-2 block text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Promotional emails and offers
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="px-6 py-2 bg-[#e60012] text-white rounded-md hover:bg-[#d40010] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e60012] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ '--tw-ring-offset-color': 'var(--panel-charcoal)' }}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
} 