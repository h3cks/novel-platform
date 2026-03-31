'use client';

import { useReaderStore } from '@/store/useReaderStore';
import { useEffect, useState } from 'react';

export const ReaderSettings = () => {
  const { fontSize, theme, setFontSize, setTheme } = useReaderStore();

  // Запобігання помилці Hydration (клієнт/сервер невідповідність через localStorage)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null; // Не рендеримо на сервері

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">

      {/* Налаштування шрифту */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Шрифт:</span>
        <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-md overflow-hidden">
          <button
            onClick={() => setFontSize(Math.max(12, fontSize - 2))}
            className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition"
            aria-label="Зменшити шрифт"
          >
            A-
          </button>
          <span className="px-3 py-1 text-sm font-medium text-gray-800 dark:text-gray-100 border-x border-gray-200 dark:border-gray-600">
            {fontSize}px
          </span>
          <button
            onClick={() => setFontSize(Math.min(32, fontSize + 2))}
            className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition"
            aria-label="Збільшити шрифт"
          >
            A+
          </button>
        </div>
      </div>

      {/* Налаштування теми */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTheme('light')}
          className={`w-8 h-8 rounded-full border-2 ${theme === 'light' ? 'border-blue-500' : 'border-gray-200'} bg-white`}
          title="Світла тема"
        />
        <button
          onClick={() => setTheme('sepia')}
          className={`w-8 h-8 rounded-full border-2 ${theme === 'sepia' ? 'border-blue-500' : 'border-gray-200'} bg-[#f4ecd8]`}
          title="Тема Сепія"
        />
        <button
          onClick={() => setTheme('dark')}
          className={`w-8 h-8 rounded-full border-2 ${theme === 'dark' ? 'border-blue-500' : 'border-gray-700'} bg-gray-900`}
          title="Темна тема"
        />
      </div>
    </div>
  );
};