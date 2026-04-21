'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/features/admin/api/admin.service';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function AdminNovelDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data: novel, isLoading } = useQuery({
    queryKey: ['admin-novel-detail', id],
    queryFn: () => adminService.getAdminNovelDetail(Number(id)),
  });

  const blockMutation = useMutation({
    mutationFn: () => adminService.blockNovel(Number(id), novel.flagged ? 'unblock' : 'violation'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-novel-detail'] });
      toast.success('Статус змінено');
    }
  });

  if (isLoading) return <div className="p-8 text-center">Завантаження...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Картка новели */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="md:flex">
          <div className="md:w-64 h-80 bg-gray-200 shrink-0">
            {novel.coverUrl ? (
              <img src={novel.coverUrl} className="w-full h-full object-cover" alt="Cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">Без обкладинки</div>
            )}
          </div>
          <div className="p-8 flex-1 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold">{novel.title}</h1>
                <p className="text-gray-500">Автор: <Link href={`/admin/users/${novel.authorId}`} className="text-indigo-600 hover:underline">{novel.author.username}</Link></p>
              </div>
              <button
                onClick={() => blockMutation.mutate()}
                className={`px-6 py-2 rounded-lg font-bold text-white transition ${novel.flagged ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {novel.flagged ? 'Розблокувати твір' : 'Заблокувати твір'}
              </button>
            </div>

            <div className="flex gap-2">
              {novel.genres.map((g: any) => (
                <span key={g.genreId} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded">{g.genre.name}</span>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-100">
              <div className="text-center">
                <p className="text-xs text-gray-400 uppercase">Розділів</p>
                <p className="font-bold text-xl">{novel.chapters.length}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400 uppercase">Коментарів</p>
                <p className="font-bold text-xl">{novel._count.comments}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400 uppercase">Підписників</p>
                <p className="font-bold text-xl">{novel._count.followers}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Список глав */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold mb-4">Останні глави</h3>
          <div className="space-y-3">
            {novel.chapters.slice(0, 10).map((ch: any) => (
              <div key={ch.id} className="flex justify-between text-sm p-2 hover:bg-gray-50 rounded">
                <span>{ch.order}. {ch.title}</span>
                <span className="text-gray-400">{new Date(ch.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Скарги на цю новелу */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold mb-4 text-red-600">🚩 Скарги користувачів</h3>
          <div className="space-y-4">
            {novel.reports.length === 0 ? (
              <p className="text-center text-gray-400 py-8">Скарг немає</p>
            ) : (
              novel.reports.map((r: any) => (
                <div key={r.id} className="p-3 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex justify-between text-xs font-bold text-red-700">
                    <span>{r.reason}</span>
                    <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-red-600 mt-1">{r.detail}</p>
                  <p className="text-[10px] text-gray-400 mt-2">Від: @{r.reporter.username}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}