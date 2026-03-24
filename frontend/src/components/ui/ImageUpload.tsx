'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { uploadService } from '@/lib/api/upload.service';

interface ImageUploadProps {
  currentImageUrl?: string | null;
  onUploadSuccess: (url: string) => void;
  label?: string;
}

export const ImageUpload = ({ currentImageUrl, onUploadSuccess, label = 'Завантажити зображення' }: ImageUploadProps) => {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);

  const uploadMutation = useMutation({
    mutationFn: uploadService.uploadImage,
    onSuccess: (url) => {
      setPreview(url);
      onUploadSuccess(url);
    },
    onError: () => {
      alert('Помилка завантаження файлу. Перевірте розмір або формат.');
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Показуємо локальне прев'ю одразу
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Відправляємо на сервер
    uploadMutation.mutate(file);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">{label}</label>
      <div className="flex items-center gap-6">
        <div className="w-32 h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden relative">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-400 text-sm text-center px-2">Немає зображення</span>
          )}
          {uploadMutation.isPending && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white text-sm">Завантаження...</span>
            </div>
          )}
        </div>

        <label className="cursor-pointer bg-white border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition text-sm font-medium">
          Обрати файл
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploadMutation.isPending}
          />
        </label>
      </div>
    </div>
  );
};