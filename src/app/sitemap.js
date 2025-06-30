import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/firebase/config'

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://callmibro.com'
  
  // Static routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/spare-parts`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/shop-registration`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/profile`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/orders`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/payment`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // Service-specific routes (based on your services)
  const serviceRoutes = [
    'smartphone-repair',
    'laptop-repair', 
    'tv-repair',
    'ac-repair',
    'refrigerator-repair',
    'washing-machine-repair',
    'microwave-repair',
    'printer-repair',
    'tablet-repair',
    'gaming-console-repair',
  ].map((service) => ({
    url: `${baseUrl}/services/${service}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // Booking routes
  const bookingRoutes = [
    {
      url: `${baseUrl}/services/booking`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/services/booking-confirmation`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // Dynamic routes from database
  let dynamicRoutes = []

  try {
    // Get approved shop owners for inventory pages
    const shopOwnersSnapshot = await getDocs(collection(db, 'shopOwners'))
    const shopOwners = shopOwnersSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(shop => shop.status === 'approved' && shop.hasInventory)

    // Add shop inventory pages
    const shopInventoryRoutes = shopOwners.map((shop) => ({
      url: `${baseUrl}/shop-inventory/${shop.id}`,
      lastModified: new Date(shop.updatedAt?.toDate?.() || shop.createdAt?.toDate?.() || new Date()),
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

    // Get technicians for technician detail pages
    const techniciansSnapshot = await getDocs(collection(db, 'technicians'))
    const technicians = techniciansSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(tech => tech.status === 'approved')

    // Add technician detail pages
    const technicianRoutes = technicians.map((tech) => ({
      url: `${baseUrl}/technicians/${tech.id}`,
      lastModified: new Date(tech.updatedAt?.toDate?.() || tech.createdAt?.toDate?.() || new Date()),
      changeFrequency: 'monthly',
      priority: 0.6,
    }))

    // Get spare parts for spare parts detail pages
    const sparePartsSnapshot = await getDocs(collection(db, 'spareParts'))
    const spareParts = sparePartsSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(part => part.isActive)

    // Add spare parts detail pages
    const sparePartsDetailRoutes = spareParts.map((part) => ({
      url: `${baseUrl}/spare-parts/${part.id}`,
      lastModified: new Date(part.updatedAt?.toDate?.() || part.createdAt?.toDate?.() || new Date()),
      changeFrequency: 'weekly',
      priority: 0.6,
    }))

    dynamicRoutes = [
      ...shopInventoryRoutes,
      ...technicianRoutes,
      ...sparePartsDetailRoutes,
    ]
  } catch (error) {
    console.error('Error fetching dynamic routes for sitemap:', error)
    // Continue without dynamic routes if there's an error
  }

  // Admin routes (if you want them indexed)
  const adminRoutes = [
    {
      url: `${baseUrl}/admin`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/admin/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  // Combine all routes
  const allRoutes = [
    ...staticRoutes,
    ...serviceRoutes,
    ...bookingRoutes,
    ...dynamicRoutes,
    ...adminRoutes,
  ]

  return allRoutes
} 