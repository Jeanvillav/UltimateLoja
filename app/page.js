import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <div className="glass-panel p-12 rounded-3xl max-w-3xl w-full mx-auto shadow-2xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        
        <h1 className="text-5xl md:text-7xl font-black font-outfit mb-6 text-white drop-shadow-[0_0_15px_rgba(0,229,255,0.6)]">
          Bienvenido a las<br/>Canchas Sintéticas de Loja
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
          Arma tu equipo ideal, analiza las estadísticas de tus amigos y demuestra quién manda en la cancha. 
          Al puro estilo Ultimate Team.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center relative z-10">
          <Link href="/equipos" className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all border border-slate-600 hover:border-slate-400 shadow-lg hover:shadow-xl text-lg flex items-center justify-center gap-2">
            Ver Equipos
          </Link>
          
          <Link href="/squad-builder" className="w-full sm:w-auto px-8 py-4 btn-fifa w-full font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)] hover:-translate-y-1 text-lg flex items-center justify-center gap-2">
            Crea tu Plantilla
          </Link>
        </div>
      </div>
    </div>
  );
}
