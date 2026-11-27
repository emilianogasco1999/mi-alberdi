import type { Metadata } from 'next';
import { AdminHomePage } from '@/features/admin/presentation/pages/AdminHomePage';

export const metadata: Metadata = {
  title: 'Administración | Mi Alberdi',
};

export default function Page() {
  return <AdminHomePage />;
}
