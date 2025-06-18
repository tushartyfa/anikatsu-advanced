/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Environment variables here
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  }
};

export default nextConfig;
