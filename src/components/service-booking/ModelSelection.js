'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/firebase/config'

export default function ModelSelection({ service, brand, onModelSelect }) {
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedModelId, setSelectedModelId] = useState(null)
  const [error, setError] = useState(null)
  
  // Check if online
  const checkNetwork = () => {
    return navigator.onLine;
  };
  
  // Helper function to remove price from model data
  const removePriceFromModels = (modelsData) => {
    return modelsData.map(model => ({
      ...model,
      price: null
    }));
  };
  
  // Fetch models from database based on selected brand
  useEffect(() => {
    const fetchModels = async () => {
      // Reset error state on new fetch
      setError(null);
      
      if (!brand || !brand.id) {
        setLoading(false)
        return
      }
      
      // Check if we're online
      if (!checkNetwork()) {
        console.log('Network connection unavailable, using fallback models');
        setModels(removePriceFromModels(getModels()));
        setError('Network connection unavailable');
        toast.error('Network connection unavailable. Using default models.');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true)
        
        // Make sure we have a valid database reference
        if (!db) {
          console.error('Firestore database reference is not available');
          throw new Error('Database connection not available');
        }
        
        // Query models from the standalone collection instead of subcollections
        console.log('Fetching models from standalone collection for brand:', brand.id);
        const modelsQuery = query(
          collection(db, 'models'),
          where('brandId', '==', brand.id),
          where('isActive', '==', true)
        );
        
        console.log('Executing Firestore query for models...');
        const modelsSnapshot = await Promise.race([
          getDocs(modelsQuery),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database query timed out')), 10000)
          )
        ]);
        
        console.log('Query executed, results:', modelsSnapshot.size);
        
        if (modelsSnapshot.empty) {
          // Try fetching from the old structure if the new one has no results
          console.log('No models found in models collection, trying legacy structure...');
          
          try {
            // Legacy: Get models from the brand's subcollection
            const legacyModelsCollection = collection(db, 'brands', brand.id, 'models');
            const legacyModelsQuery = query(legacyModelsCollection, where('isActive', '==', true));
            const legacyModelsSnapshot = await getDocs(legacyModelsQuery);
            
            if (!legacyModelsSnapshot.empty) {
              console.log('Found models in legacy structure:', legacyModelsSnapshot.size);
              
              const modelsData = legacyModelsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Remove price data
                price: null
              }));
              
              setModels(removePriceFromModels(modelsData));
              toast.warning('Using legacy model data. Please run migration tool.');
              setLoading(false);
              return;
            }
          } catch (legacyError) {
            console.error('Error fetching legacy models:', legacyError);
            // Continue to fallback
          }
        }
        
        const modelsData = modelsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Remove price data
          price: null
        }))
        
        if (modelsData.length === 0) {
          // Fallback to hardcoded models if no models found in database
          console.log('No models found in database, using fallback');
          setModels(removePriceFromModels(getModels()))
          if (brand.id !== 'default') {
            toast.warning(`Using default models for ${brand.name}`)
          }
        } else {
          console.log('Found models in database:', modelsData.length);
          setModels(modelsData)
        }
      } catch (error) {
        console.error('Error fetching models:', error)
        console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error).reduce((obj, prop) => {
          obj[prop] = error[prop];
          return obj;
        }, {})));
        
        // Set error state
        setError(error.message || 'Failed to load models');
        
        // Fallback to hardcoded models on error
        setModels(removePriceFromModels(getModels()))
        
        // Show more specific error message based on error type
        if (error.name === 'FirebaseError') {
          if (error.code === 'permission-denied') {
            toast.error('Permission denied: Check Firebase rules');
          } else if (error.code === 'unavailable') {
            toast.error('Firebase service unavailable. Using default models.');
          } else {
            toast.error(`Firebase error (${error.code}): Using default models`);
          }
        } else if (error.message === 'Database query timed out') {
          toast.error('Database query timed out. Using default models.');
        } else {
          toast.error('Failed to load models from database')
        }
      } finally {
        setLoading(false)
      }
    }
    
    fetchModels()
  }, [brand, service])
  
  // Function to get default price based on service and model name
  const getDefaultPrice = (service, brandId, modelName) => {
    // Return null to avoid displaying prices
    return null;
    
    /* Prices are no longer displayed in the frontend
    // Default pricing logic based on service type and model name
    const normalizeServiceName = (name) => {
      return name?.toLowerCase().replace(/[-\s]/g, '') || '';
    };
    
    const normalizedService = normalizeServiceName(service);
    
    // Base price for different services
    const basePrices = {
      'mobilescreenrepair': '₹3,500',
      'batteryreplacement': '₹1,500',
      'tvdiagnostics': '₹1,000',
      'acgasrefill': '₹2,000',
      'speakerrepair': '₹1,200',
      'laptoprepair': '₹2,500',
      'refrigeratorrepair': '₹1,800'
    };
    
    // Price adjustments based on model name patterns
    let price = basePrices[normalizedService] || '₹1,500';
    
    // Higher price for premium models (containing "pro", "max", "ultra", etc.)
    if (/pro|max|ultra|premium|plus\+?|elite|flagship/i.test(modelName)) {
      // Increase price by ~30%
      const numericPrice = parseInt(price.replace(/[^\d]/g, ''));
      price = '₹' + Math.round(numericPrice * 1.3).toLocaleString('en-IN');
    }
    
    return price;
    */
  };

  // Comprehensive data for models based on brand and service type (fallback)
  const getModels = () => {
    // Normalize service name for comparison
    const normalizeServiceName = (name) => {
      return name?.toLowerCase().replace(/[-\s]/g, '') || '';
    };
    
    const normalizedService = normalizeServiceName(service);
    
    // More debugging
    console.log('ModelSelection: Normalized Service =', normalizedService);
    
    if (brand.id === 'apple' && normalizedService === 'mobilescreenrepair') {
      return [
        { id: 'iphone-16-pro-max', name: 'iPhone 16 Pro Max', price: '₹13,500' },
        { id: 'iphone-16-pro', name: 'iPhone 16 Pro', price: '₹12,000' },
        { id: 'iphone-16-plus', name: 'iPhone 16 Plus', price: '₹10,500' },
        { id: 'iphone-16', name: 'iPhone 16', price: '₹9,000' },
        { id: 'iphone-15-pro-max', name: 'iPhone 15 Pro Max', price: '₹8,500' },
        { id: 'iphone-15-pro', name: 'iPhone 15 Pro', price: '₹7,500' },
        { id: 'iphone-15-plus', name: 'iPhone 15 Plus', price: '₹6,800' },
        { id: 'iphone-15', name: 'iPhone 15', price: '₹5,900' },
        { id: 'iphone-14-pro-max', name: 'iPhone 14 Pro Max', price: '₹7,500' },
        { id: 'iphone-14-pro', name: 'iPhone 14 Pro', price: '₹6,500' },
        { id: 'iphone-14-plus', name: 'iPhone 14 Plus', price: '₹5,800' },
        { id: 'iphone-14', name: 'iPhone 14', price: '₹5,200' },
        { id: 'iphone-13-pro-max', name: 'iPhone 13 Pro Max', price: '₹6,800' },
        { id: 'iphone-13-pro', name: 'iPhone 13 Pro', price: '₹6,200' },
        { id: 'iphone-13-mini', name: 'iPhone 13 Mini', price: '₹5,000' },
        { id: 'iphone-13', name: 'iPhone 13', price: '₹4,800' },
        { id: 'iphone-12-pro-max', name: 'iPhone 12 Pro Max', price: '₹6,500' },
        { id: 'iphone-12-pro', name: 'iPhone 12 Pro', price: '₹5,800' },
        { id: 'iphone-12-mini', name: 'iPhone 12 Mini', price: '₹4,800' },
        { id: 'iphone-12', name: 'iPhone 12', price: '₹4,500' },
        { id: 'iphone-11-pro-max', name: 'iPhone 11 Pro Max', price: '₹6,000' },
        { id: 'iphone-11-pro', name: 'iPhone 11 Pro', price: '₹5,500' },
        { id: 'iphone-11', name: 'iPhone 11', price: '₹4,000' },
        { id: 'iphone-xr', name: 'iPhone XR', price: '₹3,800' },
        { id: 'iphone-xs-max', name: 'iPhone XS Max', price: '₹4,800' },
        { id: 'iphone-xs', name: 'iPhone XS', price: '₹4,500' },
        { id: 'iphone-x', name: 'iPhone X', price: '₹4,200' },
        { id: 'iphone-8-plus', name: 'iPhone 8 Plus', price: '₹3,800' },
        { id: 'iphone-8', name: 'iPhone 8', price: '₹3,500' },
        { id: 'iphone-7-plus', name: 'iPhone 7 Plus', price: '₹3,500' },
        { id: 'iphone-7', name: 'iPhone 7', price: '₹3,200' },
        { id: 'iphone-se-3', name: 'iPhone SE (3rd gen)', price: '₹3,500' },
        { id: 'iphone-se-2', name: 'iPhone SE (2nd gen)', price: '₹3,200' },
        { id: 'iphone-se-1', name: 'iPhone SE (1st gen)', price: '₹2,800' }
      ];
    } else if (brand.id === 'samsung' && normalizedService === 'mobilescreenrepair') {
      return [
        { id: 'galaxy-s24-ultra', name: 'Galaxy S24 Ultra', price: '₹16,500' },
        { id: 'galaxy-s24-plus', name: 'Galaxy S24+', price: '₹12,800' },
        { id: 'galaxy-s24', name: 'Galaxy S24', price: '₹10,500' },
        { id: 'galaxy-s23-ultra', name: 'Galaxy S23 Ultra', price: '₹14,200' },
        { id: 'galaxy-s23-plus', name: 'Galaxy S23+', price: '₹11,800' },
        { id: 'galaxy-s23', name: 'Galaxy S23', price: '₹9,500' },
        { id: 'galaxy-s22-ultra', name: 'Galaxy S22 Ultra', price: '₹12,500' },
        { id: 'galaxy-s22-plus', name: 'Galaxy S22+', price: '₹10,200' },
        { id: 'galaxy-s22', name: 'Galaxy S22', price: '₹8,500' },
        { id: 'galaxy-s21-ultra', name: 'Galaxy S21 Ultra', price: '₹11,500' },
        { id: 'galaxy-s21-plus', name: 'Galaxy S21+', price: '₹9,800' },
        { id: 'galaxy-s21', name: 'Galaxy S21', price: '₹7,500' },
        { id: 'galaxy-s21-fe', name: 'Galaxy S21 FE', price: '₹6,800' },
        { id: 'galaxy-s20-ultra', name: 'Galaxy S20 Ultra', price: '₹10,500' },
        { id: 'galaxy-s20-plus', name: 'Galaxy S20+', price: '₹8,800' },
        { id: 'galaxy-s20', name: 'Galaxy S20', price: '₹7,200' },
        { id: 'galaxy-s20-fe', name: 'Galaxy S20 FE', price: '₹6,500' }
      ];
    } else if (brand.id === 'lg' && normalizedService === 'tvdiagnostics') {
      return [
        { id: 'lg-oled-g4', name: 'LG OLED G4 (2024)', price: '₹4,500' },
        { id: 'lg-oled-c4', name: 'LG OLED C4 (2024)', price: '₹4,200' },
        { id: 'lg-oled-b4', name: 'LG OLED B4 (2024)', price: '₹3,800' },
        { id: 'lg-oled-g3', name: 'LG OLED G3 (2023)', price: '₹4,200' },
        { id: 'lg-oled-c3', name: 'LG OLED C3 (2023)', price: '₹3,800' },
        { id: 'lg-oled-b3', name: 'LG OLED B3 (2023)', price: '₹3,500' },
        { id: 'lg-oled-g2', name: 'LG OLED G2 (2022)', price: '₹3,800' },
        { id: 'lg-oled-c2', name: 'LG OLED C2 (2022)', price: '₹3,500' },
        { id: 'lg-oled-b2', name: 'LG OLED B2 (2022)', price: '₹3,200' },
        { id: 'lg-oled-a2', name: 'LG OLED A2 (2022)', price: '₹3,000' },
        { id: 'lg-oled-g1', name: 'LG OLED G1 (2021)', price: '₹3,500' },
        { id: 'lg-oled-c1', name: 'LG OLED C1 (2021)', price: '₹3,200' },
        { id: 'lg-oled-b1', name: 'LG OLED B1 (2021)', price: '₹2,800' },
        { id: 'lg-oled-a1', name: 'LG OLED A1 (2021)', price: '₹2,500' },
        { id: 'lg-qned99', name: 'LG QNED99 8K Mini LED', price: '₹4,000' },
        { id: 'lg-qned90', name: 'LG QNED90 4K Mini LED', price: '₹3,500' },
        { id: 'lg-qned85', name: 'LG QNED85 4K Mini LED', price: '₹3,200' },
        { id: 'lg-nanocell-nano90', name: 'LG NanoCell NANO90', price: '₹2,800' },
        { id: 'lg-nanocell-nano85', name: 'LG NanoCell NANO85', price: '₹2,500' },
        { id: 'lg-nanocell-nano80', name: 'LG NanoCell NANO80', price: '₹2,200' },
        { id: 'lg-nanocell-nano75', name: 'LG NanoCell NANO75', price: '₹2,000' },
        { id: 'lg-uhd-up80', name: 'LG UHD UP80', price: '₹1,800' },
        { id: 'lg-uhd-up75', name: 'LG UHD UP75', price: '₹1,500' },
        { id: 'lg-uhd-up70', name: 'LG UHD UP70', price: '₹1,200' },
        { id: 'lg-smart-tv', name: 'LG Smart TV (Basic)', price: '₹1,000' }
      ];
    } else if (brand.id === 'daikin' && normalizedService === 'acgasrefill') {
      return [
        { id: 'daikin-ftht-1-ton', name: 'Daikin FTHT 1 Ton 5 Star Inverter Split AC', price: '₹2,200' },
        { id: 'daikin-ftht-1.5-ton', name: 'Daikin FTHT 1.5 Ton 5 Star Inverter Split AC', price: '₹2,500' },
        { id: 'daikin-ftht-2-ton', name: 'Daikin FTHT 2 Ton 5 Star Inverter Split AC', price: '₹2,800' },
        { id: 'daikin-ftkf-1-ton', name: 'Daikin FTKF 1 Ton 3 Star Inverter Split AC', price: '₹2,000' },
        { id: 'daikin-ftkf-1.5-ton', name: 'Daikin FTKF 1.5 Ton 3 Star Inverter Split AC', price: '₹2,300' },
        { id: 'daikin-ftkf-2-ton', name: 'Daikin FTKF 2 Ton 3 Star Inverter Split AC', price: '₹2,600' },
        { id: 'daikin-jtkj-1-ton', name: 'Daikin JTKJ 1 Ton 5 Star Inverter Split AC', price: '₹2,200' },
        { id: 'daikin-jtkj-1.5-ton', name: 'Daikin JTKJ 1.5 Ton 5 Star Inverter Split AC', price: '₹2,500' },
        { id: 'daikin-ftkm-1-ton', name: 'Daikin FTKM 1 Ton 5 Star Inverter Split AC', price: '₹2,200' },
        { id: 'daikin-ftkm-1.5-ton', name: 'Daikin FTKM 1.5 Ton 5 Star Inverter Split AC', price: '₹2,500' },
        { id: 'daikin-ftkm-2-ton', name: 'Daikin FTKM 2 Ton 5 Star Inverter Split AC', price: '₹2,800' },
        { id: 'daikin-ftkg-1-ton', name: 'Daikin FTKG 1 Ton 3 Star Fixed Speed Split AC', price: '₹1,800' },
        { id: 'daikin-ftkg-1.5-ton', name: 'Daikin FTKG 1.5 Ton 3 Star Fixed Speed Split AC', price: '₹2,100' },
        { id: 'daikin-ftkg-2-ton', name: 'Daikin FTKG 2 Ton 3 Star Fixed Speed Split AC', price: '₹2,400' },
        { id: 'daikin-skyair-cassette', name: 'Daikin SkyAir Cassette AC (2.5 HP)', price: '₹3,500' },
        { id: 'daikin-skyair-cassette-3hp', name: 'Daikin SkyAir Cassette AC (3 HP)', price: '₹3,800' },
        { id: 'daikin-skyair-cassette-4hp', name: 'Daikin SkyAir Cassette AC (4 HP)', price: '₹4,200' },
        { id: 'daikin-skyair-cassette-5hp', name: 'Daikin SkyAir Cassette AC (5 HP)', price: '₹4,800' },
        { id: 'daikin-vrv-cassette', name: 'Daikin VRV Cassette AC (Small)', price: '₹4,000' },
        { id: 'daikin-vrv-cassette-medium', name: 'Daikin VRV Cassette AC (Medium)', price: '₹4,500' },
        { id: 'daikin-vrv-cassette-large', name: 'Daikin VRV Cassette AC (Large)', price: '₹5,000' },
        { id: 'daikin-ductable-8.5-ton', name: 'Daikin Ductable AC (8.5 Ton)', price: '₹5,500' },
        { id: 'daikin-ductable-11-ton', name: 'Daikin Ductable AC (11 Ton)', price: '₹6,000' },
        { id: 'daikin-ductable-16.5-ton', name: 'Daikin Ductable AC (16.5 Ton)', price: '₹6,500' },
        { id: 'daikin-packaged-8.5-ton', name: 'Daikin Packaged AC (8.5 Ton)', price: '₹5,800' },
        { id: 'daikin-packaged-11-ton', name: 'Daikin Packaged AC (11 Ton)', price: '₹6,300' },
        { id: 'daikin-window-1-ton', name: 'Daikin Window AC (1 Ton)', price: '₹1,800' },
        { id: 'daikin-window-1.5-ton', name: 'Daikin Window AC (1.5 Ton)', price: '₹2,100' },
        { id: 'daikin-window-2-ton', name: 'Daikin Window AC (2 Ton)', price: '₹2,400' }
      ];
    } else if (brand.id === 'jbl' && normalizedService === 'speakerrepair') {
      return [
        { id: 'jbl-flip-6', name: 'JBL Flip 6', price: '₹1,500' },
        { id: 'jbl-flip-5', name: 'JBL Flip 5', price: '₹1,300' },
        { id: 'jbl-flip-4', name: 'JBL Flip 4', price: '₹1,200' },
        { id: 'jbl-flip-3', name: 'JBL Flip 3', price: '₹1,000' },
        { id: 'jbl-charge-5', name: 'JBL Charge 5', price: '₹1,800' },
        { id: 'jbl-charge-4', name: 'JBL Charge 4', price: '₹1,600' },
        { id: 'jbl-charge-3', name: 'JBL Charge 3', price: '₹1,400' },
        { id: 'jbl-pulse-5', name: 'JBL Pulse 5', price: '₹2,000' },
        { id: 'jbl-pulse-4', name: 'JBL Pulse 4', price: '₹1,800' },
        { id: 'jbl-pulse-3', name: 'JBL Pulse 3', price: '₹1,600' },
        { id: 'jbl-xtreme-3', name: 'JBL Xtreme 3', price: '₹2,500' },
        { id: 'jbl-xtreme-2', name: 'JBL Xtreme 2', price: '₹2,200' },
        { id: 'jbl-xtreme', name: 'JBL Xtreme', price: '₹2,000' },
        { id: 'jbl-boombox-3', name: 'JBL Boombox 3', price: '₹3,200' },
        { id: 'jbl-boombox-2', name: 'JBL Boombox 2', price: '₹2,800' },
        { id: 'jbl-boombox', name: 'JBL Boombox', price: '₹2,500' },
        { id: 'jbl-partybox-1000', name: 'JBL PartyBox 1000', price: '₹5,000' },
        { id: 'jbl-partybox-710', name: 'JBL PartyBox 710', price: '₹4,500' },
        { id: 'jbl-partybox-310', name: 'JBL PartyBox 310', price: '₹3,500' },
        { id: 'jbl-partybox-110', name: 'JBL PartyBox 110', price: '₹3,000' },
        { id: 'jbl-partybox-100', name: 'JBL PartyBox 100', price: '₹2,800' },
        { id: 'jbl-go-3', name: 'JBL Go 3', price: '₹900' },
        { id: 'jbl-go-2', name: 'JBL Go 2', price: '₹800' },
        { id: 'jbl-go', name: 'JBL Go', price: '₹700' },
        { id: 'jbl-clip-4', name: 'JBL Clip 4', price: '₹1,000' },
        { id: 'jbl-clip-3', name: 'JBL Clip 3', price: '₹900' },
        { id: 'jbl-tune-710bt', name: 'JBL Tune 710BT Headphones', price: '₹1,200' },
        { id: 'jbl-tune-510bt', name: 'JBL Tune 510BT Headphones', price: '₹1,000' },
        { id: 'jbl-tune-760nc', name: 'JBL Tune 760NC Headphones', price: '₹1,500' },
        { id: 'jbl-tune-660nc', name: 'JBL Tune 660NC Headphones', price: '₹1,300' }
      ];
    } else if (brand.id === 'sony' && normalizedService === 'speakerrepair') {
      return [
        { id: 'sony-srs-xb43', name: 'Sony SRS-XB43', price: '₹1,800' },
        { id: 'sony-srs-xb33', name: 'Sony SRS-XB33', price: '₹1,500' },
        { id: 'sony-srs-xb23', name: 'Sony SRS-XB23', price: '₹1,300' },
        { id: 'sony-srs-xb13', name: 'Sony SRS-XB13', price: '₹1,000' },
        { id: 'sony-srs-xb12', name: 'Sony SRS-XB12', price: '₹900' },
        { id: 'sony-srs-xp700', name: 'Sony SRS-XP700', price: '₹3,500' },
        { id: 'sony-srs-xp500', name: 'Sony SRS-XP500', price: '₹3,000' },
        { id: 'sony-srs-xg500', name: 'Sony SRS-XG500', price: '₹2,800' },
        { id: 'sony-srs-xg300', name: 'Sony SRS-XG300', price: '₹2,500' },
        { id: 'sony-srs-xb43', name: 'Sony SRS-XB43', price: '₹1,800' },
        { id: 'sony-srs-xv900', name: 'Sony SRS-XV900', price: '₹4,000' },
        { id: 'sony-srs-xv800', name: 'Sony SRS-XV800', price: '₹3,500' },
        { id: 'sony-srs-xv700', name: 'Sony SRS-XV700', price: '₹3,200' },
        { id: 'sony-srs-ra5000', name: 'Sony SRS-RA5000', price: '₹3,500' },
        { id: 'sony-srs-ra3000', name: 'Sony SRS-RA3000', price: '₹3,000' },
        { id: 'sony-ht-s40r', name: 'Sony HT-S40R Soundbar', price: '₹3,000' },
        { id: 'sony-ht-s20r', name: 'Sony HT-S20R Soundbar', price: '₹2,500' },
        { id: 'sony-ht-a7000', name: 'Sony HT-A7000 Soundbar', price: '₹4,500' },
        { id: 'sony-ht-a5000', name: 'Sony HT-A5000 Soundbar', price: '₹4,000' },
        { id: 'sony-gtk-xb7', name: 'Sony GTK-XB7', price: '₹3,200' },
        { id: 'sony-gtk-xb5', name: 'Sony GTK-XB5', price: '₹2,800' },
        { id: 'sony-gtk-xb90', name: 'Sony GTK-XB90', price: '₹3,500' },
        { id: 'sony-gtk-xb72', name: 'Sony GTK-XB72', price: '₹3,200' },
        { id: 'sony-gtk-xb60', name: 'Sony GTK-XB60', price: '₹2,800' },
        { id: 'sony-mhc-v83d', name: 'Sony MHC-V83D', price: '₹4,500' },
        { id: 'sony-mhc-v73d', name: 'Sony MHC-V73D', price: '₹4,200' },
        { id: 'sony-mhc-v43d', name: 'Sony MHC-V43D', price: '₹3,800' },
        { id: 'sony-mhc-v13', name: 'Sony MHC-V13', price: '₹3,500' },
        { id: 'sony-wh-1000xm5', name: 'Sony WH-1000XM5 Headphones', price: '₹2,200' },
        { id: 'sony-wh-1000xm4', name: 'Sony WH-1000XM4 Headphones', price: '₹2,000' }
      ];
    } else if (brand.id === 'bose' && normalizedService === 'speakerrepair') {
      return [
        { id: 'bose-soundlink-flex', name: 'Bose SoundLink Flex', price: '₹1,800' },
        { id: 'bose-soundlink-revolve-2', name: 'Bose SoundLink Revolve II', price: '₹2,200' },
        { id: 'bose-soundlink-revolve', name: 'Bose SoundLink Revolve', price: '₹2,000' },
        { id: 'bose-soundlink-revolve-plus-2', name: 'Bose SoundLink Revolve+ II', price: '₹2,500' },
        { id: 'bose-soundlink-revolve-plus', name: 'Bose SoundLink Revolve+', price: '₹2,300' },
        { id: 'bose-portable-home', name: 'Bose Portable Home Speaker', price: '₹2,800' },
        { id: 'bose-soundlink-mini-2', name: 'Bose SoundLink Mini II', price: '₹1,800' },
        { id: 'bose-soundlink-mini', name: 'Bose SoundLink Mini', price: '₹1,500' },
        { id: 'bose-soundlink-color-2', name: 'Bose SoundLink Color II', price: '₹1,500' },
        { id: 'bose-soundlink-color', name: 'Bose SoundLink Color', price: '₹1,300' },
        { id: 'bose-soundlink-3', name: 'Bose SoundLink III', price: '₹1,800' },
        { id: 'bose-soundlink-2', name: 'Bose SoundLink II', price: '₹1,500' },
        { id: 'bose-soundlink-1', name: 'Bose SoundLink', price: '₹1,300' },
        { id: 'bose-soundtouch-30', name: 'Bose SoundTouch 30', price: '₹3,000' },
        { id: 'bose-soundtouch-20', name: 'Bose SoundTouch 20', price: '₹2,500' },
        { id: 'bose-soundtouch-10', name: 'Bose SoundTouch 10', price: '₹2,000' },
        { id: 'bose-home-speaker-500', name: 'Bose Home Speaker 500', price: '₹3,200' },
        { id: 'bose-home-speaker-300', name: 'Bose Home Speaker 300', price: '₹2,800' },
        { id: 'bose-tv-speaker', name: 'Bose TV Speaker', price: '₹2,500' },
        { id: 'bose-smart-soundbar-900', name: 'Bose Smart Soundbar 900', price: '₹4,500' },
        { id: 'bose-smart-soundbar-700', name: 'Bose Smart Soundbar 700', price: '₹4,000' },
        { id: 'bose-smart-soundbar-300', name: 'Bose Smart Soundbar 300', price: '₹3,500' },
        { id: 'bose-quietcomfort-45', name: 'Bose QuietComfort 45 Headphones', price: '₹2,200' },
        { id: 'bose-quietcomfort-35-ii', name: 'Bose QuietComfort 35 II Headphones', price: '₹2,000' },
        { id: 'bose-noise-cancelling-700', name: 'Bose Noise Cancelling 700 Headphones', price: '₹2,500' }
      ];
    } else if (brand.id === 'marshall' && normalizedService === 'speakerrepair') {
      return [
        { id: 'marshall-emberton-ii', name: 'Marshall Emberton II', price: '₹1,800' },
        { id: 'marshall-emberton', name: 'Marshall Emberton', price: '₹1,500' },
        { id: 'marshall-willen', name: 'Marshall Willen', price: '₹1,200' },
        { id: 'marshall-kilburn-iii', name: 'Marshall Kilburn III', price: '₹2,800' },
        { id: 'marshall-kilburn-ii', name: 'Marshall Kilburn II', price: '₹2,500' },
        { id: 'marshall-kilburn', name: 'Marshall Kilburn', price: '₹2,200' },
        { id: 'marshall-stockwell-iii', name: 'Marshall Stockwell III', price: '₹2,500' },
        { id: 'marshall-stockwell-ii', name: 'Marshall Stockwell II', price: '₹2,200' },
        { id: 'marshall-stockwell', name: 'Marshall Stockwell', price: '₹2,000' },
        { id: 'marshall-tufton', name: 'Marshall Tufton', price: '₹3,200' },
        { id: 'marshall-woburn-iii', name: 'Marshall Woburn III', price: '₹3,800' },
        { id: 'marshall-woburn-ii', name: 'Marshall Woburn II', price: '₹3,500' },
        { id: 'marshall-woburn', name: 'Marshall Woburn', price: '₹3,200' },
        { id: 'marshall-acton-iii', name: 'Marshall Acton III', price: '₹2,800' },
        { id: 'marshall-acton-ii', name: 'Marshall Acton II', price: '₹2,500' },
        { id: 'marshall-acton', name: 'Marshall Acton', price: '₹2,200' },
        { id: 'marshall-stanmore-iii', name: 'Marshall Stanmore III', price: '₹3,200' },
        { id: 'marshall-stanmore-ii', name: 'Marshall Stanmore II', price: '₹3,000' },
        { id: 'marshall-stanmore', name: 'Marshall Stanmore', price: '₹2,800' },
        { id: 'marshall-major-iv', name: 'Marshall Major IV Headphones', price: '₹1,800' },
        { id: 'marshall-major-iii', name: 'Marshall Major III Headphones', price: '₹1,500' },
        { id: 'marshall-monitor-ii', name: 'Marshall Monitor II ANC Headphones', price: '₹2,200' }
      ];
    } else if (brand.id === 'xiaomi' && normalizedService === 'mobilescreenrepair') {
      return [
        { id: 'xiaomi-13-pro', name: 'Xiaomi 13 Pro', price: '₹11,500' },
        { id: 'xiaomi-13', name: 'Xiaomi 13', price: '₹9,800' },
        { id: 'xiaomi-12-pro', name: 'Xiaomi 12 Pro', price: '₹8,500' },
        { id: 'xiaomi-12', name: 'Xiaomi 12', price: '₹7,500' },
        { id: 'xiaomi-11t-pro', name: 'Xiaomi 11T Pro', price: '₹6,800' },
        { id: 'xiaomi-11t', name: 'Xiaomi 11T', price: '₹6,000' },
        { id: 'xiaomi-11-ultra', name: 'Xiaomi Mi 11 Ultra', price: '₹8,500' },
        { id: 'xiaomi-11-pro', name: 'Xiaomi Mi 11 Pro', price: '₹7,500' },
        { id: 'xiaomi-11', name: 'Xiaomi Mi 11', price: '₹6,800' },
        { id: 'xiaomi-11-lite', name: 'Xiaomi Mi 11 Lite', price: '₹5,500' },
        { id: 'xiaomi-note-12-pro-plus', name: 'Redmi Note 12 Pro+', price: '₹5,500' },
        { id: 'xiaomi-note-12-pro', name: 'Redmi Note 12 Pro', price: '₹5,000' },
        { id: 'xiaomi-note-12', name: 'Redmi Note 12', price: '₹4,500' },
        { id: 'xiaomi-note-11-pro-plus', name: 'Redmi Note 11 Pro+', price: '₹5,200' },
        { id: 'xiaomi-note-11-pro', name: 'Redmi Note 11 Pro', price: '₹4,800' },
        { id: 'xiaomi-note-11', name: 'Redmi Note 11', price: '₹4,200' },
        { id: 'xiaomi-note-10-pro', name: 'Redmi Note 10 Pro', price: '₹4,500' },
        { id: 'xiaomi-note-10', name: 'Redmi Note 10', price: '₹4,000' },
        { id: 'xiaomi-k60', name: 'Redmi K60', price: '₹6,500' },
        { id: 'xiaomi-k50', name: 'Redmi K50', price: '₹6,000' },
        { id: 'xiaomi-k40', name: 'Redmi K40', price: '₹5,500' }
      ];
    } else if (brand.id === 'samsung' && normalizedService === 'tvdiagnostics') {
      return [
        { id: 'samsung-neo-qled-8k', name: 'Samsung Neo QLED 8K TV', price: '₹5,500' },
        { id: 'samsung-neo-qled-4k', name: 'Samsung Neo QLED 4K TV', price: '₹4,800' },
        { id: 'samsung-qled-4k', name: 'Samsung QLED 4K TV', price: '₹4,200' },
        { id: 'samsung-crystal-uhd', name: 'Samsung Crystal UHD TV', price: '₹3,500' },
        { id: 'samsung-frame', name: 'Samsung The Frame TV', price: '₹4,500' },
        { id: 'samsung-serif', name: 'Samsung The Serif TV', price: '₹4,200' },
        { id: 'samsung-sero', name: 'Samsung The Sero TV', price: '₹4,000' },
        { id: 'samsung-qn900c', name: 'Samsung QN900C Neo QLED 8K', price: '₹6,000' },
        { id: 'samsung-qn800c', name: 'Samsung QN800C Neo QLED 8K', price: '₹5,500' },
        { id: 'samsung-qn90c', name: 'Samsung QN90C Neo QLED 4K', price: '₹5,000' },
        { id: 'samsung-qn85c', name: 'Samsung QN85C Neo QLED 4K', price: '₹4,800' },
        { id: 'samsung-q80c', name: 'Samsung Q80C QLED 4K', price: '₹4,500' },
        { id: 'samsung-q70c', name: 'Samsung Q70C QLED 4K', price: '₹4,200' },
        { id: 'samsung-q60c', name: 'Samsung Q60C QLED 4K', price: '₹3,800' },
        { id: 'samsung-bu8000', name: 'Samsung BU8000 Crystal UHD 4K', price: '₹3,500' },
        { id: 'samsung-bu7000', name: 'Samsung BU7000 Crystal UHD 4K', price: '₹3,200' },
        { id: 'samsung-ls03b', name: 'Samsung The Frame LS03B', price: '₹4,500' }
      ];
    } else if (brand.id === 'voltas' && normalizedService === 'acgasrefill') {
      return [
        { id: 'voltas-vertis-5-star-1-ton', name: 'Voltas Vertis 5 Star 1 Ton Inverter Split AC', price: '₹2,000' },
        { id: 'voltas-vertis-5-star-1.5-ton', name: 'Voltas Vertis 5 Star 1.5 Ton Inverter Split AC', price: '₹2,300' },
        { id: 'voltas-vertis-3-star-1-ton', name: 'Voltas Vertis 3 Star 1 Ton Inverter Split AC', price: '₹1,800' },
        { id: 'voltas-vertis-3-star-1.5-ton', name: 'Voltas Vertis 3 Star 1.5 Ton Inverter Split AC', price: '₹2,100' },
        { id: 'voltas-magnus-5-star-1-ton', name: 'Voltas Magnus 5 Star 1 Ton Inverter Split AC', price: '₹2,000' },
        { id: 'voltas-magnus-5-star-1.5-ton', name: 'Voltas Magnus 5 Star 1.5 Ton Inverter Split AC', price: '₹2,300' },
        { id: 'voltas-magnus-3-star-1-ton', name: 'Voltas Magnus 3 Star 1 Ton Inverter Split AC', price: '₹1,800' },
        { id: 'voltas-magnus-3-star-1.5-ton', name: 'Voltas Magnus 3 Star 1.5 Ton Inverter Split AC', price: '₹2,100' },
        { id: 'voltas-123v-1-ton', name: 'Voltas 123V DZX 1 Ton 3 Star Fixed Speed Split AC', price: '₹1,600' },
        { id: 'voltas-183v-1.5-ton', name: 'Voltas 183V DZX 1.5 Ton 3 Star Fixed Speed Split AC', price: '₹1,900' },
        { id: 'voltas-123v-czp-1-ton', name: 'Voltas 123V CZP 1 Ton 3 Star Fixed Speed Window AC', price: '₹1,500' },
        { id: 'voltas-183v-czp-1.5-ton', name: 'Voltas 183V CZP 1.5 Ton 3 Star Fixed Speed Window AC', price: '₹1,800' }
      ];
    } else if (brand.id === 'harmankardon' && normalizedService === 'speakerrepair') {
      return [
        { id: 'harman-kardon-aura-studio-3', name: 'Harman Kardon Aura Studio 3', price: '₹2,800' },
        { id: 'harman-kardon-aura-studio-2', name: 'Harman Kardon Aura Studio 2', price: '₹2,500' },
        { id: 'harman-kardon-onyx-studio-7', name: 'Harman Kardon Onyx Studio 7', price: '₹2,500' },
        { id: 'harman-kardon-onyx-studio-6', name: 'Harman Kardon Onyx Studio 6', price: '₹2,200' },
        { id: 'harman-kardon-onyx-studio-5', name: 'Harman Kardon Onyx Studio 5', price: '₹2,000' },
        { id: 'harman-kardon-onyx-studio-4', name: 'Harman Kardon Onyx Studio 4', price: '₹1,800' },
        { id: 'harman-kardon-citation-500', name: 'Harman Kardon Citation 500', price: '₹3,200' },
        { id: 'harman-kardon-citation-300', name: 'Harman Kardon Citation 300', price: '₹2,800' },
        { id: 'harman-kardon-citation-200', name: 'Harman Kardon Citation 200', price: '₹2,500' },
        { id: 'harman-kardon-citation-100', name: 'Harman Kardon Citation 100', price: '₹2,200' },
        { id: 'harman-kardon-citation-bar', name: 'Harman Kardon Citation Bar', price: '₹3,500' },
        { id: 'harman-kardon-citation-surround', name: 'Harman Kardon Citation Surround', price: '₹2,800' },
        { id: 'harman-kardon-citation-sub', name: 'Harman Kardon Citation Sub', price: '₹3,000' },
        { id: 'harman-kardon-soundsticks-4', name: 'Harman Kardon SoundSticks 4', price: '₹2,500' },
        { id: 'harman-kardon-soundsticks-3', name: 'Harman Kardon SoundSticks 3', price: '₹2,200' }
      ];
    } else {
      // Generic models for other brands/services
      return [
        { id: 'model-premium-plus', name: 'Premium Plus Model', price: '₹8,500' },
        { id: 'model-premium', name: 'Premium Model', price: '₹6,500' },
        { id: 'model-standard-plus', name: 'Standard Plus Model', price: '₹5,500' },
        { id: 'model-standard', name: 'Standard Model', price: '₹4,500' },
        { id: 'model-basic-plus', name: 'Basic Plus Model', price: '₹4,000' },
        { id: 'model-basic', name: 'Basic Model', price: '₹3,500' },
        { id: 'model-entry', name: 'Entry Level Model', price: '₹2,500' }
      ];
    }
  };

  const handleModelSelect = (model) => {
    try {
      setSelectedModelId(model.id);
      
      // Show toast for model selection
      toast.success(`Selected model: ${model.name}`);
      
      // Check if callback exists
      if (typeof onModelSelect !== 'function') {
        toast.error('Error: Cannot proceed with model selection');
        return;
      }
      
      // Call the parent component's onModelSelect function
      onModelSelect(model);
    } catch (error) {
      toast.error(`Error selecting model: ${error.message}`);
    }
  };

  if (!brand || !brand.id) {
    return (
      <div className="bg-gradient-to-b from-[#111] to-[#191919] border border-[#333] rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Select Model</h3>
        <p className="text-gray-400">Please select a brand first</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-b from-[#111] to-[#191919] border border-[#333] rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Select Model</h3>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#e60012]"></div>
        </div>
      </div>
    );
  }

  if (models.length === 0) {
    return (
      <div className="bg-gradient-to-b from-[#111] to-[#191919] border border-[#333] rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Select Model</h3>
        <p className="text-gray-400">No models available for {brand.name}</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-[#111] to-[#191919] border border-[#333] rounded-lg p-6 shadow-lg">
      <h3 className="text-xl font-semibold text-white mb-4">Select Model for {brand.name}</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {models.map((model) => (
          <div
            key={model.id}
            onClick={() => handleModelSelect(model)}
            className={`flex flex-col p-4 rounded-lg cursor-pointer transition-all ${
              selectedModelId === model.id
                ? 'bg-[#e60012] border-2 border-[#ff6b6b]'
                : 'bg-[#222] border border-[#333] hover:border-[#444] hover:bg-[#2a2a2a]'
            }`}
          >
            <div className="flex items-center mb-3">
              {model.photoURL ? (
                <div className="w-12 h-12 mr-3 flex items-center justify-center">
                  <img
                    src={model.photoURL}
                    alt={model.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : null}
              
              <h4 className={`font-medium ${
                selectedModelId === model.id ? 'text-white' : 'text-gray-200'
              }`}>
                {model.name}
              </h4>
            </div>
            
            {model.description && (
              <div className="mt-auto pt-2">
                <span className={`text-sm ${
                  selectedModelId === model.id ? 'text-white' : 'text-gray-400'
                }`}>
                  {model.description}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 