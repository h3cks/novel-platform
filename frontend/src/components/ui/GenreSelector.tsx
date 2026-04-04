'use client';

interface Genre {
  id: number;
  name: string;
}

interface GenreSelectorProps {
  genres: Genre[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  max?: number;
  disabled?: boolean;
}

export const GenreSelector = ({ genres, selectedIds, onChange, max = 3, disabled }: GenreSelectorProps) => {
  const toggleGenre = (id: number) => {
    if (disabled) return;
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((gid) => gid !== id)); // Видалити
    } else {
      if (selectedIds.length >= max) return; // Ліміт
      onChange([...selectedIds, id]); // Додати
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {genres.map((g) => {
        const isSelected = selectedIds.includes(g.id);
        return (
          <button
            key={g.id}
            type="button"
            disabled={disabled}
            onClick={() => toggleGenre(g.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border
              ${isSelected
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105'
              : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {g.name}
          </button>
        );
      })}
    </div>
  );
};