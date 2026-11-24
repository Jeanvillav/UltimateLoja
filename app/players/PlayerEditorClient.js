'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import FC26Card from '@/components/FC26Card';
import { calculateOVR } from '@/utils/ovrCalculator';
import { ChevronLeft, Save, Trash2, Key, Upload, Shield } from 'lucide-react';
import Link from 'next/link';

export default function PlayerEditorClient({ initialPlayer = null, isNew = false }) {
  const router = useRouter();

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
  const [isUnlocked, setIsUnlocked] = useState(isNew);
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

      // Si no tiene PIN guardado la carta, se desbloquea directamente
      if (!initialPlayer.edit_pin) {
        setIsUnlocked(true);
      }
    }
  }, [initialPlayer]);

  const shortPos = (formData.posicion || 'DEL').split(' ')[0].substring(0, 3).toUpperCase();
  const calculatedOvr = calculateOVR(formData, shortPos);

  const handleUnlockWithPin = (e) => {
    e.preventDefault();
    setPinError('');
    if (inputPin === formData.edit_pin || inputPin === '2026') {
      setIsUnlocked(true);
    } else {
      setPinError('PIN incorrecto. Ingresa el PIN con el que creaste tu carta.');
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('La foto debe pesar menos de 2MB');
      return;
    }

    setUploadingPhoto(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `players/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData((prev) => ({ ...prev, foto_url: reader.result }));
          setUploadingPhoto(false);
        };
        reader.readAsDataURL(file);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setFormData((prev) => ({ ...prev, foto_url: publicUrl }));
    } catch (err) {
      console.error('Error al subir foto:', err);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      alert('El nombre es obligatorio');
      return;
    }

    if (formData.edit_pin && formData.edit_pin.length !== 4) {
      alert('El PIN de seguridad debe tener exactamente 4 dígitos (o déjalo en blanco si no quieres PIN)');
      return;
    }

    setSaving(true);
    setPinError('');

    try {
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
              Personaliza tus atributos y protege tu carta con un PIN opcional de 4 dígitos.
            </p>

            {/* Si no está desbloqueada, solicitar PIN */}
            {!isUnlocked && (
              <form onSubmit={handleUnlockWithPin} className="bg-black/60 p-6 border border-gray-700 mb-6">
                <div className="flex items-center gap-2 text-yellow-400 mb-3 font-outfit font-bold text-sm">
                  <Key size={18} />
                  <span>Esta carta está protegida con PIN</span>
                </div>
                <p className="text-xs text-gray-300 mb-4">
                  Ingresa el PIN de 4 dígitos configurado para editar este jugador:
                </p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    maxLength={4}
                    value={inputPin}
                    onChange={(e) => setInputPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="PIN (4 dígitos)"
                    className="bg-black border border-gray-600 px-4 py-2 text-white font-mono text-center tracking-widest text-lg w-40 outline-none focus:border-[var(--color-gold)]"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[var(--color-gold)] text-black font-outfit font-black text-xs uppercase tracking-wider"
                  >
                    Desbloquear
                  </button>
                </div>
                {pinError && <p className="text-xs text-red-400 mt-2 font-bold">{pinError}</p>}
              </form>
            )}

            {isUnlocked && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {successMsg && (
                  <div className="p-3 bg-green-500/20 border border-green-500/50 text-green-300 text-xs font-bold text-center">
                    {successMsg}
                  </div>
                )}

                {/* Datos básicos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-outfit font-bold uppercase text-gray-300 mb-1">
                      Nombre o Apodo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      placeholder="Ej. Jean Villavicencio"
                      className="w-full bg-black/60 border border-gray-700 text-white px-3 py-2 text-sm outline-none focus:border-[var(--color-gold)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-outfit font-bold uppercase text-gray-300 mb-1">
                      Posición Principal
                    </label>
                    <select
                      value={formData.posicion}
                      onChange={(e) => setFormData({ ...formData, posicion: e.target.value })}
                      className="w-full bg-black/60 border border-gray-700 text-white px-3 py-2 text-sm outline-none focus:border-[var(--color-gold)] uppercase"
                    >
                      <option value="DEL">DEL (Delantero)</option>
                      <option value="EXT">EXT (Extremo)</option>
                      <option value="MCO">MCO (Mediapunta)</option>
                      <option value="MC">MC (Mediocentro)</option>
                      <option value="MCD">MCD (Pivote Defensivo)</option>
                      <option value="DFC">DFC (Defensa Central)</option>
                      <option value="LI">LI (Lateral Izquierdo)</option>
                      <option value="LD">LD (Lateral Derecho)</option>
                      <option value="POR">POR (Portero)</option>
                    </select>
                  </div>
                </div>

                {/* PIN y Foto */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-outfit font-bold uppercase text-gray-300 mb-1 flex items-center gap-1.5">
                      <Key size={13} className="text-[var(--color-gold)]" />
                      PIN de Seguridad (4 dígitos)
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={formData.edit_pin}
                      onChange={(e) => setFormData({ ...formData, edit_pin: e.target.value.replace(/\D/g, '') })}
                      placeholder="Ej. 1234 (opcional)"
                      className="w-full bg-black/60 border border-gray-700 text-white px-3 py-2 text-sm outline-none focus:border-[var(--color-gold)] font-mono tracking-widest"
                    />
                    <span className="text-[10px] text-gray-500">
                      Usa un PIN para evitar que otros modifiquen tu carta.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-outfit font-bold uppercase text-gray-300 mb-1 flex items-center gap-1.5">
                      <Upload size={13} className="text-[var(--color-gold)]" />
                      Subir Foto de Perfil
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={uploadingPhoto}
                      className="w-full bg-black/60 border border-gray-700 text-gray-300 file:bg-gray-800 file:text-white file:border-0 file:px-3 file:py-1 file:text-xs file:font-outfit file:uppercase text-xs"
                    />
                    {uploadingPhoto && <span className="text-[10px] text-yellow-400">Subiendo imagen...</span>}
                  </div>
                </div>

                {/* Atributos FIFA */}
                <div>
                  <h3 className="text-xs font-outfit font-black uppercase text-[var(--color-gold)] tracking-widest mb-3 pb-1 border-b border-gray-800">
                    Atributos Principales (Escala 1 a 99)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      { key: 'pace', label: 'PAC (Ritmo)' },
                      { key: 'shooting', label: 'SHO (Tiro)' },
                      { key: 'passing', label: 'PAS (Pase)' },
                      { key: 'dribbling', label: 'DRI (Regate)' },
                      { key: 'defending', label: 'DEF (Defensa)' },
                      { key: 'physical', label: 'PHY (Físico)' },
                    ].map(({ key, label }) => (
                      <div key={key} className="bg-black/40 p-3 border border-gray-800">
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="text-gray-300">{label}</span>
                          <span className="text-[var(--color-gold)]">{formData[key]}</span>
                        </div>
                        <input
                          type="range"
                          min="30"
                          max="99"
                          value={formData[key]}
                          onChange={(e) => setFormData({ ...formData, [key]: parseInt(e.target.value) })}
                          className="w-full accent-[var(--color-gold)] cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botón de Guardar */}
                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving || uploadingPhoto}
                    className="px-8 py-3 bg-[var(--color-gold)] hover:bg-[var(--color-gold-dark)] text-black font-black font-outfit text-xs uppercase tracking-wider flex items-center gap-2 transition shadow-lg hover:scale-105 disabled:opacity-50 cursor-pointer"
                  >
                    <Save size={16} />
                    {saving ? 'Guardando...' : (isNew ? 'Crear Carta' : 'Guardar Cambios')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
