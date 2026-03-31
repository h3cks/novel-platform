'use client';

import { useState } from 'react';
import { useCreateComment } from '../hooks/useCreateComment';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import Link from 'next/link';

interface CommentFormProps {
  novelId?: string;
  chapterId?: string;
  parentId?: number;
  placeholder?: string;
  onSuccess?: () => void;
  autoFocus?: boolean;
}

export const CommentForm = ({ novelId, chapterId, parentId, placeholder = 'Написати коментар...', onSuccess, autoFocus }: CommentFormProps) => {
  const [text, setText] = useState('');
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const { mutate: createComment, isPending } = useCreateComment({ novelId, chapterId });

  if (!isAuthenticated) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 text-center">
        <p className="text-gray-600 mb-3">Увійдіть, щоб залишити коментар</p>
        <Link href="/auth/login" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 transition">
          Увійти
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    createComment(
      {
        text,
        novelId: novelId ? Number(novelId) : undefined,
        chapterId: chapterId ? Number(chapterId) : undefined,
        parentId
      },
      {
        onSuccess: () => {
          setText('');
          if (onSuccess) onSuccess();
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isPending}
        autoFocus={autoFocus}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-y min-h-[100px] disabled:bg-gray-50"
      />
      <div className="flex justify-end gap-2">
        {onSuccess && ( // Якщо є onSuccess, значить це форма відповіді (Reply), показуємо кнопку Скасувати
          <button
            type="button"
            onClick={onSuccess}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md font-medium transition"
          >
            Скасувати
          </button>
        )}
        <button
          type="submit"
          disabled={isPending || !text.trim()}
          className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isPending ? 'Відправка...' : 'Відправити'}
        </button>
      </div>
    </form>
  );
};