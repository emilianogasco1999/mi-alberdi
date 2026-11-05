import type { Metadata } from 'next';
import { AppProviders } from '@/core/providers/AppProviders';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mi Alberdi | Guía de Comercios, Oficios y Servicios',
  description:
    'Encontrá comercios, oficios, profesionales y emprendimientos de Juan Bautista Alberdi. Contacto directo por WhatsApp y sin comisiones.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
