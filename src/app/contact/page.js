'use client';

import { useState, useEffect } from 'react';
import { db } from '@/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import ContactForm from '../../components/ContactForm'
import ContactInfo from '../../components/ContactInfo'

export default function ContactPage() {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">
      <Header activePage="contact" />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-black to-[#111] py-12 md:py-16 px-4 md:px-8 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-[#e60012]/10 blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-60 h-60 rounded-full bg-[#e60012]/10 blur-3xl"></div>
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className={`text-center transform transition-all duration-700 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <div className="inline-block bg-[#111] px-4 py-1 rounded-full mb-4 border border-[#333]">
              <span className="text-[#e60012] text-sm font-medium">Get In Touch</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Contact <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e60012] to-[#ff6b6b]">Our Team</span>
            </h1>
            
            <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto">
              Have questions or need assistance? Our customer support team is here to help with all your repair service needs
            </p>
          </div>
        </div>
      </section>
      
      {/* Contact Section */}
      <section className="py-12 md:py-16 px-4 md:px-8 bg-[#111]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <ContactInfo />
            <ContactForm />
          </div>
        </div>
      </section>
      
      {/* Map Section */}
      <section className="py-12 md:py-16 px-4 md:px-8 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e60012] to-[#ff6b6b]">Location</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Visit our office in Faridabad, Haryana for in-person assistance
            </p>
          </div>
          
          <div className="h-[400px] rounded-xl overflow-hidden border border-[#333]">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d112173.30646932511!2d77.2139621!3d28.4120348!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cdc15f5a424b1%3A0xe4f50576c850e0f2!2sFaridabad%2C%20Haryana!5e0!3m2!1sen!2sin!4v1654321234567!5m2!1sen!2sin" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="CallMiBro Office Location"
            ></iframe>
          </div>
        </div>
      </section>
      
      <Footer />
    </main>
  )
} 