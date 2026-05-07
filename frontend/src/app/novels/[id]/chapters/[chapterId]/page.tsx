import type { Metadata } from 'next';
import { ReaderView } from '@/features/chapters/components/ReaderView';

export const metadata: Metadata = {
  title: 'Читання | NovelHub',
};


export default async function ChapterPage({ params }: { params: Promise<{ id: string; chapterId: string }> }) {
  const { id, chapterId } = await params;

  return (
    <div className="-mx-4 -my-8 sm:-mx-0">
      <ReaderView novelId={id} chapterId={chapterId} />
    </div>
  );
}