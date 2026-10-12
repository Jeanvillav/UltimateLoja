import Link from 'next/link';
import { Home, AlertTriangle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 text-center">
      <div className="glass-panel p-10 md:p-14 rounded-3xl max-w-xl w-full mx-auto shadow-2xl relative overflow-hidden border-t-4 border-red-500">
        
        {/* FIFA Red Card Aesthetic Icon */}
        <div className="mx-auto w-16 h-24 bg-gradient-to-br from-red-500 to-red-700 rounded-md shadow-[0_0_25px_rgba(239,68,68,0.6)] flex items-center justify-center mb-6 transform -rotate-6 animate-pulse">
          <AlertTriangle className="text-white w-8 h-8 opacity-80" />
        </div>

        <h1 className="text-6xl md:text-7xl font-black font-outfit text-white mb-2 tracking-wider">
          404
        </h1>
        
        <h2 className="text-xl md:text-2xl font-bold font-outfit text-red-400 mb-4 uppercase tracking-wide">
          ¡Fuera de lugar! Jugada no encontrada
        </h2>

        <p className="text-slate-300 text-sm md:text-base mb-8 leading-relaxed max-w-md mx-auto">
          Parece que la pelota se fue de la cancha o el jugador al que intentas acceder no existe en la plantilla.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 bg-[var(--color-highlight)] text-black font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-green-400 transition-transform active:scale-95 shadow-lg shadow-green-500/20"
          >
            <Home size={18} />
            Volver a la Cancha (Inicio)
          </Link>
          
          <Link
            href="/convocados"
            className="w-full sm:w-auto px-6 py-3 bg-slate-800 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors border border-slate-700"
          >
            <ArrowLeft size={18} />
            Ver Convocados
          </Link>
        </div>
      </div>
    </div>
  );
}
