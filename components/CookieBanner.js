'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie } from 'lucide-react';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('cookie_consent');
      if (!consent) {
        // Small delay for smooth entry
        const timer = setTimeout(() => setVisible(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // LocalStorage not available or SSR
    }
  }, []);

  const handleConsent = (level) => {
    try {
      localStorage.setItem('cookie_consent', level);
      window.dispatchEvent(new Event('cookie_consent_updated'));
    } catch (e) {
      console.error(e);
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-8 md:right-auto md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="glass-panel p-5 rounded-2xl border border-white/15 shadow-2xl backdrop-blur-xl bg-slate-950/90 text-white">
        <div className="flex items-start gap-3 mb-3">
          <div className="p-2 bg-[var(--color-highlight)]/20 text-[var(--color-highlight)] rounded-lg">
            <Cookie size={22} />
          </div>
          <div>
            <h3 className="font-outfit font-bold text-sm uppercase tracking-wider text-white">
              Consentimiento de Cookies
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Utilizamos cookies esenciales y analíticas anónimas para mejorar tu experiencia en la cancha y medir estadísticas de visitas. Consulta nuestra{' '}
              <Link href="/privacidad" className="text-[var(--color-highlight)] underline hover:text-white">
                Política de Privacidad
              </Link>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-white/10 justify-end">
          <button
            onClick={() => handleConsent('essential')}
            className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            Solo esenciales
          </button>
          <button
            onClick={() => handleConsent('all')}
            className="px-4 py-1.5 text-xs font-bold bg-[var(--color-highlight)] text-black rounded-lg hover:bg-green-400 transition-transform active:scale-95 shadow-md shadow-green-500/20"
          >
            Aceptar todas
          </button>
        </div>
      </div>
    </div>
  );
}
