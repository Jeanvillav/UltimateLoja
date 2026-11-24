'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CalendarCheck, ArrowRight, DoorOpen, Users, CheckCircle, ShieldCheck, MapPin, DollarSign, MessageSquare } from 'lucide-react';
import { useRoom } from '@/store/RoomContext';
import RoomSelectorModal from '@/components/RoomSelectorModal';

export default function Home() {
  const { room, roomCode } = useRoom();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8 md:py-14 max-w-4xl">
      {/* Banner de Inicio / Prototipo MVP v1 */}
      <div className="glass-panel p-6 sm:p-10 text-center relative overflow-hidden border-t-4 border-t-[var(--color-gold)] mb-8 shadow-2xl">
        
        {/* Aviso de feedback de usuario 1 */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-green-500/15 border border-green-500/30 text-green-400 text-xs font-bold uppercase tracking-wider mb-4 rounded-full">
          <CheckCircle size={14} />
          <span>Ya estás en la sala {roomCode} • No necesitas cuenta ni contraseña</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-outfit uppercase text-white mb-4 tracking-tight leading-tight">
          {room?.name ? room.name : 'Organizador de Partidos de Sintética'}
        </h1>
        
        <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
          Contacta a la cancha sintética de Loja por WhatsApp, convoca a tus amigos, confirma quién va y divide la cuota justa en segundos.
        </p>

        {/* Acciones Principales del Prototipo */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Link 
            href="/convocados" 
            className="w-full sm:w-auto px-8 py-4 bg-[var(--color-gold)] hover:bg-[var(--color-gold-dark)] text-black font-black font-outfit uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(246,197,65,0.4)] hover:scale-105 text-sm flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <CalendarCheck size={20} />
            Organizar Partido Ahora
            <ArrowRight size={18} />
          </Link>

          <button
            onClick={() => setModalOpen(true)}
            className="w-full sm:w-auto px-6 py-4 bg-black/80 hover:bg-black border border-gray-700 hover:border-[var(--color-gold)] text-gray-200 hover:text-white font-bold font-outfit uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <DoorOpen size={18} className="text-[var(--color-gold)]" />
            Crear o Unirse a una Sala
          </button>
        </div>

        {/* Sala actual activa */}
        <div className="inline-flex items-center gap-2 text-xs text-slate-400 bg-black/40 px-3 py-1 border border-white/5">
          <span>Sala activa:</span>
          <span className="text-[var(--color-gold)] font-black uppercase">{roomCode}</span>
          <button 
            onClick={() => setModalOpen(true)} 
            className="text-slate-300 underline hover:text-white ml-1 cursor-pointer"
          >
            (Cambiar)
          </button>
        </div>
      </div>

      {/* Recorrido en 3 Pasos del MVP v1 (Como en el Portafolio) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="glass-panel p-5 border-t-2 border-t-slate-700 text-left">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-[var(--color-gold)] font-black font-outfit flex items-center justify-center mb-3 text-sm">
            1
          </div>
          <h3 className="text-white font-black font-outfit uppercase text-sm mb-1.5 flex items-center gap-1.5">
            <MapPin size={15} className="text-[var(--color-gold)]" />
            Elige Cancha y Turno
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Selecciona la cancha de Loja (La Sede, Gol de Oro, The Forest, etc.) y escribe al dueño por WhatsApp con el mensaje ya armado.
          </p>
        </div>

        <div className="glass-panel p-5 border-t-2 border-t-slate-700 text-left">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-[var(--color-gold)] font-black font-outfit flex items-center justify-center mb-3 text-sm">
            2
          </div>
          <h3 className="text-white font-black font-outfit uppercase text-sm mb-1.5 flex items-center gap-1.5">
            <Users size={15} className="text-green-400" />
            Convoca a tus Amigos
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Invita a tu lista de amigos y marca quién está confirmado, por confirmar o ausente con un solo toque.
          </p>
        </div>

        <div className="glass-panel p-5 border-t-2 border-t-slate-700 text-left">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-[var(--color-gold)] font-black font-outfit flex items-center justify-center mb-3 text-sm">
            3
          </div>
          <h3 className="text-white font-black font-outfit uppercase text-sm mb-1.5 flex items-center gap-1.5">
            <DollarSign size={15} className="text-green-400" />
            Cuota Justa en WhatsApp
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            La app divide el costo solo entre los confirmados y te da el mensaje listo para copiar y enviar a tu grupo.
          </p>
        </div>
      </div>

      <RoomSelectorModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
