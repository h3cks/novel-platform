export default function NovelLoadingSkeleton() {
  return (
    <div className="animate-pulse container mx-auto px-4 py-8 max-w-5xl">
      {/* Хідер новели */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        {/* Обкладинка */}
        <div className="w-full md:w-64 h-96 bg-slate-200 rounded-2xl shrink-0"></div>
        {/* Інфо */}
        <div className="flex-1 space-y-4 py-2">
          <div className="h-10 bg-slate-200 rounded-lg w-3/4"></div>
          <div className="h-6 bg-slate-200 rounded-lg w-1/4"></div>
          <div className="flex gap-2 pt-4">
            <div className="h-8 w-20 bg-slate-200 rounded-full"></div>
            <div className="h-8 w-24 bg-slate-200 rounded-full"></div>
          </div>
          <div className="space-y-3 pt-6">
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>

      {/* Список глав */}
      <div className="space-y-4">
        <div className="h-8 bg-slate-200 rounded w-40 mb-6"></div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 bg-slate-100 rounded-xl w-full border border-slate-200"></div>
        ))}
      </div>
    </div>
  );
}