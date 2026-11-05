import type { Metadata } from 'next';
import { LoginPage } from '@/features/auth/presentation/pages/LoginPage';

export const metadata: Metadata = {
  title: 'Ingresar | Mi Alberdi',
  description: 'Accedé a tu panel de comerciante, oficio o vecino en Mi Alberdi',
};

export default function Page() {
  return <LoginPage />;
}
