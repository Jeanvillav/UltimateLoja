import React from 'react';
import { calculateOVR, getDynamicRating } from '@/utils/ovrCalculator';

export default function TeamLineup({ team }) {
  if (!team.lineup || !Array.isArray(team.lineup)) return null;

  const activePlayers = team.lineup.filter(pos => pos.player);
  if (activePlayers.length === 0) return null;

  const squadOvr = Math.round(activePlayers.reduce((sum, pos) => sum + getDynamicRating(pos.player, pos.name), 0) / activePlayers.length);

  return (
    <div className="mb-16">
      <h2 className="text-3xl font-black font-outfit text-white mb-6 flex items-center gap-4">
        Alineación Titular
        <span className="text-sm bg-slate-800 px-3 py-1 rounded-full text-slate-300 font-normal tracking-wide">
          {team.formation || 'Formación'}
        </span>
      </h2>
      
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Pitch Area */}
        <div className="w-full lg:w-2/3 flex flex-col items-center">
          <div className="flex justify-between items-center w-full bg-slate-900/50 p-4 rounded-xl border border-slate-800 mb-6">
            <div className="text-center">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Valoración</div>
              <div className={`text-3xl font-black font-outfit ${squadOvr >= 85 ? 'text-yellow-400' : squadOvr >= 75 ? 'text-green-400' : 'text-white'}`}>
                {squadOvr || '--'}
              </div>
            </div>
            <div className="text-right text-slate-400 text-sm">
              <p>Titulares: <span className="text-white font-bold">{activePlayers.length}/6</span></p>
            </div>
          </div>

          <div 
            className="relative w-full max-w-[400px] aspect-[2/3] rounded-lg overflow-hidden border-2 border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
            style={{ 
              background: 'linear-gradient(to bottom, #166534, #14532d)',
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 10%, rgba(0,0,0,0.1) 10%, rgba(0,0,0,0.1) 20%)'
            }}
          >
            {team.lineup.map(pos => {
              if (!pos.player) return null;
              
              const dynamicRating = getDynamicRating(pos.player, pos.name);
              const naturalOvr = calculateOVR(pos.player, pos.player.posicion);
              const isPenalized = dynamicRating < naturalOvr;

              return (
                <div 
                  key={pos.id}
                  className="absolute w-24 h-32 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-10"
                  style={{ top: pos.top, left: pos.left }}
                >
                  <img 
                    src={pos.player.foto_url || `https://placehold.co/100x100/111827/22c55e?text=${pos.player.nombre.charAt(0)}`} 
                    alt={pos.player.nombre} 
                    className="w-16 h-16 rounded-full object-cover drop-shadow-lg mb-1" 
                  />
                  <div className={`bg-slate-900/80 px-2 py-0.5 rounded text-[10px] font-bold text-center w-full truncate border ${isPenalized ? 'border-red-500/50 text-red-400' : 'border-yellow-500/30 text-yellow-400'}`}>
                    {dynamicRating} {pos.player.nombre.split(' ')[0]}
                  </div>
                </div>
              );
            })}
            
            {/* Pitch Lines */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[15%] border-b-2 border-x-2 border-white/30"></div>
            <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-1/6 h-[10%] border-b-2 border-x-2 border-white/30"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-[15%] border-t-2 border-x-2 border-white/30"></div>
            <div className="absolute bottom-[15%] left-1/2 -translate-x-1/2 w-1/6 h-[10%] border-t-2 border-x-2 border-white/30"></div>
            <div className="absolute top-1/2 left-0 w-full border-t-2 border-white/30"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/4 aspect-square rounded-full border-2 border-white/30"></div>
          </div>
        </div>

        {/* Starting 6 List */}
        <div className="w-full lg:w-1/3 bg-slate-900/50 p-6 rounded-xl border border-slate-800">
          <h3 className="text-xl font-bold mb-4 text-green-400 font-outfit">Los 6 Elegidos</h3>
          <ul className="space-y-3">
            {activePlayers.map(pos => {
              const p = pos.player;
              const ovr = getDynamicRating(p, pos.name);
              return (
                <li key={pos.id} className="flex items-center gap-4 bg-slate-800/50 p-3 rounded-lg border border-white/5">
                  <span className="w-8 h-8 flex items-center justify-center bg-black/50 rounded text-xs font-bold text-slate-400 border border-slate-700">
                    {pos.name}
                  </span>
                  <img src={p.foto_url || `https://placehold.co/40x40/111827/22c55e?text=${p.nombre.charAt(0)}`} alt={p.nombre} className="w-10 h-10 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white truncate text-sm">{p.nombre}</p>
                    <p className="text-xs text-slate-400">{p.posicion}</p>
                  </div>
                  <div className="text-lg font-black text-yellow-400">{ovr}</div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
