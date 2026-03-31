import type { Metadata } from 'next';
import { RegisterForm } from '@/features/auth/components/RegisterForm';

export const metadata: Metadata = {
  title: 'Реєстрація | NovelHub',
  description: 'Створіть акаунт у NovelHub, щоб читати та писати новели.',
};

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full flex justify-center">
        <RegisterForm />
      </div>
    </main>
  );
}