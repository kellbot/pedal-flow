/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    basePath: process.env.NODE_ENV === 'production' ? '/pedal-flow' : '',
    images: {
        unoptimized: true
    },
};

export default nextConfig;
