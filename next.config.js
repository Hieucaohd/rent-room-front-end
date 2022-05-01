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
                    source: '/api/forget/send',
                    destination: process.env.NEXT_PUBLIC_ENDPOINT + '/forget/send',
                },
                {
                    source: '/api/forget/',
                    destination: process.env.NEXT_PUBLIC_ENDPOINT + '/forget/',
                }
            ],
        };
    },
};

module.exports = nextConfig;
