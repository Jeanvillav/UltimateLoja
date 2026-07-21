'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { DndContext, useDraggable, useDroppable, DragOverlay } from '@dnd-kit/core';
import { useSquadStore } from '@/store/squadStore';
import html2canvas from 'html2canvas';
import { useSearchParams } from 'next/navigation';

function DraggablePlayer({ player }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: player.id || player.nombre,
    data: player
  });

  return (
    <div 
      ref={setNodeRef} 
      {...listeners} 
      {...attributes}
      className={`glass-panel p-2 rounded-lg cursor-grab mb-2 flex items-center gap-3 hover:bg-slate-700/50 transition-colors ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
       {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={player.foto_url || `https://placehold.co/50x50/111827/22c55e?text=${player.nombre.charAt(0)}`} alt={player.nombre} className="w-10 h-10 rounded-full object-cover" />
      <div>
        <div className="font-bold font-outfit">{player.nombre}</div>
        <div className="text-xs text-slate-400">OVR: {player.overall_rating} • {player.posicion.split(' ')[0]}</div>
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
      className={`absolute w-24 h-32 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center rounded-xl border-2 transition-all ${isOver ? 'border-yellow-400 bg-yellow-400/20' : 'border-dashed border-white/30 bg-black/40'} ${pos.player ? 'border-solid border-green-500/50' : ''}`}
      style={{ top: pos.top, left: pos.left }}
    >
      {pos.player ? (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-1 group">
          <button 
            onClick={() => removePlayer(pos.id)}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-20"
          >
            ×
          </button>
           {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pos.player.foto_url || `https://placehold.co/100x100/111827/22c55e?text=${pos.player.nombre.charAt(0)}`} alt={pos.player.nombre} className="w-16 h-16 rounded-full object-cover drop-shadow-lg mb-1" />
          <div className="bg-slate-900/80 px-2 py-0.5 rounded text-[10px] font-bold text-center w-full truncate border border-yellow-500/30 text-yellow-400">
            {pos.player.overall_rating} {pos.player.nombre.split(' ')[0]}
          </div>
        </div>
      ) : (
        <span className="text-white/50 font-bold text-sm uppercase">{pos.name}</span>
      )}
    </div>
  );
}

function SquadBuilderInner({ teams, players }) {
  const searchParams = useSearchParams();
  const baseTeamId = searchParams.get('base');
  
  const [activePlayer, setActivePlayer] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(baseTeamId || (teams[0]?.id || ''));
  const pitchRef = useRef(null);
  
  const { pitch, assignPlayer, clearSquad } = useSquadStore();

  // Handle Drag End
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

  const exportImage = async () => {
    if (pitchRef.current) {
      try {
        const canvas = await html2canvas(pitchRef.current, { backgroundColor: '#0f172a', scale: 2 });
        const image = canvas.toDataURL("image/jpeg", 0.9);
        const link = document.createElement('a');
        link.href = image;
        link.download = 'mi-plantilla-loja.jpg';
        link.click();
      } catch (err) {
        console.error("Error exportando imagen", err);
        alert("Hubo un error exportando la imagen.");
      }
    }
  };

  // Filter players
  const teamPlayers = players.filter(p => p.team_id === selectedTeam);
  const otherPlayers = players.filter(p => p.team_id !== selectedTeam);

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      
      {/* Sidebar: Players */}
      <div className="w-full lg:w-1/3 glass-panel rounded-2xl p-6 h-[80vh] flex flex-col">
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

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">De tu equipo</h3>
              {teamPlayers.length === 0 && <p className="text-xs text-slate-500 italic">No hay jugadores</p>}
              {teamPlayers.map(p => (
                <DraggablePlayer key={p.id || p.nombre} player={p} />
              ))}
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">Otros equipos</h3>
              {otherPlayers.length === 0 && <p className="text-xs text-slate-500 italic">No hay jugadores</p>}
              {otherPlayers.map(p => (
                <DraggablePlayer key={p.id || p.nombre} player={p} />
              ))}
            </div>

            <DragOverlay dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
              {activePlayer ? (
                <div className="bg-slate-800 p-2 rounded-lg flex items-center gap-3 border border-green-500 shadow-2xl opacity-90 scale-105">
                   {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={activePlayer.foto_url || `https://placehold.co/50x50/111827/22c55e?text=${activePlayer.nombre.charAt(0)}`} alt={activePlayer.nombre} className="w-10 h-10 rounded-full object-cover" />
                  <div className="font-bold text-white">{activePlayer.nombre}</div>
                </div>
              ) : null}
            </DragOverlay>
            
            {/* The Droppable positions need to be rendered inside DndContext. We'll move the pitch inside or wrap everything */}
            
          </DndContext>
        </div>
      </div>

      {/* Main Area: Pitch */}
      <div className="w-full lg:w-2/3 flex flex-col items-center">
        <div className="flex gap-4 mb-6 w-full justify-end">
          <button onClick={clearSquad} className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition border border-slate-600">
            Limpiar Cancha
          </button>
          <button onClick={exportImage} className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 font-bold rounded-lg hover:brightness-110 transition shadow-lg">
            Exportar Imagen
          </button>
        </div>

        {/* Pitch Container - We wrap this in a DndContext that shares state with the sidebar, 
            so we need to wrap the whole Flex container. Let's fix that below by rendering the Droppables.
            Since DndContext needs to wrap both Draggables and Droppables, we must restructure slightly. */}
      </div>
    </div>
  );
}

