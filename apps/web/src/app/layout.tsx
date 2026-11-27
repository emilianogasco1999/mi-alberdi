import type { Metadata } from 'next';
import { Oswald, Poppins } from 'next/font/google';
import { AppProviders } from '@/core/providers/AppProviders';
import { Navbar } from '@/components/Navbar';
import './globals.css';

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-oswald',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-poppins',
  display: 'swap',
});

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
    <html lang="es" className={`${oswald.variable} ${poppins.variable}`}>
      <body className="min-h-screen bg-white font-sans text-ink antialiased flex flex-col">
        <AppProviders>
          <Navbar />
          <div className="flex-1">{children}</div>
        </AppProviders>
      </body>
    </html>
  );
}
