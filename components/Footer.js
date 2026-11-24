import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="glass-panel mt-auto border-b-0 border-l-0 border-r-0 border-t border-white/10 py-6 text-xs text-slate-400">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-[var(--color-gold)] flex items-center justify-center">
            <span className="font-outfit font-black text-black text-[10px] tracking-tighter">UL</span>
          </div>
          <span className="font-outfit font-bold text-white tracking-widest uppercase">
            Ultimate Loja
          </span>
          <span className="text-slate-500">•</span>
          <span>Prototipo MVP v1 — Fútbol sintético en Loja, Ecuador</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6">
          <Link href="/" className="hover:text-white transition-colors">
            Inicio
          </Link>
          <Link href="/convocados" className="hover:text-white transition-colors text-[var(--color-gold)] font-bold">
            Organizar Partido
          </Link>
          <Link href="/privacidad" className="hover:text-white transition-colors">
            Privacidad
          </Link>
          <Link href="/terminos" className="hover:text-white transition-colors">
            Términos
          </Link>
        </div>

        <div className="text-slate-500 text-center md:text-right">
          © {new Date().getFullYear()} Ultimate Loja. Proyecto Académico.
        </div>
      </div>
    </footer>
  );
}
