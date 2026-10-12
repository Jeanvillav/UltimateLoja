import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CookieBanner from '@/components/CookieBanner';
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
    default: 'Ultimate Loja | Fútbol Sintética & Stats estilo FC',
    template: '%s | Ultimate Loja',
  },
  description: 'Plataforma comunitaria de fútbol amateur en Loja, Ecuador. Convocatorias de canchas sintéticas, cálculo de cuotas y constructor de plantillas tácticas estilo FIFA/FC.',
  keywords: [
    'Ultimate Loja', 
    'Fútbol Sintética Loja', 
    'Canchas Sintéticas Loja', 
    'Squad Builder', 
    'FIFA Card Loja', 
    'Pichanga Loja',
    'Fútbol amateur Ecuador'
  ],
  authors: [{ name: 'Jean Villavicencio' }],
  creator: 'Jean Villavicencio',
  openGraph: {
    type: 'website',
    locale: 'es_EC',
    url: 'https://ultimate-loja.vercel.app',
    siteName: 'Ultimate Loja',
    title: 'Ultimate Loja | Fútbol Sintética & Stats estilo FC',
    description: 'Arma tu equipo ideal, analiza las estadísticas de tus amigos y convoca pichangas en las canchas sintéticas de Loja.',
    images: [
      {
        url: '/FondoUltimateLoja.jpg',
        width: 1200,
        height: 630,
        alt: 'Ultimate Loja - Canchas Sintéticas y Estadísticas',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ultimate Loja | Fútbol Sintética & Stats estilo FC',
    description: 'Arma tu equipo ideal y organiza partidos en las canchas de Loja al puro estilo Ultimate Team.',
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
        <Navbar />
        <main>
          {children}
        </main>
        <Footer />
        <CookieBanner />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
