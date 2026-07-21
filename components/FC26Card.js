import React from 'react';
import Link from 'next/link';
import { calculateOVR } from '@/utils/ovrCalculator';

export default function FC26Card({ player, asPreview = false, livePhotoUrl = null }) {
  const shortPos = (player.posicion || 'DEL').split(' ')[0].substring(0, 3).toUpperCase();
  const calculatedOvr = calculateOVR(player, shortPos);

  // Determine card style based on rating
  let bgGradient = "from-yellow-400 to-yellow-600"; // Gold
  let textColor = "text-yellow-950";
  let borderGlow = "shadow-[0_0_15px_rgba(250,204,21,0.4)]";
  
  if (calculatedOvr < 75) {
    bgGradient = "from-slate-300 to-slate-500"; // Silver
    textColor = "text-slate-900";
    borderGlow = "shadow-[0_0_15px_rgba(203,213,225,0.4)]";
  }
  if (calculatedOvr < 65) {
    bgGradient = "from-amber-700 to-amber-900"; // Bronze
    textColor = "text-amber-100";
    borderGlow = "shadow-[0_0_15px_rgba(180,83,9,0.4)]";
  }

  const idOrName = player.id || player.nombre || 'Nuevo';
  
  // Use livePhotoUrl if provided (for live preview in cropper), otherwise use db foto_url
  const foto = livePhotoUrl || player.foto_url || `https://placehold.co/150x150/transparent/fff?text=${(player.nombre || 'N').charAt(0)}`;

  const CardContent = (
    <div className={`fc-card relative w-64 h-96 bg-gradient-to-br ${bgGradient} ${textColor} p-4 flex flex-col justify-between overflow-hidden ${borderGlow} ${asPreview ? 'shadow-2xl scale-100' : ''}`}>
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTEwIDBMICAyMCAxMCBMMTAgMjAgTDAgMTAgWiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==')] bg-repeat pointer-events-none"></div>
      
      {/* Player Image */}
      <div className="absolute bottom-[105px] inset-x-0 mx-auto w-52 h-52 flex justify-center pointer-events-none z-0">
         {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={foto} 
          alt={player.nombre} 
          className="w-full h-full object-cover object-center drop-shadow-xl filter contrast-125" 
          style={{ 
            maskImage: 'radial-gradient(circle at center, black 45%, transparent 75%)', 
            WebkitMaskImage: 'radial-gradient(circle at center, black 45%, transparent 75%)' 
          }} 
        />
      </div>

      {/* Top bar: Rating and Position */}
      <div className="flex justify-between items-start z-10 relative pointer-events-none">
        <div className="flex flex-col items-center drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)]">
          <div className="text-4xl font-black font-outfit leading-none">{calculatedOvr}</div>
          <span className="text-lg font-bold">{shortPos}</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-black/30 flex items-center justify-center backdrop-blur-sm shadow-md border border-white/20">
          <span className="text-xs font-bold text-white">EC</span>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="z-10 relative mt-auto pt-2 border-t border-current/20 bg-gradient-to-t from-black/10 to-transparent">
        <h3 className="text-center text-xl font-black uppercase tracking-wider mb-2 drop-shadow-sm">{player.nombre ? player.nombre.split(' ')[0] : 'NOMBRE'}</h3>
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm font-bold">
          <div className="flex justify-between">
            <span className="opacity-75">{shortPos === 'POR' ? 'DIV' : 'PAC'}</span> <span>{player.pace || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-75">{shortPos === 'POR' ? 'REF' : 'DRI'}</span> <span>{player.dribbling || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-75">{shortPos === 'POR' ? 'HAN' : 'SHO'}</span> <span>{player.shooting || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-75">{shortPos === 'POR' ? 'SPD' : 'DEF'}</span> <span>{player.defending || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-75">{shortPos === 'POR' ? 'KIC' : 'PAS'}</span> <span>{player.passing || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-75">{shortPos === 'POR' ? 'POS' : 'PHY'}</span> <span>{player.physical || 0}</span>
          </div>
        </div>
      </div>

    </div>
  );

  if (asPreview) {
    return CardContent;
  }

  return (
    <Link href={`/players/${encodeURIComponent(idOrName)}`} className="block transition-transform duration-300 hover:-translate-y-2 hover:scale-105">
      {CardContent}
    </Link>
  );
}
