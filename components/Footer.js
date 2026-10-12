import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="glass-panel mt-auto border-b-0 border-l-0 border-r-0 border-t border-white/10 py-8 text-xs text-slate-400">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-tr from-[var(--color-highlight)] to-[#3a7bd5] flex items-center justify-center">
            <span className="font-outfit font-black text-black text-[10px] tracking-tighter">UL</span>
          </div>
          <span className="font-outfit font-bold text-white tracking-widest uppercase">
            Ultimate Loja
          </span>
          <span className="text-slate-500">•</span>
          <span>Fútbol amateur & sintéticas en Loja, Ecuador</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6">
          <Link href="/convocados" className="hover:text-white transition-colors">
            Convocados
          </Link>
          <Link href="/squad-builder" className="hover:text-white transition-colors">
            Squad Builder
          </Link>
          <Link href="/privacidad" className="hover:text-white transition-colors">
            Política de Privacidad
          </Link>
          <Link href="/terminos" className="hover:text-white transition-colors">
            Términos y Condiciones
          </Link>
        </div>

        <div className="text-slate-500 text-center md:text-right">
          © {new Date().getFullYear()} Ultimate Loja. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
