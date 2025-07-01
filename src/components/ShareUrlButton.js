import React from 'react'
import { toast } from 'react-hot-toast'

export default function ShareUrlButton({ url, buttonText = 'Copy Link', className = '' }) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard!')
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      toast.success('Link copied to clipboard!')
    }
  }
  return (
    <button onClick={handleCopy} className={`flex items-center px-3 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors duration-200 ${className}`}>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16h8M8 12h8m-7 8h6a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v7a2 2 0 002 2z" /></svg>
      {buttonText}
    </button>
  )
} 