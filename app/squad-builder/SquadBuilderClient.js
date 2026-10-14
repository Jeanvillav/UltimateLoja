'use client';

import React, { useState, useRef, useEffect, useSyncExternalStore, useMemo, Suspense } from 'react';
import { DndContext, useDraggable, useDroppable, DragOverlay, useSensor, useSensors, MouseSensor, TouchSensor } from '@dnd-kit/core';
import { useSquadStore, FORMATIONS } from '@/store/squadStore';
import html2canvas from 'html2canvas-pro';
import { Copy, Users, Shield, ArrowRight, RotateCcw, Check, Sparkles } from 'lucide-react';
import { calculateOVR, getDynamicRating } from '@/utils/ovrCalculator';
import { getPlayerPhoto } from '@/utils/playerUtils';
import { createClient } from '@/utils/supabase/client';
import { useSearchParams } from 'next/navigation';

// ==========================================
// COMPONENTES DRAGGABLE & DROPPABLE
// ==========================================

function PitchDraggablePlayer({ player, posId, removePlayer, pitchPosName, teamColor = 'yellow' }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `pitch_${posId}_${player.id || player.nombre}`,
    data: { player, posId }
  });

  const dynamicRating = getDynamicRating(player, pitchPosName);
  const naturalOvr = calculateOVR(player, player.posicion);
  const isPenalized = dynamicRating < naturalOvr;

  const borderColor = teamColor === 'cyan' 
    ? 'border-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.6)]' 
    : teamColor === 'green' 
      ? 'border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.6)]' 
      : 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.6)]';

  return (
    <div 
      ref={setNodeRef}
      {...listeners} 
      {...attributes}
      className={`relative w-full h-full flex flex-col items-center justify-center p-1 group cursor-grab ${isDragging ? 'opacity-30' : 'opacity-100'}`}
    >
      <button 
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          removePlayer(posId);
        }}
        className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-30 shadow-lg cursor-pointer"
        title="Quitar jugador"
      >
        ×
      </button>

      {/* Foto del Jugador */}
      <div className={`w-14 h-14 rounded-full overflow-hidden border-2 ${borderColor} bg-slate-900 drop-shadow-2xl flex-shrink-0 relative pointer-events-none`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={getPlayerPhoto(player.foto_url)} 
          alt={player.nombre} 
          className="w-full h-full object-cover object-top" 
        />
      </div>

      {/* Badge de Media y Nombre */}
      <div className={`mt-1 bg-black/85 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-black text-center w-auto max-w-[100px] truncate border shadow-lg pointer-events-none ${
        isPenalized ? 'border-red-500/60 text-red-400' : 'border-white/20 text-white'
      }`}>
        <span className={teamColor === 'cyan' ? 'text-cyan-400 mr-1' : teamColor === 'green' ? 'text-green-400 mr-1' : 'text-yellow-400 mr-1'}>
          {dynamicRating}
        </span>
        <span>{player.nombre ? player.nombre.split(' ')[0] : 'Jugador'}</span>
      </div>
    </div>
  );
}

function DroppablePosition({ pos, player, removePlayer, teamColor = 'yellow' }) {
  const { isOver, setNodeRef } = useDroppable({
    id: pos.id,
  });

  return (
    <div 
      ref={setNodeRef}
      className={`absolute w-24 h-28 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center transition-all ${
        isOver ? 'scale-110 z-30' : 'z-10'
      }`}
      style={{ top: pos.top, left: pos.left }}
    >
      {player ? (
        <PitchDraggablePlayer 
          player={player} 
          posId={pos.id} 
          removePlayer={removePlayer} 
          pitchPosName={pos.name}
          teamColor={teamColor}
        />
      ) : (
        <div className={`w-13 h-13 rounded-full border-2 border-dashed flex flex-col items-center justify-center backdrop-blur-sm transition-all shadow-lg ${
          isOver 
            ? 'border-yellow-400 bg-yellow-400/30 scale-110' 
            : 'border-white/70 bg-black/50 text-white/90 hover:border-white'
        }`}>
          <span className="font-outfit font-black text-xs uppercase tracking-wider">{pos.name}</span>
        </div>
      )}
    </div>
  );
}

