'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { NovelCarousel } from '@/features/home/components/NovelCarousel';
import { LatestUpdates } from '@/features/home/components/LatestUpdates';
import {
  useRecommendedNovels,
  useTopOfWeekNovels,
  useTopOfDayNovels
} from '@/features/novels/hooks/useNovels';

export default function Home() {
  // Отримуємо стан авторизації
  const { token } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  // Завантажуємо дані паралельно для каруселей
  const { data: recommended, isLoading: isRecLoading } = useRecommendedNovels();
  const { data: topWeek, isLoading: isWeekLoading } = useTopOfWeekNovels();
  const { data: topDay, isLoading: isDayLoading } = useTopOfDayNovels();

  // Запобігаємо Hydration Error
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-transparent pt-20 pb-24 sm:pt-32 sm:pb-32 text-center">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-multiply pointer-events-none"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6">
            Відкрийте для себе <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">світ новел</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            NovelHub — це сучасна платформа для читання, створення та обговорення найкращих історій. Приєднуйтесь до тисяч читачів та авторів вже сьогодні.
          </p>

          {/* Динамічні кнопки залежно від авторизації */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center min-h-[52px]">
            {!isMounted ? (
              // Скелетон на час монтування (щоб кнопки не стрибали)
              <div className="flex gap-4 animate-pulse">
                <div className="w-48 h-[52px] bg-slate-200 rounded-full"></div>
                <div className="w-48 h-[52px] bg-slate-200 rounded-full hidden sm:block"></div>
              </div>
            ) : token ? (
              // КНОПКИ ДЛЯ АВТОРИЗОВАНИХ КОРИСТУВАЧІВ
              <>
                <Link
                  href="/library"
                  className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-3.5 rounded-full font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all duration-200"
                >
                  Моя бібліотека
                </Link>
                <Link
                  href="/profile"
                  className="w-full sm:w-auto bg-white border border-slate-200 text-slate-700 px-8 py-3.5 rounded-full font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
                >
                  Мій профіль
                </Link>
              </>
            ) : (
              // КНОПКИ ДЛЯ НЕАВТОРИЗОВАНИХ КОРИСТУВАЧІВ
              <>
                <Link
                  href="/novels"
                  className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-3.5 rounded-full font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all duration-200"
                >
                  Перейти до каталогу
                </Link>
                <Link
                  href="/auth/register"
                  className="w-full sm:w-auto bg-white border border-slate-200 text-slate-700 px-8 py-3.5 rounded-full font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
                >
                  Створити акаунт
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Блоки новел та Оновлення */}
      <div className="w-full max-w-7xl mx-auto px-0 sm:px-6 space-y-12 pb-16">

        <NovelCarousel
          title="Рекомендовано для вас"
          novels={recommended}
          isLoading={isRecLoading}
        />

        <NovelCarousel
          title="Топ тижня"
          novels={topWeek}
          isLoading={isWeekLoading}
          linkTo="/search?sort=views_week"
        />

        <NovelCarousel
          title="Популярне сьогодні"
          novels={topDay}
          isLoading={isDayLoading}
        />

        {/* Модуль останніх оновлень */}
        <div className="px-4 sm:px-0 mt-16 border-t border-slate-200 pt-8">
          <LatestUpdates />
        </div>
      </div>

      {/* Mini Features Section */}
      <section className="w-full max-w-5xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center border-t border-slate-100">
        <div className="p-6 rounded-2xl bg-white shadow-sm border border-slate-100">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 text-xl">📖</div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Величезна бібліотека</h3>
          <p className="text-slate-500 text-sm">Тисячі новел у різних жанрах, від фентезі до кіберпанку.</p>
        </div>
        <div className="p-6 rounded-2xl bg-white shadow-sm border border-slate-100">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 text-xl">✍️</div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Студія Автора</h3>
          <p className="text-slate-500 text-sm">Зручний редактор для публікації ваших власних творів.</p>
        </div>
        <div className="p-6 rounded-2xl bg-white shadow-sm border border-slate-100">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 text-xl">💬</div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Активна спільнота</h3>
          <p className="text-slate-500 text-sm">Коментуйте розділи та спілкуйтеся з іншими читачами.</p>
        </div>
      </section>
    </div>
  );
}