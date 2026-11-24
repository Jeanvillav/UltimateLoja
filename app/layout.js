import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CookieBanner from '@/components/CookieBanner';
import { RoomProvider } from '@/store/RoomContext';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://ultimate-loja.vercel.app'),
  title: {
    default: 'Ultimate Loja | MVP v1 - Organizador de Canchas Sintéticas',
    template: '%s | Ultimate Loja',
  },
  description: 'App web para organizar partidos en canchas sintéticas de Loja: contactar a la cancha por WhatsApp, convocar amigos, ver quién confirma y dividir el costo.',
  keywords: [
    'Ultimate Loja', 
    'Fútbol Sintética Loja', 
    'Canchas Sintéticas Loja', 
    'Organizador de partidos', 
    'Partido Loja',
    'Fútbol amateur Ecuador'
  ],
  authors: [{ name: 'Jean Villavicencio' }],
  creator: 'Jean Villavicencio',
  openGraph: {
    type: 'website',
    locale: 'es_EC',
    url: 'https://ultimate-loja.vercel.app',
    siteName: 'Ultimate Loja',
    title: 'Ultimate Loja | MVP v1 - Organizador de Canchas Sintéticas',
    description: 'Organiza partidos en canchas sintéticas de Loja, convoca amigos y divide la cuota en segundos.',
    images: [
      {
        url: '/FondoUltimateLoja.jpg',
        width: 1200,
        height: 630,
        alt: 'Ultimate Loja - Organizador de Partidos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ultimate Loja | MVP v1 - Organizador de Canchas Sintéticas',
    description: 'Organiza partidos en canchas sintéticas de Loja, convoca amigos y divide la cuota en segundos.',
    images: ['/FondoUltimateLoja.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${inter.variable} ${outfit.variable}`}>
      <body>
        <RoomProvider>
          <Navbar />
          <main>
            {children}
          </main>
          <Footer />
          <CookieBanner />
          <Analytics />
          <SpeedInsights />
        </RoomProvider>
      </body>
    </html>
  );
}
