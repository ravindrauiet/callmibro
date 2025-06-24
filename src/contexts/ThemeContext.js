'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { usePathname } from 'next/navigation'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const isAdminPage = pathname?.startsWith('/admin')

  useEffect(() => {
    const fetchThemeSettings = async () => {
      try {
        const themeDoc = await getDoc(doc(db, 'settings', 'themeSettings'))
        
        if (themeDoc.exists()) {
          setIsDarkMode(themeDoc.data().isDarkMode)
        }
      } catch (error) {
        console.error('Error fetching theme settings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchThemeSettings()
  }, [])

  useEffect(() => {
    if (!loading) {
      // Apply theme classes to html element
      document.documentElement.classList.toggle('dark-mode', isDarkMode)
      document.documentElement.classList.toggle('light-mode', !isDarkMode)
      
      // Apply theme-specific styles to body
      if (isDarkMode) {
        document.body.style.backgroundColor = 'var(--bg-color)'
        document.body.style.color = 'var(--text-main)'
      } else {
        document.body.style.backgroundColor = 'var(--bg-color)'
        document.body.style.color = 'var(--text-main)'
      }
    }
  }, [isDarkMode, loading])

  const toggleTheme = async () => {
    const newThemeValue = !isDarkMode
    setIsDarkMode(newThemeValue)
    
    try {
      await setDoc(doc(db, 'settings', 'themeSettings'), { 
        isDarkMode: newThemeValue,
        updatedAt: new Date()
      }, { merge: true })
    } catch (error) {
      console.error('Error saving theme settings:', error)
    }
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext) 