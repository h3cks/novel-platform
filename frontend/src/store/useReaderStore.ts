import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'sepia';

interface ReaderState {
  fontSize: number;
  theme: Theme;
  setFontSize: (size: number) => void;
  setTheme: (theme: Theme) => void;
}

export const useReaderStore = create<ReaderState>()(
  persist(
    (set) => ({
      fontSize: 18, // Розмір тексту за замовчуванням
      theme: 'light',
      setFontSize: (size) => set({ fontSize: Math.max(12, Math.min(size, 32)) }), // Обмеження від 12 до 32px
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'reader-settings' }
  )
);