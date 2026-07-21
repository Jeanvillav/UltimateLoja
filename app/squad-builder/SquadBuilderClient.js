'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { DndContext, useDraggable, useDroppable, DragOverlay, useSensor, useSensors, MouseSensor, TouchSensor } from '@dnd-kit/core';
import { useSquadStore, FORMATIONS } from '@/store/squadStore';
import html2canvas from 'html2canvas';
import { calculateOVR, getDynamicRating } from '@/utils/ovrCalculator';
import { createClient } from '@/utils/supabase/client';
import { useSearchParams } from 'next/navigation';

function PitchDraggablePlayer({ player, posId, removePlayer, pitchPosName }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `pitch_${player.id || player.nombre}`,
    data: player
  });

  const dynamicRating = getDynamicRating(player, pitchPosName);
  const naturalOvr = calculateOVR(player, player.posicion);
  const isPenalized = dynamicRating < naturalOvr;

  return (
    <div 
      ref={setNodeRef}
      {...listeners} 
      {...attributes}
      className={`relative w-full h-full flex flex-col items-center justify-center p-1 group cursor-grab ${isDragging ? 'opacity-30' : 'opacity-100'}`}
    >
      <button 
        onClick={(e) => {
          e.stopPropagation(); // Prevent drag start when clicking remove
          removePlayer(posId);
        }}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-20"
      >
        ×
      </button>
       {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={player.foto_url || `https://placehold.co/100x100/111827/22c55e?text=${player.nombre.charAt(0)}`} alt={player.nombre} className="w-16 h-16 rounded-full object-cover drop-shadow-lg mb-1 pointer-events-none" />
      <div className={`bg-slate-900/80 px-2 py-0.5 rounded text-[10px] font-bold text-center w-full truncate border ${isPenalized ? 'border-red-500/50 text-red-400' : 'border-yellow-500/30 text-yellow-400'}`}>
        {dynamicRating} {player.nombre.split(' ')[0]}
      </div>
    </div>
  );
}

function SidebarDraggablePlayer({ player }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: player.id || player.nombre,
    data: player
  });

  const shortPos = (player.posicion || 'DEL').split(' ')[0].substring(0, 3).toUpperCase();
  const calculatedOvr = calculateOVR(player, shortPos);

  return (
    <div 
      ref={setNodeRef} 
      {...listeners} 
      {...attributes}
      className={`glass-panel p-2 rounded-lg cursor-grab mb-2 flex items-center gap-3 hover:bg-slate-700/50 transition-colors ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
       {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={player.foto_url || `https://placehold.co/50x50/111827/22c55e?text=${player.nombre.charAt(0)}`} alt={player.nombre} className="w-10 h-10 rounded-full object-cover pointer-events-none" />
      <div>
        <div className="font-bold font-outfit">{player.nombre}</div>
        <div className="text-xs text-slate-400">OVR: {calculatedOvr} • {player.posicion.split(' ')[0]}</div>
      </div>
    </div>
  );
}

function DroppablePosition({ pos }) {
  const { isOver, setNodeRef } = useDroppable({
    id: pos.id,
  });
  
  const { removePlayer } = useSquadStore();

  return (
    <div 
      ref={setNodeRef}
      className={`absolute w-24 h-32 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center rounded-xl border-2 transition-all ${isOver ? 'border-yellow-400 bg-yellow-400/20 z-30 scale-110' : 'border-dashed border-white/30 bg-black/40'} ${pos.player ? 'border-solid border-green-500/50 z-10' : ''}`}
      style={{ top: pos.top, left: pos.left }}
    >
      {pos.player ? (
        <PitchDraggablePlayer player={pos.player} posId={pos.id} removePlayer={removePlayer} pitchPosName={pos.name} />
      ) : (
        <span className="text-white/50 font-bold text-sm uppercase pointer-events-none">{pos.name}</span>
      )}
    </div>
  );
}

