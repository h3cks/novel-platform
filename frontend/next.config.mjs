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
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/**', // Дозволяє всі шляхи, включаючи /uploads/
      },
      {
        protocol: 'https',
        hostname: 'placehold.co', // Додаємо дозвіл для placehold.co
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;