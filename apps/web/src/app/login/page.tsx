import type { Metadata } from 'next';
import { LoginPage } from '@/features/auth/presentation/pages/LoginPage';

export const metadata: Metadata = {
  title: 'Ingresar | Mi Alberdi',
  description: 'Accedé a tu panel de comerciante, oficio o vecino en Mi Alberdi',
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ returnUrl?: string }>;
}) {
  const { returnUrl } = await searchParams;
  return <LoginPage returnUrl={returnUrl} />;
}
