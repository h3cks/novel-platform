import type { Metadata } from 'next';
import { ReaderView } from '@/features/chapters/components/ReaderView';

export const metadata: Metadata = {
  title: 'Читання | NovelHub',
};

interface ChapterPageProps {
  params: {
    id: string;
    chapterId: string;
  };
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { id, chapterId } = await params;

  return (
    <div className="-mx-4 -my-8 sm:-mx-0">
      <ReaderView novelId={params.id} chapterId={params.chapterId} />
    </div>
  );
}