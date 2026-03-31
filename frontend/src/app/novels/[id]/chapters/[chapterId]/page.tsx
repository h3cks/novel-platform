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

export default function ChapterPage({ params }: ChapterPageProps) {
  // Тут ми просто викликаємо ReaderView. Вся логіка (теми, запити) - клієнтська.
  return (
    <div className="-mx-4 -my-8 sm:-mx-0">
      {/* Негативні марджини використовуються для того, щоб перекрити паддінги з layout.tsx
          і дозволити фону сепії/темної теми зайняти всю ширину на мобільних */}
      <ReaderView novelId={params.id} chapterId={params.chapterId} />
    </div>
  );
}