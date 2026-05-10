'use client';

import { useReaderStore } from '@/store/useReaderStore';
import { useEffect, useState } from 'react';

export const ReaderSettings = () => {
  const { fontSize, theme, setFontSize, setTheme } = useReaderStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  // Динамічні стилі для панелі залежно від вибраної теми
  const panelStyles =
    theme === 'dark' ? 'bg-white/5 border-white/10 text-gray-300' :
      theme === 'sepia' ? 'bg-[#eaddc5] border-[#d4c5b0] text-[#5b4636]' :
        'bg-white border-gray-200 text-gray-700';

  const buttonStyles =
    theme === 'dark' ? 'hover:bg-white/10 border-white/20 text-gray-300' :
      theme === 'sepia' ? 'hover:bg-[#dbcbae] border-[#d4c5b0] text-[#5b4636]' :
        'hover:bg-gray-100 border-gray-200 text-gray-700';

  return (
    <div className={`flex flex-wrap items-center justify-between gap-4 p-4 mb-10 rounded-xl shadow-sm border transition-colors duration-300 ${panelStyles}`}>

      {/* Налаштування шрифту */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold opacity-80">Розмір тексту:</span>
        <div className="flex items-center rounded-lg overflow-hidden border border-inherit">
          <button
            onClick={() => setFontSize(Math.max(12, fontSize - 2))}
            className={`px-4 py-1.5 font-bold transition-colors ${buttonStyles}`}
            aria-label="Зменшити шрифт"
          >
            A-
          </button>
          <span className={`px-4 py-1.5 text-sm font-bold border-x border-inherit`}>
            {fontSize}px
          </span>
          <button
            onClick={() => setFontSize(Math.min(32, fontSize + 2))}
            className={`px-4 py-1.5 font-bold transition-colors ${buttonStyles}`}
            aria-label="Збільшити шрифт"
          >
            A+
          </button>
        </div>
      </div>

      {/* Налаштування теми */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold opacity-80">Фон:</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme('light')}
            className={`w-9 h-9 rounded-full border-2 transition-all ${theme === 'light' ? 'border-indigo-500 scale-110' : 'border-gray-200 hover:scale-105'} bg-white`}
            title="Світла тема"
          />
          <button
            onClick={() => setTheme('sepia')}
            className={`w-9 h-9 rounded-full border-2 transition-all ${theme === 'sepia' ? 'border-indigo-500 scale-110' : 'border-gray-300 hover:scale-105'} bg-[#f4ecd8]`}
            title="Тема Сепія"
          />
          <button
            onClick={() => setTheme('dark')}
            className={`w-9 h-9 rounded-full border-2 transition-all ${theme === 'dark' ? 'border-indigo-500 scale-110' : 'border-gray-700 hover:scale-105'} bg-[#1a1a1a]`}
            title="Темна тема"
          />
        </div>
      </div>

    </div>
  );
};