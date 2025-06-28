// Script to seed Firebase with sample spare parts data
// Run this in your browser console or as a Node.js script

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCxgEegetMFGha1ZIcBdLRb0XI7lu5cYiA",
  authDomain: "callmibro.firebaseapp.com",
  projectId: "callmibro",
  storageBucket: "callmibro.appspot.com",
  messagingSenderId: "411367076640",
  appId: "1:411367076640:web:0b654f87bb3d2b65ba5d45"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sampleSpareParts = [
  {
    name: "iPhone 12 Battery",
    deviceCategory: "Mobile Phones",
    brand: "Apple",
    model: "iPhone 12",
    category: "Battery",
    description: "Genuine replacement battery for iPhone 12 with 2815mAh capacity",
    price: 2499.00,
    imageURL: "/phone-battery.jpg",
    stock: 15,
    isActive: true,
    compatibility: "iPhone 12, iPhone 12 Pro",
    specifications: "Capacity: 2815mAh, Voltage: 3.83V, Type: Li-ion",
    featured: true,
    rating: 4.8,
    reviews: 24
  },
  {
    name: "Samsung Galaxy S21 Screen",
    deviceCategory: "Mobile Phones",
    brand: "Samsung",
    model: "Galaxy S21",
    category: "Screen",
    description: "Original AMOLED display replacement for Samsung Galaxy S21",
    price: 8999.00,
    imageURL: "/phone-battery-2.jpg",
    stock: 8,
    isActive: true,
    compatibility: "Samsung Galaxy S21",
    specifications: "6.2 inch Dynamic AMOLED, 2400x1080 resolution",
    featured: true,
    rating: 4.7,
    reviews: 18
  },
  {
    name: "LG OLED TV Remote",
    deviceCategory: "TVs",
    brand: "LG",
    model: "OLED TV",
    category: "Remote",
    description: "Magic Remote for LG OLED TVs with voice control",
    price: 1499.00,
    imageURL: "/tv-remote.jpg",
    stock: 25,
    isActive: true,
    compatibility: "LG OLED TVs, LG Smart TVs",
    specifications: "Bluetooth, Voice Control, Motion Control",
    featured: false,
    rating: 4.5,
    reviews: 32
  },
  {
    name: "Sony Bravia Remote",
    deviceCategory: "TVs",
    brand: "Sony",
    model: "Bravia",
    category: "Remote",
    description: "Universal remote control for Sony Bravia TVs",
    price: 899.00,
    imageURL: "/tv-remote-2.jpg",
    stock: 20,
    isActive: true,
    compatibility: "Sony Bravia TVs",
    specifications: "Infrared, Universal compatibility",
    featured: true,
    rating: 4.3,
    reviews: 15
  },
  {
    name: "Voltas AC PCB",
    deviceCategory: "ACs",
    brand: "Voltas",
    model: "1.5 Ton",
    category: "PCB",
    description: "Main PCB board for Voltas 1.5 ton split AC",
    price: 3499.00,
    imageURL: "/ac-fitter.jpg",
    stock: 12,
    isActive: true,
    compatibility: "Voltas 1.5 Ton Split AC",
    specifications: "Main control board with all functions",
    featured: false,
    rating: 4.6,
    reviews: 9
  },
  {
    name: "Daikin AC Capacitor",
    deviceCategory: "ACs",
    brand: "Daikin",
    model: "2 Ton",
    category: "Capacitor",
    description: "Start capacitor for Daikin 2 ton AC units",
    price: 599.00,
    imageURL: "/ac-fitter.jpg",
    stock: 30,
    isActive: true,
    compatibility: "Daikin 2 Ton AC",
    specifications: "35μF, 450V, Start capacitor",
    featured: false,
    rating: 4.4,
    reviews: 12
  },
  {
    name: "Whirlpool Refrigerator Shelf",
    deviceCategory: "Refrigerators",
    brand: "Whirlpool",
    model: "Double Door",
    category: "Shelf",
    description: "Glass shelf replacement for Whirlpool double door refrigerator",
    price: 799.00,
    imageURL: "/refrigerator-shelf.jpg",
    stock: 10,
    isActive: true,
    compatibility: "Whirlpool Double Door Refrigerators",
    specifications: "Tempered glass, 60cm width",
    featured: true,
    rating: 4.9,
    reviews: 27
  },
  {
    name: "Godrej Refrigerator Door Seal",
    deviceCategory: "Refrigerators",
    brand: "Godrej",
    model: "Single Door",
    category: "Door Seal",
    description: "Magnetic door seal for Godrej single door refrigerator",
    price: 399.00,
    imageURL: "/refrigerator-shelf-2.jpg",
    stock: 14,
    isActive: true,
    compatibility: "Godrej Single Door Refrigerators",
    specifications: "Magnetic seal, 180cm length",
    featured: false,
    rating: 4.8,
    reviews: 19
  },
  {
    name: "Dell Laptop Charger",
    deviceCategory: "Laptops",
    brand: "Dell",
    model: "Inspiron 15",
    category: "Charger",
    description: "65W AC adapter for Dell Inspiron 15 series",
    price: 1299.00,
    imageURL: "/laptop-charger.jpg",
    stock: 8,
    isActive: true,
    compatibility: "Dell Inspiron 15, Latitude series",
    specifications: "65W, 19.5V, 3.34A",
    featured: false,
    rating: 4.5,
    reviews: 18
  },
  {
    name: "HP Laptop Battery",
    deviceCategory: "Laptops",
    brand: "HP",
    model: "Pavilion",
    category: "Battery",
    description: "Replacement battery for HP Pavilion laptops",
    price: 2499.00,
    imageURL: "/laptop-charger-2.jpg",
    stock: 6,
    isActive: true,
    compatibility: "HP Pavilion series",
    specifications: "6-cell, 4400mAh, Li-ion",
    featured: true,
    rating: 4.7,
    reviews: 14
  },
  {
    name: "iPad Air Screen",
    deviceCategory: "Tablets",
    brand: "Apple",
    model: "iPad Air",
    category: "Screen",
    description: "Retina display replacement for iPad Air",
    price: 5999.00,
    imageURL: "/phone-battery.jpg",
    stock: 5,
    isActive: true,
    compatibility: "iPad Air (4th generation)",
    specifications: "10.9 inch Retina display, 2360x1640",
    featured: true,
    rating: 4.6,
    reviews: 8
  },
  {
    name: "Samsung Tab S7 Charger",
    deviceCategory: "Tablets",
    brand: "Samsung",
    model: "Galaxy Tab S7",
    category: "Charger",
    description: "Fast charging adapter for Samsung Galaxy Tab S7",
    price: 899.00,
    imageURL: "/laptop-charger.jpg",
    stock: 12,
    isActive: true,
    compatibility: "Samsung Galaxy Tab S7, S7+",
    specifications: "25W, USB-C, Fast charging",
    featured: false,
    rating: 4.4,
    reviews: 11
  }
];

async function seedSpareParts() {
  try {
    console.log('Starting to seed spare parts data...');
    
    for (const part of sampleSpareParts) {
      const docRef = await addDoc(collection(db, 'spareParts'), {
        ...part,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log(`Added spare part: ${part.name} with ID: ${docRef.id}`);
    }
    
    console.log('Successfully seeded all spare parts data!');
  } catch (error) {
    console.error('Error seeding spare parts:', error);
  }
}

// Uncomment the line below to run the seeding
// seedSpareParts();

export { seedSpareParts }; 