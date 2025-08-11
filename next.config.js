/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Enable built-in image optimization
    formats: ['image/webp', 'image/avif'],
    
    // Responsive image sizes optimized for the artwork
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // Aggressive caching for better performance
    minimumCacheTTL: 60 * 60 * 24 * 60, // 60 days
    
    // Additional optimization
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Compress responses
  compress: true,
  
  // Static optimization
  trailingSlash: false,
  
  // Optional: Enable experimental features
  experimental: {
    optimizePackageImports: ['@/components', '@/utils'],
  },
  
  // Headers for better caching
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      {
        source: '/_next/image',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, s-maxage=31536000, immutable',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig