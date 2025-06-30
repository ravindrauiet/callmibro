import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'
import ToastProvider from '@/components/ToastProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'CallMiBro - Professional Device Repair Services',
  description: 'Expert technicians for smartphones, laptops, TVs, and home appliances repair. Fast, reliable, and affordable service across India. Book online repair services today!',
  keywords: 'device repair, smartphone repair, laptop repair, TV repair, AC repair, refrigerator repair, washing machine repair, electronics repair, home appliance repair, CallMiBro',
  authors: [{ name: 'CallMiBro Team' }],
  creator: 'CallMiBro',
  publisher: 'CallMiBro',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://callmibro.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'CallMiBro - Professional Device Repair Services',
    description: 'Expert technicians for smartphones, laptops, TVs, and home appliances repair. Fast, reliable, and affordable service across India.',
    url: 'https://callmibro.com',
    siteName: 'CallMiBro',
    images: [
      {
        url: '/hero.jpg',
        width: 1200,
        height: 630,
        alt: 'CallMiBro - Professional Device Repair Services',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CallMiBro - Professional Device Repair Services',
    description: 'Expert technicians for smartphones, laptops, TVs, and home appliances repair. Fast, reliable, and affordable service.',
    images: ['/hero.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Replace with your actual Google verification code
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/icons/apple-touch-icon.png',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/icons/site.webmanifest" />
        <meta name="theme-color" content="#e60012" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="apple-mobile-web-app-title" content="CallMiBro" />
        <link rel="icon" type="image/svg+xml" href="/icons/callmibro.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="shortcut icon" href="/icons/favicon.ico" />
        
        {/* Structured Data for Local Business */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "CallMiBro",
              "description": "Professional device repair services for smartphones, laptops, TVs, and home appliances",
              "url": "https://callmibro.com",
              "logo": "https://callmibro.com/icons/callmibro.svg",
              "image": "https://callmibro.com/hero.jpg",
              "telephone": "+91-XXXXXXXXXX", // Replace with actual phone number
              "email": "support@callmibro.com", // Replace with actual email
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "IN",
                "addressLocality": "India"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": "20.5937", // Replace with actual coordinates
                "longitude": "78.9629"
              },
              "openingHours": "Mo-Su 08:00-20:00",
              "priceRange": "₹₹",
              "serviceArea": {
                "@type": "Country",
                "name": "India"
              },
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Repair Services",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Smartphone Repair"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Laptop Repair"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "TV Repair"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "AC Repair"
                    }
                  }
                ]
              },
              "sameAs": [
                "https://facebook.com/callmibro",
                "https://twitter.com/callmibro",
                "https://instagram.com/callmibro"
              ]
            })
          }}
        />
        
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/service-worker.js').then(
                    function(registration) {
                      console.log('Service Worker registration successful with scope: ', registration.scope);
                    },
                    function(err) {
                      console.log('Service Worker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider>
            <ToastProvider />
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
