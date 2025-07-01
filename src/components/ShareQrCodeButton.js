import React, { useState } from 'react'

export default function ShareQrCodeButton({ url, buttonText = 'Show QR Code', className = '' }) {
  const [open, setOpen] = useState(false)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`
  return (
    <>
      <button onClick={() => setOpen(true)} className={`flex items-center px-3 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors duration-200 ${className}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h4v4H4V4zm12 0h4v4h-4V4zM4 16h4v4H4v-4zm12 0h4v4h-4v-4z" /></svg>
        {buttonText}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg relative">
            <button onClick={() => setOpen(false)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white">✕</button>
            <h2 className="text-lg font-semibold mb-4 text-center">Scan QR Code</h2>
            <img src={qrCodeUrl} alt="QR Code" className="mx-auto" />
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300 break-all">{url}</p>
          </div>
        </div>
      )}
    </>
  )
} 