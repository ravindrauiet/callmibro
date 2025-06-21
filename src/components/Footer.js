'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'

export default function Footer() {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setIsVisible(true)
      }
    }, {
      threshold: 0.2
    })
    
    const element = document.getElementById('footer-section')
    if (element) observer.observe(element)
    
    return () => {
      if (element) observer.unobserve(element)
    }
  }, [])
  
  const services = [
    { name: "Mobile Repair", url: "/services?category=mobile" },
    { name: "TV Services", url: "/services?category=tv" },
    { name: "AC Repairs", url: "/services?category=ac" },
    { name: "Refrigerator Repairs", url: "/services?category=refrigerator" }
  ]
  
  const company = [
    { name: "About Us", url: "/about" },
    { name: "Our Technicians", url: "/technicians" },
    { name: "Contact Us", url: "/contact" },
    { name: "FAQ", url: "/faq" }
  ]
  
  const support = [
    { name: "My Account", url: "/profile" },
    { name: "Track Service", url: "/orders" },
    { name: "Payment Support", url: "/payment" },
    { name: "Privacy Policy", url: "/privacy-policy" }
  ]
  
  return (
    <footer id="footer-section" className="relative pt-20 pb-10 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#111] to-black -z-10"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e60012] to-transparent opacity-30"></div>
      <div className="absolute top-0 left-1/2 w-64 h-64 bg-[#e60012]/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Main Footer Content */}
        <div 
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16 transform transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {/* Brand Section */}
          <div className="md:col-span-2 lg:col-span-1">
            <div className="flex items-center mb-6">
              <div className="mr-3 relative w-10 h-10 flex items-center justify-center">
                <span className="text-[#e60012] text-3xl font-bold absolute animate-pulse">●</span>
                <span className="text-[#e60012] text-3xl font-bold blur-sm absolute animate-pulse">●</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight">
                Call<span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e60012] to-[#ff6b6b]">Mi</span>Bro
              </h2>
            </div>
            <p className="text-gray-400 mb-8">
              India's most trusted appliance and device repair service, bringing expert technicians to your doorstep.
            </p>
            
            <div className="flex flex-col space-y-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-[#222] flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-[#e60012]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Call us 24/7</div>
                  <a href="tel:+919876543210" className="text-white hover:text-[#e60012] font-medium">+91 98765 43210</a>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-[#222] flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-[#e60012]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Email us</div>
                  <a href="mailto:support@callmibro.com" className="text-white hover:text-[#e60012] font-medium">support@callmibro.com</a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Services Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 flex items-center">
              <span className="w-6 h-0.5 bg-[#e60012] mr-3"></span>
              Our Services
            </h3>
            <ul className="space-y-3">
              {services.map((item, index) => (
                <li key={index} style={{ transitionDelay: `${index * 50}ms` }} className={`transform transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                }`}>
                  <Link 
                    href={item.url} 
                    className="text-gray-400 hover:text-white transition-colors flex items-center"
                  >
                    <svg className="w-3 h-3 text-[#e60012] mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                    </svg>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Company Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 flex items-center">
              <span className="w-6 h-0.5 bg-[#e60012] mr-3"></span>
              Company
            </h3>
            <ul className="space-y-3">
              {company.map((item, index) => (
                <li key={index} style={{ transitionDelay: `${index * 50 + 200}ms` }} className={`transform transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                }`}>
                  <Link 
                    href={item.url} 
                    className="text-gray-400 hover:text-white transition-colors flex items-center"
                  >
                    <svg className="w-3 h-3 text-[#e60012] mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                    </svg>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Support Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 flex items-center">
              <span className="w-6 h-0.5 bg-[#e60012] mr-3"></span>
              Support
            </h3>
            <ul className="space-y-3">
              {support.map((item, index) => (
                <li key={index} style={{ transitionDelay: `${index * 50 + 400}ms` }} className={`transform transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                }`}>
                  <Link 
                    href={item.url} 
                    className="text-gray-400 hover:text-white transition-colors flex items-center"
                  >
                    <svg className="w-3 h-3 text-[#e60012] mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                    </svg>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Newsletter & Social */}
        <div 
          className={`mb-16 bg-gradient-to-r from-[#111] via-black to-[#111] p-8 rounded-xl border border-[#222] transform transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="md:w-1/2">
              <h4 className="text-xl font-bold mb-2">Join Our Newsletter</h4>
              <p className="text-gray-400 text-sm mb-4 md:mb-0">
                Get the latest offers, tips and updates delivered directly to your inbox.
              </p>
            </div>
            
            <div className="w-full md:w-1/2">
              <form className="flex">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-grow bg-black border border-[#333] text-white px-4 py-3 rounded-l-lg focus:outline-none focus:border-[#e60012]"
                />
                <button 
                  type="submit"
                  className="bg-gradient-to-r from-[#e60012] to-[#ff6b6b] text-white px-6 py-3 rounded-r-lg font-medium hover:from-[#d4000e] hover:to-[#e65b5b] transition-all"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className={`border-t border-[#222] pt-8 flex flex-col md:flex-row items-center justify-between transform transition-all duration-700 delay-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} CallMiBro. All rights reserved.
          </p>
          
          <div className="flex items-center gap-6">
            {/* Social Icons */}
            <div className="flex space-x-4">
              <a href="#" className="w-8 h-8 bg-[#111] rounded-full flex items-center justify-center text-gray-400 hover:bg-[#e60012] hover:text-white transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="w-8 h-8 bg-[#111] rounded-full flex items-center justify-center text-gray-400 hover:bg-[#e60012] hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="w-8 h-8 bg-[#111] rounded-full flex items-center justify-center text-gray-400 hover:bg-[#e60012] hover:text-white transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
            
            {/* Payment Methods */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">Payments:</span>
              <div className="flex gap-2">
                <div className="w-8 h-5 bg-white/10 rounded flex items-center justify-center">
                  <svg className="h-3 w-auto" viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3Z" fill="#000" />
                    <path d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32Z" fill="#fff" />
                    <path d="M15 19h2v-2h-2v2Zm-4 0h2v-2h-2v2Zm-4 0h2v-2H7v2ZM19 9h-1.4l-2.4 8h1.4l2.4-8ZM9.5 11a1 1 0 01-1 1h-2a1 1 0 110-2h2a1 1 0 011 1Zm14.5-2h-2a1 1 0 00-1 1v1a1 1 0 001 1h1a1 1 0 011 1v1a1 1 0 01-1 1h-2a1 1 0 010-2h2v-1h-2a1 1 0 01-1-1v-1a1 1 0 011-1h2a1 1 0 010 2h-2v1h2a1 1 0 001-1v-1a1 1 0 00-1-1ZM12.3 9l-2.7 8h1.4l.6-1.4h2.8l.6 1.4h1.4l-2.7-8h-1.4Zm-.5 5.4 1-2.4 1 2.4h-2Z" fill="#142688" />
                  </svg>
                </div>
                <div className="w-8 h-5 bg-white/10 rounded flex items-center justify-center">
                  <svg className="h-3 w-auto" viewBox="0 0 24 16" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.4 0H1.6C.7 0 0 .7 0 1.6v12.8c0 .9.7 1.6 1.6 1.6h20.8c.9 0 1.6-.7 1.6-1.6V1.6c0-.9-.7-1.6-1.6-1.6Z" fill="#252525" />
                    <path d="M9.5 13.6 9 12H6l-.5 1.5H3.8L6.9 2.4h1.4l3.1 11.2H9.5Zm-3-3h2l-1-3.7L6.5 10Zm6.6-3.3c0-2 1.3-3.4 3.3-3.4 1.9 0 3.2 1.4 3.2 3.2 0 2-1.3 3.3-3.3 3.3-1.9 0-3.2-1.3-3.2-3.1Zm4.8.1c0-1.2-.5-1.8-1.6-1.8-1 0-1.5.7-1.5 1.6 0 1.2.5 1.7 1.6 1.7 1 0 1.5-.6 1.5-1.5Z" fill="#fff" />
                  </svg>
                </div>
                <div className="w-8 h-5 bg-white/10 rounded flex items-center justify-center">
                  <svg className="h-3 w-auto" viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M34.5 24h-31C1.6 24 0 22.4 0 20.5v-17C0 1.6 1.6 0 3.5 0h31C36.4 0 38 1.6 38 3.5v17c0 1.9-1.6 3.5-3.5 3.5Z" fill="#FFFFFE" />
                    <path d="M3.5 1C2.1 1 1 2.1 1 3.5v17C1 21.9 2.1 23 3.5 23h31c1.4 0 2.5-1.1 2.5-2.5v-17C37 2.1 35.9 1 34.5 1h-31Z" fill="#8E8E8E" />
                    <path d="M14.4 5h9.2v14h-9.2V5Z" fill="#FF5F00" />
                    <path d="M15 12c0-2.8 1.3-5.3 3.3-7A8.9 8.9 0 0 0 12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c2.4 0 4.6-.8 6.3-2.2-2-1.6-3.3-4.2-3.3-7Z" fill="#EB001B" />
                    <path d="M36 12c0 5.5-4.5 10-10 10-2.4 0-4.6-.8-6.3-2.2 2-1.6 3.3-4.2 3.3-7 0-2.8-1.3-5.3-3.3-7A8.9 8.9 0 0 1 26 2c5.5 0 10 4.5 10 10Z" fill="#F79E1B" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 