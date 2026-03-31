import { useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsService } from '../api/comments.service';
import { CreateCommentDTO } from '../types';

export const useCreateComment = (targetParams: { novelId?: string; chapterId?: string }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommentDTO) => commentsService.createComment(data),
    onSuccess: () => {
      // Оновлюємо список коментарів після успішного додавання
      queryClient.invalidateQueries({ queryKey: ['comments', targetParams] });
    },
  });
};