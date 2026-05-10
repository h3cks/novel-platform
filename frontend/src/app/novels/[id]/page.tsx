import type { Metadata } from 'next';
import { NovelDetails } from '@/features/novels/components/NovelDetails';
import { CommentSection } from '@/features/comments/components/CommentSection';
import { RecommendedNovels } from '@/features/novels/components/RecommendedNovels';

export default async function NovelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6">
      <NovelDetails novelId={id} />
      <RecommendedNovels currentNovelId={id} />
      <CommentSection novelId={id} />
    </div>
  );
}