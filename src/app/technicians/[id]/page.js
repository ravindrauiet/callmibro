'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { db } from '@/firebase/config';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { FiStar, FiCheck, FiClock, FiPhone, FiMapPin, FiThumbsUp } from 'react-icons/fi';

// Fallback technician data in case Firebase fails
const fallbackTechnician = {
  id: 'tech-001',
  name: 'Jane Smith',
  role: 'Phone Specialist',
  rating: 4.8,
  reviewCount: 156,
  imageUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
  bio: 'Jane is a certified phone repair specialist with over 8 years of experience working with all major brands. She specializes in screen replacements, battery upgrades, and water damage recovery.',
  skills: [
    'Screen Repair & Replacement',
    'Battery Replacement',
    'Water Damage Recovery',
    'Data Recovery',
    'Software Troubleshooting',
    'Component-level Repair'
  ],
  services: [
    {
      id: 'svc-001',
      name: 'iPhone Screen Repair',
      price: 2499,
      icon: '📱'
    },
    {
      id: 'svc-002',
      name: 'Battery Replacement',
      price: 1299,
      icon: '🔋'
    },
    {
      id: 'svc-003',
      name: 'Water Damage Repair',
      price: 3499,
      icon: '💧'
    },
    {
      id: 'svc-004',
      name: 'Charging Port Repair',
      price: 1999,
      icon: '🔌'
    }
  ],
  availability: 'Available today',
  badges: ['Top Performer', 'Certified Expert', 'Fast Response'],
  languages: ['English', 'Hindi']
};

export default function TechnicianProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [technician, setTechnician] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingBanner, setShowBookingBanner] = useState(false);

  // Fetch technician data from Firebase
  useEffect(() => {
    async function fetchTechnician() {
      try {
        setLoading(true);
        
        if (!params.id) {
          throw new Error('Technician ID is required');
        }
        
        // Get technician document from Firestore
        const technicianDoc = await getDoc(doc(db, 'technicians', params.id));
        
        if (!technicianDoc.exists()) {
          // Use fallback data if technician not found
          console.log('Technician not found, using fallback data');
          setTechnician(fallbackTechnician);
        } else {
          // Get technician data from document
          const technicianData = {
            id: technicianDoc.id,
            ...technicianDoc.data()
          };
          
          // Get technician services from Firestore
          const servicesQuery = query(
            collection(db, 'services'),
            where('technicianId', '==', params.id)
          );
          const servicesSnapshot = await getDocs(servicesQuery);
          
          if (!servicesSnapshot.empty) {
            const services = servicesSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            technicianData.services = services;
          }
          
          setTechnician(technicianData);
        }
      } catch (error) {
        console.error('Error fetching technician:', error);
        setError(error.message);
        // Use fallback data on error
        setTechnician(fallbackTechnician);
      } finally {
        setLoading(false);
      }
    }

    fetchTechnician();
  }, [params.id]);

  // Handle scroll for booking banner
  useEffect(() => {
    const handleScroll = () => {
      // Show booking banner when scrolled past a certain point
      if (window.scrollY > 300) {
        setShowBookingBanner(true);
      } else {
        setShowBookingBanner(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBookNow = (serviceId) => {
    // Navigate to booking page with technician and service pre-selected
    router.push(`/services/booking?technicianId=${params.id}&serviceId=${serviceId || ''}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <p className="mb-4">Loading technician profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Error Loading Profile</h2>
          <p className="text-gray-400">{error}</p>
          <button 
            onClick={() => router.push('/technicians')}
            className="mt-6 bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-md transition-colors"
          >
            Back to Technicians
          </button>
        </div>
      </div>
    );
  }

  if (!technician) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Technician Not Found</h2>
          <p className="text-gray-400">The technician you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => router.push('/technicians')}
            className="mt-6 bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-md transition-colors"
          >
            Back to Technicians
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="bg-[#1a1a1a] py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
            {/* Technician Image */}
            <div className="relative">
              <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-red-600">
                <Image 
                  src={technician.imageUrl || '/images/default-technician.jpg'} 
                  alt={technician.name}
                  width={192}
                  height={192}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                {technician.availability || 'Available'}
              </div>
            </div>
            
            {/* Technician Basic Info */}
            <div className="text-center lg:text-left">
              <h1 className="text-3xl lg:text-4xl font-bold">{technician.name}</h1>
              <p className="text-gray-400 text-xl mt-2">{technician.role}</p>
              
              {/* Rating */}
              <div className="flex items-center mt-4 justify-center lg:justify-start">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <FiStar 
                      key={i} 
                      className={`w-5 h-5 ${i < Math.floor(technician.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-500'}`} 
                    />
                  ))}
                </div>
                <span className="ml-2 text-red-500 font-semibold">{technician.rating}</span>
                <span className="ml-2 text-gray-400">({technician.reviewCount} reviews)</span>
              </div>
              
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mt-4 justify-center lg:justify-start">
                {technician.badges && technician.badges.map((badge, index) => (
                  <span key={index} className="bg-[#222] text-white text-xs px-3 py-1 rounded-full border border-[#444]">
                    {badge}
                  </span>
                ))}
              </div>
              
              {/* Languages */}
              {technician.languages && (
                <div className="mt-4 text-gray-400">
                  <span className="mr-2">Languages:</span>
                  {technician.languages.join(', ')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bio & Skills Section */}
      <div className="container mx-auto px-4 py-10">
        <div className="bg-[#1a1a1a] rounded-lg p-6 lg:p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Bio */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">About {technician.name.split(' ')[0]}</h2>
              <p className="text-gray-300">{technician.bio}</p>
            </div>
            
            {/* Skills */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Skills & Expertise</h2>
              <ul className="space-y-3">
                {technician.skills && technician.skills.map((skill, index) => (
                  <li key={index} className="flex items-start">
                    <FiCheck className="mt-1 mr-3 text-red-500" />
                    <span className="text-gray-300">{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Services Offered</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {technician.services && technician.services.map((service) => (
              <div 
                key={service.id} 
                className="bg-[#111] border border-[#333] rounded-lg p-5 hover:border-red-500 transition-colors cursor-pointer"
                onClick={() => handleBookNow(service.id)}
              >
                <div className="text-3xl mb-3">{service.icon || '🛠️'}</div>
                <h3 className="text-lg font-medium mb-2">{service.name}</h3>
                <p className="text-red-500 font-semibold">₹{service.price}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Booking CTA */}
      <div 
        className={`fixed bottom-0 left-0 right-0 bg-red-600 text-white py-4 px-4 transition-all duration-300 ${
          showBookingBanner ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between">
          <div>
            <p className="font-semibold">Book {technician.name} now</p>
            <p className="text-sm">Starting from ₹{Math.min(...technician.services.map(s => s.price))}</p>
          </div>
          <button 
            onClick={() => handleBookNow()}
            className="mt-3 sm:mt-0 bg-white text-red-600 hover:bg-gray-100 py-2 px-6 rounded-md font-semibold transition-colors"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
} 