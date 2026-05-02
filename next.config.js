/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'pub-2814684ce1d74daeb80ca303dbb330e0.r2.dev',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'firebasestorage.googleapis.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'storage.googleapis.com',
                pathname: '/**',
            }
        ],
    },
};

module.exports = nextConfig;
