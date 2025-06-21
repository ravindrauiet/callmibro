'use client'

import { useState } from 'react'
import { db } from '@/firebase/config'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'

export default function ContactForm() {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError('')
    
    try {
      // Validate form data
      if (!formData.name || !formData.email || !formData.subject || !formData.message) {
        throw new Error('Please fill in all required fields');
      }
      
      // Add to Firestore
      await addDoc(collection(db, 'contactMessages'), {
        ...formData,
        userId: currentUser ? currentUser.uid : 'guest',
        createdAt: serverTimestamp()
      });
      
      // Show success message
      setSubmitSuccess(true)
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        })
        setSubmitSuccess(false)
      }, 3000)
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-[#111] border border-[#333] rounded-xl p-6 sm:p-8 shadow-lg hover:shadow-[#e60012]/10 transition-shadow">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Send Us a Message</h2>
        <p className="text-gray-400 text-sm">Fill out the form below and we'll get back to you shortly</p>
      </div>
      
      {submitSuccess ? (
        <div className="bg-gradient-to-r from-green-900 to-green-800 text-green-100 p-4 rounded-lg mb-6 border border-green-700 flex items-center">
          <svg className="w-5 h-5 mr-2 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span>Thank you for your message! We'll get back to you soon.</span>
        </div>
      ) : null}
      
      {submitError && (
        <div className="bg-gradient-to-r from-red-900 to-red-800 text-red-100 p-4 rounded-lg mb-6 border border-red-700 flex items-center">
          <svg className="w-5 h-5 mr-2 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>{submitError}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
          {/* Name field */}
          <div>
            <label htmlFor="name" className="block text-white text-sm font-medium mb-2">Full Name <span className="text-[#e60012]">*</span></label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-[#222] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#e60012] focus:ring-1 focus:ring-[#e60012] transition-colors"
              required
            />
          </div>
          
          {/* Email field */}
          <div>
            <label htmlFor="email" className="block text-white text-sm font-medium mb-2">Email <span className="text-[#e60012]">*</span></label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-[#222] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#e60012] focus:ring-1 focus:ring-[#e60012] transition-colors"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
          {/* Phone field */}
          <div>
            <label htmlFor="phone" className="block text-white text-sm font-medium mb-2">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full bg-[#222] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#e60012] focus:ring-1 focus:ring-[#e60012] transition-colors"
            />
          </div>
          
          {/* Subject field */}
          <div>
            <label htmlFor="subject" className="block text-white text-sm font-medium mb-2">Subject <span className="text-[#e60012]">*</span></label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full bg-[#222] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#e60012] focus:ring-1 focus:ring-[#e60012] transition-colors appearance-none cursor-pointer"
              required
            >
              <option value="">Select a subject</option>
              <option value="general">General Inquiry</option>
              <option value="support">Technical Support</option>
              <option value="billing">Billing Issue</option>
              <option value="feedback">Feedback</option>
            </select>
          </div>
        </div>
        
        {/* Message field */}
        <div className="mb-6">
          <label htmlFor="message" className="block text-white text-sm font-medium mb-2">Message <span className="text-[#e60012]">*</span></label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="5"
            className="w-full bg-[#222] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#e60012] focus:ring-1 focus:ring-[#e60012] transition-colors"
            required
          ></textarea>
        </div>
        
        <button
          type="submit"
          className={`w-full bg-gradient-to-r from-[#e60012] to-[#ff6b6b] text-white py-3 rounded-lg hover:shadow-lg hover:shadow-[#e60012]/20 transition-all flex items-center justify-center ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            </>
          ) : (
            <>
              Send Message
              <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>
      </form>
    </div>
  )
} 