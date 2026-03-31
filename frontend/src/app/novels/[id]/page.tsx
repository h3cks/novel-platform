import type { Metadata } from 'next';
import { NovelDetails } from '@/features/novels/components/NovelDetails';

export const metadata: Metadata = {
  title: 'Деталі новели | NovelHub',
  description: 'Інформація про новелу',
};

// Типізація параметрів для Next.js 13+
interface NovelPageProps {
  params: {
    id: string;
  };
}

export default function NovelPage({ params }: NovelPageProps) {
  return (
    <div className="max-w-5xl mx-auto py-6">
      <NovelDetails novelId={params.id} />

      {/* У майбутньому тут можна додати:
        - <ChapterList novelId={params.id} /> (Список розділів)
        - <CommentSection novelId={params.id} /> (Коментарі)
      */}
    </div>
  );
}