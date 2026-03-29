'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { chaptersService } from '@/features/chapters/api/chapters.service';
import Link from 'next/link';

export default function CreateChapterPage() {
  const { id: novelId } = useParams();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [order, setOrder] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');

  const createMutation = useMutation({
    mutationFn: chaptersService.createChapter,
    onSuccess: () => {
      // Після успішного створення повертаємося до панелі керування книгою
      router.push(`/studio/novels/${novelId}`);
    },
    onError: (error: any) => {
      setErrorMsg(error.response?.data?.message || 'Помилка при збереженні розділу.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    createMutation.mutate({
      novelId: Number(novelId),
      title,
      content,
      order: Number(order)
    });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Написати новий розділ</h1>
          <p className="mt-1 text-sm text-slate-500">Додайте новий контент до вашої новели.</p>
        </div>
        <Link
          href={`/studio/novels/${novelId}`}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          Скасувати
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-2xl shadow-sm ring-1 ring-slate-200">
        {errorMsg && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-3">
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
              Назва розділу <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              required
              className="block w-full rounded-lg border-0 py-2.5 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm px-3"
              placeholder="Розділ 1. Початок подорожі"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="md:col-span-1">
            <label htmlFor="order" className="block text-sm font-medium text-slate-700 mb-1">
              Порядковий номер
            </label>
            <input
              id="order"
              type="number"
              min="1"
              required
              className="block w-full rounded-lg border-0 py-2.5 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm px-3"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
            />
          </div>
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-slate-700 mb-1">
            Текст розділу <span className="text-red-500">*</span>
          </label>
          <div className="rounded-lg border border-slate-300 focus-within:ring-2 focus-within:ring-indigo-600 focus-within:border-transparent">
            {/* Панель інструментів (візуальна заглушка для майбутнього Rich Text Editor) */}
            <div className="bg-slate-50 border-b border-slate-300 px-3 py-2 rounded-t-lg text-sm text-slate-500 flex gap-2">
              <button type="button" className="px-2 py-1 hover:bg-slate-200 rounded font-bold">B</button>
              <button type="button" className="px-2 py-1 hover:bg-slate-200 rounded italic">I</button>
            </div>
            <textarea
              id="content"
              required
              rows={20}
              className="block w-full border-0 py-3 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm px-4 resize-y rounded-b-lg font-serif"
              placeholder="Почніть писати вашу історію тут..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500 flex justify-end">
            Кількість символів: {content.length}
          </p>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="inline-flex justify-center rounded-lg bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
          >
            {createMutation.isPending ? 'Збереження...' : 'Опублікувати розділ'}
          </button>
        </div>
      </form>
    </div>
  );
}