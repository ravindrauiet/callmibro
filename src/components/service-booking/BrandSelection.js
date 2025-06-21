'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'

export default function BrandSelection({ service, onBrandSelect }) {
  // Comprehensive brands based on the service type
  const getBrands = () => {
    // Normalize service name for comparison
    const normalizeServiceName = (name) => {
      return name?.toLowerCase().replace(/[-\s]/g, '') || '';
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
        // Show toast for default brands
        toast.warning(`Using default brands for service: ${service}`);
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
  const [selectedBrandId, setSelectedBrandId] = useState(null);

  const handleBrandSelect = (brand) => {
    try {
      setSelectedBrandId(brand.id);
      
      // Show toast for brand selection
      toast.success(`Selected brand: ${brand.name}`);
      
      // Check if callback exists
      if (typeof onBrandSelect !== 'function') {
        toast.error('Error: Cannot proceed with brand selection');
        return;
      }
      
      // Call the parent component's onBrandSelect function
      onBrandSelect(brand);
    } catch (error) {
      toast.error(`Error selecting brand: ${error.message}`);
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#111] to-[#191919] border border-[#333] rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-[#e60012] to-[#ff6b6b] bg-clip-text text-transparent">Select Brand</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {brands.map((brand) => (
          <div 
            key={brand.id}
            className={`bg-gradient-to-br from-[#1a1a1a] to-[#222] border ${
              selectedBrandId === brand.id 
                ? 'border-[#e60012] shadow-lg shadow-[#e60012]/10' 
                : 'border-[#333] hover:border-[#e60012]/70'
            } rounded-lg p-4 transition-all duration-300 cursor-pointer transform hover:scale-[1.02]`}
            onClick={() => handleBrandSelect(brand)}
          >
            <div className="aspect-square overflow-hidden rounded-lg mb-3 bg-[#222] flex items-center justify-center">
              <span className={`text-2xl font-bold ${
                selectedBrandId === brand.id
                  ? 'bg-gradient-to-r from-[#e60012] to-[#ff6b6b] bg-clip-text text-transparent'
                  : 'text-gray-500'
              }`}>{brand.name.charAt(0)}</span>
            </div>
            <h3 className={`text-base font-medium text-center ${
              selectedBrandId === brand.id
                ? 'bg-gradient-to-r from-[#e60012] to-[#ff6b6b] bg-clip-text text-transparent'
                : 'text-white'
            }`}>{brand.name}</h3>
          </div>
        ))}
      </div>
    </div>
  )
}
