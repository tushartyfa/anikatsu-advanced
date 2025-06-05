/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_CORSPROXY_URL: process.env.CORSPROXY_URL,
  },
  images: {
    domains: [
      'via.placeholder.com',
      'gogocdn.net',
      'cdnjs.cloudflare.com',
      'img.zorores.com',
      'poster.zoros.to',
      'cdn.myanimelist.net',
      's4.anilist.co',
      'artworks.thetvdb.com',
      'image.tmdb.org',
      'justanimeapi.vercel.app',
      'consumet.org',
      'api.consumet.org',
      'img.flixhq.to',
      'img.bflix.to',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true,
  },
  experimental: {
    scrollRestoration: true,
  },
  serverExternalPackages: ['puppeteer-core'],
  async rewrites() {
    // Get the API URL from environment variable or use default
    const apiUrl = process.env.ANIWATCH_API;
    // Extract the base URL without the /api/v2/hianime path
    const baseUrl = apiUrl.replace('/api/v2/hianime', '');
    
    return [
      {
        source: '/api/v2/hianime/:path*',
        destination: `${apiUrl}/:path*`
      },
      {
        source: '/api/anime/:path*',
        destination: `${apiUrl}/anime/:path*`
      }
    ]
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
          { key: 'Referrer-Policy', value: 'no-referrer-when-downgrade' },
          { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        ],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'Referrer-Policy', value: 'no-referrer-when-downgrade' },
          { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        ]
      }
    ];
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: [{ loader: '@svgr/webpack', options: { icon: true } }],
    });
    return config;
  },
};

module.exports = nextConfig; 