/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    eslint: {
        ignoreDuringBuilds: true,
    },
    async rewrites() {
        return {
            fallback: [
                {
                    source: '/api/graphql',
                    destination: process.env.NEXT_PUBLIC_ENDPOINT + '/graphql',
                },
                {
                    source: '/api/forgot/send',
                    destination: process.env.NEXT_PUBLIC_ENDPOINT + '/forgot/send',
                },
                {
                    source: '/api/forgot/',
                    destination: process.env.NEXT_PUBLIC_ENDPOINT + '/forgot/',
                }
            ],
        };
    },
};

module.exports = nextConfig;
