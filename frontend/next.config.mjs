/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com', // Дозволяємо аватарки Google
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;