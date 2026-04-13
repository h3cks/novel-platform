'use client';

import { useState } from 'react';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsService } from '../api/comments.service';
import { Comment } from '../types';
import { CommentForm } from './CommentForm';

interface CommentItemProps {
  comment: Comment;
  novelId?: string;
  chapterId?: string;
}

export const CommentItem = ({ comment, novelId, chapterId }: CommentItemProps) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isReplying, setIsReplying] = useState(false);

  const avatarImage = comment.user.avatarUrl || '/placeholder-avatar.png';
  const date = new Date(comment.createdAt).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const deleteMutation = useMutation({
    mutationFn: () => commentsService.deleteComment(comment.id),
    onSuccess: () => {
      // Інвалідація запитів для оновлення списку коментарів
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    }
  });

  const canDelete = user && !comment.deleted && (
    user.id === comment.userId || ['ADMIN', 'MODERATOR'].includes(user.role)
  );

  return (
    <div className="flex gap-4 group">
      <div className="w-10 h-10 shrink-0 rounded-full overflow-hidden bg-gray-200 border border-gray-300">
        <img src={avatarImage} alt={comment.user.username} className="w-full h-full object-cover" />
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-gray-900">{comment.user.displayName || comment.user.username}</span>
          <span className="text-xs text-gray-500">{date}</span>
        </div>

        <div className="text-gray-800 whitespace-pre-wrap">
          {comment.deleted ? (
            <span className="italic text-gray-400">Коментар було видалено.</span>
          ) : (
            comment.text
          )}
        </div>

        {!comment.deleted && (
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="text-xs font-semibold text-gray-500 hover:text-indigo-600 transition"
            >
              Відповісти
            </button>

            {canDelete && (
              <button
                onClick={() => { if(confirm('Видалити коментар?')) deleteMutation.mutate(); }}
                disabled={deleteMutation.isPending}
                className="text-xs font-semibold text-red-400 hover:text-red-600 transition opacity-0 group-hover:opacity-100"
              >
                Видалити
              </button>
            )}
          </div>
        )}

        {isReplying && (
          <div className="mt-3">
            <CommentForm
              novelId={novelId}
              chapterId={chapterId}
              parentId={comment.id}
              placeholder={`Відповісти ${comment.user.username}...`}
              onSuccess={() => setIsReplying(false)}
            />
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-100">
            {comment.replies.map(reply => (
              <CommentItem
                key={reply.id}
                comment={reply}
                novelId={novelId}
                chapterId={chapterId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};