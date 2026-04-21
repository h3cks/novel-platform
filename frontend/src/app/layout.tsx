import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import Providers from "@/components/providers/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "NovelHub",
  description: "Платформа для читання та публікації новел",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
    <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
    <Providers>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                fontSize: '16px',
                padding: '16px',
                maxWidth: '500px',
              },

              error: {
                duration: 5000,
                style: {
                  background: '#FEF2F2',
                  color: '#991B1B',
                  border: '1px solid #F87171',
                },
              },

              success: {
                style: {
                  background: '#F0FDF4',
                  color: '#166534',
                  border: '1px solid #4ADE80',
                },
              },
            }}
          />
        </main>
      </div>
    </Providers>
    </body>
    </html>
  );
}