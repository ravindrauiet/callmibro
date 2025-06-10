'use client'

import { useState } from 'react'
import Modal from './Modal'

export default function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // In a real app, you would handle authentication here
    if (isLogin) {
      console.log('Login:', { email: formData.email, password: formData.password })
      alert('Login functionality would be implemented here')
    } else {
      console.log('Signup:', formData)
      alert('Signup functionality would be implemented here')
    }
    
    // Close the modal after form submission
    onClose()
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    // Reset form data when switching modes
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    })
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isLogin ? 'Login' : 'Sign Up'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name field (only for signup) */}
        {!isLogin && (
          <div>
            <label htmlFor="name" className="block text-white text-sm font-medium mb-1.5">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-[#222] border border-[#333] rounded px-3 py-2 text-white focus:outline-none focus:border-[#e60012] text-sm sm:text-base"
              required
            />
          </div>
        )}
        
        {/* Email field */}
        <div>
          <label htmlFor="email" className="block text-white text-sm font-medium mb-1.5">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-[#222] border border-[#333] rounded px-3 py-2 text-white focus:outline-none focus:border-[#e60012] text-sm sm:text-base"
            required
          />
        </div>
        
        {/* Password field */}
        <div>
          <label htmlFor="password" className="block text-white text-sm font-medium mb-1.5">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full bg-[#222] border border-[#333] rounded px-3 py-2 text-white focus:outline-none focus:border-[#e60012] text-sm sm:text-base"
            required
          />
        </div>
        
        {/* Confirm Password field (only for signup) */}
        {!isLogin && (
          <div>
            <label htmlFor="confirmPassword" className="block text-white text-sm font-medium mb-1.5">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full bg-[#222] border border-[#333] rounded px-3 py-2 text-white focus:outline-none focus:border-[#e60012] text-sm sm:text-base"
              required
            />
          </div>
        )}
        
        {/* Submit button */}
        <button
          type="submit"
          className="w-full bg-[#e60012] text-white py-2 rounded hover:bg-[#b3000f] transition-colors mt-2 text-sm sm:text-base"
        >
          {isLogin ? 'Login' : 'Sign Up'}
        </button>
        
        {/* Toggle between login and signup */}
        <div className="text-center mt-4 text-gray-400 text-sm">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={switchMode}
            className="text-[#e60012] hover:underline focus:outline-none"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </div>
        
        {/* Social login options */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#333]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#111] text-gray-400 text-xs sm:text-sm">Or continue with</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              type="button"
              className="bg-[#222] hover:bg-[#333] text-white py-2 px-3 sm:px-4 rounded border border-[#333] transition-colors flex items-center justify-center text-xs sm:text-sm"
              onClick={() => alert('Google login would be implemented here')}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
              </svg>
              Google
            </button>
            <button
              type="button"
              className="bg-[#222] hover:bg-[#333] text-white py-2 px-3 sm:px-4 rounded border border-[#333] transition-colors flex items-center justify-center text-xs sm:text-sm"
              onClick={() => alert('Facebook login would be implemented here')}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z"/>
              </svg>
              Facebook
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
} 