function SidebarDraggablePlayer({ 
  player, 
  assignedTeam = null, 
  onQuickAssign1 = null, 
  onQuickAssign2 = null,
  onRemove = null 
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar_${player.id || player.nombre}`,
    data: { player }
  });

  const shortPos = (player.posicion || 'DEL').split(' ')[0].substring(0, 3).toUpperCase();
  const calculatedOvr = calculateOVR(player, shortPos);

  const teamBorder = assignedTeam === 'team1' 
    ? 'border-cyan-400/80 bg-cyan-950/40' 
    : assignedTeam === 'team2' 
      ? 'border-green-400/80 bg-green-950/40' 
      : 'border-white/10 bg-slate-900/60';

  return (
    <div 
      className={`p-2.5 rounded-xl border flex flex-col gap-2 transition-all mb-2 shadow-md ${teamBorder} ${
        isDragging ? 'opacity-40 scale-95' : 'opacity-100 hover:border-slate-500'
      }`}
    >
      <div 
        ref={setNodeRef} 
        {...listeners} 
        {...attributes}
        className="flex items-center gap-3 cursor-grab"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={getPlayerPhoto(player.foto_url)} 
          alt={player.nombre} 
          className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-white/20 pointer-events-none" 
        />
        <div className="flex-1 min-w-0 pointer-events-none">
          <div className="flex items-center justify-between">
            <div className="font-bold font-outfit text-white text-xs truncate">{player.nombre}</div>
            <span className="text-[10px] font-black text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded">
              {calculatedOvr}
            </span>
          </div>
          <div className="text-[10px] text-slate-400">{shortPos} • {player.posicion}</div>
        </div>
      </div>

      {/* Botones rápidos de asignación (vitales para móvil o clics rápidos) */}
      {(onQuickAssign1 || onQuickAssign2) && (
        <div className="flex items-center gap-1.5 pt-1.5 border-t border-white/10 text-[10px] font-bold">
          {assignedTeam === 'team1' ? (
            <>
              <span className="text-cyan-300 bg-cyan-400/20 px-2 py-0.5 rounded-md flex-1 text-center truncate">
                🔵 Equipo 1
              </span>
              {onQuickAssign2 && (
                <button
                  type="button"
                  onClick={() => onQuickAssign2(player)}
                  className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-green-600 hover:text-white text-slate-300 transition"
                  title="Pasar a Equipo 2"
                >
                  ➜ Eq. 2
                </button>
              )}
              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(player.id)}
                  className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition"
                  title="Quitar de cancha"
                >
                  ×
                </button>
              )}
            </>
          ) : assignedTeam === 'team2' ? (
            <>
              <span className="text-green-300 bg-green-400/20 px-2 py-0.5 rounded-md flex-1 text-center truncate">
                🟢 Equipo 2
              </span>
              {onQuickAssign1 && (
                <button
                  type="button"
                  onClick={() => onQuickAssign1(player)}
                  className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-300 transition"
                  title="Pasar a Equipo 1"
                >
                  ➜ Eq. 1
                </button>
              )}
              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(player.id)}
                  className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition"
                  title="Quitar de cancha"
                >
                  ×
                </button>
              )}
            </>
          ) : (
            <>
              {onQuickAssign1 && (
                <button
                  type="button"
                  onClick={() => onQuickAssign1(player)}
                  className="flex-1 py-1 px-2 rounded-md bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-black transition text-center"
                >
                  + Equipo 1
                </button>
              )}
              {onQuickAssign2 && (
                <button
                  type="button"
                  onClick={() => onQuickAssign2(player)}
                  className="flex-1 py-1 px-2 rounded-md bg-green-500/20 hover:bg-green-500 text-green-300 hover:text-black transition text-center"
                >
                  + Equipo 2
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}


// ==========================================
// COMPONENTE PRINCIPAL: SQUAD BUILDER
// ==========================================

export default function SquadBuilderClient({ teams, players, isAdmin }) {
  const searchParams = useSearchParams();
  const baseTeamId = searchParams.get('base');
  const canchaParam = searchParams.get('cancha');
  const horaParam = searchParams.get('hora');
  const fechaParam = searchParams.get('fecha');
  const modoParam = searchParams.get('modo');

  const isTwoTeamsMode = modoParam === 'two_teams';

  const [activeDragItem, setActiveDragItem] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(baseTeamId || (teams[0]?.id || ''));
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Pestaña activa en modo 2 equipos (ambos, equipo 1, equipo 2)
  const [twoTeamsTab, setTwoTeamsTab] = useState('both'); // 'both' | 'team1' | 'team2'

  // Refs para capturas de imagen
  const singlePitchRef = useRef(null);
  const team1PitchRef = useRef(null);
  const team2PitchRef = useRef(null);
  const bothTeamsMatchRef = useRef(null);

  // Store para modo 1 equipo tradicional
  const { 
    pitch: singlePitch, 
    assignPlayer: assignSinglePlayer, 
    removePlayer: removeSinglePlayer, 
    clearSquad: clearSingleSquad, 
    activeFormation: singleFormation, 
    setFormation: setSingleFormation, 
    loadLineup 
  } = useSquadStore();

  // ==========================================
  // ESTADO LOCAL PARA MODO 2 EQUIPOS (Equipo 1 y Equipo 2)
  // ==========================================
  const defaultFormationName = 'Fútbol 6 (2-2-1)';
  const [team1Formation, setTeam1Formation] = useState(defaultFormationName);
  const [team2Formation, setTeam2Formation] = useState(defaultFormationName);

  const [team1Pitch, setTeam1Pitch] = useState(() => {
    return (FORMATIONS[defaultFormationName] || []).map(pos => ({ ...pos, player: null }));
  });

  const [team2Pitch, setTeam2Pitch] = useState(() => {
    return (FORMATIONS[defaultFormationName] || []).map(pos => ({ ...pos, player: null }));
  });

  // Sensores DnD con soporte Touch y Mouse
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Carga automática de alineación si vino de un equipo existente
  useEffect(() => {
    if (baseTeamId) {
      const team = teams.find(t => t.id === baseTeamId);
      if (team && team.lineup && team.formation) {
        loadLineup(team.formation, team.lineup);
      }
    }
  }, [baseTeamId, teams, loadLineup]);

  // Lista de convocados
  const paramPlayers = searchParams.get('players');
  const isConvocatoria = !!paramPlayers;
  const convocadoIds = useMemo(() => isConvocatoria ? paramPlayers.split(',') : [], [isConvocatoria, paramPlayers]);

  const displayConvocados = useMemo(() => {
    if (!isConvocatoria) return [];
    return players.filter(p => convocadoIds.includes(p.id));
  }, [isConvocatoria, players, convocadoIds]);

  const teamPlayers = useMemo(() => {
    if (isConvocatoria) return [];
    return players.filter(p => p.player_teams?.some(pt => pt.team_id === selectedTeam) || p.team_id === selectedTeam);
  }, [isConvocatoria, players, selectedTeam]);

  const otherPlayers = useMemo(() => {
    if (isConvocatoria) return [];
    return players.filter(p => !p.player_teams?.some(pt => pt.team_id === selectedTeam) && p.team_id !== selectedTeam);
  }, [isConvocatoria, players, selectedTeam]);

  // Cambio de formación para Equipo 1
  const handleTeam1FormationChange = (fName) => {
    if (!FORMATIONS[fName]) return;
    setTeam1Formation(fName);
    const newPositions = FORMATIONS[fName];
    setTeam1Pitch(prev => newPositions.map((pos, idx) => ({ ...pos, player: prev[idx]?.player || null })));
  };

  // Cambio de formación para Equipo 2
  const handleTeam2FormationChange = (fName) => {
    if (!FORMATIONS[fName]) return;
    setTeam2Formation(fName);
    const newPositions = FORMATIONS[fName];
    setTeam2Pitch(prev => newPositions.map((pos, idx) => ({ ...pos, player: prev[idx]?.player || null })));
  };

  // Asignar a Equipo 1 por ID o al primer hueco disponible
  const assignToTeam1 = (player, targetPosId = null) => {
    // Si ya estaba en el equipo 2, lo removemos de allí
    setTeam2Pitch(prev => prev.map(pos => pos.player?.id === player.id ? { ...pos, player: null } : pos));
    
    setTeam1Pitch(prev => {
      let targetIndex = -1;
      if (targetPosId) {
        targetIndex = prev.findIndex(p => p.id === targetPosId);
      }
      if (targetIndex === -1) {
        // Buscar el primer hueco libre
        targetIndex = prev.findIndex(p => !p.player);
      }
      if (targetIndex === -1) {
        alert("Equipo 1 ya tiene todas sus posiciones ocupadas. Cambia la formación o quita un jugador.");
        return prev;
      }
      
      const updated = [...prev];
      // Si el jugador ya estaba en otra posición del equipo 1, lo liberamos
      const existingIdx = updated.findIndex(p => p.player?.id === player.id);
      if (existingIdx !== -1) {
        updated[existingIdx] = { ...updated[existingIdx], player: null };
      }
      updated[targetIndex] = { ...updated[targetIndex], player };
      return updated;
    });
  };

  // Asignar a Equipo 2 por ID o al primer hueco disponible
  const assignToTeam2 = (player, targetPosId = null) => {
    // Si ya estaba en el equipo 1, lo removemos de allí
    setTeam1Pitch(prev => prev.map(pos => pos.player?.id === player.id ? { ...pos, player: null } : pos));

    setTeam2Pitch(prev => {
      let targetIndex = -1;
      if (targetPosId) {
        targetIndex = prev.findIndex(p => p.id === targetPosId);
      }
      if (targetIndex === -1) {
        targetIndex = prev.findIndex(p => !p.player);
      }
      if (targetIndex === -1) {
        alert("Equipo 2 ya tiene todas sus posiciones ocupadas. Cambia la formación o quita un jugador.");
        return prev;
      }
      
      const updated = [...prev];
      const existingIdx = updated.findIndex(p => p.player?.id === player.id);
      if (existingIdx !== -1) {
        updated[existingIdx] = { ...updated[existingIdx], player: null };
      }
      updated[targetIndex] = { ...updated[targetIndex], player };
      return updated;
    });
  };

  // Quitar de cualquiera de los dos equipos
  const removeFromBothTeams = (playerId) => {
    setTeam1Pitch(prev => prev.map(p => p.player?.id === playerId ? { ...p, player: null } : p));
    setTeam2Pitch(prev => prev.map(p => p.player?.id === playerId ? { ...p, player: null } : p));
  };

  // Saber en qué equipo está asignado un convocado
  const getAssignedTeam = (playerId) => {
    if (team1Pitch.some(p => p.player?.id === playerId)) return 'team1';
    if (team2Pitch.some(p => p.player?.id === playerId)) return 'team2';
    return null;
  };

  // Handlers de Drag and Drop
  const handleDragStart = (event) => {
    setActiveDragItem(event.active.data.current?.player || null);
  };

  const handleDragEnd = (event) => {
    const { over, active } = event;
    setActiveDragItem(null);
    if (!over) return;

    const draggedPlayer = active.data.current?.player;
    if (!draggedPlayer) return;

    const overId = String(over.id);

    if (isTwoTeamsMode) {
      if (overId.startsWith('t1_')) {
        const rawPosId = overId.replace('t1_', '');
        assignToTeam1(draggedPlayer, rawPosId);
      } else if (overId.startsWith('t2_')) {
        const rawPosId = overId.replace('t2_', '');
        assignToTeam2(draggedPlayer, rawPosId);
      }
    } else {
      assignSinglePlayer(overId, draggedPlayer);
    }
  };

  // OVR de los equipos
  const activeSinglePlayers = singlePitch.filter(p => p.player);
  const singleOvr = activeSinglePlayers.length > 0 
    ? Math.round(activeSinglePlayers.reduce((acc, p) => acc + getDynamicRating(p.player, p.name), 0) / activeSinglePlayers.length) 
    : 0;

  const activeT1Players = team1Pitch.filter(p => p.player);
  const t1Ovr = activeT1Players.length > 0 
    ? Math.round(activeT1Players.reduce((acc, p) => acc + getDynamicRating(p.player, p.name), 0) / activeT1Players.length) 
    : 0;

  const activeT2Players = team2Pitch.filter(p => p.player);
  const t2Ovr = activeT2Players.length > 0 
    ? Math.round(activeT2Players.reduce((acc, p) => acc + getDynamicRating(p.player, p.name), 0) / activeT2Players.length) 
    : 0;

  // Exportar / Copiar Imagen con CanchaPlantilla.jpg de fondo
  const exportImage = async (ref, fileName = 'plantilla.png') => {
    if (!ref.current) return;
    setIsExporting(true);
    setCopiedSuccess(false);

    try {
      const canvas = await html2canvas(ref.current, { 
        backgroundColor: '#0a0f1d', 
        useCORS: true, 
        scale: 2,
        allowTaint: true,
        logging: false
      });

      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error("No se pudo generar la imagen.");
        try {
          const item = new ClipboardItem({ "image/png": blob });
          await navigator.clipboard.write([item]);
          setCopiedSuccess(true);
          setTimeout(() => setCopiedSuccess(false), 3000);
          alert("¡Plantilla copiada al portapapeles con el fondo de la cancha! Ya puedes pegarla en WhatsApp.");
        } catch (err) {
          console.error("Clipboard API failed, downloading instead", err);
          const link = document.createElement('a');
          link.download = fileName;
          link.href = canvas.toDataURL('image/png');
          link.click();
        } finally {
          setIsExporting(false);
        }
      }, 'image/png');
    } catch (err) {
      console.error("Export error", err);
      alert("Error al copiar la imagen.");
      setIsExporting(false);
    }
  };

  // Guardar como titular (administrador)
  const handleSaveTeamLineup = async () => {
    if (!selectedTeam) return;
    setIsSaving(true);
    setSaveMessage('');
    const supabase = createClient();
    const { error } = await supabase.from('teams').update({
      formation: singleFormation,
      lineup: singlePitch
    }).eq('id', selectedTeam);
    
    setIsSaving(false);
    if (error) {
      setSaveMessage('Error al guardar alineación.');
    } else {
      setSaveMessage('¡Alineación guardada con éxito!');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  if (!isClient) return <div className="text-center p-12 text-slate-400">Cargando constructor de plantillas...</div>;

  return (
    <Suspense fallback={<div className="text-center p-12">Cargando...</div>}>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* ========================================================
              BARRA LATERAL DE JUGADORES (CONVOCADOS O PLANTILLA)
          ======================================================== */}
          <div className="w-full lg:w-1/3 glass-panel rounded-3xl p-5 sm:p-6 h-auto lg:h-[88vh] flex flex-col z-20 shadow-2xl border border-white/10 bg-black/60 backdrop-blur-2xl">
            <div className="flex items-center justify-between gap-2 mb-4">
              <h2 className="text-xl sm:text-2xl font-black font-outfit text-white flex items-center gap-2">
                <span>Jugadores</span>
                <span className="text-xs font-bold text-cyan-400 bg-cyan-400/10 px-2.5 py-0.5 rounded-full border border-cyan-400/30">
                  {isConvocatoria ? displayConvocados.length : players.length}
                </span>
              </h2>

              {isTwoTeamsMode ? (
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  🏆 Modo: 2 Equipos
                </span>
              ) : (
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-green-500/20 text-green-300 border border-green-500/40">
                  🛡️ Modo: 1 Equipo
                </span>
              )}
            </div>

            {/* Selector de plantilla base si no viene de convocados */}
            {!isConvocatoria && (
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Plantilla Base:</label>
                <select 
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-white outline-none focus:border-cyan-400 font-bold"
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                >
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Lista scrollable de jugadores */}
            <div className="flex-1 overflow-y-auto pr-1.5 custom-scrollbar max-h-[60vh] lg:max-h-none">
              {isConvocatoria ? (
                <div className="mb-4">
                  <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                    {isTwoTeamsMode 
                      ? 'Arrastra a cada jugador a la cancha deseada, o presiona "+ Equipo 1" o "+ Equipo 2" para asignarlo rápidamente.'
                      : 'Arrastra a los jugadores a la posición que desees en la cancha.'}
                  </p>

                  {displayConvocados.map(p => (
                    <SidebarDraggablePlayer 
                      key={p.id || p.nombre} 
                      player={p}
                      assignedTeam={isTwoTeamsMode ? getAssignedTeam(p.id) : null}
                      onQuickAssign1={isTwoTeamsMode ? () => assignToTeam1(p) : null}
                      onQuickAssign2={isTwoTeamsMode ? () => assignToTeam2(p) : null}
                      onRemove={isTwoTeamsMode ? () => removeFromBothTeams(p.id) : null}
                    />
                  ))}
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h3 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">De tu equipo</h3>
                    {teamPlayers.length === 0 && <p className="text-xs text-slate-500 italic">No hay jugadores registrados</p>}
                    {teamPlayers.map(p => (
                      <SidebarDraggablePlayer key={p.id || p.nombre} player={p} />
                    ))}
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Otros jugadores</h3>
                    {otherPlayers.length === 0 && <p className="text-xs text-slate-500 italic">No hay más jugadores</p>}
                    {otherPlayers.map(p => (
                      <SidebarDraggablePlayer key={p.id || p.nombre} player={p} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>


          {/* ========================================================
              ÁREA PRINCIPAL DE LA(S) CANCHA(S)
          ======================================================== */}
          <div className="w-full lg:w-2/3 flex flex-col gap-6">

            {/* ==========================================
                CASO A: MODO 2 EQUIPOS (DOS CANCHAS EN PANTALLA)
            ========================================== */}
            {isTwoTeamsMode ? (
              <div className="flex flex-col gap-6">
                
                {/* Barra de control superior para 2 equipos */}
                <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
                  {/* Comparador de Medias de los 2 Equipos */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 bg-cyan-950/60 border border-cyan-400/40 px-3.5 py-2 rounded-xl shadow-md">
                      <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></span>
                      <div>
                        <span className="text-[10px] font-black uppercase text-cyan-300 block">Equipo 1</span>
                        <span className="text-xl font-black font-outfit text-white leading-none">{t1Ovr || '--'} OVR</span>
                      </div>
                    </div>

                    <span className="text-sm font-black text-yellow-400 font-outfit">VS</span>

                    <div className="flex items-center gap-3 bg-green-950/60 border border-green-400/40 px-3.5 py-2 rounded-xl shadow-md">
                      <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></span>
                      <div>
                        <span className="text-[10px] font-black uppercase text-green-300 block">Equipo 2</span>
                        <span className="text-xl font-black font-outfit text-white leading-none">{t2Ovr || '--'} OVR</span>
                      </div>
                    </div>
                  </div>

                  {/* Selector de Pestaña en Móvil / Desktop */}
                  <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-700">
                    <button
                      type="button"
                      onClick={() => setTwoTeamsTab('both')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        twoTeamsTab === 'both' ? 'bg-cyan-400 text-black shadow-md' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Ambas Canchas
                    </button>
                    <button
                      type="button"
                      onClick={() => setTwoTeamsTab('team1')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        twoTeamsTab === 'team1' ? 'bg-cyan-400 text-black shadow-md' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Solo Eq. 1
                    </button>
                    <button
                      type="button"
                      onClick={() => setTwoTeamsTab('team2')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        twoTeamsTab === 'team2' ? 'bg-green-400 text-black shadow-md' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Solo Eq. 2
                    </button>
                  </div>

                  {/* Botón Principal para Copiar Imagen del Partido Completo */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => exportImage(bothTeamsMatchRef, 'duelo-sintetica-loja.png')}
                      disabled={isExporting}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-400 hover:from-yellow-400 hover:to-amber-300 text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(250,204,21,0.4)] hover:scale-105 active:scale-95 cursor-pointer flex-shrink-0"
                    >
                      <Copy size={16} />
                      <span>{isExporting ? 'Copiando...' : 'Copiar Imagen del Duelo'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setTeam1Pitch(prev => prev.map(p => ({ ...p, player: null })));
                        setTeam2Pitch(prev => prev.map(p => ({ ...p, player: null })));
                      }}
                      className="p-2.5 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition border border-red-500/30"
                      title="Limpiar ambas canchas"
                    >
                      <RotateCcw size={16} />
                    </button>
                  </div>
                </div>

                {/* Contenedor Capturable de Ambas Canchas para la Imagen Exportada */}
                <div ref={bothTeamsMatchRef} className="p-4 rounded-3xl bg-slate-950/90 border border-white/10 shadow-2xl flex flex-col gap-4">
                  
                  {/* Encabezado del Duelo que saldrá en la Imagen */}
                  <div className="bg-gradient-to-r from-cyan-950/80 via-slate-900 to-green-950/80 p-3 sm:p-4 rounded-2xl border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-center sm:text-left">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400 block">
                        ⚔️ Duelo de Sintética en Loja
                      </span>
                      <h3 className="text-lg sm:text-xl font-black font-outfit text-white">
                        <span className="text-cyan-400">Equipo 1 ({t1Ovr} OVR)</span>
                        <span className="text-yellow-400 mx-2">VS</span>
                        <span className="text-green-400">Equipo 2 ({t2Ovr} OVR)</span>
                      </h3>
                    </div>
                    {(canchaParam || fechaParam || horaParam) && (
                      <div className="text-xs font-bold text-slate-300 flex items-center justify-center sm:justify-end gap-2 flex-wrap">
                        {canchaParam && <span className="text-yellow-400">🏟️ {canchaParam}</span>}
                        {fechaParam && <span>• 📅 {fechaParam}</span>}
                        {horaParam && <span>• ⏰ {horaParam}</span>}
                      </div>
                    )}
                  </div>

                  {/* Cuadrícula con las DOS Canchas */}
                  <div className={`grid gap-6 ${
                    twoTeamsTab === 'both' ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'
                  }`}>

                    {/* =====================================
                        CANCHA 1: EQUIPO 1 (Azul / Cian)
                    ===================================== */}
                    {(twoTeamsTab === 'both' || twoTeamsTab === 'team1') && (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between bg-cyan-950/50 p-3 rounded-xl border border-cyan-400/30">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                            <span className="font-outfit font-black text-sm text-cyan-300 uppercase">Equipo 1</span>
                            <span className="text-xs font-bold text-white bg-black/40 px-2 py-0.5 rounded-full">
                              {t1Ovr} OVR
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <select
                              value={team1Formation}
                              onChange={(e) => handleTeam1FormationChange(e.target.value)}
                              className="bg-slate-900 border border-slate-700 text-cyan-300 text-xs font-bold rounded-lg p-1.5 outline-none focus:border-cyan-400"
                            >
                              {Object.keys(FORMATIONS).map(f => (
                                <option key={f} value={f}>{f}</option>
                              ))}
                            </select>

                            <button
                              type="button"
                              onClick={() => exportImage(team1PitchRef, 'equipo-1-sintetica.png')}
                              className="p-1.5 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500 hover:text-black rounded-lg transition"
                              title="Copiar solo Equipo 1"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Cancha 1 con Fondo CanchaPlantilla.jpg */}
                        <div className="w-full flex justify-center">
                          <div 
                            ref={team1PitchRef}
                            className="relative w-full max-w-[440px] aspect-[736/1307] rounded-2xl overflow-hidden shadow-2xl border-2 border-cyan-500/40 select-none"
                          >
                            {/* Imagen de Cancha Real */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src="/CanchaPlantilla.jpg" 
                              alt="Cancha Equipo 1" 
                              className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-0" 
                              crossOrigin="anonymous"
                            />

                            {/* Badge superior del equipo en la cancha */}
                            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-black/85 backdrop-blur-md px-3.5 py-1 rounded-full border border-cyan-400/50 flex items-center gap-2 shadow-2xl pointer-events-none">
                              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                              <span className="text-xs font-black text-cyan-300 uppercase">Equipo 1</span>
                              <span className="text-xs font-bold text-white">• {t1Ovr} OVR</span>
                            </div>

                            {/* Posiciones de la Cancha 1 */}
                            {team1Pitch.map(pos => (
                              <DroppablePosition 
                                key={`t1_${pos.id}`} 
                                pos={{ ...pos, id: `t1_${pos.id}` }}
                                player={pos.player}
                                removePlayer={(posId) => {
                                  const rawId = posId.replace('t1_', '');
                                  setTeam1Pitch(prev => prev.map(p => p.id === rawId ? { ...p, player: null } : p));
                                }}
                                teamColor="cyan"
                              />
                            ))}

                            <div className="absolute bottom-2 left-3 text-white/30 font-black font-outfit text-sm pointer-events-none">
                              ULTIMATE LOJA • EQ 1
                            </div>
                          </div>
                        </div>
                      </div>
                    )}


                    {/* =====================================
                        CANCHA 2: EQUIPO 2 (Verde / Esmeralda)
                    ===================================== */}
                    {(twoTeamsTab === 'both' || twoTeamsTab === 'team2') && (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between bg-green-950/50 p-3 rounded-xl border border-green-400/30">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
                            <span className="font-outfit font-black text-sm text-green-300 uppercase">Equipo 2</span>
                            <span className="text-xs font-bold text-white bg-black/40 px-2 py-0.5 rounded-full">
                              {t2Ovr} OVR
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <select
                              value={team2Formation}
                              onChange={(e) => handleTeam2FormationChange(e.target.value)}
                              className="bg-slate-900 border border-slate-700 text-green-300 text-xs font-bold rounded-lg p-1.5 outline-none focus:border-green-400"
                            >
                              {Object.keys(FORMATIONS).map(f => (
                                <option key={f} value={f}>{f}</option>
                              ))}
                            </select>

                            <button
                              type="button"
                              onClick={() => exportImage(team2PitchRef, 'equipo-2-sintetica.png')}
                              className="p-1.5 bg-green-500/20 text-green-300 hover:bg-green-500 hover:text-black rounded-lg transition"
                              title="Copiar solo Equipo 2"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Cancha 2 con Fondo CanchaPlantilla.jpg */}
                        <div className="w-full flex justify-center">
                          <div 
                            ref={team2PitchRef}
                            className="relative w-full max-w-[440px] aspect-[736/1307] rounded-2xl overflow-hidden shadow-2xl border-2 border-green-500/40 select-none"
                          >
                            {/* Imagen de Cancha Real */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src="/CanchaPlantilla.jpg" 
                              alt="Cancha Equipo 2" 
                              className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-0" 
                              crossOrigin="anonymous"
                            />

                            {/* Badge superior del equipo en la cancha */}
                            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-black/85 backdrop-blur-md px-3.5 py-1 rounded-full border border-green-400/50 flex items-center gap-2 shadow-2xl pointer-events-none">
                              <span className="w-2 h-2 rounded-full bg-green-400"></span>
                              <span className="text-xs font-black text-green-300 uppercase">Equipo 2</span>
                              <span className="text-xs font-bold text-white">• {t2Ovr} OVR</span>
                            </div>

                            {/* Posiciones de la Cancha 2 */}
                            {team2Pitch.map(pos => (
                              <DroppablePosition 
                                key={`t2_${pos.id}`} 
                                pos={{ ...pos, id: `t2_${pos.id}` }}
                                player={pos.player}
                                removePlayer={(posId) => {
                                  const rawId = posId.replace('t2_', '');
                                  setTeam2Pitch(prev => prev.map(p => p.id === rawId ? { ...p, player: null } : p));
                                }}
                                teamColor="green"
                              />
                            ))}

                            <div className="absolute bottom-2 left-3 text-white/30 font-black font-outfit text-sm pointer-events-none">
                              ULTIMATE LOJA • EQ 2
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            ) : (

              /* ==========================================
                  CASO B: MODO 1 EQUIPO TRADICIONAL
              ========================================== */
              <div className="flex flex-col gap-6">
                
                {/* Barra de control superior para 1 equipo */}
                <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                  <div className="flex items-center gap-4">
                    <div className="text-center bg-slate-900 border border-slate-700 px-4 py-2 rounded-xl">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-0.5">Media del Equipo</div>
                      <div className={`text-3xl font-black font-outfit leading-none ${singleOvr >= 75 ? 'text-green-400' : singleOvr > 0 ? 'text-yellow-400' : 'text-slate-600'}`}>
                        {singleOvr || '--'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-xs text-slate-400 font-bold uppercase">Formación:</label>
                      <select 
                        value={singleFormation || 'Fútbol 6 (2-2-1)'}
                        onChange={(e) => setSingleFormation(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-xl p-2 text-white outline-none focus:border-green-400 font-bold text-xs"
                      >
                        {Object.keys(FORMATIONS).map(f => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isAdmin && selectedTeam && !isConvocatoria && (
                      <button 
                        onClick={handleSaveTeamLineup}
                        disabled={isSaving}
                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg"
                      >
                        {isSaving ? 'Guardando...' : 'Guardar como Titular'}
                      </button>
                    )}

                    <button 
                      onClick={() => exportImage(singlePitchRef, 'plantilla-cancha-loja.png')} 
                      disabled={isExporting}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(34,197,94,0.4)] cursor-pointer"
                    >
                      <Copy size={16} />
                      <span>{isExporting ? 'Copiando...' : 'Copiar Imagen'}</span>
                    </button>

                    <button 
                      onClick={clearSingleSquad} 
                      className="p-2.5 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition border border-red-500/30"
                      title="Limpiar alineación"
                    >
                      <RotateCcw size={16} />
                    </button>
                  </div>
                </div>

                {saveMessage && <div className="text-xs text-green-400 font-bold bg-green-500/10 p-2.5 rounded-xl border border-green-500/30 text-center">{saveMessage}</div>}

                {/* La Cancha Individual con CanchaPlantilla.jpg de fondo */}
                <div className="w-full flex justify-center overflow-x-auto pb-4 custom-scrollbar">
                  <div 
                    ref={singlePitchRef}
                    className="relative w-full max-w-[480px] aspect-[736/1307] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 select-none"
                  >
                    {/* Imagen de Cancha Real */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src="/CanchaPlantilla.jpg" 
                      alt="Cancha de Fútbol" 
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-0" 
                      crossOrigin="anonymous"
                    />

                    {/* Banner de datos del partido en la parte superior de la cancha */}
                    {(canchaParam || horaParam || fechaParam) && (
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-black/85 backdrop-blur-md px-4 py-1.5 rounded-full border border-yellow-400/50 flex items-center gap-2.5 shadow-2xl text-xs font-black text-white pointer-events-none">
                        {canchaParam && <span className="text-yellow-400">🏟️ {canchaParam}</span>}
                        {horaParam && <span className="text-slate-300">• ⏰ {horaParam}</span>}
                        {fechaParam && <span className="text-slate-400 text-[10px]">• 📅 {fechaParam}</span>}
                      </div>
                    )}

                    {/* Posiciones de la Cancha */}
                    {singlePitch.map(pos => (
                      <DroppablePosition 
                        key={pos.id} 
                        pos={pos}
                        player={pos.player}
                        removePlayer={removeSinglePlayer}
                        teamColor="yellow"
                      />
                    ))}

                    <div className="absolute bottom-3 left-3 text-white/30 font-black font-outfit text-base pointer-events-none">
                      ULTIMATE LOJA
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Drag Overlay para animación suave */}
        <DragOverlay dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
          {activeDragItem ? (
            <div className="bg-slate-900 p-2 rounded-xl flex items-center gap-3 border border-yellow-400 shadow-2xl opacity-90 scale-105 pointer-events-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={getPlayerPhoto(activeDragItem.foto_url)} alt={activeDragItem.nombre} className="w-10 h-10 rounded-full object-cover" />
              <div className="font-bold text-white text-xs">{activeDragItem.nombre}</div>
            </div>
          ) : null}
        </DragOverlay>

      </DndContext>
    </Suspense>
  );
}
