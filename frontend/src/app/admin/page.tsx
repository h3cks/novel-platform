'use client';

// Дашборд-заглушка. У майбутньому тут будуть API виклики для статистики.
export default function AdminDashboardPage() {
  const stats = [
    { title: 'Всього користувачів', value: '1,248', color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Нових новел', value: '42', color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Відкритих репортів', value: '12', color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-slate-900 mb-6">Панель управління</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className={`p-6 rounded-2xl border border-slate-100 ${stat.bg}`}>
            <h3 className="text-slate-600 text-sm font-medium mb-2">{stat.title}</h3>
            <p className={`text-4xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 text-center text-slate-500">
        <p>Вітаємо в адмін-панелі. Оберіть розділ у меню зліва для управління платформою.</p>
      </div>
    </div>
  );
}