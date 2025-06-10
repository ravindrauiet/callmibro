'use client'

import { useState } from 'react'

export default function ModelSelection({ service, brand, onModelSelect }) {
  // Mock data for models based on brand and service type
  const getModels = () => {
    if (brand.id === 'apple' && service === 'Mobile Screen Repair') {
      return [
        { id: 'iphone-15-pro', name: 'iPhone 15 Pro', price: '₹6,500' },
        { id: 'iphone-15', name: 'iPhone 15', price: '₹5,900' },
        { id: 'iphone-14-pro', name: 'iPhone 14 Pro', price: '₹5,500' },
        { id: 'iphone-14', name: 'iPhone 14', price: '₹5,200' },
        { id: 'iphone-13', name: 'iPhone 13', price: '₹4,800' },
        { id: 'iphone-12', name: 'iPhone 12', price: '₹4,500' },
        { id: 'iphone-11', name: 'iPhone 11', price: '₹4,000' },
        { id: 'iphone-se', name: 'iPhone SE', price: '₹3,500' }
      ];
    } else if (brand.id === 'samsung' && service === 'Mobile Screen Repair') {
      return [
        { id: 'galaxy-s24-ultra', name: 'Galaxy S24 Ultra', price: '₹6,200' },
        { id: 'galaxy-s24-plus', name: 'Galaxy S24+', price: '₹5,800' },
        { id: 'galaxy-s24', name: 'Galaxy S24', price: '₹5,500' },
        { id: 'galaxy-s23', name: 'Galaxy S23', price: '₹5,000' },
        { id: 'galaxy-a54', name: 'Galaxy A54', price: '₹4,200' },
        { id: 'galaxy-a34', name: 'Galaxy A34', price: '₹3,800' }
      ];
    } else if (brand.id === 'lg' && service === 'TV Diagnostics') {
      return [
        { id: 'lg-oled-c4', name: 'LG OLED C4', price: '₹2,500' },
        { id: 'lg-oled-g4', name: 'LG OLED G4', price: '₹2,800' },
        { id: 'lg-nanocell', name: 'LG NanoCell', price: '₹2,000' },
        { id: 'lg-uhd', name: 'LG UHD TV', price: '₹1,800' }
      ];
    } else if (brand.id === 'daikin' && service === 'AC Gas Refill') {
      return [
        { id: 'daikin-1-ton', name: '1 Ton Split AC', price: '₹1,800' },
        { id: 'daikin-1.5-ton', name: '1.5 Ton Split AC', price: '₹2,200' },
        { id: 'daikin-2-ton', name: '2 Ton Split AC', price: '₹2,500' },
        { id: 'daikin-cassette', name: 'Cassette AC', price: '₹3,000' }
      ];
    } else if (brand.id === 'jbl' && service === 'Speaker Repair') {
      return [
        { id: 'jbl-flip-6', name: 'JBL Flip 6', price: '₹1,200' },
        { id: 'jbl-charge-5', name: 'JBL Charge 5', price: '₹1,500' },
        { id: 'jbl-xtreme-3', name: 'JBL Xtreme 3', price: '₹2,000' },
        { id: 'jbl-partybox-110', name: 'JBL PartyBox 110', price: '₹2,500' },
        { id: 'jbl-boombox-3', name: 'JBL Boombox 3', price: '₹2,800' }
      ];
    } else if (brand.id === 'sony' && service === 'Speaker Repair') {
      return [
        { id: 'sony-srs-xb43', name: 'Sony SRS-XB43', price: '₹1,300' },
        { id: 'sony-srs-xb33', name: 'Sony SRS-XB33', price: '₹1,100' },
        { id: 'sony-srs-xb23', name: 'Sony SRS-XB23', price: '₹900' },
        { id: 'sony-srs-xg500', name: 'Sony SRS-XG500', price: '₹2,200' },
        { id: 'sony-srs-xv900', name: 'Sony SRS-XV900', price: '₹2,600' }
      ];
    } else if (brand.id === 'bose' && service === 'Speaker Repair') {
      return [
        { id: 'bose-soundlink-flex', name: 'Bose SoundLink Flex', price: '₹1,400' },
        { id: 'bose-soundlink-revolve', name: 'Bose SoundLink Revolve', price: '₹1,600' },
        { id: 'bose-soundlink-revolve-plus', name: 'Bose SoundLink Revolve+', price: '₹1,800' },
        { id: 'bose-portable-home', name: 'Bose Portable Home Speaker', price: '₹2,300' },
        { id: 'bose-soundlink-mini', name: 'Bose SoundLink Mini II', price: '₹1,200' }
      ];
    } else if (brand.id === 'marshall' && service === 'Speaker Repair') {
      return [
        { id: 'marshall-emberton', name: 'Marshall Emberton', price: '₹1,300' },
        { id: 'marshall-kilburn', name: 'Marshall Kilburn II', price: '₹1,800' },
        { id: 'marshall-stockwell', name: 'Marshall Stockwell II', price: '₹1,500' },
        { id: 'marshall-tufton', name: 'Marshall Tufton', price: '₹2,200' },
        { id: 'marshall-woburn', name: 'Marshall Woburn III', price: '₹2,500' }
      ];
    } else {
      // Generic models for other brands/services
      return [
        { id: 'model-premium', name: 'Premium Model', price: '₹5,500' },
        { id: 'model-standard', name: 'Standard Model', price: '₹4,500' },
        { id: 'model-basic', name: 'Basic Model', price: '₹3,500' }
      ];
    }
  };

  const models = getModels();

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Select Model</h2>
      <p className="text-gray-400 mb-6">Selected Brand: {brand.name}</p>
      
      <div className="space-y-4">
        {models.map((model) => (
          <div 
            key={model.id}
            className="bg-[#111] border border-[#222] rounded-lg p-4 hover:border-[#e60012] transition-colors cursor-pointer"
            onClick={() => onModelSelect(model)}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">{model.name}</h3>
                <p className="text-sm text-gray-400">Service Price: {model.price}</p>
              </div>
              <div className="text-[#e60012]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 