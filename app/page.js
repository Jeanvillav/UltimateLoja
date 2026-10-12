import Link from 'next/link';
import { CalendarCheck, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <div className="glass-panel p-8 md:p-14 rounded-3xl max-w-3xl w-full mx-auto shadow-2xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold uppercase tracking-widest mb-6">
          ⚽ Temporada Sintéticas Loja
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black font-outfit mb-6 text-white drop-shadow-[0_0_20px_rgba(0,229,255,0.4)] leading-tight">
          Bienvenido a las<br/>Canchas Sintéticas de Loja
        </h1>
        
        <p className="text-base sm:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          Arma tu equipo ideal, analiza las estadísticas de tus amigos y convoca pichangas con cálculo de cuotas al puro estilo Ultimate Team.
        </p>
        
        {/* Único CTA Claro y Dominante */}
        <div className="flex flex-col items-center gap-6 relative z-10">
          <Link 
            href="/convocados" 
            className="w-full sm:w-auto px-10 py-5 bg-[var(--color-highlight)] hover:bg-green-400 text-black font-black font-outfit uppercase tracking-wider rounded-2xl transition-all shadow-[0_0_30px_rgba(34,197,94,0.5)] hover:shadow-[0_0_45px_rgba(34,197,94,0.8)] hover:-translate-y-1 text-lg flex items-center justify-center gap-3 active:scale-95 cursor-pointer"
          >
            <CalendarCheck size={24} />
            Organizar Partido de Sintética
            <ArrowRight size={20} />
          </Link>

          {/* Enlaces de Exploración Secundarios sin competir con el CTA */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-slate-400 font-medium">
            <Link href="/squad-builder" className="hover:text-white transition-colors underline underline-offset-4">
              Crea tu plantilla táctica
            </Link>
            <span className="text-slate-600">•</span>
            <Link href="/equipos" className="hover:text-white transition-colors underline underline-offset-4">
              Ver equipos de Loja
            </Link>
            <span className="text-slate-600">•</span>
            <Link href="/jugadores" className="hover:text-white transition-colors underline underline-offset-4">
              Base de jugadores
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
