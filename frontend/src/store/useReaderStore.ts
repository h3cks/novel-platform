import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'sepia' | 'dark';

interface ReaderState {
  fontSize: number;
  theme: Theme;
  setFontSize: (size: number) => void;
  setTheme: (theme: Theme) => void;
}

export const useReaderStore = create<ReaderState>()(
  persist(
    (set) => ({
      fontSize: 18, // Базовий розмір у пікселях
      theme: 'light',
      setFontSize: (size) => set({ fontSize: size }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'novelhub-reader-settings',
    }
  )
);