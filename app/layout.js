import { Inter, Outfit } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const metadata = {
  title: 'Futbol Stats | Premium Player Ratings',
  description: 'Manage and analyze your 5, 6, or 7-a-side football players with FIFA-style statistics and advanced insights.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${inter.variable} ${outfit.variable}`}>
      <body>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
