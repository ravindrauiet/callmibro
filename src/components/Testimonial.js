'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function Testimonial() {
  const testimonials = [
    {
      id: 1,
      name: "Jane Doe",
      location: "Mumbai",
      text: "Excellent service! The technician arrived on time and fixed my phone screen in 30 minutes. Very professional and affordable.",
      image: "/icons/certified.svg"
    },
    {
      id: 2,
      name: "Rahul Sharma",
      location: "Delhi",
      text: "My AC wasn't cooling properly and the CallMiBro technician diagnosed and fixed the issue quickly. Great service and reasonable pricing!",
      image: "/icons/ontime.svg"
    },
    {
      id: 3,
      name: "Priya Patel",
      location: "Bangalore",
      text: "I needed a refrigerator repair and was impressed by how quickly they responded. The technician was knowledgeable and fixed the compressor issue efficiently.",
      image: "/icons/pricing.svg"
    }
  ]
  
  const [activeIndex, setActiveIndex] = useState(0)

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [testimonials.length])

  return (
    <section className="bg-[#1a1a1a] py-10 sm:py-16 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl text-center mb-6 sm:mb-12 font-bold">What Our Customers Say</h2>
        
        <div className="relative">
          {/* Testimonial Display */}
          <div className="bg-[#111] border border-[#333] rounded-lg p-6 sm:p-8 flex flex-col md:flex-row gap-6 md:items-center">
            <div className="w-full md:w-1/4 flex justify-center">
              <div className="w-24 h-24 rounded-full bg-[#222] relative flex items-center justify-center">
                <Image 
                  src={testimonials[activeIndex].image} 
                  alt={testimonials[activeIndex].name}
                  width={48}
                  height={48}
                />
              </div>
            </div>
            <div className="w-full md:w-3/4">
              <div className="text-[#e60012] mb-2 text-2xl">"</div>
              <p className="text-base sm:text-lg mb-4 italic">
                {testimonials[activeIndex].text}
              </p>
              <div className="flex items-center space-x-2">
                <div className="text-[#e60012] text-sm sm:text-base font-medium">
                  {testimonials[activeIndex].name}
                </div>
                <div className="h-4 w-0.5 bg-[#333]"></div>
                <div className="text-gray-400 text-sm">
                  {testimonials[activeIndex].location}
                </div>
              </div>
            </div>
          </div>
          
          {/* Indicator Dots */}
          <div className="flex justify-center space-x-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${index === activeIndex ? 'bg-[#e60012]' : 'bg-[#333]'}`}
                aria-label={`View testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
} 