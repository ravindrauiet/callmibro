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
      siteDescription: 'Your trusted repair service',
      contactEmail: '',
      contactPhone: '',
      address: '',
      workingHours: ''
    },
    appearance: {
      primaryColor: '#e60012',
      secondaryColor: '#111111',
      showHeroBanner: true,
      showTestimonials: true,
      showServices: true
    },
    notifications: {
      sendBookingConfirmation: true,
      sendBookingReminder: true,
      sendTechnicianAssigned: true,
      sendServiceCompleted: true,
      adminEmailNotifications: true
    }
  })

  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'siteSettings'))
        
        if (settingsDoc.exists()) {
          const data = settingsDoc.data()
          setSettings(prevSettings => ({
            general: { ...prevSettings.general, ...data.general },
            appearance: { ...prevSettings.appearance, ...data.appearance },
            notifications: { ...prevSettings.notifications, ...data.notifications }
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
        <h2 className="text-2xl font-bold text-white">Settings</h2>
      </div>

      <div className="bg-[#1a1a1a] rounded-lg shadow-md overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-[#333]">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'general'
                ? 'text-[#e60012] border-b-2 border-[#e60012]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'appearance'
                ? 'text-[#e60012] border-b-2 border-[#e60012]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Appearance
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'notifications'
                ? 'text-[#e60012] border-b-2 border-[#e60012]'
                : 'text-gray-400 hover:text-white'
            }`}
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
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={settings.general.siteName}
                    onChange={(e) => handleChange('general', 'siteName', e.target.value)}
                    className="w-full px-3 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Site Description
                  </label>
                  <input
                    type="text"
                    value={settings.general.siteDescription}
                    onChange={(e) => handleChange('general', 'siteDescription', e.target.value)}
                    className="w-full px-3 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={settings.general.contactEmail}
                    onChange={(e) => handleChange('general', 'contactEmail', e.target.value)}
                    className="w-full px-3 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={settings.general.contactPhone}
                    onChange={(e) => handleChange('general', 'contactPhone', e.target.value)}
                    className="w-full px-3 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Address
                </label>
                <textarea
                  value={settings.general.address}
                  onChange={(e) => handleChange('general', 'address', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Working Hours
                </label>
                <input
                  type="text"
                  value={settings.general.workingHours}
                  onChange={(e) => handleChange('general', 'workingHours', e.target.value)}
                  placeholder="e.g. Mon-Fri: 9AM-6PM, Sat: 10AM-4PM"
                  className="w-full px-3 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
                />
              </div>
            </div>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              {/* Theme Toggle */}
              <div className="p-4 border border-[#333] rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">Site Theme</h3>
                    <p className="text-sm text-gray-400">Toggle between light and dark mode for the entire website</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isDarkMode} 
                      onChange={toggleTheme}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e60012]"></div>
                    <span className="ml-3 text-sm font-medium text-gray-300">
                      {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                    </span>
                  </label>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
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
                      className="ml-2 w-full px-3 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
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
                      className="ml-2 w-full px-3 py-2 bg-[#222] border border-[#333] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e60012] focus:border-[#e60012] text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showHeroBanner"
                    checked={settings.appearance.showHeroBanner}
                    onChange={() => handleCheckboxChange('appearance', 'showHeroBanner')}
                    className="h-4 w-4 text-[#e60012] focus:ring-[#e60012] border-[#333] rounded"
                  />
                  <label htmlFor="showHeroBanner" className="ml-2 block text-sm text-gray-300">
                    Show Hero Banner on Homepage
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showTestimonials"
                    checked={settings.appearance.showTestimonials}
                    onChange={() => handleCheckboxChange('appearance', 'showTestimonials')}
                    className="h-4 w-4 text-[#e60012] focus:ring-[#e60012] border-[#333] rounded"
                  />
                  <label htmlFor="showTestimonials" className="ml-2 block text-sm text-gray-300">
                    Show Testimonials on Homepage
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showServices"
                    checked={settings.appearance.showServices}
                    onChange={() => handleCheckboxChange('appearance', 'showServices')}
                    className="h-4 w-4 text-[#e60012] focus:ring-[#e60012] border-[#333] rounded"
                  />
                  <label htmlFor="showServices" className="ml-2 block text-sm text-gray-300">
                    Show Services on Homepage
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sendBookingConfirmation"
                  checked={settings.notifications.sendBookingConfirmation}
                  onChange={() => handleCheckboxChange('notifications', 'sendBookingConfirmation')}
                  className="h-4 w-4 text-[#e60012] focus:ring-[#e60012] border-[#333] rounded"
                />
                <label htmlFor="sendBookingConfirmation" className="ml-2 block text-sm text-gray-300">
                  Send booking confirmation emails to customers
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sendBookingReminder"
                  checked={settings.notifications.sendBookingReminder}
                  onChange={() => handleCheckboxChange('notifications', 'sendBookingReminder')}
                  className="h-4 w-4 text-[#e60012] focus:ring-[#e60012] border-[#333] rounded"
                />
                <label htmlFor="sendBookingReminder" className="ml-2 block text-sm text-gray-300">
                  Send booking reminder emails (24 hours before appointment)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sendTechnicianAssigned"
                  checked={settings.notifications.sendTechnicianAssigned}
                  onChange={() => handleCheckboxChange('notifications', 'sendTechnicianAssigned')}
                  className="h-4 w-4 text-[#e60012] focus:ring-[#e60012] border-[#333] rounded"
                />
                <label htmlFor="sendTechnicianAssigned" className="ml-2 block text-sm text-gray-300">
                  Notify customers when a technician is assigned
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sendServiceCompleted"
                  checked={settings.notifications.sendServiceCompleted}
                  onChange={() => handleCheckboxChange('notifications', 'sendServiceCompleted')}
                  className="h-4 w-4 text-[#e60012] focus:ring-[#e60012] border-[#333] rounded"
                />
                <label htmlFor="sendServiceCompleted" className="ml-2 block text-sm text-gray-300">
                  Send service completion emails with feedback request
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="adminEmailNotifications"
                  checked={settings.notifications.adminEmailNotifications}
                  onChange={() => handleCheckboxChange('notifications', 'adminEmailNotifications')}
                  className="h-4 w-4 text-[#e60012] focus:ring-[#e60012] border-[#333] rounded"
                />
                <label htmlFor="adminEmailNotifications" className="ml-2 block text-sm text-gray-300">
                  Send email notifications to admin for new bookings
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Save Button */}
        <div className="px-6 py-4 bg-[#222] border-t border-[#333] flex justify-end">
          <button
            onClick={saveSettings}
            disabled={saving}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#e60012] hover:bg-[#d40010] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e60012] ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </button>
        </div>
      </div>
    </div>
  )
} 