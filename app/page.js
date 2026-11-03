'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CalendarCheck, ArrowRight, DoorOpen, Users, Plus } from 'lucide-react';
import { useRoom } from '@/store/RoomContext';
import RoomSelectorModal from '@/components/RoomSelectorModal';

export default function Home() {
  const { room, roomCode } = useRoom();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <div className="glass-panel p-8 md:p-14 max-w-3xl w-full mx-auto shadow-2xl relative overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--color-gold)] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-green-700 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-2000"></div>
        
        {/* Badge de Sala Activa y Acceso rápido a cambio */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/30 text-[var(--color-gold)] text-xs font-bold uppercase tracking-widest">
            ⚽ {room?.name || `Sala Activa: ${roomCode}`}
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/70 border border-gray-700 hover:border-[var(--color-gold)] text-xs font-outfit font-bold uppercase tracking-wider text-gray-300 hover:text-white transition cursor-pointer"
          >
            <DoorOpen size={13} className="text-[var(--color-gold)]" />
            Cambiar Sala
          </button>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black font-outfit mb-6 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] leading-tight">
          {room?.name ? room.name : 'Bienvenido a las Canchas Sintéticas'}
        </h1>
        
        <p className="text-base sm:text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
          Arma tu equipo ideal, analiza las cartas estadísticas de tus amigos y convoca pichangas con cálculo de cuotas al puro estilo Ultimate Team.
        </p>

        {/* Botones de Sala Inicial / Acciones Principales */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 relative z-10">
          <button
            onClick={() => setModalOpen(true)}
            className="w-full sm:w-auto px-6 py-4 bg-black/80 hover:bg-black border-2 border-[var(--color-gold)] text-[var(--color-gold)] font-black font-outfit uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition hover:scale-105 shadow-[0_0_15px_rgba(246,197,65,0.2)] cursor-pointer"
          >
            <Plus size={18} />
            Crear o Unirse a una Sala
          </button>

          <Link 
            href="/convocados" 
            className="w-full sm:w-auto px-8 py-4 bg-[var(--color-gold)] hover:bg-[var(--color-gold-dark)] text-black font-black font-outfit uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(246,197,65,0.4)] hover:scale-105 text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <CalendarCheck size={18} />
            Organizar Pichanga
            <ArrowRight size={16} />
          </Link>
        </div>
        
        {/* Enlaces de Exploración Secundarios */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-slate-400 font-medium">
          <Link href="/squad-builder" className="hover:text-white transition-colors underline underline-offset-4">
            Plantilla táctica
          </Link>
          <span className="text-slate-600">•</span>
          <Link href="/equipos" className="hover:text-white transition-colors underline underline-offset-4">
            Equipos de la sala
          </Link>
          <span className="text-slate-600">•</span>
          <Link href="/jugadores" className="hover:text-white transition-colors underline underline-offset-4">
            Cartas de jugadores
          </Link>
        </div>
      </div>

      <RoomSelectorModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
