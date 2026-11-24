'use client';

import Link from 'next/link';
import { Home, Users, ClipboardList, Shield, ListChecks } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="glass-panel sticky top-0 z-50 rounded-none border-t-0 border-l-0 border-r-0 border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--color-gold)] flex items-center justify-center shadow-[0_0_10px_rgba(246,197,65,0.4)]">
              <span className="font-outfit font-black text-black text-sm tracking-tighter">UL</span>
            </div>
            <span className="font-outfit font-black text-xl text-white tracking-widest uppercase drop-shadow-md">
              Ultimate Loja
            </span>
          </Link>
          
          {/* Desktop nav */}
          <div className="hidden md:flex h-full">
            <Link href="/" className="flex items-center h-full px-4 gap-2 text-gray-300 font-bold uppercase tracking-widest text-xs hover:text-white border-t-[3px] border-transparent hover:border-[var(--color-gold)] hover:bg-white/5 transition-all">
              Inicio
            </Link>
            <Link href="/equipos" className="flex items-center h-full px-4 gap-2 text-gray-300 font-bold uppercase tracking-widest text-xs hover:text-white border-t-[3px] border-transparent hover:border-[var(--color-gold)] hover:bg-white/5 transition-all">
              Equipos
            </Link>
            <Link href="/jugadores" className="flex items-center h-full px-4 gap-2 text-gray-300 font-bold uppercase tracking-widest text-xs hover:text-white border-t-[3px] border-transparent hover:border-[var(--color-gold)] hover:bg-white/5 transition-all">
              Jugadores
            </Link>
            <Link href="/squad-builder" className="flex items-center h-full px-4 gap-2 text-gray-300 font-bold uppercase tracking-widest text-xs hover:text-white border-t-[3px] border-transparent hover:border-[var(--color-gold)] hover:bg-white/5 transition-all">
              Squad Builder
            </Link>
            <Link href="/convocados" className="flex items-center h-full px-4 gap-2 text-gray-300 font-bold uppercase tracking-widest text-xs hover:text-white border-t-[3px] border-transparent hover:border-[var(--color-gold)] hover:bg-white/5 transition-all">
              Convocados
            </Link>
          </div>

          <div className="flex items-center h-full">
            <Link href="/admin" className="flex items-center h-full px-4 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white border-t-[3px] border-transparent hover:border-red-500 hover:bg-red-500/10 transition-all">
              Admin
            </Link>
          </div>
        </div>
      </div>
      
      {/* Mobile nav */}
      <div className="md:hidden flex justify-around p-0 glass-panel rounded-none border-b-0 border-l-0 border-r-0 border-t border-white/10 overflow-x-auto text-xs">
         <Link href="/" className="flex-1 py-3 text-center text-gray-400 hover:text-[var(--color-gold)] hover:bg-white/5 border-t-[3px] border-transparent hover:border-[var(--color-gold)]"><Home size={20} className="mx-auto" /></Link>
         <Link href="/equipos" className="flex-1 py-3 text-center text-gray-400 hover:text-[var(--color-gold)] hover:bg-white/5 border-t-[3px] border-transparent hover:border-[var(--color-gold)]"><Shield size={20} className="mx-auto" /></Link>
         <Link href="/jugadores" className="flex-1 py-3 text-center text-gray-400 hover:text-[var(--color-gold)] hover:bg-white/5 border-t-[3px] border-transparent hover:border-[var(--color-gold)]"><Users size={20} className="mx-auto" /></Link>
         <Link href="/squad-builder" className="flex-1 py-3 text-center text-gray-400 hover:text-[var(--color-gold)] hover:bg-white/5 border-t-[3px] border-transparent hover:border-[var(--color-gold)]"><ClipboardList size={20} className="mx-auto" /></Link>
         <Link href="/convocados" className="flex-1 py-3 text-center text-gray-400 hover:text-[var(--color-gold)] hover:bg-white/5 border-t-[3px] border-transparent hover:border-[var(--color-gold)]"><ListChecks size={20} className="mx-auto" /></Link>
      </div>
    </nav>
  );
}
