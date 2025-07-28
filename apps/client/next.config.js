/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 's.phantomgalaxies.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'ipfs.io',
                port: '',
                pathname: '/**',
            },
        ],
    },
}

export default nextConfig
