'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

export default function Testimonial() {
  const [isVisible, setIsVisible] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [animating, setAnimating] = useState(false)
  const intervalRef = useRef(null)
  
  // Enhanced testimonials with ratings, profile images, and service types
  const testimonials = [
    {
      id: 1,
      name: "Jane Doe",
      location: "Mumbai",
      text: "Excellent service! The technician arrived on time and fixed my phone screen in just 30 minutes. The quality of repair is outstanding and my phone looks brand new.",
      image: "/icons/certified.svg",
      rating: 5,
      serviceName: "iPhone Screen Repair",
      color: "from-[#ff4b4b] to-[#ff7676]"
    },
    {
      id: 2,
      name: "Rahul Sharma",
      location: "Delhi",
      text: "My AC wasn't cooling properly and the CallMiBro technician diagnosed and fixed the issue quickly. The service was very professional and the pricing was reasonable.",
      image: "/icons/ontime.svg",
      rating: 4.8,
      serviceName: "AC Repair Service", 
      color: "from-[#3366ff] to-[#5c8aff]"
    },
    {
      id: 3,
      name: "Priya Patel",
      location: "Bangalore",
      text: "I needed an urgent refrigerator repair and was impressed by how quickly they responded. The technician was knowledgeable and fixed the compressor issue efficiently.",
      image: "/icons/pricing.svg",
      rating: 5,
      serviceName: "Refrigerator Repair",
      color: "from-[#00ccb8] to-[#39e5d5]"
    }
  ]
  
  const nextTestimonial = () => {
    if (animating) return
    
    setAnimating(true)
    setActiveIndex((current) => (current + 1) % testimonials.length)
    
    setTimeout(() => {
      setAnimating(false)
    }, 500)
  }
  
  const prevTestimonial = () => {
    if (animating) return
    
    setAnimating(true)
    setActiveIndex((current) => (current - 1 + testimonials.length) % testimonials.length)
    
    setTimeout(() => {
      setAnimating(false)
    }, 500)
  }
  
  // Intersection Observer to detect when section is visible
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setIsVisible(true)
      }
    }, {
      threshold: 0.2
    })
    
    const element = document.getElementById('testimonials-section')
    if (element) observer.observe(element)
    
    return () => {
      if (element) observer.unobserve(element)
    }
  }, [])

  // Auto-rotate testimonials
  useEffect(() => {
    if (isVisible) {
      intervalRef.current = setInterval(() => {
        nextTestimonial()
      }, 5000)
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isVisible, testimonials.length, animating])
  
  // Render star rating
  const renderRating = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={`star-${i}`} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"></path>
        </svg>
      )
    }
    
    if (hasHalfStar) {
      stars.push(
        <svg key="half-star" className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="halfStarGradient">
              <stop offset="50%" stopColor="#FBBF24" />
              <stop offset="50%" stopColor="#4B5563" />
            </linearGradient>
          </defs>
          <path fill="url(#halfStarGradient)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"></path>
        </svg>
      )
    }
    
    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-star-${i}`} className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"></path>
        </svg>
      )
    }
    
    return stars
  }
  
  return (
    <section id="testimonials-section" className="py-20 sm:py-28 px-4 sm:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-black to-[#111] -z-10"></div>
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#e60012]/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-[#e60012]/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Section Heading */}
        <div 
          className={`mb-16 text-center transform transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="inline-block bg-[#111] px-4 py-1 rounded-full mb-4 border border-[#333]">
            <span className="text-[#e60012] text-sm font-medium">Testimonials</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            What Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e60012] to-[#ff6b6b]">Customers Say</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Don't just take our word for it — hear from our satisfied customers across India
          </p>
        </div>
        
        {/* Testimonial Cards */}
        <div 
          className={`relative transform transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {/* Main Testimonial Card */}
          <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden shadow-xl transition-all">
            <div className="relative">
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-r ${testimonials[activeIndex].color} opacity-10`}></div>
              
              {/* Content */}
              <div className="relative p-8 md:p-10">
                <div className="md:flex items-center gap-8">
                  {/* Profile Section */}
                  <div className="mb-8 md:mb-0 flex flex-col items-center md:items-start">
                    <div className={`w-20 h-20 rounded-full bg-gradient-to-r ${testimonials[activeIndex].color} p-1 mb-4`}>
                      <div className="bg-black rounded-full w-full h-full flex items-center justify-center overflow-hidden">
                        <Image 
                          src={testimonials[activeIndex].image} 
                          alt={testimonials[activeIndex].name}
                          width={40}
                          height={40}
                          className="brightness-150"
                        />
                      </div>
                    </div>
                    <h4 className="text-xl font-bold">{testimonials[activeIndex].name}</h4>
                    <p className="text-gray-400 text-sm">{testimonials[activeIndex].location}</p>
                    
                    <div className="flex mt-3">
                      {renderRating(testimonials[activeIndex].rating)}
                    </div>
                  </div>
                  
                  {/* Quote Section */}
                  <div className="flex-1">
                    <div className={`w-12 h-12 mb-4 rounded-full bg-gradient-to-r ${testimonials[activeIndex].color} flex items-center justify-center text-white text-2xl font-serif`}>
                      "
                    </div>
                    
                    <div 
                      className={`text-lg italic mb-6 transition-all duration-300 ${animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
                    >
                      {testimonials[activeIndex].text}
                    </div>
                    
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#222] text-sm">
                      <span className={`inline-block w-2 h-2 rounded-full bg-gradient-to-r ${testimonials[activeIndex].color} mr-2`}></span>
                      {testimonials[activeIndex].serviceName}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Navigation Controls */}
          <div className="flex justify-between mt-8">
            <div className="flex items-center gap-4">
              {/* Indicator Dots */}
              <div className="hidden sm:flex items-center space-x-3">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`transition-all ${index === activeIndex ? 'w-8 h-2 bg-[#e60012]' : 'w-2 h-2 bg-[#444]'} rounded-full`}
                    aria-label={`View testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={prevTestimonial}
                className="w-10 h-10 rounded-full border border-[#333] flex items-center justify-center text-gray-400 hover:border-[#e60012] hover:text-[#e60012] transition-colors"
                aria-label="Previous testimonial"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button 
                onClick={nextTestimonial}
                className="w-10 h-10 rounded-full border border-[#333] flex items-center justify-center text-gray-400 hover:border-[#e60012] hover:text-[#e60012] transition-colors"
                aria-label="Next testimonial"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 