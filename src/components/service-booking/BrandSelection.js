'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useTheme } from '@/contexts/ThemeContext'

export default function BrandSelection({ service, onBrandSelect }) {
  const [brands, setBrands] = useState([])
  const [filteredBrands, setFilteredBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBrandId, setSelectedBrandId] = useState(null)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const { isDarkMode } = useTheme()

  // Check if online
  const checkNetwork = () => {
    return navigator.onLine;
  };

  // Filter brands based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredBrands(brands);
    } else {
      const filtered = brands.filter(brand =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBrands(filtered);
    }
  }, [searchTerm, brands]);

  // Fetch brands from database
  useEffect(() => {
    const fetchBrands = async () => {
      // Reset error state on new fetch
      setError(null);
      
      // Check if we're online
      if (!checkNetwork()) {
        console.log('Network connection unavailable, using fallback brands');
        const fallbackBrands = getBrands();
        setBrands(fallbackBrands);
        setFilteredBrands(fallbackBrands);
        setError('Network connection unavailable');
        toast.error('Network connection unavailable. Using default brands.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true)
        
        // Normalize service name for comparison
        const normalizeServiceName = (name) => {
          return name?.toLowerCase().replace(/[-\s]/g, '') || '';
        };
        
        const normalizedService = normalizeServiceName(service);
        console.log('Fetching brands for service:', service, 'normalized:', normalizedService);
        
        // Map service to category
        const serviceToCategory = {
          'mobilescreenrepair': 'Mobile',
          'batteryreplacement': 'Mobile',
          'tvdiagnostics': 'TV',
          'acgasrefill': 'AC',
          'speakerrepair': 'Audio',
          'laptoprepair': 'Laptop',
          'refrigeratorrepair': 'Refrigerator'
        };
        
        const category = serviceToCategory[normalizedService] || '';
        console.log('Category mapped to:', category);
        
        // Make sure we have a valid database reference
        if (!db) {
          console.error('Firestore database reference is not available');
          throw new Error('Database connection not available');
        }
        
        // Query brands by category if available
        let brandsQuery;
        if (category) {
          brandsQuery = query(
            collection(db, 'brands'),
            where('category', '==', category),
            where('isActive', '==', true)
          );
        } else {
          brandsQuery = query(
            collection(db, 'brands'),
            where('isActive', '==', true)
          );
        }
        
        console.log('Executing Firestore query for brands...');
        const brandsSnapshot = await Promise.race([
          getDocs(brandsQuery),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database query timed out')), 10000)
          )
        ]);
        
        console.log('Query executed, results:', brandsSnapshot.size);
        const brandsData = brandsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        if (brandsData.length === 0) {
          // Fallback to hardcoded brands if no brands found in database
          console.log('No brands found in database, using fallback');
          const fallbackBrands = getBrands();
          setBrands(fallbackBrands);
          setFilteredBrands(fallbackBrands);
          toast.warning('Using default brands for this service');
        } else {
          console.log('Found brands in database:', brandsData.length);
          setBrands(brandsData);
          setFilteredBrands(brandsData);
        }
      } catch (error) {
        console.error('Error fetching brands:', error);
        console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error).reduce((obj, prop) => {
          obj[prop] = error[prop];
          return obj;
        }, {})));
        
        // Set error state
        setError(error.message || 'Failed to load brands');
        
        // Fallback to hardcoded brands on error
        const fallbackBrands = getBrands();
        setBrands(fallbackBrands);
        setFilteredBrands(fallbackBrands);
        
        // Show more specific error message based on error type
        if (error.name === 'FirebaseError') {
          if (error.code === 'permission-denied') {
            toast.error('Permission denied: Check Firebase rules');
          } else if (error.code === 'unavailable') {
            toast.error('Firebase service unavailable. Using default brands.');
          } else {
            toast.error(`Firebase error (${error.code}): Using default brands`);
          }
        } else if (error.message === 'Database query timed out') {
          toast.error('Database query timed out. Using default brands.');
        } else {
          toast.error('Failed to load brands from database');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchBrands();
  }, [service]);

  // Fallback function for hardcoded brands
  const getBrands = () => {
    // Normalize service name for comparison
    const normalizeServiceName = (name) => {
      return name?.toLowerCase().replace(/[-\s]/g, '') || '';
    };
    
    const normalizedService = normalizeServiceName(service);
    
    let brandList = [];
    
    switch(normalizedService) {
      case 'mobilescreenrepair':
        brandList = [
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
        break;
      case 'tvdiagnostics':
        brandList = [
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
        break;
      case 'acgasrefill':
        brandList = [
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
        break;
      case 'batteryreplacement':
        brandList = [
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
        break;
      case 'speakerrepair':
        brandList = [
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
        break;
      case 'laptoprepair':
        brandList = [
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
        break;
      case 'refrigeratorrepair':
        brandList = [
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
        break;
      default:
        // Show toast for default brands
        toast.warning(`Using default brands for service: ${service}`);
        brandList = [
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
        break;
    }
    
    // Add "Other" option at the end
    brandList.push({ id: 'other', name: 'Other' });
    
    return brandList;
  };

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

  // Render brand cards
  return (
    <div className="border rounded-lg p-6 shadow-lg" style={{ 
      background: 'linear-gradient(to bottom, var(--panel-dark), var(--panel-charcoal))',
      borderColor: 'var(--border-color)'
    }}>
      <h2 className="text-xl font-medium mb-4">Select Brand</h2>
      
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for your brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-10 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#e60012] focus:border-transparent"
            style={{
              backgroundColor: 'var(--panel-dark)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-main)'
            }}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {searchTerm && (
          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
            Found {filteredBrands.length} brand{filteredBrands.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#e60012]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filteredBrands.map(brand => (
            <div 
              key={brand.id}
              onClick={() => handleBrandSelect(brand)}
              className={`border rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer transition-all ${
                selectedBrandId === brand.id 
                  ? 'bg-[#e60012] border-[#ff6b6b]' 
                  : 'hover:border-[#e60012]'
              }`}
              style={{ 
                backgroundColor: selectedBrandId === brand.id ? undefined : 'var(--panel-charcoal)',
                borderColor: selectedBrandId === brand.id ? undefined : 'var(--border-color)' 
              }}
            >
              {brand.id === 'other' ? (
                <div className="h-12 w-12 flex items-center justify-center rounded-full mb-2 bg-[#e60012]/10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#e60012]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              ) : brand.logo ? (
                <img 
                  src={brand.logo} 
                  alt={brand.name} 
                  className="h-12 w-12 object-contain mb-2" 
                />
              ) : (
                <div className="h-12 w-12 flex items-center justify-center rounded-full mb-2" style={{ background: 'var(--panel-dark)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" style={{ color: 'var(--text-secondary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              )}
              <div className="text-center">
                <div className={`font-medium ${selectedBrandId === brand.id ? 'text-white' : ''}`} style={{ 
                  color: selectedBrandId === brand.id ? undefined : 'var(--text-main)' 
                }}>
                  {brand.name}
                </div>
                {brand.category && (
                  <div className={`text-xs ${selectedBrandId === brand.id ? 'text-gray-200' : ''}`} style={{ 
                    color: selectedBrandId === brand.id ? undefined : 'var(--text-secondary)' 
                  }}>
                    {brand.category}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!loading && filteredBrands.length === 0 && searchTerm && (
        <div className="text-center py-8">
          <p style={{ color: 'var(--text-secondary)' }} className="mb-4">
            No brands found matching "{searchTerm}"
          </p>
          <button
            onClick={() => setSearchTerm('')}
            className="text-[#e60012] hover:underline"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  )
}
