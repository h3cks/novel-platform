'use client';

import Link from 'next/link';
import { Bookmark } from '../types';

interface BookmarkItemProps {
  bookmark: Bookmark;
  onRemove: (novelId: number) => void;
}

export const BookmarkItem = ({ bookmark, onRemove }: BookmarkItemProps) => {
  return (
    <div className="flex gap-4 p-4 border border-slate-200 rounded-2xl bg-white hover:shadow-md transition-shadow">
      <div className="w-20 h-28 bg-slate-100 rounded-xl overflow-hidden shrink-0">
        {bookmark.novel.coverUrl ? (
          <img src={bookmark.novel.coverUrl} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">No cover</div>
        )}
      </div>
      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          <Link href={`/novels/${bookmark.novel.id}`} className="text-lg font-bold text-slate-900 hover:text-indigo-600 line-clamp-1">
            {bookmark.novel.title}
          </Link>
          <p className="text-sm text-slate-500 mt-1">Автор: {bookmark.novel.author.username}</p>
        </div>
        <button
          onClick={() => onRemove(bookmark.novelId)}
          className="text-sm font-medium text-red-500 hover:text-red-700 self-start"
        >
          Видалити з бібліотеки
        </button>
      </div>
    </div>
  );
};