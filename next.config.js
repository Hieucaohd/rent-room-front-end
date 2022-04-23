/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
     // Warning: This allows production builds to successfully complete even if
     // your project has ESLint errors.
     ignoreDuringBuilds: true,
  },
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
