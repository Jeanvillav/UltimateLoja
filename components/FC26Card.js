import React from 'react';
import Link from 'next/link';

export default function FC26Card({ player }) {
  // Determine card style based on rating
  let bgGradient = "from-yellow-400 to-yellow-600"; // Gold
  let textColor = "text-yellow-950";
  let borderGlow = "shadow-[0_0_15px_rgba(250,204,21,0.4)]";
  
  if (player.overall_rating < 75) {
    bgGradient = "from-slate-300 to-slate-500"; // Silver
    textColor = "text-slate-900";
    borderGlow = "shadow-[0_0_15px_rgba(203,213,225,0.4)]";
  }
  if (player.overall_rating < 65) {
    bgGradient = "from-amber-700 to-amber-900"; // Bronze
    textColor = "text-amber-100";
    borderGlow = "shadow-[0_0_15px_rgba(180,83,9,0.4)]";
  }

  const shortPos = player.posicion.split(' ')[0].substring(0, 3).toUpperCase();
  const idOrName = player.id || player.nombre;
  const foto = player.foto_url || `https://placehold.co/150x150/transparent/fff?text=${player.nombre.charAt(0)}`;

  return (
    <Link href={`/players/${encodeURIComponent(idOrName)}`} className="block transition-transform duration-300 hover:-translate-y-2 hover:scale-105">
      <div className={`fc-card relative w-64 h-96 bg-gradient-to-br ${bgGradient} ${textColor} p-4 flex flex-col justify-between overflow-hidden ${borderGlow}`}>
        
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTEwIDBMICAyMCAxMCBMMTAgMjAgTDAgMTAgWiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==')] bg-repeat pointer-events-none"></div>
        
        {/* Top bar: Rating and Position */}
        <div className="flex justify-between items-start z-10 relative">
          <div className="flex flex-col items-center">
            <span className="text-4xl font-black font-outfit leading-none">{player.overall_rating}</span>
            <span className="text-lg font-bold">{shortPos}</span>
          </div>
          {/* Nationality / Club flag could go here */}
          <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center">
            <span className="text-xs font-bold text-white">EC</span>
          </div>
        </div>

        {/* Player Image */}
        <div className="absolute top-12 left-0 right-0 flex justify-center pointer-events-none z-0">
           {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={foto} alt={player.nombre} className="h-44 object-contain drop-shadow-xl filter contrast-125" />
        </div>

        {/* Bottom Section */}
        <div className="z-10 relative mt-auto pt-2 border-t border-current/20">
          <h3 className="text-center text-xl font-black uppercase tracking-wider mb-2">{player.nombre.split(' ')[0]}</h3>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm font-bold">
            <div className="flex justify-between">
              <span className="opacity-75">PAC</span> <span>{player.pace}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-75">DRI</span> <span>{player.dribbling}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-75">SHO</span> <span>{player.shooting}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-75">DEF</span> <span>{player.defending}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-75">PAS</span> <span>{player.passing}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-75">PHY</span> <span>{player.physical}</span>
            </div>
          </div>
        </div>

      </div>
    </Link>
  );
}
