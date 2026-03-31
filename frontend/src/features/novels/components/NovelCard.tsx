import Link from 'next/link';
import Image from 'next/image';
import { Novel } from '../types';

interface NovelCardProps {
  novel: Novel;
}

export const NovelCard = ({ novel }: NovelCardProps) => {
  // Заглушка для обкладинки, якщо coverUrl відсутній
  const coverImage = novel.coverUrl || '/placeholder-cover.jpg';

  // Обрізаємо опис для прев'ю
  const truncateDescription = (text: string | null, length = 100) => {
    if (!text) return 'Опис відсутній...';
    return text.length > length ? `${text.substring(0, length)}...` : text;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
      <div className="relative w-full h-64 bg-gray-200">
        {/* Використовуємо звичайний img для простоти, але в продакшені краще Next/Image з налаштованими domains */}
        <img
          src={coverImage}
          alt={`Обкладинка ${novel.title}`}
          className="w-full h-full object-cover"
        />
        {novel.status === 'PUBLISHED' && (
          <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
            Опубліковано
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
          {novel.title}
        </h3>

        {novel.author && (
          <p className="text-sm text-gray-500 mb-3">
            Автор: <span className="font-medium">{novel.author.username}</span>
          </p>
        )}

        <p className="text-sm text-gray-600 mb-4 flex-grow line-clamp-3">
          {truncateDescription(novel.description)}
        </p>

        <div className="mt-auto">
          <Link
            href={`/novels/${novel.id}`}
            className="block w-full text-center bg-blue-50 text-blue-600 hover:bg-blue-100 py-2 rounded-md font-medium transition-colors"
          >
            Читати
          </Link>
        </div>
      </div>
    </div>
  );
};