"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FC26Card from '@/components/FC26Card';
import { calculateOVR } from '@/utils/ovrCalculator';

export default function ConvocadosClient({ initialPlayers }) {
  const CANCHAS_LOJA = [
    'La Sede',
    'Colegio De Ingenieros',
    'Calva y Calva',
    'The Forest'
  ];

  const [selectedCancha, setSelectedCancha] = useState('La Sede');
  const [customCancha, setCustomCancha] = useState('');
  const [matchDate, setMatchDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [matchTime, setMatchTime] = useState('20:00');
  const [canchaCost, setCanchaCost] = useState(20);

  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [statuses, setStatuses] = useState({});
  const router = useRouter();
  
  const togglePlayerSelection = (player) => {
    const isSelected = selectedPlayers.some(p => p.id === player.id);
    if (isSelected) {
      setSelectedPlayers(selectedPlayers.filter(p => p.id !== player.id));
      const newStatuses = { ...statuses };
      delete newStatuses[player.id];
      setStatuses(newStatuses);
    } else {
      if (selectedPlayers.length < 14) {
        setSelectedPlayers([...selectedPlayers, player]);
        setStatuses({ ...statuses, [player.id]: 'pendiente' });
      } else {
        alert("Ya has seleccionado el máximo de 14 jugadores.");
      }
    }
  };

  const isSelected = (playerId) => selectedPlayers.some(p => p.id === playerId);
  
  const isValidConvocatoria = selectedPlayers.length >= 5 && selectedPlayers.length <= 14;

  const confirmedPlayers = selectedPlayers.filter(p => statuses[p.id] === 'confirmado');
  const costPerPerson = confirmedPlayers.length > 0 && canchaCost > 0 
    ? (canchaCost / confirmedPlayers.length).toFixed(2) 
    : null;

  const getFormattedDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const [year, month, day] = dateStr.split('-');
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long' });
    } catch {
      return dateStr;
    }
  };

  const handleConfirm = () => {
    if (isValidConvocatoria) {
      const availablePlayers = selectedPlayers.filter(p => statuses[p.id] !== 'ausente');
      const ids = availablePlayers.map(p => p.id).join(',');
      const finalCancha = selectedCancha === 'Otro' ? (customCancha || 'Sintética') : selectedCancha;
      const params = new URLSearchParams({
        players: ids,
        cancha: finalCancha,
        hora: matchTime,
        fecha: matchDate
      });
      router.push(`/squad-builder?${params.toString()}`);
    }
  };

  const handleCopyList = async () => {
    if (selectedPlayers.length === 0) return;
    
    const confirmados = selectedPlayers.filter(p => statuses[p.id] === 'confirmado');
    const pendientes = selectedPlayers.filter(p => (statuses[p.id] || 'pendiente') === 'pendiente');
    const ausentes = selectedPlayers.filter(p => statuses[p.id] === 'ausente');
    const finalCancha = selectedCancha === 'Otro' ? (customCancha || 'Cancha por definir') : selectedCancha;

    let text = `⚽ *PARTIDO DE SINTÉTICA - LOJA* ⚽\n`;
    text += `🏟️ *Cancha:* ${finalCancha}\n`;
    if (matchDate) text += `📅 *Fecha:* ${getFormattedDate(matchDate)}\n`;
    if (matchTime) text += `⏰ *Hora:* ${matchTime}\n`;
    if (canchaCost > 0) {
      text += `💵 *Costo Cancha:* $${Number(canchaCost).toFixed(2)}`;
      if (confirmados.length > 0) {
        text += ` ($${costPerPerson} c/u entre los ${confirmados.length} confirmados)\n`;
      } else {
        text += `\n`;
      }
    }
    text += `\n📋 *CONVOCATORIA* (${selectedPlayers.length}/14 Jugadores)\n\n`;

    if (confirmados.length > 0) {
      text += `🟢 *Confirmados (${confirmados.length}):*\n`;
      confirmados.forEach(p => text += `✔ ${p.nombre}\n`);
      text += '\n';
    }

    if (pendientes.length > 0) {
      text += `🟡 *Por Confirmar (${pendientes.length}):*\n`;
      pendientes.forEach(p => text += `⏳ ${p.nombre}\n`);
      text += '\n';
    }

    if (ausentes.length > 0) {
      text += `🔴 *No Pueden (${ausentes.length}):*\n`;
      ausentes.forEach(p => text += `✖ ${p.nombre}\n`);
      text += '\n';
    }

    text += `¡Pilas a confirmar los que faltan! 🔥⚽`;

    try {
      await navigator.clipboard.writeText(text);
      alert("¡Lista copiada al portapapeles con los datos del partido!");
    } catch (err) {
      console.error(err);
      alert("Error al copiar la lista.");
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Selector de Cancha y Detalles del Partido */}
      <div className="glass-panel p-6 rounded-2xl border-t border-[var(--color-highlight)]/40 shadow-2xl bg-black/40 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-[var(--color-highlight)] bg-[var(--color-highlight)]/10 px-3 py-1 rounded-full border border-[var(--color-highlight)]/30">
              📍 Loja, Ecuador
            </span>
            <h2 className="text-2xl font-black font-outfit text-white mt-2">
              Organizador del Partido
            </h2>
            <p className="text-sm text-slate-400">
              Elige la sintética, horario y calcula la cuota automática para tus convocados.
            </p>
          </div>

          {/* Resumen rápido de cuota */}
          <div className="bg-slate-900/90 border border-slate-700/80 p-3 rounded-xl flex items-center gap-4 self-start md:self-auto shadow-inner">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Cuota por Confirmado</span>
              <span className="text-lg font-black text-green-400 font-outfit">
                {costPerPerson ? `$${costPerPerson}` : '--'}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Confirmados</span>
              <span className="text-lg font-black text-white font-outfit">
                {confirmedPlayers.length} / {selectedPlayers.length}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Canchas de Loja */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              🏟️ Cancha en Loja
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CANCHAS_LOJA.map(cancha => (
                <button
                  key={cancha}
                  type="button"
                  onClick={() => setSelectedCancha(cancha)}
                  className={`py-3 px-3 rounded-xl font-bold text-xs transition-all text-center flex flex-col items-center justify-center gap-1 border ${
                    selectedCancha === cancha
                      ? 'bg-[var(--color-highlight)] text-black border-[var(--color-highlight)] shadow-[0_0_15px_rgba(0,229,255,0.4)] scale-[1.02]'
                      : 'bg-slate-900/70 text-slate-300 border-slate-700/80 hover:border-slate-500 hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate w-full">{cancha}</span>
                </button>
              ))}
            </div>

            {selectedCancha === 'Otro' && (
              <input
                type="text"
                placeholder="Nombre de la cancha o ubicación..."
                value={customCancha}
                onChange={(e) => setCustomCancha(e.target.value)}
                className="mt-3 w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-[var(--color-highlight)]"
              />
            )}
          </div>

          {/* Fecha, Hora y Costo */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                📅 Fecha
              </label>
              <input
                type="date"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white outline-none focus:border-[var(--color-highlight)] font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                ⏰ Hora
              </label>
              <input
                type="time"
                value={matchTime}
                onChange={(e) => setMatchTime(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white outline-none focus:border-[var(--color-highlight)] font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                💵 Costo ($)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={canchaCost}
                onChange={(e) => setCanchaCost(Number(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-green-400 font-bold outline-none focus:border-green-500 text-center"
              />
            </div>
          </div>
        </div>
      </div>

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
              <div className="flex gap-2">
                <button 
                  disabled={selectedPlayers.length === 0}
                  onClick={handleCopyList}
                  className="w-12 h-12 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 hover:text-white transition flex items-center justify-center border border-slate-700 flex-shrink-0 disabled:opacity-50"
                  title="Copiar lista de texto con detalles del partido"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                </button>
                <button 
                  disabled={!isValidConvocatoria}
                  className={`flex-1 py-3 rounded-xl font-black uppercase tracking-wider transition-all ${
                    isValidConvocatoria 
                      ? 'bg-[var(--color-highlight)] text-black hover:bg-white hover:scale-105 shadow-[0_0_20px_rgba(0,229,255,0.6)] cursor-pointer' 
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  }`}
                  onClick={handleConfirm}
                >
                  {selectedPlayers.length < 5 ? `Faltan ${5 - selectedPlayers.length}` : 'Armar Táctica'}
                </button>
              </div>
            </div>
          
          {selectedPlayers.length > 0 ? (
            <div className="flex flex-col gap-3 max-h-[50vh] lg:max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {selectedPlayers.map(p => {
                const shortPos = (p.posicion || 'DEL').split(' ')[0].substring(0, 3).toUpperCase();
                const ovr = calculateOVR(p, shortPos);
                const currentStatus = statuses[p.id] || 'pendiente';
                
                return (
                  <div 
                    key={p.id} 
                    className="flex items-center gap-4 bg-slate-900/60 p-3 rounded-xl border border-slate-700 cursor-pointer hover:border-[var(--color-highlight)] hover:bg-slate-800/80 group transition-all" 
                    onClick={() => togglePlayerSelection(p)}
                    title={`Quitar a ${p.nombre} de la convocatoria`}
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
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-slate-400 text-[10px] font-bold">{shortPos}</span>
                        <select 
                          value={currentStatus} 
                          onChange={(e) => {
                            e.stopPropagation();
                            setStatuses({...statuses, [p.id]: e.target.value});
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className={`text-[10px] font-bold rounded px-2 py-0.5 outline-none border cursor-pointer ${
                            currentStatus === 'confirmado' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                            currentStatus === 'ausente' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                            'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                          }`}
                        >
                          <option value="pendiente" className="bg-slate-900 text-yellow-400">Por confirmar</option>
                          <option value="confirmado" className="bg-slate-900 text-green-400">Confirmado</option>
                          <option value="ausente" className="bg-slate-900 text-red-400">No puede</option>
                        </select>
                      </div>
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
              const status = statuses[player.id];
              return (
                <div 
                  key={player.id} 
                  className={`relative cursor-pointer transition-all duration-300 ${
                    selected 
                      ? `ring-4 rounded-xl transform scale-105 ${status === 'ausente' ? 'ring-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : status === 'confirmado' ? 'ring-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]' : 'ring-[var(--color-highlight)] shadow-[0_0_20px_rgba(0,229,255,0.4)]'}` 
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
                    <div className={`absolute inset-0 rounded-xl backdrop-blur-[1px] flex flex-col items-center justify-center z-20 ${
                      status === 'ausente' ? 'bg-red-900/40' : 
                      status === 'confirmado' ? 'bg-green-900/30' : 
                      'bg-[var(--color-highlight)]/10'
                    }`}>
                      <div className={`rounded-full w-12 h-12 flex items-center justify-center mb-2 transform scale-110 shadow-lg ${
                        status === 'ausente' ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.8)]' : 
                        status === 'confirmado' ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.8)]' : 
                        'bg-[var(--color-highlight)] text-black shadow-[0_0_20px_rgba(0,229,255,0.8)]'
                      }`}>
                        {status === 'ausente' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={`bg-black/80 font-black uppercase px-3 py-1 rounded-full text-sm border ${
                        status === 'ausente' ? 'text-red-400 border-red-500' : 
                        status === 'confirmado' ? 'text-green-400 border-green-500' : 
                        'text-[var(--color-highlight)] border-[var(--color-highlight)]'
                      }`}>
                        {status === 'ausente' ? 'No puede' : 
                         status === 'confirmado' ? 'Confirmado' : 'Convocado'}
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
  </div>
  );
}
