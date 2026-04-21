'use client';

import Link from 'next/link';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Дашборд', path: '/admin' },
    { name: 'Користувачі', path: '/admin/users' },
    { name: 'Контент', path: '/admin/content' },
    { name: 'Репорти', path: '/admin/reports' },
    { name: 'Розсилка', path: '/admin/broadcast' },
    { name: 'Логи дій', path: '/admin/logs' }, // Додано сюди
  ];

  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'MODERATOR']}>
      <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto w-full">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sticky top-24 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-3">Управління</h3>
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}