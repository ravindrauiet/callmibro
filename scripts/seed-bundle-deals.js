const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBxGQoBzJqJqJqJqJqJqJqJqJqJqJqJqJq",
  authDomain: "callmibro.firebaseapp.com",
  projectId: "callmibro",
  storageBucket: "callmibro.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefghijklmnop"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sampleBundleDeals = [
  {
    title: "Device Protection Pack",
    description: "Complete protection for your device with premium screen protector, durable case, and extended warranty coverage",
    imageURL: "/product-deals.jpg",
    discount: "20% OFF",
    url: "/deals/protection-pack",
    featured: true,
    isActive: true,
    originalPrice: 2999,
    discountedPrice: 2399,
    validUntil: "2024-12-31",
    includedItems: "Premium screen protector, Shockproof case, Extended warranty (1 year), Free installation",
    terms: "Valid for all device types. Warranty covers manufacturing defects only. Installation available at service centers.",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    title: "Complete Repair Bundle",
    description: "Professional repair service including screen replacement, battery replacement, and comprehensive diagnostic",
    imageURL: "/bundle-deals.jpg",
    discount: "15% OFF",
    url: "/deals/repair-bundle",
    featured: false,
    isActive: true,
    originalPrice: 4999,
    discountedPrice: 4249,
    validUntil: "2024-11-30",
    includedItems: "Screen replacement, Battery replacement, Diagnostic service, 90-day warranty, Free pickup & delivery",
    terms: "Valid for smartphones and tablets. Original parts used. Service available in select cities.",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    title: "Gaming Device Care Package",
    description: "Specialized care package for gaming devices with cooling solutions and performance optimization",
    imageURL: "/product-deals.jpg",
    discount: "25% OFF",
    url: "/deals/gaming-care",
    featured: true,
    isActive: true,
    originalPrice: 3999,
    discountedPrice: 2999,
    validUntil: "2024-10-31",
    includedItems: "Cooling pad, Performance optimization, Thermal paste replacement, Gaming accessories, 6-month warranty",
    terms: "Valid for gaming laptops and desktops. Professional installation required. Limited to specific models.",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    title: "Business Device Maintenance",
    description: "Comprehensive maintenance package for business devices with priority support and data backup",
    imageURL: "/bundle-deals.jpg",
    discount: "30% OFF",
    url: "/deals/business-maintenance",
    featured: false,
    isActive: true,
    originalPrice: 7999,
    discountedPrice: 5599,
    validUntil: "2024-12-31",
    includedItems: "Hardware maintenance, Software optimization, Data backup service, Priority support, 1-year warranty",
    terms: "Valid for business laptops and desktops. On-site service available. Data backup included.",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    title: "Student Device Package",
    description: "Affordable package designed for students with essential repairs and educational software",
    imageURL: "/product-deals.jpg",
    discount: "40% OFF",
    url: "/deals/student-package",
    featured: true,
    isActive: true,
    originalPrice: 2499,
    discountedPrice: 1499,
    validUntil: "2024-09-30",
    includedItems: "Basic repairs, Educational software license, Study apps, Student ID verification required",
    terms: "Valid for students with valid ID. Software licenses valid for 1 year. Limited to 2 repairs per academic year.",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
];

async function seedBundleDeals() {
  try {
    console.log('Starting to seed bundle deals...');
    
    for (const bundleDeal of sampleBundleDeals) {
      const docRef = await addDoc(collection(db, 'bundleDeals'), bundleDeal);
      console.log(`Added bundle deal: ${bundleDeal.title} with ID: ${docRef.id}`);
    }
    
    console.log('Successfully seeded all bundle deals!');
  } catch (error) {
    console.error('Error seeding bundle deals:', error);
  }
}

// Run the seed function
seedBundleDeals(); 