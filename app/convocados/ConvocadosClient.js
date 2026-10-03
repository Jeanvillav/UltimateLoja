"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FC26Card from '@/components/FC26Card';
import { calculateOVR } from '@/utils/ovrCalculator';

export default function ConvocadosClient({ initialPlayers }) {
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const router = useRouter();
  
  const togglePlayerSelection = (player) => {
    const isSelected = selectedPlayers.some(p => p.id === player.id);
    if (isSelected) {
      setSelectedPlayers(selectedPlayers.filter(p => p.id !== player.id));
    } else {
      if (selectedPlayers.length < 14) {
        setSelectedPlayers([...selectedPlayers, player]);
      } else {
        alert("Ya has seleccionado el máximo de 14 jugadores.");
      }
    }
  };

  const isSelected = (playerId) => selectedPlayers.some(p => p.id === playerId);
  
  const isValidConvocatoria = selectedPlayers.length >= 5 && selectedPlayers.length <= 14;

  const handleConfirm = () => {
    if (isValidConvocatoria) {
      const ids = selectedPlayers.map(p => p.id).join(',');
      router.push(`/squad-builder?players=${ids}`);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row-reverse gap-8 relative items-start">
      {/* Resumen de convocados (Sidebar derecha) */}
      <div className="w-full lg:w-1/3 lg:sticky lg:top-24 z-40">
        <div className="glass-panel p-6 shadow-2xl border-t border-[var(--color-highlight)]/50 backdrop-blur-xl bg-black/40 rounded-2xl">
          <div className="flex flex-col gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold font-outfit text-white flex items-center gap-2">
                Convocados 
                <span className="text-[var(--color-highlight)]">({selectedPlayers.length}/14)</span>
              </h2>
              <p className="text-sm text-slate-400 mt-1">Mínimo 5, máximo 14 jugadores.</p>
            </div>
            <button 
              disabled={!isValidConvocatoria}
              className={`w-full py-3 rounded-xl font-black uppercase tracking-wider transition-all ${
                isValidConvocatoria 
                  ? 'bg-[var(--color-highlight)] text-black hover:bg-white hover:scale-105 shadow-[0_0_20px_rgba(0,229,255,0.6)] cursor-pointer' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
              onClick={handleConfirm}
            >
              {selectedPlayers.length < 5 ? `Faltan ${5 - selectedPlayers.length}` : 'Confirmar'}
            </button>
          </div>
          
          {selectedPlayers.length > 0 ? (
            <div className="flex flex-col gap-3 max-h-[50vh] lg:max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {selectedPlayers.map(p => {
                const shortPos = (p.posicion || 'DEL').split(' ')[0].substring(0, 3).toUpperCase();
                const ovr = calculateOVR(p, shortPos);
                return (
                  <div 
                    key={p.id} 
                    className="flex items-center gap-4 bg-slate-900/60 p-3 rounded-xl border border-slate-700 cursor-pointer hover:border-red-500 hover:bg-slate-800/80 group transition-all" 
                    onClick={() => togglePlayerSelection(p)}
                    title={`Eliminar a ${p.nombre}`}
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[var(--color-highlight)] shadow-[0_0_10px_rgba(0,229,255,0.4)] flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={p.foto_url || `https://placehold.co/150x150/transparent/fff?text=${(p.nombre || 'N').charAt(0)}`} 
                        alt={p.nombre}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-bold text-sm leading-tight truncate">{p.nombre}</h4>
                      <span className="text-slate-400 text-xs">{shortPos}</span>
                    </div>
                    <div className="bg-black text-[var(--color-highlight)] font-black text-lg px-3 py-1 rounded-lg border border-slate-700 shadow-inner flex-shrink-0">
                      {ovr}
                    </div>
                    <div className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-1 font-bold">
                      ×
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center">
              <p className="text-slate-400 text-center text-sm font-medium px-4">Aún no has seleccionado ningún jugador.<br/><br/>Haz clic en las cartas para añadirlos.</p>
            </div>
          )}
        </div>
      </div>

      {/* Lista de todos los jugadores */}
      <div className="w-full lg:w-2/3">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-xl font-bold font-outfit text-white">Plantilla Global</h3>
          <div className="text-sm text-slate-400">{initialPlayers.length} jugadores disponibles</div>
        </div>
        
        {initialPlayers.length === 0 ? (
          <p className="text-center text-slate-500 py-12 bg-slate-900/50 rounded-2xl">No se encontraron jugadores disponibles en la base de datos.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
            {initialPlayers.map((player) => {
              const selected = isSelected(player.id);
              return (
                <div 
                  key={player.id} 
                  className={`relative cursor-pointer transition-all duration-300 ${
                    selected 
                      ? 'ring-4 ring-[var(--color-highlight)] rounded-xl transform scale-105 shadow-[0_0_20px_rgba(0,229,255,0.4)]' 
                      : 'hover:-translate-y-2 hover:scale-105 hover:shadow-xl'
                  }`}
                  onClick={() => togglePlayerSelection(player)}
                >
                  {/* Prevent navigation from Link inside FC26Card by intercepting click, or use asPreview */}
                  <div className="pointer-events-none">
                    <FC26Card player={player} asPreview={true} />
                  </div>
                  
                  {/* Overlay for selected state */}
                  {selected && (
                    <div className="absolute inset-0 bg-[var(--color-highlight)]/10 rounded-xl backdrop-blur-[1px] flex flex-col items-center justify-center z-20">
                      <div className="bg-[var(--color-highlight)] text-black rounded-full w-12 h-12 flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.8)] mb-2 transform scale-110">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="bg-black/80 text-[var(--color-highlight)] font-black uppercase px-3 py-1 rounded-full text-sm border border-[var(--color-highlight)]">
                        Convocado
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}
