import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const metadata = {
  title: 'Ultimate Loja | FC 26 Style',
  description: 'Manage and analyze your football players with FIFA-style statistics.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${inter.variable} ${outfit.variable}`}>
      <body>
        <Navbar />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
