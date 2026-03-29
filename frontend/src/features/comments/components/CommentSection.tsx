'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsService } from '@/features/comments/api/comments.service';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { Comment } from '../types';

interface CommentSectionProps {
  novelId?: number;
  chapterId?: number;
}

export function CommentSection({ novelId, chapterId }: CommentSectionProps) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  const [newCommentText, setNewCommentText] = useState('');

  const queryKey = ['comments', { novelId, chapterId }];

  const { data: comments, isLoading } = useQuery({
    queryKey,
    queryFn: () => commentsService.getComments({ novelId, chapterId }),
    enabled: !!novelId || !!chapterId,
  });

  const createMutation = useMutation({
    mutationFn: commentsService.createComment,
    onSuccess: () => {
      setNewCommentText('');
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    createMutation.mutate({ novelId, chapterId, text: newCommentText });
  };

  if (isLoading) return <div className="py-8 text-center text-slate-500">Завантаження коментарів...</div>;

  return (
    <div className="mt-12 w-full max-w-4xl mx-auto">
      <h3 className="text-xl font-bold text-slate-900 mb-6">
        Коментарі ({comments?.length || 0})
      </h3>

      {/* Форма додавання нового коментаря */}
      {isAuthenticated() ? (
        <form onSubmit={handleSubmit} className="mb-8 flex gap-4 items-start">
          <div className="w-10 h-10 bg-slate-200 rounded-full flex-shrink-0 overflow-hidden">
            {/* Заглушка для аватара поточного юзера */}
            <svg className="w-full h-full text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </div>
          <div className="flex-1">
            <textarea
              rows={3}
              className="block w-full rounded-lg border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm px-3 resize-y"
              placeholder="Напишіть ваш коментар..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
            />
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                disabled={createMutation.isPending || !newCommentText.trim()}
                className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
              >
                {createMutation.isPending ? 'Надсилання...' : 'Надіслати'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-slate-50 rounded-lg text-center border border-slate-200 text-sm text-slate-600">
          Будь ласка, <a href="/auth/login" className="text-indigo-600 font-semibold hover:underline">увійдіть</a>, щоб залишити коментар.
        </div>
      )}

      {/* Список коментарів */}
      <div className="space-y-6">
        {comments?.filter(c => !c.parentId).map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            novelId={novelId}
            chapterId={chapterId}
            queryKey={queryKey}
          />
        ))}
        {comments?.length === 0 && (
          <div className="text-center text-slate-500 py-4">Ще немає коментарів. Будьте першим!</div>
        )}
      </div>
    </div>
  );
}

// Внутрішній рекурсивний компонент для відображення коментаря та його відповідей
function CommentItem({
                       comment, novelId, chapterId, queryKey
                     }: {
  comment: Comment, novelId?: number, chapterId?: number, queryKey: any[]
}) {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  const replyMutation = useMutation({
    mutationFn: commentsService.createComment,
    onSuccess: () => {
      setIsReplying(false);
      setReplyText('');
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: commentsService.deleteComment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    replyMutation.mutate({ novelId, chapterId, parentId: comment.id, text: replyText });
  };

  // Форматування дати
  const formattedDate = new Date(comment.createdAt).toLocaleDateString('uk-UA', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="flex gap-4">
      {/* Аватар */}
      <div className="w-10 h-10 bg-slate-200 rounded-full flex-shrink-0 overflow-hidden">
        {comment.user?.avatarUrl ? (
          <img src={comment.user.avatarUrl} alt={comment.user.username} className="w-full h-full object-cover" />
        ) : (
          <svg className="w-full h-full text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        )}
      </div>

      <div className="flex-1">
        <div className="bg-slate-50 rounded-lg p-4 ring-1 ring-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-sm text-slate-900">
              {comment.user?.displayName || comment.user?.username || 'Невідомий користувач'}
            </span>
            <span className="text-xs text-slate-500">{formattedDate}</span>
          </div>

          <div className="text-sm text-slate-700 whitespace-pre-wrap">
            {comment.deleted ? (
              <span className="italic text-slate-400">[Цей коментар було видалено]</span>
            ) : (
              comment.text
            )}
          </div>
        </div>

        {/* Кнопки дій */}
        {!comment.deleted && (
          <div className="mt-2 flex items-center gap-4 text-xs">
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="text-slate-500 hover:text-indigo-600 font-medium"
            >
              Відповісти
            </button>
            {currentUser?.id === comment.userId && (
              <button
                onClick={() => { if(confirm('Видалити коментар?')) deleteMutation.mutate(comment.id) }}
                className="text-slate-400 hover:text-red-600 font-medium"
              >
                Видалити
              </button>
            )}
          </div>
        )}

        {/* Форма відповіді */}
        {isReplying && (
          <form onSubmit={handleReplySubmit} className="mt-3 flex gap-3 items-start">
            <textarea
              rows={2}
              autoFocus
              className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm px-3"
              placeholder="Ваша відповідь..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <div className="flex flex-col gap-2">
              <button
                type="submit"
                disabled={replyMutation.isPending || !replyText.trim()}
                className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
              >
                Відповісти
              </button>
              <button
                type="button"
                onClick={() => setIsReplying(false)}
                className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                Скасувати
              </button>
            </div>
          </form>
        )}

        {/* Рекурсивний рендер відповідей */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4 pl-4 border-l-2 border-slate-100">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                novelId={novelId}
                chapterId={chapterId}
                queryKey={queryKey}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}