// Full combined component to share DndContext across Draggables (Sidebar) and Droppables (Pitch)
export default function SquadBuilderClient({ teams, players }) {
  const searchParams = useSearchParams();
  const baseTeamId = searchParams.get('base');
  
  const [activePlayer, setActivePlayer] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(baseTeamId || (teams[0]?.id || ''));
  const pitchRef = useRef(null);
  
  const { pitch, assignPlayer, clearSquad } = useSquadStore();
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

  const exportImage = async () => {
    if (pitchRef.current) {
      try {
        const canvas = await html2canvas(pitchRef.current, { backgroundColor: '#111827', scale: 2 });
        const image = canvas.toDataURL("image/jpeg", 0.9);
        const link = document.createElement('a');
        link.href = image;
        link.download = 'mi-plantilla-loja.jpg';
        link.click();
      } catch (err) {
        console.error("Error exportando imagen", err);
        alert("Hubo un error exportando la imagen.");
      }
    }
  };

  const teamPlayers = players.filter(p => p.team_id === selectedTeam);
  const otherPlayers = players.filter(p => p.team_id !== selectedTeam);

  if (!isClient) return <div className="text-center p-8">Cargando constructor de plantillas...</div>;

  return (
    <Suspense fallback={<div className="text-center">Cargando...</div>}>
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
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

            <div className="flex-1 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#22c55e transparent' }}>
              <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">De tu equipo</h3>
                {teamPlayers.length === 0 && <p className="text-xs text-slate-500 italic">No hay jugadores</p>}
                {teamPlayers.map(p => (
                  <DraggablePlayer key={p.id || p.nombre} player={p} />
                ))}
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">Otros equipos</h3>
                {otherPlayers.length === 0 && <p className="text-xs text-slate-500 italic">No hay jugadores</p>}
                {otherPlayers.map(p => (
                  <DraggablePlayer key={p.id || p.nombre} player={p} />
                ))}
              </div>
            </div>
          </div>

          {/* Main Area: Pitch */}
          <div className="w-full lg:w-2/3 flex flex-col items-center">
            <div className="flex gap-4 mb-6 w-full justify-end">
              <button onClick={clearSquad} className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition border border-slate-600">
                Limpiar
              </button>
              <button onClick={exportImage} className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 font-bold rounded-lg hover:brightness-110 transition shadow-lg">
                Exportar
              </button>
            </div>

            {/* The Pitch */}
            <div 
              ref={pitchRef}
              className="relative w-full max-w-[600px] aspect-[2/3] bg-gradient-to-b from-green-700 to-green-900 rounded-lg border-4 border-white/20 shadow-2xl overflow-hidden"
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
              <div className="absolute bottom-2 left-2 text-white/30 font-black font-outfit text-xl">
                ULTIMATE LOJA
              </div>
            </div>
          </div>
        </div>

        {/* Drag Overlay for smooth animation outside constraints */}
        <DragOverlay dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
          {activePlayer ? (
            <div className="bg-slate-800 p-2 rounded-lg flex items-center gap-3 border border-green-500 shadow-2xl opacity-90 scale-105">
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
