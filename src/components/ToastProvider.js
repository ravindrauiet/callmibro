'use client'

import { Toaster } from 'react-hot-toast'

export default function ToastProvider() {
  return (
    <Toaster 
      position="top-center"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#222',
          color: '#fff',
          border: '1px solid #333'
        },
        success: {
          iconTheme: {
            primary: '#e60012',
            secondary: '#fff'
          }
        },
        error: {
          iconTheme: {
            primary: '#e60012',
            secondary: '#fff'
          }
        }
      }}
    />
  )
} 