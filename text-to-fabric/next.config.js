/** @type {import('next').NextConfig} */
const nextConfig = {
  // When served under Showcase1.0 (e.g. GitHub Pages at /Showcase1.0/)
  basePath: process.env.NODE_ENV === 'production' ? '/Showcase1.0/text-to-fabric' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/Showcase1.0/text-to-fabric' : '',
  output: 'export',
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    
    // Ensure Three.js is properly externalized
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    
    return config;
  },
  // Disable server-side rendering for pages that use Three.js
  experimental: {
    esmExternals: 'loose',
  },
};

module.exports = nextConfig;

