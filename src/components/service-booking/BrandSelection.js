'use client'

import { useState } from 'react'

export default function BrandSelection({ service, onBrandSelect }) {
  // Comprehensive brands based on the service type
  const getBrands = () => {
    // Normalize service name for comparison
    const normalizeServiceName = (name) => {
      return name.toLowerCase().replace(/[-\s]/g, '');
    };
    
    const normalizedService = normalizeServiceName(service);
    
    switch(normalizedService) {
      case 'mobilescreenrepair':
        return [
          { id: 'apple', name: 'Apple' },
          { id: 'samsung', name: 'Samsung' },
          { id: 'xiaomi', name: 'Xiaomi' },
          { id: 'oneplus', name: 'OnePlus' },
          { id: 'google', name: 'Google' },
          { id: 'vivo', name: 'Vivo' },
          { id: 'oppo', name: 'OPPO' },
          { id: 'realme', name: 'Realme' },
          { id: 'motorola', name: 'Motorola' },
          { id: 'nokia', name: 'Nokia' },
          { id: 'asus', name: 'ASUS' },
          { id: 'huawei', name: 'Huawei' },
          { id: 'honor', name: 'Honor' },
          { id: 'iqoo', name: 'iQOO' },
          { id: 'tecno', name: 'TECNO' },
          { id: 'infinix', name: 'Infinix' },
          { id: 'poco', name: 'POCO' },
          { id: 'lava', name: 'Lava' },
          { id: 'micromax', name: 'Micromax' },
          { id: 'blackberry', name: 'BlackBerry' },
          { id: 'htc', name: 'HTC' },
          { id: 'lenovo', name: 'Lenovo' },
          { id: 'sony', name: 'Sony' },
          { id: 'lg', name: 'LG' }
        ];
      case 'tvdiagnostics':
        return [
          { id: 'samsung', name: 'Samsung' },
          { id: 'lg', name: 'LG' },
          { id: 'sony', name: 'Sony' },
          { id: 'panasonic', name: 'Panasonic' },
          { id: 'tcl', name: 'TCL' },
          { id: 'xiaomi', name: 'Xiaomi' },
          { id: 'hisense', name: 'Hisense' },
          { id: 'vu', name: 'Vu' },
          { id: 'onida', name: 'Onida' },
          { id: 'philips', name: 'Philips' },
          { id: 'toshiba', name: 'Toshiba' },
          { id: 'videocon', name: 'Videocon' },
          { id: 'haier', name: 'Haier' },
          { id: 'thomson', name: 'Thomson' },
          { id: 'bpl', name: 'BPL' },
          { id: 'sansui', name: 'Sansui' },
          { id: 'micromax', name: 'Micromax' },
          { id: 'akai', name: 'Akai' },
          { id: 'sharp', name: 'Sharp' },
          { id: 'jvc', name: 'JVC' },
          { id: 'kodak', name: 'Kodak' },
          { id: 'inalsa', name: 'Inalsa' },
          { id: 'hitachi', name: 'Hitachi' },
          { id: 'nokia', name: 'Nokia' }
        ];
      case 'acgasrefill':
        return [
          { id: 'daikin', name: 'Daikin' },
          { id: 'hitachi', name: 'Hitachi' },
          { id: 'lg', name: 'LG' },
          { id: 'carrier', name: 'Carrier' },
          { id: 'samsung', name: 'Samsung' },
          { id: 'voltas', name: 'Voltas' },
          { id: 'bluestar', name: 'Blue Star' },
          { id: 'mitsubishi', name: 'Mitsubishi' },
          { id: 'whirlpool', name: 'Whirlpool' },
          { id: 'haier', name: 'Haier' },
          { id: 'panasonic', name: 'Panasonic' },
          { id: 'godrej', name: 'Godrej' },
          { id: 'ogeneral', name: 'O General' },
          { id: 'lloyd', name: 'Lloyd' },
          { id: 'onida', name: 'Onida' },
          { id: 'toshiba', name: 'Toshiba' },
          { id: 'sharp', name: 'Sharp' },
          { id: 'midea', name: 'Midea' },
          { id: 'sanyo', name: 'Sanyo' },
          { id: 'kenstar', name: 'Kenstar' },
          { id: 'videocon', name: 'Videocon' },
          { id: 'trane', name: 'Trane' },
          { id: 'york', name: 'York' },
          { id: 'fujitsu', name: 'Fujitsu' }
        ];
      case 'batteryreplacement':
        return [
          { id: 'apple', name: 'Apple' },
          { id: 'samsung', name: 'Samsung' },
          { id: 'xiaomi', name: 'Xiaomi' },
          { id: 'oneplus', name: 'OnePlus' },
          { id: 'vivo', name: 'Vivo' },
          { id: 'oppo', name: 'OPPO' },
          { id: 'realme', name: 'Realme' },
          { id: 'google', name: 'Google' },
          { id: 'motorola', name: 'Motorola' },
          { id: 'nokia', name: 'Nokia' },
          { id: 'huawei', name: 'Huawei' },
          { id: 'honor', name: 'Honor' },
          { id: 'asus', name: 'ASUS' },
          { id: 'lenovo', name: 'Lenovo' },
          { id: 'sony', name: 'Sony' },
          { id: 'lg', name: 'LG' },
          { id: 'micromax', name: 'Micromax' },
          { id: 'lava', name: 'Lava' },
          { id: 'poco', name: 'POCO' },
          { id: 'iqoo', name: 'iQOO' },
          { id: 'blackberry', name: 'BlackBerry' },
          { id: 'htc', name: 'HTC' },
          { id: 'gionee', name: 'Gionee' },
          { id: 'tecno', name: 'TECNO' }
        ];
      case 'speakerrepair':
        return [
          { id: 'bose', name: 'Bose' },
          { id: 'sony', name: 'Sony' },
          { id: 'jbl', name: 'JBL' },
          { id: 'marshall', name: 'Marshall' },
          { id: 'harmankardon', name: 'Harman Kardon' },
          { id: 'boat', name: 'boAt' },
          { id: 'ultimate', name: 'Ultimate Ears' },
          { id: 'anker', name: 'Anker' },
          { id: 'sonos', name: 'Sonos' },
          { id: 'bowers', name: 'Bowers & Wilkins' },
          { id: 'bang', name: 'Bang & Olufsen' },
          { id: 'yamaha', name: 'Yamaha' },
          { id: 'klipsch', name: 'Klipsch' },
          { id: 'denon', name: 'Denon' },
          { id: 'philips', name: 'Philips' },
          { id: 'pioneer', name: 'Pioneer' },
          { id: 'creative', name: 'Creative' },
          { id: 'polk', name: 'Polk Audio' },
          { id: 'edifier', name: 'Edifier' },
          { id: 'saregama', name: 'Saregama' },
          { id: 'zebronics', name: 'Zebronics' },
          { id: 'portronics', name: 'Portronics' },
          { id: 'jvc', name: 'JVC' },
          { id: 'logitech', name: 'Logitech' }
        ];
      case 'laptoprepair':
        return [
          { id: 'apple', name: 'Apple' },
          { id: 'dell', name: 'Dell' },
          { id: 'hp', name: 'HP' },
          { id: 'lenovo', name: 'Lenovo' },
          { id: 'asus', name: 'ASUS' },
          { id: 'acer', name: 'Acer' },
          { id: 'microsoft', name: 'Microsoft' },
          { id: 'msi', name: 'MSI' },
          { id: 'samsung', name: 'Samsung' },
          { id: 'lg', name: 'LG' },
          { id: 'razer', name: 'Razer' },
          { id: 'toshiba', name: 'Toshiba' },
          { id: 'sony', name: 'Sony' },
          { id: 'huawei', name: 'Huawei' },
          { id: 'fujitsu', name: 'Fujitsu' },
          { id: 'panasonic', name: 'Panasonic' },
          { id: 'gigabyte', name: 'Gigabyte' },
          { id: 'alienware', name: 'Alienware' },
          { id: 'vaio', name: 'VAIO' },
          { id: 'hcl', name: 'HCL' },
          { id: 'compaq', name: 'Compaq' },
          { id: 'gateway', name: 'Gateway' },
          { id: 'micromax', name: 'Micromax' },
          { id: 'xiaomi', name: 'Xiaomi' }
        ];
      case 'refrigeratorrepair':
        return [
          { id: 'samsung', name: 'Samsung' },
          { id: 'lg', name: 'LG' },
          { id: 'whirlpool', name: 'Whirlpool' },
          { id: 'bosch', name: 'Bosch' },
          { id: 'haier', name: 'Haier' },
          { id: 'godrej', name: 'Godrej' },
          { id: 'hitachi', name: 'Hitachi' },
          { id: 'panasonic', name: 'Panasonic' },
          { id: 'siemens', name: 'Siemens' },
          { id: 'voltas', name: 'Voltas Beko' },
          { id: 'electrolux', name: 'Electrolux' },
          { id: 'sharp', name: 'Sharp' },
          { id: 'kelvinator', name: 'Kelvinator' },
          { id: 'videocon', name: 'Videocon' },
          { id: 'liebherr', name: 'Liebherr' },
          { id: 'mitsubishi', name: 'Mitsubishi' },
          { id: 'daewoo', name: 'Daewoo' },
          { id: 'kenstar', name: 'Kenstar' },
          { id: 'miele', name: 'Miele' },
          { id: 'hisense', name: 'Hisense' },
          { id: 'onida', name: 'Onida' },
          { id: 'lloyd', name: 'Lloyd' },
          { id: 'croma', name: 'Croma' },
          { id: 'sansui', name: 'Sansui' }
        ];
      default:
        console.log('Service not found:', service, 'Normalized:', normalizedService); // Enhanced logging
        return [
          { id: 'samsung', name: 'Samsung' },
          { id: 'lg', name: 'LG' },
          { id: 'apple', name: 'Apple' },
          { id: 'sony', name: 'Sony' },
          { id: 'panasonic', name: 'Panasonic' },
          { id: 'xiaomi', name: 'Xiaomi' },
          { id: 'bosch', name: 'Bosch' },
          { id: 'whirlpool', name: 'Whirlpool' },
          { id: 'hitachi', name: 'Hitachi' },
          { id: 'bose', name: 'Bose' },
          { id: 'dell', name: 'Dell' },
          { id: 'hp', name: 'HP' }
        ];
    }
  };

  const brands = getBrands();

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Select Brand</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {brands.map((brand) => (
          <div 
            key={brand.id}
            className="bg-[#111] border border-[#222] rounded-lg p-4 hover:border-[#e60012] transition-colors cursor-pointer"
            onClick={() => onBrandSelect(brand)}
          >
            {/* <div className="aspect-square overflow-hidden rounded-lg mb-4 bg-[#222] flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-500">{brand.name.charAt(0)}</span>
            </div> */}
            <h3 className="text-lg font-medium text-center">{brand.name}</h3>
          </div>
        ))}
      </div>
    </div>
  )
}
