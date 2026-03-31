import type { Metadata } from 'next';
import { NovelList } from '@/features/novels/components/NovelList';

export const metadata: Metadata = {
  title: 'Каталог новел | NovelHub',
  description: 'Знайдіть свою наступну улюблену історію серед тисяч новел на NovelHub.',
};

export default function NovelsPage() {
  return (
    <div className="space-y-6">
      <header className="flex justify-between items-end border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Каталог</h1>
          <p className="text-gray-500 mt-2">Популярні та нові надходження</p>
        </div>

        {/* У майбутньому тут можна додати компоненти фільтрації та пошуку */}
      </header>

      <section>
        <NovelList />
      </section>
    </div>
  );
}