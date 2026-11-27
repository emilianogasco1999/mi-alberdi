import type { Metadata } from 'next';
import { DashboardPage } from '@/features/dashboard/presentation/pages/DashboardPage';

export const metadata: Metadata = {
  title: 'Mi panel | Mi Alberdi',
};

export default function Page() {
  return <DashboardPage />;
}
