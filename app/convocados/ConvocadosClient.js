"use client";

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FC26Card from '@/components/FC26Card';
import { calculateOVR } from '@/utils/ovrCalculator';
import { getPlayerPhoto } from '@/utils/playerUtils';
import { CANCHAS_LOJA } from '@/utils/canchasData';
import { 
  Users, 
  Shield, 
  Copy, 
  ArrowRight, 
  Phone, 
  MessageCircle, 
  Calendar, 
  Clock, 
  DollarSign, 
  MapPin, 
  Check, 
  Search, 
  ExternalLink,
  Sparkles
} from 'lucide-react';

export default function ConvocadosClient({ initialPlayers }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ==========================================
  // BLOQUE 1: RESERVA DE CANCHA (Cancha, Fecha, Hora, WhatsApp)
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
  // BLOQUE 2: CONVOCATORIA (Modalidad, Costo, Jugadores)
  // ==========================================
  const initialMode = searchParams.get('modo') === 'single_team' ? 'single_team' : 'two_teams';
  const [matchMode, setMatchMode] = useState(initialMode); // 'two_teams' | 'single_team'
  const [canchaCost, setCanchaCost] = useState(20);

  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('ALL');
  const [copiedList, setCopiedList] = useState(false);

  const isTwoTeams = matchMode === 'two_teams';
  const minPlayers = isTwoTeams ? 10 : 5;
  const maxPlayers = isTwoTeams ? 14 : 7;

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

  // Alternar selección de un jugador
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
        setStatuses({ ...statuses, [player.id]: 'pendiente' });
      } else {
        alert(
          isTwoTeams
            ? `Ya has seleccionado el límite de 14 jugadores para armar 2 equipos (máximo 7 vs 7).`
            : `Ya has seleccionado el límite de 7 jugadores para un solo equipo.`
        );
      }
    }
  };

  const isSelected = (playerId) => selectedPlayers.some(p => p.id === playerId);
  const isValidConvocatoria = selectedPlayers.length >= minPlayers && selectedPlayers.length <= maxPlayers;

  const confirmedPlayers = selectedPlayers.filter(p => statuses[p.id] === 'confirmado');
  const costPerPerson = confirmedPlayers.length > 0 && canchaCost > 0 
    ? (canchaCost / confirmedPlayers.length).toFixed(2) 
    : null;

  // Avanzar al Squad Builder
  const handleConfirm = () => {
    if (isValidConvocatoria) {
      const availablePlayers = selectedPlayers.filter(p => statuses[p.id] !== 'ausente');
      const ids = availablePlayers.map(p => p.id).join(',');
      const params = new URLSearchParams({
        players: ids,
        cancha: finalCanchaName,
        hora: matchTime,
        fecha: matchDate,
        modo: matchMode,
      });
      router.push(`/squad-builder?${params.toString()}`);
    }
  };

  // Copiar lista completa formateada para el grupo de WhatsApp de amigos
  const handleCopyList = async () => {
    if (selectedPlayers.length === 0) return;
    
    const confirmados = selectedPlayers.filter(p => statuses[p.id] === 'confirmado');
    const pendientes = selectedPlayers.filter(p => (statuses[p.id] || 'pendiente') === 'pendiente');
    const ausentes = selectedPlayers.filter(p => statuses[p.id] === 'ausente');

    let text = `⚽ *PARTIDO DE SINTÉTICA - LOJA* ⚽\n`;
    text += `🏆 *Modalidad:* ${isTwoTeams ? 'Armar 2 Equipos (Partido Completo)' : 'Un Solo Equipo (Mi Plantilla)'}\n`;
    text += `🏟️ *Cancha:* ${finalCanchaName}\n`;
    if (finalCanchaPhone) {
      text += `📞 *Contacto Cancha:* ${finalCanchaPhone}\n`;
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
    text += `\n📋 *CONVOCATORIA* (${selectedPlayers.length}/${maxPlayers} Jugadores • Mínimo ${minPlayers})\n\n`;

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

    text += `¡Pilas a confirmar los que faltan! 🔥⚽`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedList(true);
      setTimeout(() => setCopiedList(false), 2500);
    } catch (err) {
      console.error(err);
      alert("Error al copiar la lista.");
    }
  };

  // Filtrado de jugadores para la cuadrícula
  const filteredPlayers = useMemo(() => {
    return initialPlayers.filter(p => {
      const matchesSearch = !searchQuery || p.nombre.toLowerCase().includes(searchQuery.toLowerCase());
      const posShort = (p.posicion || 'DEL').split(' ')[0].toUpperCase();
      const matchesPos = selectedPosition === 'ALL' || posShort.includes(selectedPosition);
      return matchesSearch && matchesPos;
    });
  }, [initialPlayers, searchQuery, selectedPosition]);

  return (
    <div className="flex flex-col gap-10">

      {/* Navegación Rápida entre las 2 Fases del Workflow */}
      <div className="glass-panel p-3 sm:p-4 rounded-2xl border border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-center">
          <div className="flex items-center justify-center gap-2.5 p-3 rounded-xl bg-gradient-to-r from-cyan-500/25 to-blue-500/10 border border-cyan-400/40 text-cyan-300 shadow-sm">
            <span className="w-6 h-6 rounded-full bg-cyan-400 text-black text-xs font-black flex items-center justify-center">1</span>
            <span className="text-xs sm:text-sm font-black uppercase tracking-wide">Paso 1: Reservar Cancha (Lugar, Fecha, Hora & WhatsApp)</span>
          </div>
          <div className="flex items-center justify-center gap-2.5 p-3 rounded-xl bg-gradient-to-r from-green-500/25 to-emerald-500/10 border border-green-400/40 text-green-300 shadow-sm">
            <span className="w-6 h-6 rounded-full bg-green-400 text-black text-xs font-black flex items-center justify-center">2</span>
            <span className="text-xs sm:text-sm font-black uppercase tracking-wide">Paso 2: Convocatoria (Modalidad, Cuotas & Jugadores)</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          BLOQUE 1: RESERVA DE LA CANCHA (Cancha + Fecha + Hora + WhatsApp directo)
      ======================================================== */}
      <section className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/30 bg-black/60 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
        {/* Encabezado del Bloque de Reserva */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-cyan-400 text-black font-black text-sm flex items-center justify-center shadow-lg shadow-cyan-400/30">1</span>
              <h2 className="text-2xl sm:text-3xl font-black font-outfit text-white">
                Reserva de Cancha Sintética
              </h2>
            </div>
            <p className="text-sm text-slate-300 mt-1 pl-10">
              Elige el complejo en Loja, ajusta la fecha y la hora, y escríbeles directamente por WhatsApp para apartar tu turno.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-xs text-cyan-300 self-start md:self-auto font-bold">
            <MapPin size={14} className="text-cyan-400" />
            <span>Loja, Ecuador</span>
          </div>
        </div>

        {/* 1.1 Cuadrícula para Elegir la Cancha */}
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
          1. Selecciona la Cancha:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {CANCHAS_LOJA.map((cancha) => {
            const isSelectedCancha = selectedCanchaId === cancha.id;
            return (
              <button
                key={cancha.id}
                type="button"
                onClick={() => setSelectedCanchaId(cancha.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer group ${
                  isSelectedCancha
                    ? `bg-gradient-to-b ${cancha.colorBg} ${cancha.colorBorder} shadow-[0_0_20px_rgba(0,229,255,0.4)] ring-2 ring-cyan-400 scale-[1.02]`
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-600 hover:bg-slate-800/80 text-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-lg">🏟️</span>
                    {cancha.badge && (
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${cancha.colorBadge || 'bg-white/10 text-white'}`}>
                        {cancha.badge}
                      </span>
                    )}
                  </div>
                  <h3 className={`font-outfit font-black text-sm leading-snug ${isSelectedCancha ? 'text-white' : 'text-slate-200'}`}>
                    {cancha.nombre}
                  </h3>
                </div>

                <div className="mt-3 pt-2 border-t border-white/5">
                  {cancha.telefono ? (
                    <div className="flex items-center gap-1.5 text-[11px] text-green-400 font-bold truncate">
                      <Phone size={12} className="flex-shrink-0" />
                      <span className="truncate">{cancha.telefonoDisplay}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-500 italic">Contacto local</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* 1.2 Ajustar Fecha y Hora justo debajo de la Cancha */}
        <div className="bg-slate-900/70 border border-slate-700/80 rounded-2xl p-4 sm:p-5 mb-6">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
            2. Horario para la Reserva:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Calendar size={14} className="text-cyan-400" />
                <span>Fecha del Partido</span>
              </label>
              <input
                type="date"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white outline-none focus:border-cyan-400 font-bold"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                {getFormattedDate(matchDate)}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Clock size={14} className="text-cyan-400" />
                <span>Hora del Partido</span>
              </label>
              <input
                type="time"
                value={matchTime}
                onChange={(e) => setMatchTime(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white outline-none focus:border-cyan-400 font-bold"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Turno de cancha: {matchTime} hs
              </span>
            </div>
          </div>
        </div>

        {/* Campos opcionales si eligió "Otra Cancha" */}
        {selectedCanchaId === 'otro' && (
          <div className="mb-6 p-4 rounded-2xl bg-purple-950/30 border border-purple-500/40 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Nombre de la Cancha
              </label>
              <input
                type="text"
                placeholder="Ej. Sintética El Valle, La Banda..."
                value={customCanchaName}
                onChange={(e) => setCustomCanchaName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-purple-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Número de WhatsApp / Teléfono
              </label>
              <input
                type="tel"
                placeholder="Ej. 099 123 4567 o +593..."
                value={customCanchaPhone}
                onChange={(e) => setCustomCanchaPhone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-purple-400"
              />
            </div>
          </div>
        )}

        {/* 1.3 Tarjeta de Acción Inmediata: Escribir al WhatsApp con el mensaje ya armado */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-green-500/40 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-green-500/20 border border-green-400/40 text-green-400 flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/10 text-2xl">
              🏟️
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-black font-outfit text-white">
                  {finalCanchaName}
                </h3>
                {currentCancha.badge && (
                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${currentCancha.colorBadge}`}>
                    {currentCancha.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-2 flex-wrap">
                <span className="text-cyan-400 font-bold">📅 {getFormattedDate(matchDate)}</span>
                <span className="text-slate-600">•</span>
                <span className="text-cyan-400 font-bold">⏰ {matchTime}</span>
                {finalCanchaPhone && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-yellow-400 font-bold">📞 {finalCanchaPhone}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Botones de Acción de Reserva */}
          <div className="flex flex-wrap items-center gap-3">
            {finalCanchaPhone ? (
              <>
                {whatsappReserveUrl && (
                  <a
                    href={whatsappReserveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2.5 transition-all shadow-[0_0_20px_rgba(34,197,94,0.5)] hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <MessageCircle size={18} />
                    <span>Escribir al WhatsApp de {finalCanchaName}</span>
                    <ExternalLink size={14} className="opacity-80" />
                  </a>
                )}

                <a
                  href={`tel:${finalCanchaPhoneRaw || finalCanchaPhone}`}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 border border-slate-600 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Phone size={15} className="text-cyan-400" />
                  <span>Llamar</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyPhone}
                  className="px-3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700 flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                  title="Copiar teléfono de la cancha"
                >
                  {copiedPhone ? (
                    <>
                      <Check size={14} className="text-green-400" />
                      <span className="text-green-400">¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <span className="text-xs text-slate-400 italic bg-black/40 px-3 py-2 rounded-xl border border-white/5">
                Puedes contactar directamente al complejo para apartar este turno.
              </span>
            )}
          </div>
        </div>
      </section>


      {/* ========================================================
          BLOQUE 2: MODALIDAD Y ORGANIZACIÓN DE LA CONVOCATORIA
      ======================================================== */}
      <section className="flex flex-col gap-8">
        
        {/* Encabezado del Bloque 2 */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-green-500/30 bg-black/60 backdrop-blur-2xl shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-green-400 text-black font-black text-sm flex items-center justify-center shadow-lg shadow-green-400/30">2</span>
                <h2 className="text-2xl sm:text-3xl font-black font-outfit text-white">
                  Modalidad y Convocatoria de Jugadores
                </h2>
              </div>
              <p className="text-sm text-slate-300 mt-1 pl-10">
                Define el formato del partido (2 equipos vs 1 equipo), el costo de la cancha para prorratear y selecciona a tus amigos.
              </p>
            </div>
            
            {/* Widget de Cuota Rápida */}
            <div className="bg-slate-900 border border-slate-700 p-3.5 rounded-2xl flex items-center gap-4 shadow-inner self-start md:self-auto">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Cuota por Confirmado</span>
                <span className="text-xl font-black text-green-400 font-outfit">
                  {costPerPerson ? `$${costPerPerson}` : '--'}
                </span>
              </div>
              <div className="h-8 w-px bg-slate-700"></div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Confirmados</span>
                <span className="text-sm font-black text-white font-outfit">
                  {confirmedPlayers.length} / {selectedPlayers.length}
                </span>
              </div>
            </div>
          </div>

          {/* Selector de Modalidad: 2 Equipos vs 1 Equipo */}
          <div className="mb-8">
            <label className="block text-xs font-black text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>🏆 Formato del Partido</span>
              <span className="text-[10px] text-slate-400 font-normal normal-case">(Selecciona cómo deseas armar la pichanga)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleModeChange('two_teams')}
                className={`p-5 rounded-2xl border text-left transition-all flex items-start gap-4 cursor-pointer ${
                  isTwoTeams
                    ? 'bg-gradient-to-br from-blue-950/80 via-slate-900 to-black border-cyan-400 shadow-[0_0_25px_rgba(0,229,255,0.3)] ring-2 ring-cyan-400/80 scale-[1.01]'
                    : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className={`p-3 rounded-2xl flex-shrink-0 ${isTwoTeams ? 'bg-cyan-400 text-black shadow-lg shadow-cyan-400/30' : 'bg-slate-800 text-slate-400'}`}>
                  <Users size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-outfit font-black text-lg uppercase text-white">Armar 2 Equipos</span>
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/40">
                      10 - 14 Jugadores
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    Partido completo de sintética. Convoca entre 10 y 14 jugadores para dividir dos escuadras rivales (5v5 hasta 7v7).
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('single_team')}
                className={`p-5 rounded-2xl border text-left transition-all flex items-start gap-4 cursor-pointer ${
                  !isTwoTeams
                    ? 'bg-gradient-to-br from-green-950/80 via-slate-900 to-black border-green-400 shadow-[0_0_25px_rgba(34,197,94,0.3)] ring-2 ring-green-400/80 scale-[1.01]'
                    : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className={`p-3 rounded-2xl flex-shrink-0 ${!isTwoTeams ? 'bg-[var(--color-highlight)] text-black shadow-lg shadow-green-400/30' : 'bg-slate-800 text-slate-400'}`}>
                  <Shield size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-outfit font-black text-lg uppercase text-white">Un Solo Equipo</span>
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-green-400/20 text-green-300 border border-green-400/40">
                      5 - 7 Jugadores
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    Convoca a tu propia escuadra o alineación titular (mínimo 5, máximo 7 jugadores) para un torneo o desafío.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Costo de Cancha y Barra de Progreso */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <DollarSign size={14} className="text-green-400" />
                <span>Costo Total Cancha ($)</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={canchaCost}
                onChange={(e) => setCanchaCost(Number(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-green-400 font-bold outline-none focus:border-green-400 text-center"
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-300 mb-2">
                <span>Progreso de Convocatoria:</span>
                <span className={`px-3 py-0.5 rounded-full font-black ${
                  selectedPlayers.length >= minPlayers ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {selectedPlayers.length} / {maxPlayers} jugadores (Mínimo {minPlayers})
                </span>
              </div>
              
              <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-white/10">
                <div 
                  className={`h-full transition-all duration-300 rounded-full ${
                    selectedPlayers.length >= minPlayers 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-400' 
                      : 'bg-gradient-to-r from-yellow-500 to-amber-400'
                  }`}
                  style={{ width: `${Math.min(100, (selectedPlayers.length / maxPlayers) * 100)}%` }}
                />
              </div>

              <div className="text-[11px] text-slate-400 mt-1.5 text-right">
                {selectedPlayers.length < minPlayers 
                  ? `Faltan ${minPlayers - selectedPlayers.length} para el mínimo` 
                  : selectedPlayers.length === maxPlayers 
                    ? '¡Límite máximo alcanzado!' 
                    : `Puedes agregar hasta ${maxPlayers - selectedPlayers.length} más`}
              </div>
            </div>
          </div>
        </div>

        {/* Contenido dividido: Lista de Selección (Izquierda) + Panel de Convocados (Derecha) */}
        <div className="flex flex-col lg:flex-row-reverse gap-8 items-start">
          
          {/* Panel Lateral: Convocados Confirmados, Copiar y Avanzar */}
          <div className="w-full lg:w-1/3 lg:sticky lg:top-24 z-30">
            <div className="glass-panel p-6 shadow-2xl border border-white/10 backdrop-blur-2xl bg-black/60 rounded-3xl">
              
              <div className="flex items-center justify-between gap-2 mb-4 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-xl font-bold font-outfit text-white">
                    Convocatoria Activa
                  </h3>
                  <span className="text-xs text-slate-400">
                    {confirmedPlayers.length} confirmados • {selectedPlayers.length} seleccionados
                  </span>
                </div>
                <span className="text-[10px] font-bold text-yellow-400 bg-yellow-400/10 px-2.5 py-1 rounded-full border border-yellow-400/30">
                  {finalCanchaName}
                </span>
              </div>

              {/* Botones de Acción: Copiar Lista para WhatsApp y Avanzar a Squad Builder */}
              <div className="flex flex-col gap-3 mb-6">
                <button 
                  disabled={selectedPlayers.length === 0}
                  onClick={handleCopyList}
                  className="w-full py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 border border-slate-700 disabled:opacity-40 cursor-pointer shadow-md"
                >
                  {copiedList ? (
                    <>
                      <Check size={18} className="text-green-400" />
                      <span className="text-green-400">¡Convocatoria Copiada al Portapapeles!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={18} className="text-cyan-400" />
                      <span>Copiar Convocatoria para el Grupo</span>
                    </>
                  )}
                </button>

                <button 
                  disabled={!isValidConvocatoria}
                  onClick={handleConfirm}
                  className={`w-full py-4 px-4 rounded-xl font-black uppercase tracking-wider text-sm transition-all flex items-center justify-center gap-2 shadow-xl ${
                    isValidConvocatoria 
                      ? 'bg-[var(--color-highlight)] text-black hover:bg-white hover:scale-[1.02] shadow-[0_0_20px_rgba(0,229,255,0.6)] cursor-pointer' 
                      : 'bg-slate-900 text-slate-500 cursor-not-allowed border border-slate-800'
                  }`}
                >
                  {selectedPlayers.length < minPlayers 
                    ? `Faltan ${minPlayers - selectedPlayers.length} para el mínimo` 
                    : (isTwoTeams ? 'Avanzar: Armar 2 Equipos' : 'Avanzar: Armar Táctica')}
                  {isValidConvocatoria && <ArrowRight size={18} />}
                </button>
              </div>

              {/* Lista Detallada de Jugadores Seleccionados con Estado */}
              {selectedPlayers.length > 0 ? (
                <div className="flex flex-col gap-2.5 max-h-[50vh] overflow-y-auto pr-1.5 custom-scrollbar">
                  {selectedPlayers.map((p) => {
                    const shortPos = (p.posicion || 'DEL').split(' ')[0].substring(0, 3).toUpperCase();
                    const ovr = calculateOVR(p, shortPos);
                    const currentStatus = statuses[p.id] || 'pendiente';
                    
                    return (
                      <div 
                        key={p.id} 
                        className="flex items-center gap-3 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-all group" 
                      >
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={getPlayerPhoto(p.foto_url)} 
                            alt={p.nombre}
                            className="w-full h-full object-cover object-top"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-white font-bold text-xs truncate">{p.nombre}</h4>
                            <span className="text-[10px] font-black text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded">
                              {ovr}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-slate-400 text-[10px] font-bold">{shortPos}</span>
                            <select 
                              value={currentStatus} 
                              onChange={(e) => setStatuses({...statuses, [p.id]: e.target.value})}
                              className={`text-[10px] font-bold rounded px-1.5 py-0.5 outline-none border cursor-pointer ${
                                currentStatus === 'confirmado' ? 'bg-green-500/20 text-green-400 border-green-500/40' :
                                currentStatus === 'ausente' ? 'bg-red-500/20 text-red-400 border-red-500/40' :
                                'bg-yellow-500/20 text-yellow-400 border-yellow-500/40'
                              }`}
                            >
                              <option value="pendiente" className="bg-slate-900 text-yellow-400">Por confirmar</option>
                              <option value="confirmado" className="bg-slate-900 text-green-400">Confirmado</option>
                              <option value="ausente" className="bg-slate-900 text-red-400">No puede</option>
                            </select>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => togglePlayerSelection(p)}
                          className="text-slate-500 hover:text-red-400 p-1 rounded transition text-sm font-bold"
                          title={`Quitar a ${p.nombre}`}
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-10 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center p-4">
                  <span className="text-3xl mb-2">👥</span>
                  <p className="text-slate-400 text-xs font-medium">
                    Aún no has seleccionado ningún jugador.<br />
                    Haz clic en las cartas de abajo para añadirlos.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Lista de Selección de Jugadores con Buscador y Filtro */}
          <div className="w-full lg:w-2/3">
            <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              {/* Buscador */}
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar jugador por nombre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-green-400 transition"
                />
              </div>

              {/* Filtro por Posición */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {['ALL', 'POR', 'DEF', 'MED', 'DEL'].map(pos => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setSelectedPosition(pos)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      selectedPosition === pos
                        ? 'bg-green-400 text-black shadow-md shadow-green-400/20'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {pos === 'ALL' ? 'Todos' : pos}
                  </button>
                ))}
              </div>
            </div>

            {/* Cuadrícula de Cartas FC26 */}
            {filteredPlayers.length === 0 ? (
              <div className="text-center text-slate-400 py-16 bg-black/40 rounded-3xl border border-white/5">
                <p className="text-base font-bold">No se encontraron jugadores que coincidan con la búsqueda.</p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedPosition('ALL'); }}
                  className="mt-3 text-xs text-green-400 underline hover:text-green-300"
                >
                  Restablecer filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 justify-items-center">
                {filteredPlayers.map((player) => {
                  const selected = isSelected(player.id);
                  const status = statuses[player.id];
                  return (
                    <div 
                      key={player.id} 
                      className={`relative cursor-pointer transition-all duration-300 ${
                        selected 
                          ? `ring-4 rounded-xl transform scale-105 ${status === 'ausente' ? 'ring-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : status === 'confirmado' ? 'ring-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]' : 'ring-cyan-400 shadow-[0_0_20px_rgba(0,229,255,0.4)]'}` 
                          : 'hover:-translate-y-2 hover:scale-105 hover:shadow-xl'
                      }`}
                      onClick={() => togglePlayerSelection(player)}
                    >
                      <div className="pointer-events-none">
                        <FC26Card player={player} asPreview={true} />
                      </div>
                      
                      {/* Overlay interactivo de selección */}
                      {selected && (
                        <div className={`absolute inset-0 rounded-xl backdrop-blur-[1px] flex flex-col items-center justify-center z-20 ${
                          status === 'ausente' ? 'bg-red-900/40' : 
                          status === 'confirmado' ? 'bg-green-900/30' : 
                          'bg-cyan-500/15'
                        }`}>
                          <div className={`rounded-full w-12 h-12 flex items-center justify-center mb-2 transform scale-110 shadow-lg ${
                            status === 'ausente' ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.8)]' : 
                            status === 'confirmado' ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.8)]' : 
                            'bg-cyan-400 text-black shadow-[0_0_20px_rgba(0,229,255,0.8)]'
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
                          <span className={`bg-black/90 font-black uppercase px-3 py-1 rounded-full text-xs border tracking-wider ${
                            status === 'ausente' ? 'text-red-400 border-red-500' : 
                            status === 'confirmado' ? 'text-green-400 border-green-500' : 
                            'text-cyan-300 border-cyan-400'
                          }`}>
                            {status === 'ausente' ? 'No puede' : 
                             status === 'confirmado' ? 'Confirmado' : 'Convocado'}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
