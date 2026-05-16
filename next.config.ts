// next.config.mjs
/** @type {import('next').NextConfig} */
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // ✅ Configure local patterns for static images and API endpoints
    localPatterns: [
      {
        pathname: '/**', // Allow all static images in public folder
      },
      {
        pathname: '/api/hero-image/**', // Allow hero slider images
      },
      {
        pathname: '/api/news-image/**', // Allow news article images
      },
    ],
    // Optional: Configure remote patterns if you use external images
    remotePatterns: [
      // Add any external image domains here if needed
      // {
      //   protocol: 'https',
      //   hostname: '**',
      // },
    ],
    // Optional: Set device sizes for responsive images
    deviceSizes: [640, 768, 1024, 1280, 1536],
    imageSizes: [16, 32, 48, 64, 96],
  },
};
 
export default nextConfig;