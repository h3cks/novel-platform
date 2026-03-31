'use client';

import { useComments } from '../hooks/useComments';
import { CommentForm } from './CommentForm';
import { CommentItem } from './CommentItem';

interface CommentSectionProps {
  novelId?: string;
  chapterId?: string;
}

export const CommentSection = ({ novelId, chapterId }: CommentSectionProps) => {
  const { data: comments, isLoading, isError } = useComments({ novelId, chapterId });

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-200">
        Коментарі {comments ? `(${comments.length})` : ''}
      </h3>

      <div className="mb-10">
        <CommentForm novelId={novelId} chapterId={chapterId} />
      </div>

      {isLoading && (
        <div className="space-y-6 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="text-red-500 bg-red-50 p-4 rounded-md">
          Не вдалося завантажити коментарі. Спробуйте пізніше.
        </div>
      )}

      {comments && comments.length === 0 && (
        <div className="text-center py-10 text-gray-500 italic">
          Поки що немає коментарів. Будьте першим!
        </div>
      )}

      {comments && comments.length > 0 && (
        <div className="space-y-8">
          {/* Фільтруємо коментарі верхнього рівня (у яких немає parentId) */}
          {comments
            .filter((c) => !c.parentId)
            .map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                novelId={novelId}
                chapterId={chapterId}
              />
            ))}
        </div>
      )}
    </div>
  );
};