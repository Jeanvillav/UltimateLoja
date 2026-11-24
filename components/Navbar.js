'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Home, CalendarCheck, DoorOpen } from 'lucide-react';
import { useRoom } from '@/store/RoomContext';
import RoomSelectorModal from '@/components/RoomSelectorModal';

export default function Navbar() {
  const { roomCode } = useRoom();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <nav className="glass-panel sticky top-0 z-50 rounded-none border-t-0 border-l-0 border-r-0 border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[var(--color-gold)] flex items-center justify-center shadow-[0_0_10px_rgba(246,197,65,0.4)]">
                <span className="font-outfit font-black text-black text-sm tracking-tighter">UL</span>
              </div>
              <div className="flex flex-col">
                <span className="font-outfit font-black text-lg sm:text-xl text-white tracking-widest uppercase drop-shadow-md leading-none">
                  Ultimate Loja
                </span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                  MVP v1 • Prototipo
                </span>
              </div>
            </Link>

            {/* Selector de Sala Activa en el centro */}
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-black/70 border border-[var(--color-gold)]/40 hover:border-[var(--color-gold)] text-xs font-outfit font-bold uppercase tracking-wider text-gray-200 hover:text-white transition cursor-pointer"
              title="Cambiar o crear sala"
            >
              <DoorOpen size={14} className="text-[var(--color-gold)]" />
              <span className="text-gray-400 hidden sm:inline">Sala:</span>
              <span className="text-[var(--color-gold)] font-black tracking-widest">{roomCode}</span>
            </button>
            
            {/* Navegación enfocada en el MVP (Historias 1 a 4) */}
            <div className="hidden sm:flex h-full items-center gap-1">
              <Link 
                href="/" 
                className="flex items-center h-full px-4 gap-2 text-gray-300 font-bold uppercase tracking-widest text-xs hover:text-white border-t-[3px] border-transparent hover:border-[var(--color-gold)] hover:bg-white/5 transition-all"
              >
                <Home size={14} />
                Inicio
              </Link>

              <Link 
                href="/convocados" 
                className="flex items-center h-full px-4 gap-2 text-black bg-[var(--color-gold)] hover:bg-[var(--color-gold-dark)] font-black uppercase tracking-widest text-xs transition-all shadow-[0_0_15px_rgba(246,197,65,0.3)]"
              >
                <CalendarCheck size={14} />
                Organizar Partido
              </Link>
            </div>
          </div>
        </div>
        
        {/* Mobile nav simple */}
        <div className="sm:hidden flex justify-around p-0 glass-panel rounded-none border-b-0 border-l-0 border-r-0 border-t border-white/10 text-xs">
           <Link href="/" className="flex-1 py-3 text-center text-gray-400 hover:text-[var(--color-gold)] hover:bg-white/5 border-t-[3px] border-transparent hover:border-[var(--color-gold)] flex items-center justify-center gap-1.5 font-bold uppercase">
             <Home size={16} /> Inicio
           </Link>
           <Link href="/convocados" className="flex-1 py-3 text-center text-black bg-[var(--color-gold)] hover:bg-[var(--color-gold-dark)] font-black uppercase tracking-wider flex items-center justify-center gap-1.5">
             <CalendarCheck size={16} /> Organizar Partido
           </Link>
        </div>
      </nav>

      <RoomSelectorModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
