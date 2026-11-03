'use client';

import { useState } from 'react';
import { useRoom } from '@/store/RoomContext';
import { createClient } from '@/utils/supabase/client';
import { DoorOpen, Plus, Key, X, Check, AlertCircle } from 'lucide-react';

export default function RoomSelectorModal({ isOpen, onClose }) {
  const { room, roomCode, switchRoom } = useRoom();
  const [tab, setTab] = useState('join'); // 'join' | 'create'
  
  // Unirse a sala
  const [joinCode, setJoinCode] = useState('');
  const [joinPin, setJoinPin] = useState('');

  // Crear sala
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newPin, setNewPin] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  if (!isOpen) return null;

  const handleJoin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const code = joinCode.trim().toUpperCase();

    if (!code) {
      setErrorMsg('Ingresa el código de la sala.');
      return;
    }

    if (!/^[A-Z]{2,8}$/.test(code)) {
      setErrorMsg('El código debe tener entre 2 y 8 letras (sin números ni espacios).');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', code)
        .single();

      if (error || !data) {
        setErrorMsg('La sala no existe o ha expirado por inactividad.');
        setLoading(false);
        return;
      }

      if (joinPin.trim() && joinPin.trim() === data.admin_pin) {
        localStorage.setItem(`ul_admin_pin_${data.code}`, joinPin.trim());
      }

      switchRoom(data.code, joinPin.trim() || null);
      onClose();
    } catch {
      setErrorMsg('Error al conectar con la sala.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const name = newName.trim();
    const code = newCode.trim().toUpperCase();
    const pin = newPin.trim();

    if (!name) {
      setErrorMsg('Ingresa un nombre para tu sala.');
      return;
    }

    if (!code || !/^[A-Z]{2,8}$/.test(code)) {
      setErrorMsg('El código debe ser de máximo 8 caracteres alfabéticos (ej: PICHANGA).');
      return;
    }

    if (!pin || !/^[0-9]{4}$/.test(pin)) {
      setErrorMsg('La contraseña debe tener exactamente 4 dígitos numéricos (ej: 1234).');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('rooms')
        .insert({
          name,
          code,
          admin_pin: pin,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          setErrorMsg('Este código ya está en uso. Por favor elige otro.');
        } else {
          setErrorMsg(error.message || 'No se pudo crear la sala.');
        }
        setLoading(false);
        return;
      }

      localStorage.setItem(`ul_admin_pin_${data.code}`, pin);
      switchRoom(data.code, pin);
      onClose();
    } catch {
      setErrorMsg('Error creando la sala.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="glass-panel w-full max-w-md p-6 relative border-t-4 border-t-[var(--color-gold)] shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition cursor-pointer"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-black font-outfit uppercase text-white mb-2 flex items-center gap-2">
          <DoorOpen className="text-[var(--color-gold)]" size={24} />
          Salas de Pichanga
        </h2>
        <p className="text-xs text-gray-400 mb-6">
          Sala actual activa: <span className="text-[var(--color-gold)] font-bold">{roomCode}</span>
        </p>

        {/* Tabs */}
        <div className="flex border-b border-white/10 mb-6">
          <button
            onClick={() => { setTab('join'); setErrorMsg(''); }}
            className={`flex-1 py-2 font-outfit font-black text-xs uppercase tracking-wider transition border-b-2 ${
              tab === 'join'
                ? 'border-[var(--color-gold)] text-[var(--color-gold)]'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Unirse a Sala
          </button>
          <button
            onClick={() => { setTab('create'); setErrorMsg(''); }}
            className={`flex-1 py-2 font-outfit font-black text-xs uppercase tracking-wider transition border-b-2 ${
              tab === 'create'
                ? 'border-[var(--color-gold)] text-[var(--color-gold)]'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Crear Sala
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-500/40 rounded-none text-red-200 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tab 1: Unirse */}
        {tab === 'join' && (
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                Código de Sala (2 a 8 letras)
              </label>
              <input
                type="text"
                maxLength={8}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase())}
                placeholder="EJ: LOJA, PICHA"
                className="w-full bg-black/60 border border-gray-700 text-white font-outfit font-black text-lg tracking-widest px-3 py-2.5 outline-none focus:border-[var(--color-gold)] uppercase"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1">
                <Key size={13} /> PIN Admin de 4 dígitos (opcional si solo vas a ver/jugar)
              </label>
              <input
                type="password"
                maxLength={4}
                value={joinPin}
                onChange={(e) => setJoinPin(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="••••"
                className="w-full bg-black/60 border border-gray-700 text-white font-mono text-center tracking-widest px-3 py-2 outline-none focus:border-[var(--color-gold)]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[var(--color-gold)] hover:bg-[var(--color-gold-dark)] text-black font-outfit font-black uppercase text-sm tracking-widest transition shadow-lg cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Entrar a la Sala'}
            </button>
          </form>
        )}

        {/* Tab 2: Crear */}
        {tab === 'create' && (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                Nombre de la Pichanga o Grupo
              </label>
              <input
                type="text"
                maxLength={40}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ej: Amigos de la Cancha San Pedro"
                className="w-full bg-black/60 border border-gray-700 text-white px-3 py-2 text-sm outline-none focus:border-[var(--color-gold)]"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                Código de la Sala (máximo 8 letras, sin números)
              </label>
              <input
                type="text"
                maxLength={8}
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase())}
                placeholder="EJ: MOTUPE"
                className="w-full bg-black/60 border border-gray-700 text-white font-outfit font-black text-lg tracking-widest px-3 py-2.5 outline-none focus:border-[var(--color-gold)] uppercase"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                PIN de Creador (exactamente 4 dígitos numéricos)
              </label>
              <input
                type="password"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="1234"
                className="w-full bg-black/60 border border-gray-700 text-white font-mono text-center tracking-widest px-3 py-2 outline-none focus:border-[var(--color-gold)]"
                required
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Este PIN te permitirá gestionar y editar equipos/jugadores de la sala.
              </p>
            </div>

            <p className="text-[11px] text-gray-400 bg-white/5 p-2.5 border border-white/10">
              ⚡ Las salas inactivas por más de 6 meses se liberan automáticamente para optimizar la base de datos.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[var(--color-gold)] hover:bg-[var(--color-gold-dark)] text-black font-outfit font-black uppercase text-sm tracking-widest transition shadow-lg cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Sala'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
