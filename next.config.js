/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Enable built-in image optimization
    formats: ['image/webp', 'image/avif'],
    
    // Responsive image sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // Cache optimization
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  
  // Optional: Enable experimental features
  experimental: {
    optimizePackageImports: ['@/components', '@/utils'],
  },
}

module.exports = nextConfig