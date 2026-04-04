'use client';

import { useState, useEffect, useRef } from 'react';
import { apiClient } from '@/lib/axios';

interface Tag { id: number; name: string; }
interface TagAutocompleteProps {
  selectedTags: Tag[]; // Тут зберігаємо повні об'єкти тегів для відображення назв
  onChange: (tags: Tag[]) => void;
  max?: number;
  disabled?: boolean;
}

export const TagAutocomplete = ({ selectedTags, onChange, max = 20, disabled }: TagAutocompleteProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Tag[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Закриття кліком поза компонентом
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Пошук тегів з бекенду (Debounce імітація)
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const { data } = await apiClient.get('/meta/tags', { params: { query, limit: 10 } });
        setResults(data.data.items || []);
        setIsOpen(true);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (tag: Tag) => {
    if (selectedTags.length >= max) return;
    if (!selectedTags.find((t) => t.id === tag.id)) {
      onChange([...selectedTags, tag]);
    }
    setQuery('');
    setIsOpen(false);
  };

  const handleRemove = (id: number) => {
    onChange(selectedTags.filter((t) => t.id !== id));
  };

  return (
    <div ref={wrapperRef} className="relative">
      {/* Відображення обраних тегів */}
      <div className="flex flex-wrap gap-2 mb-3">
        {selectedTags.map((tag) => (
          <span key={tag.id} className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-3 py-1 rounded-md text-sm border border-slate-200">
            {tag.name}
            <button type="button" onClick={() => handleRemove(tag.id)} className="text-slate-400 hover:text-red-500 ml-1">✕</button>
          </span>
        ))}
      </div>

      {/* Інпут пошуку */}
      <input
        type="text"
        disabled={disabled || selectedTags.length >= max}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.trim() && setIsOpen(true)}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
        placeholder={selectedTags.length >= max ? "Досягнуто ліміт тегів" : "Почніть вводити назву тега (напр. Магія)..."}
      />

      {/* Випадаючий список */}
      {isOpen && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
          {isLoading ? (
            <li className="px-4 py-3 text-slate-500 text-sm">Пошук...</li>
          ) : results.length > 0 ? (
            results.map((tag) => (
              <li
                key={tag.id}
                onClick={() => handleSelect(tag)}
                className="px-4 py-2.5 hover:bg-indigo-50 cursor-pointer text-sm text-slate-700"
              >
                {tag.name}
              </li>
            ))
          ) : (
            <li className="px-4 py-3 text-slate-500 text-sm">Тегів не знайдено</li>
          )}
        </ul>
      )}
    </div>
  );
};