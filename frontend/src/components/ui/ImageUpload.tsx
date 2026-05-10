'use client';

import { useState, useRef } from 'react';
import { uploadService } from '@/lib/api/upload.service';

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  shape?: 'rectangle' | 'circle';
}

export const ImageUpload = ({
                              value,
                              onChange,
                              disabled,
                              className = '',
                              placeholder = 'Завантажити',
                              shape = 'rectangle',
                            }: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Оберіть зображення');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Макс. розмір 5MB');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      const url = await uploadService.uploadImage(file);
      onChange(url);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Помилка при завантаженні');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  const isCircle = shape === 'circle';
  const shapeClasses = isCircle ? 'rounded-full aspect-square' : 'rounded-2xl h-48 w-full';

  return (
    <div className="w-full relative">
      <div
        onClick={handleClick}
        className={`group relative flex flex-col items-center justify-center border-2 border-dashed cursor-pointer transition-all overflow-hidden
        ${shapeClasses}
        ${error ? 'border-red-400 bg-red-50 text-red-500' : 'border-slate-300 hover:border-indigo-500 bg-slate-50 text-slate-500 hover:bg-indigo-50/50 hover:text-indigo-600'}
        ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      >
        <input
          type="file"
          accept="image/jpeg, image/png, image/webp"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={disabled || isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center p-4 text-center">
            <svg className="animate-spin h-6 w-6 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {!isCircle && <span className="text-sm font-medium">Завантаження...</span>}
          </div>
        ) : value ? (
          <>
            <img
              src={value}
              alt="Preview"
              className={`h-full w-full ${isCircle ? 'object-cover' : 'object-contain'}`}
            />

            <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-xs font-semibold bg-slate-900/60 px-3 py-1.5 rounded-full backdrop-blur-sm">
                Змінити
              </span>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white w-7 h-7 flex items-center justify-center rounded-full shadow-sm transition-transform hover:scale-110"
              title="Видалити зображення"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center p-4 text-center px-2">
            <svg className={`mb-2 opacity-60 ${isCircle ? 'w-8 h-8' : 'w-10 h-10'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-semibold leading-tight">{placeholder}</span>
            {!isCircle && <span className="text-[11px] opacity-60 mt-1">PNG, JPG до 5MB</span>}
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-xs font-medium absolute -bottom-5 left-0 w-full text-center truncate" title={error}>{error}</p>}
    </div>
  );
};