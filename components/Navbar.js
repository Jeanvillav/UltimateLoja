import Link from 'next/link';
import { Home, Users, Search, ClipboardList, Shield, PlusCircle } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="glass-panel sticky top-0 z-50 rounded-none border-t-0 border-l-0 border-r-0 border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-[#00d2ff] to-[#3a7bd5] flex items-center justify-center shadow-[0_0_10px_rgba(0,210,255,0.5)]">
              <span className="font-outfit font-black text-black text-sm tracking-tighter">UL</span>
            </div>
            <span className="font-outfit font-black text-xl text-white tracking-widest uppercase shadow-black drop-shadow-md">Ultimate Loja</span>
          </Link>
          
          <div className="hidden md:flex h-full">
            <Link href="/" className="flex items-center h-full px-4 gap-2 text-slate-200 font-bold uppercase tracking-widest text-xs hover:text-white border-t-[3px] border-transparent hover:border-[#00d2ff] hover:bg-white/5 transition-all">
              Inicio
            </Link>
            <Link href="/equipos" className="flex items-center h-full px-4 gap-2 text-slate-200 font-bold uppercase tracking-widest text-xs hover:text-white border-t-[3px] border-transparent hover:border-[#00d2ff] hover:bg-white/5 transition-all">
              Equipos
            </Link>
            <Link href="/jugadores" className="flex items-center h-full px-4 gap-2 text-slate-200 font-bold uppercase tracking-widest text-xs hover:text-white border-t-[3px] border-transparent hover:border-[#00d2ff] hover:bg-white/5 transition-all">
              Jugadores
            </Link>
            <Link href="/squad-builder" className="flex items-center h-full px-4 gap-2 text-slate-200 font-bold uppercase tracking-widest text-xs hover:text-white border-t-[3px] border-transparent hover:border-[#e5ff00] hover:bg-white/5 transition-all">
              Squad Builder
            </Link>
            <Link href="/sugerir" className="flex items-center h-full px-4 gap-2 text-slate-200 font-bold uppercase tracking-widest text-xs hover:text-black border-t-[3px] border-transparent hover:border-[#00d2ff] hover:bg-[#00d2ff] transition-all">
              Sugerir
            </Link>
          </div>

          <div className="flex items-center h-full">
            <Link href="/admin" className="flex items-center h-full px-4 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white border-t-[3px] border-transparent hover:border-red-500 hover:bg-red-500/10 transition-all">
              Admin
            </Link>
          </div>
        </div>
      </div>
      
      {/* Mobile nav */}
      <div className="md:hidden flex justify-around p-0 glass-panel rounded-none border-b-0 border-l-0 border-r-0 border-t border-white/10 overflow-x-auto text-xs">
         <Link href="/" className="flex-1 py-3 text-center text-slate-300 hover:text-white hover:bg-white/5 border-t-[3px] border-transparent hover:border-[#00d2ff]"><Home size={20} className="mx-auto" /></Link>
         <Link href="/equipos" className="flex-1 py-3 text-center text-slate-300 hover:text-white hover:bg-white/5 border-t-[3px] border-transparent hover:border-[#00d2ff]"><Shield size={20} className="mx-auto" /></Link>
         <Link href="/jugadores" className="flex-1 py-3 text-center text-slate-300 hover:text-white hover:bg-white/5 border-t-[3px] border-transparent hover:border-[#00d2ff]"><Users size={20} className="mx-auto" /></Link>
         <Link href="/squad-builder" className="flex-1 py-3 text-center text-slate-300 hover:text-white hover:bg-white/5 border-t-[3px] border-transparent hover:border-[#e5ff00]"><ClipboardList size={20} className="mx-auto" /></Link>
         <Link href="/sugerir" className="flex-1 py-3 text-center text-slate-300 hover:text-black hover:bg-[#00d2ff] border-t-[3px] border-transparent hover:border-[#00d2ff]"><PlusCircle size={20} className="mx-auto" /></Link>
      </div>
    </nav>
  );
}
