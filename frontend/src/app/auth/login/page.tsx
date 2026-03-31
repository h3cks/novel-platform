import type { Metadata } from 'next';
import { LoginForm } from '@/features/auth/components/LoginForm';

export const metadata: Metadata = {
  title: 'Вхід | NovelHub',
  description: 'Увійдіть до свого акаунту NovelHub',
};

export default function LoginPage() {
  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center p-4">
      <div className="w-full flex justify-center">
        <LoginForm />
      </div>
    </main>
  );
}