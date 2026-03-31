/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Тимчасово дозволяємо всі домени (для MVP)
      },
    ],
  },
};

export default nextConfig;