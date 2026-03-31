import { useQuery } from '@tanstack/react-query';
import { commentsService } from '../api/comments.service';

export const useComments = (params: { novelId?: string; chapterId?: string }) => {
  return useQuery({
    queryKey: ['comments', params],
    queryFn: () => commentsService.getComments(params),
    // Виконуємо запит лише тоді, коли є хоча б один з ID
    enabled: !!params.novelId || !!params.chapterId,
  });
};