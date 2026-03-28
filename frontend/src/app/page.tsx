import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <h1 className="text-5xl font-extrabold mb-6 text-gray-900">Вітаємо у NovelHub</h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl">
        Платформа для читання, створення та обговорення найкращих новел. Приєднуйтесь до нашої спільноти!
      </p>
      <div className="flex gap-4">
        <Link href="/novels" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition">
          Перейти до каталогу
        </Link>
        <Link href="/register" className="bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition">
          Створити акаунт
        </Link>
      </div>
    </div>
  );
}