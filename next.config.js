/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable CORS for embedding as widget
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
  // API Rewrites: Proxy /api/* requests to FastAPI backend
  async rewrites() {
    const internalApiUrl = process.env.INTERNAL_API_URL || 'http://localhost:5055'
    console.log(`[Next.js Rewrites] Proxying /api/* to ${internalApiUrl}/api/*`)
    return [
      {
        source: '/api/:path*',
        destination: `${internalApiUrl}/api/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
