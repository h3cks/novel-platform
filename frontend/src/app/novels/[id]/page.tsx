import type { Metadata } from 'next';
import { NovelDetails } from '@/features/novels/components/NovelDetails';
import { ChapterList } from '@/features/chapters/components/ChapterList';
import { CommentSection } from '@/features/comments/components/CommentSection';

export const metadata: Metadata = {
  title: 'Деталі новели | NovelHub',
  description: 'Інформація про новелу',
};

interface NovelPageProps {
  params: {
    id: string;
  };
}

export default function NovelPage({ params }: NovelPageProps) {
  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6">
      <NovelDetails novelId={params.id} />

      <ChapterList novelId={params.id} />

      <CommentSection novelId={params.id} />

    </div>
  );
}