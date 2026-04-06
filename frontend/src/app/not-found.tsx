import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-9xl font-black text-indigo-100 mb-4">404</h1>
      <h2 className="text-3xl font-bold text-slate-900 mb-3">Сторінку не знайдено</h2>
      <p className="text-slate-500 max-w-md mb-8">
        Можливо, ця сторінка була видалена, переміщена, або ви ввели неправильну адресу.
      </p>
      <Link
        href="/"
        className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-sm hover:shadow hover:-translate-y-0.5"
      >
        Повернутися на головну
      </Link>
    </div>
  );
}