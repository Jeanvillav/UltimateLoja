"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CANCHAS_LOJA } from '@/utils/canchasData';
import { useRoom } from '@/store/RoomContext';
import { createClient } from '@/utils/supabase/client';
import { 
  Users, 
  Copy, 
  Phone, 
  MessageCircle, 
  Calendar, 
  Clock, 
  DollarSign, 
  MapPin, 
  Check, 
  Search, 
  ExternalLink,
  UserPlus,
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

export default function ConvocadosClient({ initialPlayers }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { room, roomCode } = useRoom();
  const supabase = createClient();

  // Lista local de jugadores (inicia con los de la BD y permite agregar en vivo)
  const [playersList, setPlayersList] = useState(initialPlayers || []);

  // Modal para agregar amigo rápido dentro de la convocatoria (Feedback usuario 3)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerPos, setNewPlayerPos] = useState('DEL');
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);

  // ==========================================
  // PASO 1: RESERVA DE CANCHA (Cancha, Fecha, Hora, WhatsApp)
  // ==========================================
  const [selectedCanchaId, setSelectedCanchaId] = useState('la_sede');
  const [customCanchaName, setCustomCanchaName] = useState('');
  const [customCanchaPhone, setCustomCanchaPhone] = useState('');
  const [copiedPhone, setCopiedPhone] = useState(false);

  const [matchDate, setMatchDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [matchTime, setMatchTime] = useState('20:00');

  // ==========================================
  // PASO 2: CONVOCATORIA (Modalidad, Costo, Jugadores)
  // ==========================================
  const initialMode = searchParams.get('modo') === 'single_team' ? 'single_team' : 'two_teams';
  const [matchMode, setMatchMode] = useState(initialMode); // 'two_teams' | 'single_team'
  const [canchaCost, setCanchaCost] = useState(20);

  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [statuses, setStatuses] = useState({}); // { [playerId]: 'pendiente' | 'confirmado' | 'ausente' }
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('ALL');
  const [copiedList, setCopiedList] = useState(false);

  const isTwoTeams = matchMode === 'two_teams';
  const minPlayers = isTwoTeams ? 10 : 5;
  const maxPlayers = isTwoTeams ? 14 : 7;

  // Filtrar jugadores por sala activa si cambia la sala
  useEffect(() => {
    async function refreshPlayers() {
      if (!room?.id) return;
      try {
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .eq('room_id', room.id)
          .order('nombre', { ascending: true });
        if (!error && data && data.length > 0) {
          setPlayersList(data);
        }
      } catch (err) {
        console.error('Error refreshing room players:', err);
      }
    }
    refreshPlayers();
  }, [room?.id]);

  // Cancha activa
  const currentCancha = useMemo(() => {
    return CANCHAS_LOJA.find(c => c.id === selectedCanchaId) || CANCHAS_LOJA[0];
  }, [selectedCanchaId]);

  const finalCanchaName = selectedCanchaId === 'otro' 
    ? (customCanchaName || 'Cancha por definir') 
    : currentCancha.nombre;

  const finalCanchaPhone = selectedCanchaId === 'otro'
    ? (customCanchaPhone || null)
    : currentCancha.telefono;

  const finalCanchaPhoneRaw = selectedCanchaId === 'otro'
    ? (customCanchaPhone ? customCanchaPhone.replace(/\D/g, '') : null)
    : currentCancha.telefonoRaw;

  // Formateador de fecha amigable en español
  const getFormattedDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const [year, month, day] = dateStr.split('-');
      const d = new Date(Number(year), Number(month) - 1, Number(day));
      return d.toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Enlace directo de WhatsApp a la cancha con el mensaje estructurado
  const whatsappReserveUrl = useMemo(() => {
    if (!finalCanchaPhoneRaw) return null;
    const msg = `Hola ${finalCanchaName}, buenas. Quisiera consultar disponibilidad para reservar la cancha sintética el día ${getFormattedDate(matchDate)} a las ${matchTime}. ¿Tienen horario libre?`;
    return `https://wa.me/${finalCanchaPhoneRaw}?text=${encodeURIComponent(msg)}`;
  }, [finalCanchaName, finalCanchaPhoneRaw, matchDate, matchTime]);

  const handleCopyPhone = () => {
    if (!finalCanchaPhone) return;
    navigator.clipboard.writeText(finalCanchaPhone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  // Manejador de cambio de modo (2 equipos vs 1 equipo)
  const handleModeChange = (newMode) => {
    if (newMode === matchMode) return;
    setMatchMode(newMode);
    const newMax = newMode === 'two_teams' ? 14 : 7;
    if (selectedPlayers.length > newMax) {
      alert(`Has cambiado a "${newMode === 'two_teams' ? '2 Equipos' : 'Un Solo Equipo'}". Se redujo la lista a los primeros ${newMax} jugadores convocados.`);
      const trimmed = selectedPlayers.slice(0, newMax);
      setSelectedPlayers(trimmed);
      const trimmedIds = new Set(trimmed.map(p => p.id));
      const newStatuses = {};
      Object.keys(statuses).forEach(id => {
        if (trimmedIds.has(id)) newStatuses[id] = statuses[id];
      });
      setStatuses(newStatuses);
    }
  };

  // Invitar / Desconvocar jugador
  const togglePlayerSelection = (player) => {
    const isAlreadySelected = selectedPlayers.some(p => p.id === player.id);
    if (isAlreadySelected) {
      setSelectedPlayers(selectedPlayers.filter(p => p.id !== player.id));
      const newStatuses = { ...statuses };
      delete newStatuses[player.id];
      setStatuses(newStatuses);
    } else {
      if (selectedPlayers.length < maxPlayers) {
        setSelectedPlayers([...selectedPlayers, player]);
        // Por defecto entra en estado "pendiente" (Por confirmar)
        setStatuses({ ...statuses, [player.id]: 'pendiente' });
      } else {
        alert(
          isTwoTeams
            ? `Límite alcanzado: máximo 14 jugadores para armar 2 equipos (7 vs 7).`
            : `Límite alcanzado: máximo 7 jugadores para un solo equipo.`
        );
      }
    }
  };

  // Cambiar estado directo de un jugador (Confirmado, Pendiente, Ausente)
  const setPlayerStatus = (playerId, newStatus) => {
    setStatuses(prev => ({
      ...prev,
      [playerId]: newStatus
    }));
  };

  const isSelected = (playerId) => selectedPlayers.some(p => p.id === playerId);
  const isValidConvocatoria = selectedPlayers.length >= minPlayers && selectedPlayers.length <= maxPlayers;

  // Jugadores confirmados
  const confirmedPlayers = selectedPlayers.filter(p => statuses[p.id] === 'confirmado');
  
  // Cálculo de cuota por persona (Costo cancha / confirmados)
  const costPerPerson = confirmedPlayers.length > 0 && canchaCost > 0 
    ? (canchaCost / confirmedPlayers.length).toFixed(2) 
    : null;

  // Agregar nuevo amigo rápido a la sala (Feedback de pruebas de usuario)
  const handleAddNewPlayer = async (e) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;

    setIsAddingPlayer(true);
    try {
      let targetRoomId = room?.id;
      if (!targetRoomId && roomCode) {
        const { data: rData } = await supabase.from('rooms').select('id').eq('code', roomCode).single();
        targetRoomId = rData?.id;
      }

      const newPlayerObj = {
        nombre: newPlayerName.trim(),
        posicion: newPlayerPos,
        room_id: targetRoomId || null,
        overall_rating: 75,
        pace: 75,
        shooting: 75,
        passing: 75,
        dribbling: 75,
        defending: 70,
        physical: 75,
      };

      const { data, error } = await supabase
        .from('players')
        .insert(newPlayerObj)
        .select()
        .single();

      if (!error && data) {
        setPlayersList(prev => [data, ...prev]);
        // Invitarlo de inmediato a la convocatoria
        if (selectedPlayers.length < maxPlayers) {
          setSelectedPlayers(prev => [...prev, data]);
          setStatuses(prev => ({ ...prev, [data.id]: 'confirmado' }));
        }
      } else {
        // Fallback local si falla conexión
        const fallbackObj = { id: `local_${Date.now()}`, ...newPlayerObj };
        setPlayersList(prev => [fallbackObj, ...prev]);
        setSelectedPlayers(prev => [...prev, fallbackObj]);
        setStatuses(prev => ({ ...prev, [fallbackObj.id]: 'confirmado' }));
      }

      setNewPlayerName('');
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Error agregando jugador:', err);
    } finally {
      setIsAddingPlayer(false);
    }
  };

  // Copiar lista completa formateada para el grupo de WhatsApp
  const handleCopyList = async () => {
    if (selectedPlayers.length === 0) return;
    
    const confirmados = selectedPlayers.filter(p => statuses[p.id] === 'confirmado');
    const pendientes = selectedPlayers.filter(p => (statuses[p.id] || 'pendiente') === 'pendiente');
    const ausentes = selectedPlayers.filter(p => statuses[p.id] === 'ausente');

    let text = `⚽ *CONVOCATORIA DE PARTIDO - LOJA* ⚽\n\n`;
    text += `🏟️ *Cancha:* ${finalCanchaName}\n`;
    if (currentCancha.mapsUrl && selectedCanchaId !== 'otro') {
      text += `📍 *Ubicación:* ${currentCancha.mapsUrl}\n`;
    }
    if (finalCanchaPhone) {
      text += `📞 *Contacto:* ${finalCanchaPhone}\n`;
    }
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
    text += `\n📋 *JUGADORES* (${selectedPlayers.length}/${maxPlayers} • Mínimo ${minPlayers})\n\n`;

    if (confirmados.length > 0) {
      text += `🟢 *Confirmados (${confirmados.length}):*\n`;
      confirmados.forEach((p, idx) => text += `${idx + 1}. ✔ ${p.nombre} (${(p.posicion || 'DEL').split(' ')[0]})\n`);
      text += '\n';
    }

    if (pendientes.length > 0) {
      text += `🟡 *Por Confirmar (${pendientes.length}):*\n`;
      pendientes.forEach((p, idx) => text += `${idx + 1}. ⏳ ${p.nombre}\n`);
      text += '\n';
    }

    if (ausentes.length > 0) {
      text += `🔴 *No Pueden (${ausentes.length}):*\n`;
      ausentes.forEach(p => text += `✖ ${p.nombre}\n`);
      text += '\n';
    }

    text += `¡Pilas a confirmar los que faltan! 🔥⚽\n`;
    text += `📲 Organiza tu partido en: https://ultimate-loja.vercel.app`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedList(true);
      setTimeout(() => setCopiedList(false), 2500);
    } catch (err) {
      console.error(err);
      alert("Error al copiar la lista.");
    }
  };

  // Filtrado de jugadores
  const filteredPlayers = useMemo(() => {
    return playersList.filter(p => {
      const matchesSearch = !searchQuery || p.nombre.toLowerCase().includes(searchQuery.toLowerCase());
      const posShort = (p.posicion || 'DEL').split(' ')[0].toUpperCase();
      const matchesPos = selectedPosition === 'ALL' || posShort.includes(selectedPosition);
      return matchesSearch && matchesPos;
    });
  }, [playersList, searchQuery, selectedPosition]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">

      {/* ========================================================
          PASO 1: RESERVA DE CANCHA (Cancha, Fecha, Hora y Turno)
          ======================================================== */}
      <section className="glass-panel p-5 sm:p-7 border-t-4 border-t-[var(--color-gold)] shadow-xl">
        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-white/10">
          <div className="w-8 h-8 rounded-full bg-[var(--color-gold)] text-black font-black font-outfit text-sm flex items-center justify-center shadow-md">
            1
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black font-outfit uppercase text-white tracking-wide">
              Paso 1: Elige la Cancha Sintética y Turno
            </h2>
            <p className="text-xs text-slate-400">
              Selecciona el complejo en Loja y escribe directo al dueño con el mensaje de reserva armado.
            </p>
          </div>
        </div>

        {/* Cuadrícula de Canchas de Loja */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {CANCHAS_LOJA.map((cancha) => {
            const isSelectedCancha = selectedCanchaId === cancha.id;
            return (
              <button
                key={cancha.id}
                type="button"
                onClick={() => setSelectedCanchaId(cancha.id)}
                className={`p-3 text-left transition-all border flex flex-col justify-between cursor-pointer ${
                  isSelectedCancha 
                    ? 'bg-slate-900 border-[var(--color-gold)] shadow-[0_0_15px_rgba(246,197,65,0.3)] ring-1 ring-[var(--color-gold)]' 
                    : 'bg-black/50 border-slate-800 hover:border-slate-600 text-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-outfit font-black text-xs uppercase text-white truncate">
                      {cancha.nombre}
                    </span>
                    {isSelectedCancha && (
                      <CheckCircle2 size={13} className="text-[var(--color-gold)] flex-shrink-0" />
                    )}
                  </div>
                  {cancha.badge && (
                    <span className="text-[9px] uppercase font-bold text-slate-400 block truncate">
                      {cancha.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 mt-2 block">
                  {cancha.telefono ? '📞 Con WhatsApp' : 'Sin WhatsApp'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tarjeta de Cancha Seleccionada y Enlace a Google Maps */}
        <div className="bg-black/60 p-4 border border-white/10 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-[var(--color-gold)]" />
              <span className="font-bold text-sm text-white font-outfit uppercase">
                {finalCanchaName}
              </span>
              <span className="text-xs text-slate-400">• {currentCancha.direccion}</span>
            </div>
            {currentCancha.mapsUrl && selectedCanchaId !== 'otro' && (
              <a 
                href={currentCancha.mapsUrl}
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-[var(--color-gold)] hover:underline inline-flex items-center gap-1 mt-1 font-bold"
              >
                <ExternalLink size={12} />
                Ver ubicación en Google Maps
              </a>
            )}
          </div>

          {/* Botón WhatsApp directo al dueño de la cancha */}
          {whatsappReserveUrl && (
            <a
              href={whatsappReserveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-black font-outfit text-xs uppercase tracking-wider flex items-center gap-1.5 transition shadow-lg self-stretch sm:self-auto justify-center"
            >
              <MessageCircle size={15} />
              Consultar Reserva por WhatsApp
            </a>
          )}
        </div>

        {/* Formulario de Fecha, Hora y Costo de Cancha */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5 flex items-center gap-1.5">
              <Calendar size={14} className="text-[var(--color-gold)]" />
              <span>Fecha del Partido</span>
            </label>
            <input
              type="date"
              value={matchDate}
              onChange={(e) => setMatchDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 p-2.5 text-sm text-white font-bold outline-none focus:border-[var(--color-gold)]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5 flex items-center gap-1.5">
              <Clock size={14} className="text-[var(--color-gold)]" />
              <span>Hora del Turno</span>
            </label>
            <input
              type="time"
              value={matchTime}
              onChange={(e) => setMatchTime(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 p-2.5 text-sm text-white font-bold outline-none focus:border-[var(--color-gold)]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5 flex items-center gap-1.5">
              <DollarSign size={14} className="text-green-400" />
              <span>Costo Total Cancha ($)</span>
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={canchaCost}
              onChange={(e) => setCanchaCost(Number(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-700 p-2.5 text-sm text-green-400 font-black outline-none focus:border-green-400 text-center"
            />
          </div>
        </div>
      </section>

      {/* ========================================================
          PASO 2: CONVOCATORIA, CONFIRMACIONES Y CUOTA JUSTA
          ======================================================== */}
      <section className="glass-panel p-5 sm:p-7 border-t-4 border-t-green-500 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500 text-black font-black font-outfit text-sm flex items-center justify-center shadow-md">
              2
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black font-outfit uppercase text-white tracking-wide">
                Paso 2: Convocatoria y Cuota por Persona
              </h2>
              <p className="text-xs text-slate-400">
                Invita a tus amigos, confirma quién va y divide la cuota automáticamente.
              </p>
            </div>
          </div>

          {/* Botón rápido para agregar amigo a la sala (Feedback Usuario 3) */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-outfit font-bold text-xs uppercase flex items-center gap-1.5 transition cursor-pointer"
          >
            <UserPlus size={15} className="text-[var(--color-gold)]" />
            + Agregar Amigo a la Lista
          </button>
        </div>

        {/* Barra Destacada de Cuota Justa por Confirmado */}
        <div className="bg-gradient-to-r from-slate-900 via-black to-slate-900 p-4 border border-green-500/30 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider block">
              Cuota por Confirmado:
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black font-outfit text-green-400">
                {costPerPerson ? `$${costPerPerson}` : '$0.00'}
              </span>
              <span className="text-xs text-slate-400">
                c/u ({canchaCost > 0 ? `$${canchaCost} entre ${confirmedPlayers.length} confirmados` : 'Gratis'})
              </span>
            </div>
          </div>

          {/* Botón dominante: Copiar Convocatoria para WhatsApp */}
          <button
            onClick={handleCopyList}
            disabled={selectedPlayers.length === 0}
            className="w-full sm:w-auto px-6 py-3.5 bg-green-500 hover:bg-green-400 text-black font-black font-outfit uppercase text-xs tracking-wider flex items-center justify-center gap-2 transition shadow-lg cursor-pointer disabled:opacity-40"
          >
            {copiedList ? (
              <>
                <Check size={18} />
                <span>¡Copiado para WhatsApp!</span>
              </>
            ) : (
              <>
                <Copy size={18} />
                <span>Copiar Convocatoria para el Grupo</span>
              </>
            )}
          </button>
        </div>

        {/* Modalidad de Juego (2 Equipos vs 1 Equipo) y Progreso */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 bg-black/40 p-3.5 border border-white/5">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase">Modalidad:</span>
            <button
              onClick={() => handleModeChange('two_teams')}
              className={`px-3 py-1 text-xs font-outfit font-black uppercase transition cursor-pointer ${
                isTwoTeams ? 'bg-[var(--color-gold)] text-black' : 'bg-slate-800 text-slate-300'
              }`}
            >
              2 Equipos (7 vs 7)
            </button>
            <button
              onClick={() => handleModeChange('single_team')}
              className={`px-3 py-1 text-xs font-outfit font-black uppercase transition cursor-pointer ${
                !isTwoTeams ? 'bg-[var(--color-gold)] text-black' : 'bg-slate-800 text-slate-300'
              }`}
            >
              1 Equipo (5 a 7)
            </button>
          </div>

          <div className="text-xs font-bold text-slate-300">
            Convocados: <span className="text-[var(--color-gold)]">{selectedPlayers.length}</span> / {maxPlayers}
            <span className="text-slate-500 ml-1.5">(Mínimo {minPlayers})</span>
          </div>
        </div>

        {/* Filtro y Búsqueda de Amigos */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-4">
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar amigo por nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white pl-9 pr-3 py-2 text-xs outline-none focus:border-[var(--color-gold)] uppercase"
            />
          </div>

          <div className="flex gap-1 self-start sm:self-auto">
            {['ALL', 'DEL', 'MED', 'DEF', 'POR'].map((pos) => (
              <button
                key={pos}
                onClick={() => setSelectedPosition(pos)}
                className={`px-2.5 py-1 text-xs font-outfit font-bold uppercase transition cursor-pointer ${
                  selectedPosition === pos
                    ? 'bg-[var(--color-gold)] text-black font-black'
                    : 'bg-black/60 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {pos === 'ALL' ? 'Todos' : pos}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Jugadores / Amigos Estilo Prototipo (Tarjetas Limpias) */}
        {filteredPlayers.length === 0 ? (
          <div className="text-center py-12 bg-black/40 border border-white/5 p-6">
            <p className="text-sm font-bold text-slate-300 mb-2">No hay amigos registrados con esa búsqueda.</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="text-xs text-[var(--color-gold)] underline font-bold"
            >
              + Agregar un nuevo amigo a la lista
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredPlayers.map((player) => {
              const selected = isSelected(player.id);
              const status = statuses[player.id]; // 'pendiente' | 'confirmado' | 'ausente'

              return (
                <div
                  key={player.id}
                  className={`p-3.5 border transition-all flex flex-col justify-between ${
                    selected
                      ? status === 'confirmado'
                        ? 'bg-green-950/40 border-green-500 shadow-md'
                        : status === 'ausente'
                        ? 'bg-red-950/40 border-red-500/70'
                        : 'bg-yellow-950/40 border-[var(--color-gold)]'
                      : 'bg-black/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-outfit font-black text-sm uppercase text-white truncate">
                        {player.nombre}
                      </h4>
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 inline-block mt-0.5">
                        {player.posicion || 'DEL'}
                      </span>
                    </div>

                    {/* Botón para desconvocar si ya está seleccionado */}
                    {selected && (
                      <button
                        onClick={() => togglePlayerSelection(player)}
                        className="text-slate-500 hover:text-red-400 text-xs p-1 cursor-pointer"
                        title="Quitar de la convocatoria"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>

                  {/* Acciones de Estado (Confirmado / Por Confirmar / No Puede) */}
                  {!selected ? (
                    <button
                      onClick={() => togglePlayerSelection(player)}
                      className="w-full py-2 bg-slate-800 hover:bg-[var(--color-gold)] hover:text-black text-slate-200 font-outfit font-black text-xs uppercase tracking-wider transition cursor-pointer mt-2"
                    >
                      + Invitar al Partido
                    </button>
                  ) : (
                    <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-1.5">
                      <button
                        onClick={() => setPlayerStatus(player.id, 'confirmado')}
                        className={`flex-1 py-1.5 text-[11px] font-outfit font-black uppercase transition cursor-pointer flex items-center justify-center gap-1 ${
                          status === 'confirmado'
                            ? 'bg-green-500 text-black shadow-sm'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                        title="Marcar como Confirmado"
                      >
                        <Check size={12} /> Confirmado
                      </button>

                      <button
                        onClick={() => setPlayerStatus(player.id, 'pendiente')}
                        className={`py-1.5 px-2 text-[11px] font-outfit font-black uppercase transition cursor-pointer ${
                          status === 'pendiente'
                            ? 'bg-[var(--color-gold)] text-black'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                        title="Marcar como Por Confirmar"
                      >
                        ⏳
                      </button>

                      <button
                        onClick={() => setPlayerStatus(player.id, 'ausente')}
                        className={`py-1.5 px-2 text-[11px] font-outfit font-black uppercase transition cursor-pointer ${
                          status === 'ausente'
                            ? 'bg-red-500 text-white'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                        title="Marcar como No Puede"
                      >
                        ✖
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ========================================================
          MODAL: AGREGAR AMIGO RÁPIDO A LA SALA (Feedback Usuario 3)
          ======================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-sm p-6 border-t-4 border-t-[var(--color-gold)] shadow-2xl relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-black font-outfit uppercase text-white mb-1 flex items-center gap-2">
              <UserPlus size={18} className="text-[var(--color-gold)]" />
              Agregar Amigo a la Lista
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Ingresa el nombre de tu amigo para sumarlo a la convocatoria de la sala {roomCode}.
            </p>

            <form onSubmit={handleAddNewPlayer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Nombre o Apodo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Carlos Jaramillo"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 p-2.5 text-sm text-white outline-none focus:border-[var(--color-gold)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Posición Principal
                </label>
                <select
                  value={newPlayerPos}
                  onChange={(e) => setNewPlayerPos(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 p-2.5 text-sm text-white font-bold outline-none focus:border-[var(--color-gold)]"
                >
                  <option value="DEL">DEL - Delantero</option>
                  <option value="MED">MED - Mediocampista</option>
                  <option value="DEF">DEF - Defensa</option>
                  <option value="POR">POR - Portero</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isAddingPlayer}
                className="w-full py-3 bg-[var(--color-gold)] hover:bg-[var(--color-gold-dark)] text-black font-black font-outfit uppercase text-xs tracking-wider transition cursor-pointer"
              >
                {isAddingPlayer ? 'Agregando...' : 'Guardar y Convocar'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
