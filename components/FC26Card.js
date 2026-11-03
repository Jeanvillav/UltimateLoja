import React from 'react';
import Link from 'next/link';
import { calculateOVR } from '@/utils/ovrCalculator';
import { getPlayerPhoto } from '@/utils/playerUtils';

export default function FC26Card({ player, asPreview = false, livePhotoUrl = null }) {
  const shortPos = (player.posicion || 'DEL').split(' ')[0].substring(0, 3).toUpperCase();
  const calculatedOvr = calculateOVR(player, shortPos);

  // Paleta FIFA 15: Oro (#f6c541 / degradados dorados oscuros), Plata, Bronce
  let bgGradient = "from-[#f7d368] via-[#e5b32f] to-[#aa7d14]";
  let textColor = "text-[#2a1d04]";
  let textAccent = "text-[#422c02]";
  let borderOuter = "border-[#ffd978]";
  let dividerColor = "border-[#422c02]/25";
  let badgeBg = "bg-[#2a1d04]/80 text-[#f6c541]";
  let cardGlow = "shadow-[0_12px_28px_rgba(0,0,0,0.7),0_0_20px_rgba(246,197,65,0.35)]";

  if (calculatedOvr < 75) {
    // Silver
    bgGradient = "from-[#e2e8f0] via-[#cbd5e1] to-[#64748b]";
    textColor = "text-slate-950";
    textAccent = "text-slate-800";
    borderOuter = "border-slate-200";
    dividerColor = "border-slate-900/25";
    badgeBg = "bg-slate-900/80 text-slate-100";
    cardGlow = "shadow-[0_12px_28px_rgba(0,0,0,0.7),0_0_20px_rgba(203,213,225,0.3)]";
  }
  if (calculatedOvr < 65) {
    // Bronze
    bgGradient = "from-[#d97746] via-[#b4532a] to-[#783516]";
    textColor = "text-amber-950";
    textAccent = "text-amber-900";
    borderOuter = "border-amber-300";
    dividerColor = "border-amber-950/30";
    badgeBg = "bg-amber-950/85 text-amber-200";
    cardGlow = "shadow-[0_12px_28px_rgba(0,0,0,0.7),0_0_20px_rgba(180,83,9,0.35)]";
  }

  const idOrName = player.id || player.nombre || 'Nuevo';
  const foto = livePhotoUrl || getPlayerPhoto(player.foto_url);

  const CardContent = (
    <div className={`fc-card relative w-64 h-[395px] bg-gradient-to-b ${bgGradient} ${textColor} p-3.5 flex flex-col justify-between overflow-hidden border-2 ${borderOuter} ${cardGlow} select-none transition-all duration-300`}>
      
      {/* Patrón geométrico sutil FIFA 15 */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:10px_10px]" />
      
      {/* Resplandor superior metálico */}
      <div className="absolute -top-12 -left-12 w-40 h-40 bg-white/25 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header: OVR, Posición y Bandera */}
      <div className="flex justify-between items-start z-10 relative pointer-events-none">
        <div className="flex flex-col items-center">
          <span className="text-4xl sm:text-[42px] font-black font-outfit leading-none tracking-tighter drop-shadow-sm">
            {calculatedOvr}
          </span>
          <span className="text-base font-black font-outfit uppercase tracking-widest mt-0.5">
            {shortPos}
          </span>
          <div className="w-5 h-[2px] bg-current opacity-40 my-1.5" />
          {/* Escudo / Bandera Ecuador */}
          <div className="w-6 h-4 rounded-[2px] overflow-hidden shadow-sm border border-black/30 flex flex-col">
            <div className="bg-[#FFDD00] h-1/2 w-full" />
            <div className="bg-[#034EA2] h-1/4 w-full" />
            <div className="bg-[#ED1C24] h-1/4 w-full" />
          </div>
        </div>

        {/* Badge Loja / EC */}
        <div className={`px-2 py-0.5 rounded-sm ${badgeBg} backdrop-blur-md shadow-md border border-black/20 text-[10px] font-black tracking-wider uppercase`}>
          LOJA
        </div>
      </div>

      {/* Imagen del Jugador centrada */}
      <div className="absolute top-7 inset-x-0 mx-auto w-48 h-56 flex justify-center items-end pointer-events-none z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={foto} 
          alt={`Carta FIFA de ${player.nombre || 'Jugador'}`} 
          className="w-full h-full object-cover object-top filter drop-shadow-[0_8px_14px_rgba(0,0,0,0.6)] contrast-110" 
          style={{ 
            maskImage: 'linear-gradient(to bottom, black 70%, transparent 98%)', 
            WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 98%)' 
          }} 
        />
      </div>

      {/* Sección Inferior: Nombre y Atributos FIFA */}
      <div className={`z-10 relative mt-auto pt-2 bg-gradient-to-t from-black/20 via-black/5 to-transparent`}>
        {/* Nombre del jugador */}
        <div className={`border-b ${dividerColor} pb-1 mb-2`}>
          <h3 className="text-center text-lg font-black font-outfit uppercase tracking-widest truncate drop-shadow-sm px-1">
            {player.nombre ? player.nombre.split(' ')[0] : 'NOMBRE'}
          </h3>
        </div>
        
        {/* Grilla 6 Atributos FIFA */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs font-black font-outfit px-1 pb-1">
          <div className="flex justify-between items-center px-1">
            <span className={`${textAccent} opacity-80 text-[11px]`}>
              {['POR', 'ARQ'].includes(shortPos) ? 'DIV' : 'PAC'}
            </span> 
            <span className="text-sm">{player.pace || 0}</span>
          </div>
          <div className="flex justify-between items-center px-1">
            <span className={`${textAccent} opacity-80 text-[11px]`}>
              {['POR', 'ARQ'].includes(shortPos) ? 'REF' : 'DRI'}
            </span> 
            <span className="text-sm">{player.dribbling || 0}</span>
          </div>
          <div className="flex justify-between items-center px-1">
            <span className={`${textAccent} opacity-80 text-[11px]`}>
              {['POR', 'ARQ'].includes(shortPos) ? 'HAN' : 'SHO'}
            </span> 
            <span className="text-sm">{player.shooting || 0}</span>
          </div>
          <div className="flex justify-between items-center px-1">
            <span className={`${textAccent} opacity-80 text-[11px]`}>
              {['POR', 'ARQ'].includes(shortPos) ? 'SPD' : 'DEF'}
            </span> 
            <span className="text-sm">{player.defending || 0}</span>
          </div>
          <div className="flex justify-between items-center px-1">
            <span className={`${textAccent} opacity-80 text-[11px]`}>
              {['POR', 'ARQ'].includes(shortPos) ? 'KIC' : 'PAS'}
            </span> 
            <span className="text-sm">{player.passing || 0}</span>
          </div>
          <div className="flex justify-between items-center px-1">
            <span className={`${textAccent} opacity-80 text-[11px]`}>
              {['POR', 'ARQ'].includes(shortPos) ? 'POS' : 'PHY'}
            </span> 
            <span className="text-sm">{player.physical || 0}</span>
          </div>
        </div>

        {/* Pequeño detalle inferior estilo escudo FIFA */}
        <div className="w-8 h-[2px] bg-current opacity-30 mx-auto mt-1" />
      </div>

    </div>
  );

  if (asPreview) {
    return CardContent;
  }

  return (
    <Link href={`/players/${encodeURIComponent(idOrName)}`} className="block transition-transform duration-300 hover:-translate-y-2 hover:scale-[1.03]">
      {CardContent}
    </Link>
  );
}
