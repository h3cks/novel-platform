import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css'; // Переконайтеся, що шлях правильний
import Providers from '@/components/providers/Providers';
import { Navbar } from '@/components/layout/Navbar';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'NovelHub',
  description: 'Платформа для читання та публікації новел',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
    <body className={`${inter.className} bg-gray-50 text-gray-900`}>
    <Providers>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </Providers>
    </body>
    </html>
  );
}