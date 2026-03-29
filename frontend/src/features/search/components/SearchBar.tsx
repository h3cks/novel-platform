'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Ініціалізуємо стан значенням з URL, якщо воно є
  const [query, setQuery] = useState(searchParams.get('q') || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Перенаправляємо на сторінку пошуку з параметром q
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      // Якщо рядок порожній, повертаємось до каталогу
      router.push('/novels');
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-md">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <svg
          className="h-5 w-5 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="search"
        className="block w-full rounded-full border-0 py-2 pl-10 pr-3 text-slate-900 bg-slate-100 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-colors"
        placeholder="Пошук новелл..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button type="submit" className="sr-only">Шукати</button>
    </form>
  );
}