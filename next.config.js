/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Increase payload limit for server actions
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
}

module.exports = nextConfig