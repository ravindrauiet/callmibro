import withPWA from 'next-pwa'

// Configuration for PWA
const pwaConfig = {
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
}

/** @type {import('next').NextConfig} */
const nextConfig = withPWA(pwaConfig)({
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd57avc95tvxyg.cloudfront.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'graph.facebook.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'platform-lookaside.fbsbx.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.cloudfront.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
        port: '',
        pathname: '/**',
      }
    ],
    domains: [
      'd57avc95tvxyg.cloudfront.net',
      'images.unsplash.com',
      'firebasestorage.googleapis.com',
      'lh3.googleusercontent.com',
      'graph.facebook.com',
      'platform-lookaside.fbsbx.com',
      'www.shutterstock.com'
    ]
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Enable React strict mode for development
  reactStrictMode: true,
  // Disable x-powered-by header for security
  poweredByHeader: false,
  // Configure headers for security and caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          }
        ],
      },
    ]
  },
  async rewrites() {
    return [
      {
        // The main Firebase Auth handler
        source: '/__/auth/:path*',
        destination: 'https://callmibro.firebaseapp.com/__/auth/:path*'
      },
      {
        // Handle auth for www subdomain
        source: '/www.callmibro.com/__/auth/:path*',
        destination: 'https://callmibro.firebaseapp.com/__/auth/:path*'
      },
      {
        // Handle auth for root domain
        source: '/callmibro.com/__/auth/:path*',
        destination: 'https://callmibro.firebaseapp.com/__/auth/:path*'
      },
      {
        // Handle auth callback
        source: '/auth/callback',
        destination: '/auth/callback'
      }
    ];
  },
})

export default nextConfig
