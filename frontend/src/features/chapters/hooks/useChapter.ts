import { useQuery } from '@tanstack/react-query';
import { chaptersService } from '../api/chapters.service';

export const useChapter = (novelId: string, chapterId: string) => {
  return useQuery({
    queryKey: ['chapter', novelId, chapterId],
    queryFn: () => chaptersService.getChapter(novelId, chapterId),
    enabled: !!novelId && !!chapterId,
  });
};