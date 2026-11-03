'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useRoom } from '@/store/RoomContext';
import FC26Card from '@/components/FC26Card';
import { calculateOVR } from '@/utils/ovrCalculator';
import { ChevronLeft, Save, Trash2, Key, Upload, Shield } from 'lucide-react';
import Link from 'next/link';

export default function PlayerEditorClient({ initialPlayer = null, isNew = false }) {
  const router = useRouter();
  const { room, roomCode, isRoomAdmin } = useRoom();

  const [formData, setFormData] = useState({
    nombre: '',
    posicion: 'DEL',
    edad: 24,
    fecha_nacimiento: '2000-01-01',
    foto_url: '',
    edit_pin: '', // PIN personal de 4 dígitos para editar su propia carta
    pace: 75,
    shooting: 75,
    passing: 75,
    dribbling: 75,
    defending: 60,
    physical: 75,
    perfil_fisico: 'Ágil y veloz con buen centro de gravedad',
    rol_tactico: 'Delantero móvil que busca desmarques al espacio',
    cualidades_tecnicas: ['Definición', 'Control de balón', 'Velocidad'],
    fortalezas: ['Velocidad', 'Buen golpeo'],
    debilidades: ['Juego aéreo', 'Pie inhábil'],
  });

  const [inputPin, setInputPin] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(isNew || isRoomAdmin);
  const [pinError, setPinError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const supabase = createClient();

  useEffect(() => {
    if (initialPlayer) {
      setFormData({
        ...initialPlayer,
        edit_pin: initialPlayer.edit_pin || '',
        cualidades_tecnicas: initialPlayer.cualidades_tecnicas || [],
        fortalezas: initialPlayer.fortalezas || [],
        debilidades: initialPlayer.debilidades || [],
      });

      // Si el usuario es admin de sala o no tiene PIN guardado la carta, se desbloquea
      if (isRoomAdmin || !initialPlayer.edit_pin) {
        setIsUnlocked(true);
      }
    }
  }, [initialPlayer, isRoomAdmin]);

  // Verificar PIN de desbloqueo de este jugador específico
  const handleUnlockWithPin = (e) => {
    e.preventDefault();
    setPinError('');
    if (!formData.edit_pin) {
      setIsUnlocked(true);
      return;
    }

    if (inputPin === formData.edit_pin || (room?.admin_pin && inputPin === room.admin_pin)) {
      setIsUnlocked(true);
      setSuccessMsg('Carta desbloqueada para edición');
    } else {
      setPinError('PIN incorrecto. Ingresa el PIN que definiste al crear este jugador o el PIN de la sala.');
    }
  };

  // Subida de foto
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('La foto debe pesar menos de 3MB');
      return;
    }

    setUploadingPhoto(true);
    try {
      const ext = file.name.split('.').pop();
      const filePath = `players/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

      const { data, error } = await supabase.storage.from('photos').upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage.from('photos').getPublicUrl(filePath);
      setFormData((prev) => ({ ...prev, foto_url: publicUrlData.publicUrl }));
    } catch (err) {
      alert('Error subiendo foto: ' + err.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const shortPos = (formData.posicion || 'DEL').split(' ')[0].toUpperCase();
  const calculatedOvr = calculateOVR(formData, shortPos);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setPinError('');

    try {
      // Obtener room_id seguro
      let targetRoomId = room?.id;
      if (!targetRoomId) {
        const { data: rData } = await supabase.from('rooms').select('id').eq('code', roomCode).single();
        targetRoomId = rData?.id;
      }

      const payload = {
        nombre: formData.nombre.trim(),
        posicion: formData.posicion,
        edad: parseInt(formData.edad) || 20,
        fecha_nacimiento: formData.fecha_nacimiento || null,
        foto_url: formData.foto_url || null,
        edit_pin: formData.edit_pin.trim() || null,
        overall_rating: calculatedOvr,
        pace: parseInt(formData.pace) || 70,
        shooting: parseInt(formData.shooting) || 70,
        passing: parseInt(formData.passing) || 70,
        dribbling: parseInt(formData.dribbling) || 70,
        defending: parseInt(formData.defending) || 70,
        physical: parseInt(formData.physical) || 70,
        perfil_fisico: formData.perfil_fisico || '',
        rol_tactico: formData.rol_tactico || '',
        cualidades_tecnicas: formData.cualidades_tecnicas,
        fortalezas: formData.fortalezas,
        debilidades: formData.debilidades,
        room_id: targetRoomId,
      };

      if (isNew) {
        const { data, error } = await supabase.from('players').insert(payload).select().single();
        if (error) throw error;
        router.push(`/players/${data.id}`);
      } else {
        const { error } = await supabase.from('players').update(payload).eq('id', initialPlayer.id);
        if (error) throw error;
        setSuccessMsg('¡Carta actualizada exitosamente!');
        router.refresh();
      }
    } catch (err) {
      alert('Error al guardar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/jugadores"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition text-xs font-outfit uppercase font-bold"
        >
          <ChevronLeft size={18} /> Volver a Jugadores
        </Link>
        <span className="text-xs text-[var(--color-gold)] font-outfit font-black uppercase">
          Sala: {roomCode}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Previsualización de la Carta FIFA 15 */}
        <div className="lg:col-span-4 flex flex-col items-center sticky top-24">
          <FC26Card player={{ ...formData, overall_rating: calculatedOvr }} asPreview={true} />
          <p className="text-[11px] text-gray-400 mt-4 text-center">
            Media Calculada FIFA: <span className="text-[var(--color-gold)] font-bold">{calculatedOvr} OVR</span>
          </p>
        </div>

        {/* Formulario */}
        <div className="lg:col-span-8">
          <div className="glass-panel p-6 sm:p-8 border-t-4 border-t-[var(--color-gold)] shadow-2xl">
            <h1 className="text-2xl sm:text-3xl font-black font-outfit uppercase text-white mb-2">
              {isNew ? 'Crear Mi Carta de Jugador' : `Editar Carta de ${formData.nombre}`}
            </h1>
            <p className="text-xs text-gray-400 mb-6">
              Cada jugador puede personalizar sus atributos y proteger su carta con un PIN de 4 dígitos.
            </p>

            {/* Si no está desbloqueada, solicitar PIN */}
            {!isUnlocked && (
              <form onSubmit={handleUnlockWithPin} className="bg-black/60 p-6 border border-gray-700 mb-6">
                <div className="flex items-center gap-2 text-[var(--color-gold)] font-black text-sm uppercase mb-2">
                  <Key size={18} /> Carta protegida por su jugador
                </div>
                <p className="text-xs text-gray-300 mb-4">
                  Ingresa tu PIN de 4 dígitos para editar tu carta (o el PIN admin de la sala):
                </p>
                <div className="flex gap-3 max-w-xs mb-3">
                  <input
                    type="password"
                    maxLength={4}
                    value={inputPin}
                    onChange={(e) => setInputPin(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="••••"
                    className="flex-1 bg-black border border-gray-600 text-center text-lg font-mono text-white p-2 outline-none focus:border-[var(--color-gold)]"
                    required
                  />
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[var(--color-gold)] text-black font-black font-outfit text-xs uppercase"
                  >
                    Desbloquear
                  </button>
                </div>
                {pinError && <p className="text-xs text-red-400 font-bold">{pinError}</p>}
              </form>
            )}

            {/* Formulario habilitado */}
            {isUnlocked && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {successMsg && (
                  <div className="p-3 bg-green-950/80 border border-green-500/40 text-green-300 text-xs font-bold">
                    {successMsg}
                  </div>
                )}

                {/* Datos básicos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-gray-300 mb-1">
                      Nombre o Apodo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      placeholder="Ej: Jean Villavicencio"
                      className="w-full bg-black/60 border border-gray-700 text-white p-2.5 text-sm outline-none focus:border-[var(--color-gold)]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-gray-300 mb-1">
                      Posición Principal *
                    </label>
                    <select
                      value={formData.posicion}
                      onChange={(e) => setFormData({ ...formData, posicion: e.target.value })}
                      className="w-full bg-black/60 border border-gray-700 text-white p-2.5 text-sm outline-none focus:border-[var(--color-gold)] font-bold"
                    >
                      <option value="DEL">DEL - Delantero</option>
                      <option value="MED">MED - Mediocampista</option>
                      <option value="DEF">DEF - Defensa</option>
                      <option value="POR">POR - Portero</option>
                    </select>
                  </div>
                </div>

                {/* Subir foto y PIN de seguridad */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/5 p-4 border border-white/10">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-gray-300 mb-1 flex items-center gap-1.5">
                      <Upload size={14} className="text-[var(--color-gold)]" /> Foto de la Carta
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={uploadingPhoto}
                      className="text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:border file:border-gray-600 file:text-xs file:font-bold file:bg-black file:text-white hover:file:border-[var(--color-gold)] cursor-pointer"
                    />
                    {uploadingPhoto && <span className="text-[10px] text-yellow-400 block mt-1">Subiendo imagen...</span>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-gray-300 mb-1 flex items-center gap-1.5">
                      <Key size={14} className="text-[var(--color-gold)]" /> PIN de Edición (4 dígitos)
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={formData.edit_pin || ''}
                      onChange={(e) => setFormData({ ...formData, edit_pin: e.target.value.replace(/[^0-9]/g, '') })}
                      placeholder="Ej: 5678"
                      className="w-full bg-black/60 border border-gray-700 text-white p-2 text-sm font-mono tracking-widest outline-none focus:border-[var(--color-gold)]"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                      Solo quien conozca este PIN podrá modificar tu carta más adelante.
                    </p>
                  </div>
                </div>

                {/* Atributos FIFA */}
                <div>
                  <h3 className="text-xs font-black font-outfit uppercase tracking-widest text-[var(--color-gold)] mb-3">
                    Estadísticas FIFA (1 - 99)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      { key: 'pace', label: shortPos === 'POR' ? 'DIV - Estirada' : 'PAC - Ritmo' },
                      { key: 'shooting', label: shortPos === 'POR' ? 'HAN - Parada' : 'SHO - Tiro' },
                      { key: 'passing', label: shortPos === 'POR' ? 'KIC - Saque' : 'PAS - Pase' },
                      { key: 'dribbling', label: shortPos === 'POR' ? 'REF - Reflejos' : 'DRI - Regate' },
                      { key: 'defending', label: shortPos === 'POR' ? 'SPD - Velocidad' : 'DEF - Defensa' },
                      { key: 'physical', label: shortPos === 'POR' ? 'POS - Posición' : 'PHY - Físico' },
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <div className="flex justify-between text-[11px] font-bold text-gray-300 mb-1">
                          <span>{label}</span>
                          <span className="text-[var(--color-gold)]">{formData[key] || 0}</span>
                        </div>
                        <input
                          type="range"
                          min="30"
                          max="99"
                          value={formData[key] || 70}
                          onChange={(e) => setFormData({ ...formData, [key]: parseInt(e.target.value) })}
                          className="w-full accent-[var(--color-gold)] cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botón Guardar */}
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-4 bg-[var(--color-gold)] hover:bg-[var(--color-gold-dark)] text-black font-black font-outfit uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition shadow-xl cursor-pointer disabled:opacity-50"
                >
                  <Save size={18} />
                  {saving ? 'Guardando...' : isNew ? 'Publicar Mi Carta' : 'Guardar Cambios de Mi Carta'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
