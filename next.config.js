/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'pub-2814684ce1d74daeb80ca303dbb330e0.r2.dev',
                pathname: '/**',
            },
        ],
    },
};

module.exports = nextConfig;
