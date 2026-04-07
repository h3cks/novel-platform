import type { Metadata } from 'next';
import { NovelDetails } from '@/features/novels/components/NovelDetails';
import { ChapterList } from '@/features/chapters/components/ChapterList';

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

      {/* Підключаємо створений список розділів */}
      <ChapterList novelId={params.id} />

      {/* У майбутньому тут можна додати:
        - <CommentSection novelId={params.id} /> (Коментарі)
      */}
    </div>
  );
}