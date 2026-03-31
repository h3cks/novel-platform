'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterFormValues } from '../schemas/register.schema';
import { useRegister } from '../hooks/useRegister';

export const RegisterForm = () => {
  const { mutate: registerUser, isPending, error } = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched', // Валідація відбувається, коли користувач покидає поле
  });

  const onSubmit = (data: RegisterFormValues) => {
    registerUser(data);
  };

  // Витягуємо повідомлення про помилку від API, якщо воно є
  const apiError = error as any;
  const errorMessage = apiError?.response?.data?.message || 'Сталася помилка при реєстрації. Спробуйте пізніше.';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-100">
      <h2 className="text-2xl font-bold text-center mb-1 text-gray-800">Створити акаунт</h2>
      <p className="text-center text-gray-600 mb-6 text-sm">Приєднуйтесь до спільноти NovelHub</p>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-200">
          {errorMessage}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ім'я користувача</label>
        <input
          {...register('username')}
          type="text"
          disabled={isPending}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 transition"
          placeholder="johndoe"
        />
        {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          {...register('email')}
          type="email"
          disabled={isPending}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 transition"
          placeholder="your@email.com"
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
          <input
            {...register('password')}
            type="password"
            disabled={isPending}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 transition"
            placeholder="••••••••"
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Підтвердіть</label>
          <input
            {...register('confirmPassword')}
            type="password"
            disabled={isPending}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 transition"
            placeholder="••••••••"
          />
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center font-semibold"
      >
        {isPending ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Реєстрація...
          </>
        ) : 'Зареєструватися'}
      </button>

      <div className="text-center mt-6 text-sm text-gray-600">
        Вже маєте акаунт?{' '}
        <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
          Увійти
        </Link>
      </div>
    </form>
  );
};