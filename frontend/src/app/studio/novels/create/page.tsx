'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { novelsService } from '@/features/novels/api/novels.service';

export default function CreateNovelPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const createMutation = useMutation({
    mutationFn: novelsService.createNovel,
    onSuccess: (data) => {
      // После создания перенаправляем на страницу управления этой книгой
      router.push(`/studio/novels/${data.id}`);
    },
    onError: (error: any) => {
      setErrorMsg(error.response?.data?.message || 'Ошибка при создании книги.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    createMutation.mutate({ title, description, coverUrl });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Создать новую книгу</h1>
        <p className="mt-1 text-sm text-slate-500">Добавьте базовую информацию о вашей будущей новелле.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-2xl shadow-sm ring-1 ring-slate-200">
        {errorMsg && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200">
            {errorMsg}
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
            Название книги <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            required
            className="block w-full rounded-lg border-0 py-2.5 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm px-3"
            placeholder="Введите название..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="coverUrl" className="block text-sm font-medium text-slate-700 mb-1">
            URL Обложки (необязательно)
          </label>
          <input
            id="coverUrl"
            type="url"
            className="block w-full rounded-lg border-0 py-2.5 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm px-3"
            placeholder="https://example.com/cover.jpg"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
            Аннотация / Описание
          </label>
          <textarea
            id="description"
            rows={5}
            className="block w-full rounded-lg border-0 py-2.5 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm px-3"
            placeholder="О чем ваша история?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="inline-flex justify-center rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
          >
            {createMutation.isPending ? 'Создание...' : 'Создать книгу'}
          </button>
        </div>
      </form>
    </div>
  );
}