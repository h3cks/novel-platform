'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useState } from 'react';

interface CommentSectionProps {
  novelId?: number;
  chapterId?: number;
}

export const CommentSection = ({ novelId, chapterId }: CommentSectionProps) => {
  const [text, setText] = useState('');
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  // Динамічний ключ кешу та URL залежно від того, де ми знаходимось
  const queryKey = ['comments', novelId ? 'novel' : 'chapter', novelId || chapterId];
  const url = novelId ? `/comments/novel/${novelId}` : `/comments/chapter/${chapterId}`;

  const { data: comments, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data } = await apiClient.get(url);
      return data.data;
    },
    enabled: !!(novelId || chapterId)
  });

  const postComment = useMutation({
    mutationFn: async () => {
      await apiClient.post('/comments', { novelId, chapterId, text });
    },
    onSuccess: () => {
      setText('');
      queryClient.invalidateQueries({ queryKey });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    postComment.mutate();
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border mt-8">
      <h3 className="text-xl font-bold mb-6">Коментарі</h3>

      {/* Форма додавання */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Напишіть свої враження..."
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={postComment.isPending || !text.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {postComment.isPending ? 'Відправка...' : 'Надіслати'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-600 mb-8 border border-dashed">
          Будь ласка, <a href="/login" className="text-blue-600 hover:underline">увійдіть</a>, щоб залишити коментар.
        </div>
      )}

      {/* Список коментарів */}
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-100 rounded-lg"></div>
          <div className="h-20 bg-gray-100 rounded-lg"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {comments?.map((comment: any) => (
            <div key={comment.id} className="flex gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-gray-500">
                {/* Аватарка (перша літера юзера) */}
                {comment.user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-semibold text-gray-900">{comment.user?.username || 'Користувач'}</span>
                  <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
            </div>
          ))}
          {comments?.length === 0 && <p className="text-gray-500">Поки що немає коментарів. Будьте першим!</p>}
        </div>
      )}
    </div>
  );
};