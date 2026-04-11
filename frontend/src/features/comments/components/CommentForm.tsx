'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useCreateComment } from '../hooks/useCreateComment';
import Link from 'next/link';

interface CommentFormProps {
  novelId?: string;
  chapterId?: string;
  parentId?: number;
  onSuccess?: () => void;
  placeholder?: string;
}

export const CommentForm = ({ novelId, chapterId, parentId, onSuccess, placeholder = "Написати коментар..." }: CommentFormProps) => {
  const [text, setText] = useState('');
  const [mounted, setMounted] = useState(false);
  const { user } = useAuthStore();

  const { mutate: createComment, isPending } = useCreateComment({ novelId, chapterId });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-[120px] bg-slate-50 rounded-2xl animate-pulse border border-slate-100"></div>;
  }

  if (!user) {
    return (
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
        <p className="text-slate-600 mb-3">Увійдіть, щоб залишити коментар</p>
        <Link href="/auth/login" className="inline-block bg-indigo-600 text-white font-semibold px-6 py-2 rounded-xl hover:bg-indigo-700 transition-colors">
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
        placeholder={placeholder}
        disabled={isPending}
        className="w-full p-4 border border-slate-200 rounded-2xl resize-y min-h-[120px] focus:ring-2 focus:ring-indigo-500 outline-none"
      />
      <div className="flex justify-end gap-2">
        {parentId && onSuccess && (
          <button
            type="button"
            onClick={onSuccess}
            className="px-5 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl"
          >
            Скасувати
          </button>
        )}
        <button
          type="submit"
          disabled={isPending || !text.trim()}
          className="bg-indigo-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {isPending ? 'Відправка...' : 'Відправити'}
        </button>
      </div>
    </form>
  );
};