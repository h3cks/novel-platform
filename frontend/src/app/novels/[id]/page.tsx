// src/app/novels/[id]/page.tsx
import type { Metadata } from 'next';
import { NovelDetails } from '@/features/novels/components/NovelDetails';
import { CommentSection } from '@/features/comments/components/CommentSection';
import { RecommendedNovels } from '@/features/novels/components/RecommendedNovels';

export default function NovelPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6">
      <NovelDetails novelId={params.id} />

      <RecommendedNovels />

      <CommentSection novelId={params.id} />
    </div>
  );
}