export default function SquadBuilderClient({ teams, players, isAdmin }) {
  const searchParams = useSearchParams();
  const baseTeamId = searchParams.get('base');
  
  const [activePlayer, setActivePlayer] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(baseTeamId || (teams[0]?.id || ''));
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const pitchRef = useRef(null);
  
  const { pitch, assignPlayer, clearSquad, activeFormation, setFormation, loadLineup } = useSquadStore();

  useEffect(() => {
    // Auto-load team lineup if provided via query param
    if (baseTeamId) {
      const team = teams.find(t => t.id === baseTeamId);
      if (team && team.lineup && team.formation) {
        loadLineup(team.formation, team.lineup);
      }
    }
  }, [baseTeamId, teams, loadLineup]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDragEnd = (event) => {
    const { over, active } = event;
    setActivePlayer(null);
    if (over) {
      assignPlayer(over.id, active.data.current);
    }
  };

  const handleDragStart = (event) => {
    setActivePlayer(event.active.data.current);
  };



  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    })
  );

  const handleSaveTeamLineup = async () => {
    if (!selectedTeam) return;
    setIsSaving(true);
    setSaveMessage('');
    const supabase = createClient();
    const { error } = await supabase.from('teams').update({
      formation: activeFormation,
      lineup: pitch
    }).eq('id', selectedTeam);
    
    setIsSaving(false);
    if (error) {
      setSaveMessage('Error al guardar alineación.');
      console.error(error);
    } else {
      setSaveMessage('¡Alineación guardada con éxito!');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const isPlayerInTeam = (p, tId) => {
    if (p.player_teams && p.player_teams.length > 0) return p.player_teams.some(pt => pt.team_id === tId);
    return p.team_id === tId;
  };

  const teamPlayers = players.filter(p => isPlayerInTeam(p, selectedTeam));
  const otherPlayers = players.filter(p => !isPlayerInTeam(p, selectedTeam));

  // Compute Squad OVR
  const activePlayers = pitch.filter(pos => pos.player);
  const squadOvr = activePlayers.length > 0
    ? Math.round(activePlayers.reduce((sum, pos) => sum + getDynamicRating(pos.player, pos.name), 0) / activePlayers.length)
    : 0;

  if (!isClient) return <div className="text-center p-8">Cargando constructor de plantillas...</div>;

  return (
    <Suspense fallback={<div className="text-center">Cargando...</div>}>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Sidebar */}
          <div className="w-full lg:w-1/3 glass-panel rounded-2xl p-6 h-[80vh] flex flex-col z-20">
            <h2 className="text-2xl font-bold font-outfit mb-4 text-green-400">Jugadores</h2>
            
            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">Plantilla Base:</label>
              <select 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-green-500"
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
              >
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar" style={{ scrollbarWidth: 'thin', scrollbarColor: '#22c55e transparent' }}>
              <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">De tu equipo</h3>
                {teamPlayers.length === 0 && <p className="text-xs text-slate-500 italic">No hay jugadores</p>}
                {teamPlayers.map(p => (
                  <SidebarDraggablePlayer key={p.id || p.nombre} player={p} />
                ))}
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">Otros equipos</h3>
                {otherPlayers.length === 0 && <p className="text-xs text-slate-500 italic">No hay jugadores</p>}
                {otherPlayers.map(p => (
                  <SidebarDraggablePlayer key={p.id || p.nombre} player={p} />
                ))}
              </div>
            </div>
          </div>

          {/* Main Area: Pitch */}
          <div className="w-full lg:w-2/3 flex flex-col items-center">
            <div className="flex flex-col sm:flex-row gap-4 mb-6 w-full justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Valoración</div>
                  <div className={`text-3xl font-black font-outfit ${squadOvr >= 85 ? 'text-yellow-400' : squadOvr >= 75 ? 'text-green-400' : squadOvr > 0 ? 'text-white' : 'text-slate-600'}`}>
                    {squadOvr || '--'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-400 font-bold">Formación:</label>
                  <select 
                    value={activeFormation || 'Fútbol 6 (2-2-1)'}
                    onChange={(e) => setFormation(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-green-500 font-bold"
                  >
                    {Object.keys(FORMATIONS).map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                {isAdmin && selectedTeam && (
                  <div className="flex flex-col items-end">
                    <button 
                      onClick={handleSaveTeamLineup}
                      disabled={isSaving}
                      className="btn-fifa py-2 px-4 text-sm whitespace-nowrap bg-gradient-to-r from-blue-600 to-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                    >
                      {isSaving ? 'Guardando...' : 'Guardar como Titular'}
                    </button>
                    {saveMessage && <span className="text-xs text-green-400 mt-1">{saveMessage}</span>}
                  </div>
                )}
                
                <button onClick={clearSquad} className="px-4 py-2 bg-red-500/20 text-red-400 font-bold rounded-lg hover:bg-red-500/30 transition border border-red-500/30">
                  Limpiar
                </button>
              </div>
            </div>

            {/* The Pitch wrapped for horizontal scrolling on mobile */}
            <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
              <div 
                ref={pitchRef}
                className="relative w-[600px] aspect-[2/3] mx-auto bg-gradient-to-b from-green-700 to-green-900 rounded-lg border-4 border-white/20 shadow-2xl overflow-hidden"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '100% 10%, 20% 100%'
                }}
              >
              {/* Pitch lines */}
              <div className="absolute top-0 left-[25%] w-[50%] h-[15%] border-b-2 border-x-2 border-white/30"></div>
              <div className="absolute bottom-0 left-[25%] w-[50%] h-[15%] border-t-2 border-x-2 border-white/30"></div>
              <div className="absolute top-[50%] left-0 w-full h-[2px] bg-white/30"></div>
              <div className="absolute top-[50%] left-[50%] w-[20%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/30"></div>
              
              {/* Render Drop Zones */}
              {pitch.map(pos => (
                <DroppablePosition key={pos.id} pos={pos} />
              ))}

              {/* Watermark for export */}
              <div className="absolute bottom-2 left-2 text-white/30 font-black font-outfit text-xl pointer-events-none">
                ULTIMATE LOJA
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* Drag Overlay for smooth animation outside constraints */}
        <DragOverlay dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
          {activePlayer ? (
            <div className="bg-slate-800 p-2 rounded-lg flex items-center gap-3 border border-green-500 shadow-2xl opacity-90 scale-105 pointer-events-none">
               {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={activePlayer.foto_url || `https://placehold.co/50x50/111827/22c55e?text=${activePlayer.nombre.charAt(0)}`} alt={activePlayer.nombre} className="w-10 h-10 rounded-full object-cover" />
              <div className="font-bold text-white">{activePlayer.nombre}</div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </Suspense>
  );
}
