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
    <div className="bg-[#111] border border-[#333] rounded-lg p-4 sm:p-8">
      <h2 className="text-2xl font-bold mb-6 text-center sm:text-left">Send Us a Message</h2>
      
      {submitSuccess ? (
        <div className="bg-green-900 text-green-100 p-4 rounded mb-6">
          Thank you for your message! We'll get back to you soon.
        </div>
      ) : null}
      
      {submitError && (
        <div className="bg-red-900 text-red-100 p-4 rounded mb-6">
          {submitError}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Name field */}
          <div>
            <label htmlFor="name" className="block text-white mb-2">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-[#222] border border-[#333] rounded px-3 py-2 text-white focus:outline-none focus:border-[#e60012]"
              required
            />
          </div>
          
          {/* Email field */}
          <div>
            <label htmlFor="email" className="block text-white mb-2">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-[#222] border border-[#333] rounded px-3 py-2 text-white focus:outline-none focus:border-[#e60012]"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Phone field */}
          <div>
            <label htmlFor="phone" className="block text-white mb-2">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full bg-[#222] border border-[#333] rounded px-3 py-2 text-white focus:outline-none focus:border-[#e60012]"
            />
          </div>
          
          {/* Subject field */}
          <div>
            <label htmlFor="subject" className="block text-white mb-2">Subject</label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full bg-[#222] border border-[#333] rounded px-3 py-2 text-white focus:outline-none focus:border-[#e60012]"
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
          <label htmlFor="message" className="block text-white mb-2">Message</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="5"
            className="w-full bg-[#222] border border-[#333] rounded px-3 py-2 text-white focus:outline-none focus:border-[#e60012]"
            required
          ></textarea>
        </div>
        
        <button
          type="submit"
          className={`w-full bg-[#e60012] text-white py-3 rounded hover:bg-[#b3000f] transition-colors flex items-center justify-center ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
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
            'Send Message'
          )}
        </button>
      </form>
    </div>
  )
} 