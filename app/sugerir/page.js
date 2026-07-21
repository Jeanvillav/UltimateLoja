'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function SugerirJugador() {
  const initialFormState = {
    nombre: '',
    edad: 20,
    posicion: 'DEL',
    team_ids: [],
    foto_url: '',
    perfil_fisico: '',
    cualidades_tecnicas: '',
    fortalezas: '',
    debilidades: '',
    rol_tactico: '',
    overall_rating: 75,
    pace: 70,
    shooting: 70,
    passing: 70,
    dribbling: 70,
    defending: 70,
    physical: 70
  };

  const [formData, setFormData] = useState(initialFormState);

  const [mode, setMode] = useState('new'); // 'new' | 'edit'
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [generatedJson, setGeneratedJson] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Storage states
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: teamsData } = await supabase.from('teams').select('id, name').order('name');
      if (teamsData) {
        setTeams(teamsData);
        if (teamsData.length > 0) {
          setFormData(prev => ({ ...prev, team_ids: [teamsData[0].id] }));
        }
      }
      const { data: playersData } = await supabase.from('players').select('*').order('nombre');
      if (playersData) {
        setPlayers(playersData);
      }
    };
    fetchData();
  }, [supabase]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const isNumber = ['edad', 'overall_rating', 'pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'].includes(name);
    setFormData(prev => ({
      ...prev,
      [name]: isNumber ? parseInt(value) || 0 : value
    }));
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (newMode === 'new') {
      setFormData({ ...initialFormState, team_ids: teams.length > 0 ? [teams[0].id] : [] });
    } else {
      // If switching to edit mode, maybe select the first player by default
      if (players.length > 0) {
        handlePlayerSelect(players[0].id);
      }
    }
  };

  const handlePlayerSelect = (playerId) => {
    const selectedPlayer = players.find(p => p.id === playerId);
    if (selectedPlayer) {
      setFormData({
        ...initialFormState,
        ...selectedPlayer,
        team_ids: selectedPlayer.player_teams?.map(pt => pt.team_id) || [],
        cualidades_tecnicas: selectedPlayer.cualidades_tecnicas?.join(', ') || '',
        fortalezas: selectedPlayer.fortalezas?.join(', ') || '',
        debilidades: selectedPlayer.debilidades?.join(', ') || ''
      });
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `sugerencias/${fileName}`; // Guardar en subcarpeta

      // 1. Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file, { upsert: false });

      if (uploadError) throw uploadError;

      // 2. Get public URL
      const { data } = supabase.storage.from('photos').getPublicUrl(filePath);
      
      setFormData(prev => ({ ...prev, foto_url: data.publicUrl }));
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    
    // Prepare data
    const dataToSave = { ...formData };
    
    // Array parsing
    if (typeof dataToSave.cualidades_tecnicas === 'string') {
      dataToSave.cualidades_tecnicas = dataToSave.cualidades_tecnicas.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (typeof dataToSave.fortalezas === 'string') {
      dataToSave.fortalezas = dataToSave.fortalezas.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (typeof dataToSave.debilidades === 'string') {
      dataToSave.debilidades = dataToSave.debilidades.split(',').map(s => s.trim()).filter(Boolean);
    }

    const { team_ids, player_teams, ...restData } = dataToSave;

    setGeneratedJson(JSON.stringify({ ...restData, team_ids }, null, 2));
    setCopied(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-black font-outfit text-center mb-4 text-white drop-shadow-[0_0_15px_rgba(0,229,255,0.6)]">
        Sugerir un Jugador
      </h1>
      <p className="text-center text-slate-400 mb-8">
        Llena tus estadísticas o las de tu amigo. Generaremos un código para que se lo envíes al administrador.
      </p>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="glass-panel p-6 rounded-2xl flex-1 flex flex-col">
          
          <div className="flex bg-slate-900 rounded-lg p-1 mb-6 border border-slate-700">
            <button 
              onClick={() => handleModeChange('new')}
              className={`flex-1 py-2 font-bold text-sm rounded-md transition ${mode === 'new' ? 'bg-green-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Nuevo Jugador
            </button>
            <button 
              onClick={() => handleModeChange('edit')}
              className={`flex-1 py-2 font-bold text-sm rounded-md transition ${mode === 'edit' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Modificar Existente
            </button>
          </div>

          {mode === 'edit' && (
            <div className="mb-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl">
              <label className="block text-sm font-bold text-blue-400 mb-2">Selecciona el jugador a modificar:</label>
              <select 
                onChange={(e) => handlePlayerSelect(e.target.value)} 
                value={formData.id || ''}
                className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white focus:border-blue-500 outline-none font-bold"
              >
                <option value="" disabled>-- Elige un jugador --</option>
                {players.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} ({p.overall_rating} OVR)</option>
                ))}
              </select>
            </div>
          )}

          <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Nombre</label>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Edad</label>
              <input type="number" name="edad" value={formData.edad} onChange={handleChange} required className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Posición Principal</label>
              <select name="posicion" value={formData.posicion} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white">
                <option value="POR">Portero (POR)</option>
                <option value="DEF">Defensa (DEF)</option>
                <option value="MED">Mediocampista (MED)</option>
                <option value="DEL">Delantero (DEL)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Equipos (Puedes seleccionar varios)</label>
              <div className="grid grid-cols-2 gap-2 bg-slate-900 border border-slate-700 p-2 rounded max-h-32 overflow-y-auto">
                {teams.map(t => (
                  <label key={t.id} className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
                    <input 
                      type="checkbox" 
                      checked={(formData.team_ids || []).includes(t.id)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormData(prev => {
                          const currentIds = prev.team_ids || [];
                          const newIds = checked ? [...currentIds, t.id] : currentIds.filter(id => id !== t.id);
                          return { ...prev, team_ids: newIds };
                        });
                      }}
                      className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-green-500 focus:ring-green-500 focus:ring-offset-slate-900"
                    />
                    <span className="truncate">{t.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <label className="block text-sm font-bold text-green-400 mb-2">Foto del Jugador</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileUpload} 
              disabled={uploading}
              className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-green-500/20 file:text-green-400 hover:file:bg-green-500/30 transition cursor-pointer"
            />
            {uploading && <p className="text-xs text-yellow-500 mt-2">Subiendo imagen a Supabase...</p>}
            {uploadError && <p className="text-xs text-red-500 mt-2">{uploadError}</p>}
            {formData.foto_url && !uploading && (
              <div className="mt-3 flex items-center gap-3">
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={formData.foto_url} alt="Preview" className="w-12 h-12 rounded-full object-cover border-2 border-green-500" />
                <p className="text-xs text-green-400 font-bold">¡Imagen lista!</p>
              </div>
            )}
          </div>

          <div className="border-t border-slate-700 pt-4 mt-4">
            <h3 className="text-lg font-bold text-yellow-400 mb-2">Estadísticas FC 26</h3>
            <div className="grid grid-cols-3 gap-3">
              {['overall_rating', 'pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'].map(stat => {
                let label = stat.replace('_rating', ' (OVR)');
                const isGK = formData.posicion === 'Portero (POR)';
                if (isGK) {
                  if (stat === 'pace') label = 'DIV (Estirada)';
                  if (stat === 'shooting') label = 'HAN (Manejo)';
                  if (stat === 'passing') label = 'KIC (Saque)';
                  if (stat === 'dribbling') label = 'REF (Reflejos)';
                  if (stat === 'defending') label = 'SPD (Velocidad)';
                  if (stat === 'physical') label = 'POS (Colocación)';
                }

                return (
                  <div key={stat}>
                    <label className="block text-xs text-slate-400 mb-1 uppercase">{label}</label>
                    <input type="number" name={stat} min="1" max="99" value={formData[stat]} onChange={handleChange} required className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-bold text-center" />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-700 pt-4 mt-4">
            <h3 className="text-lg font-bold text-green-400 mb-2">Análisis (Opcional)</h3>
            <label className="block text-xs text-slate-400 mb-1">Perfil Físico</label>
            <textarea name="perfil_fisico" value={formData.perfil_fisico || ''} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm mb-2" rows="2"></textarea>
            
            <label className="block text-xs text-slate-400 mb-1">Rol Táctico</label>
            <input type="text" name="rol_tactico" value={formData.rol_tactico || ''} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm mb-2" />

            <label className="block text-xs text-slate-400 mb-1">Cualidades Técnicas (separadas por coma)</label>
            <input type="text" name="cualidades_tecnicas" value={formData.cualidades_tecnicas || ''} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm mb-2" />
            
            <label className="block text-xs text-slate-400 mb-1">Fortalezas (separadas por coma)</label>
            <input type="text" name="fortalezas" value={formData.fortalezas || ''} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm mb-2" />
            
            <label className="block text-xs text-slate-400 mb-1">Debilidades (separadas por coma)</label>
            <input type="text" name="debilidades" value={formData.debilidades || ''} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm mb-2" />
          </div>

          <button type="submit" disabled={uploading} className={`w-full py-3 btn-fifa w-full font-bold rounded-xl transition-all shadow-lg mt-4 disabled:opacity-50 ${mode === 'edit' ? 'btn-fifa-cyan' : ''}`}>
            Generar Código JSON
          </button>
          </form>
        </div>

        {generatedJson && (
          <div className="flex-1 flex flex-col gap-4">
            <div className="glass-panel p-4 rounded-xl flex-1 flex flex-col">
              <h3 className="text-xl font-bold font-outfit text-white mb-2">Código Generado</h3>
              <p className="text-sm text-slate-400 mb-4">Copia este código y envíaselo al administrador por WhatsApp para que lo importe con 1 clic.</p>
              
              <textarea 
                readOnly 
                value={generatedJson}
                className="w-full flex-1 bg-black/50 border border-slate-700 rounded-lg p-4 text-green-400 font-mono text-sm resize-none mb-4 outline-none"
              />
              
              <button 
                onClick={copyToClipboard}
                className={`w-full py-3 font-bold rounded-xl transition-all ${copied ? 'bg-yellow-500 text-slate-900' : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-600'}`}
              >
                {copied ? '¡Copiado!' : 'Copiar Código'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
