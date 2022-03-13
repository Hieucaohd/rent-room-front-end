/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return {
      fallback: [
        {
          source: '/api',
          destination: process.env.NEXT_PUBLIC_ENDPOINT,
        },
      ],
    }
  },
}

module.exports = nextConfig