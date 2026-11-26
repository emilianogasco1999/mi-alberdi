import type { Metadata } from 'next';
import { AdminUsuariosPage } from '@/features/admin/presentation/pages/AdminUsuariosPage';

export const metadata: Metadata = {
  title: 'Alta de comerciantes | Mi Alberdi',
  description: 'Panel de administración para dar de alta cuentas de comerciantes',
};

export default function Page() {
  return <AdminUsuariosPage />;
}
