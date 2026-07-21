'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { calculateOVR } from '@/utils/ovrCalculator';
import FC26Card from '@/components/FC26Card';

export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Import / Edit state
  const [jsonInput, setJsonInput] = useState('');
  const [previewPlayer, setPreviewPlayer] = useState(null);
  
  // Tab state
  const [activeTab, setActiveTab] = useState('jugadores'); // 'jugadores' | 'equipos'
  
  // Teams state
  const [previewTeam, setPreviewTeam] = useState(null);
  const [selectedPlayersForTeam, setSelectedPlayersForTeam] = useState([]);
  
  // Cropper State
  const [uploading, setUploading] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState(null); 
  const [showCropper, setShowCropper] = useState(false); 
  const [livePreviewUrl, setLivePreviewUrl] = useState(null); // Real-time crop preview
  const cropperRef = useRef(null);
  
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchPlayers();
        fetchTeams();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchPlayers();
        fetchTeams();
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const fetchPlayers = async () => {
    const { data } = await supabase.from('players').select('*, player_teams(team_id)').order('nombre');
    if (data) setPlayers(data);
  };

  const fetchTeams = async () => {
    const { data } = await supabase.from('teams').select('*').order('name');
    if (data) setTeams(data);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErrorMsg(error.message);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este jugador?')) return;
    const { error } = await supabase.from('players').delete().eq('id', id);
    if (error) {
      alert('Error: ' + error.message);
    } else {
      fetchPlayers();
    }
  };

  const handleEdit = (player) => {
    const { created_at, ...playerToEdit } = player;
    
    // Convert arrays to comma-separated strings for the UI
    if (Array.isArray(playerToEdit.cualidades_tecnicas)) {
      playerToEdit.cualidades_tecnicas = playerToEdit.cualidades_tecnicas.join(', ');
    }
    if (Array.isArray(playerToEdit.fortalezas)) {
      playerToEdit.fortalezas = playerToEdit.fortalezas.join(', ');
    }
    if (Array.isArray(playerToEdit.debilidades)) {
      playerToEdit.debilidades = playerToEdit.debilidades.join(', ');
    }

    const jsonStr = JSON.stringify(playerToEdit, null, 2);
    setJsonInput(jsonStr);
    setPreviewPlayer(playerToEdit);
    setSuccessMsg('Jugador cargado. Puedes editar sus datos abajo.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleParseJSON = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setPreviewPlayer(parsed);
      setErrorMsg('');
    } catch (err) {
      setErrorMsg("JSON Inválido: " + err.message);
      setPreviewPlayer(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const isNumber = ['edad', 'overall_rating', 'pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'].includes(name);
    const updatedValue = isNumber ? parseInt(value) || 0 : value;
    
    setPreviewPlayer(prev => {
      const updated = { ...prev, [name]: updatedValue };
      setJsonInput(JSON.stringify(updated, null, 2));
      return updated;
    });
  };

  const onFileChange = (e) => {
    e.preventDefault();
    let files;
    if (e.dataTransfer) {
      files = e.dataTransfer.files;
    } else if (e.target) {
      files = e.target.files;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCropImageSrc(reader.result);
      setLivePreviewUrl(null); // reset live preview
      setShowCropper(true);
    };
    if (files && files.length > 0) {
      reader.readAsDataURL(files[0]);
    }
    e.target.value = '';
  };

  // Real-time crop event
  const onCrop = () => {
    if (cropperRef.current?.cropper) {
      // Get a low-res data url for quick live preview
      setLivePreviewUrl(cropperRef.current.cropper.getCroppedCanvas({ maxWidth: 200, maxHeight: 200 }).toDataURL('image/jpeg', 0.6));
    }
  };

  const handleCropAndUpload = async () => {
    if (typeof cropperRef.current?.cropper !== "undefined") {
      setUploading(true);
      setErrorMsg('');
      
      const cropper = cropperRef.current.cropper;
      
      cropper.getCroppedCanvas({
        maxWidth: 1024,
        maxHeight: 1024,
      }).toBlob(async (blob) => {
        if (!blob) {
          setErrorMsg("Error al recortar la imagen.");
          setUploading(false);
          return;
        }

        try {
          const fileName = `players/cropped_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.jpeg`;
          
          const { error: uploadError } = await supabase.storage
            .from('photos')
            .upload(fileName, blob, { contentType: 'image/jpeg' });

          if (uploadError) throw uploadError;

          const { data } = supabase.storage.from('photos').getPublicUrl(fileName);
          
          setPreviewPlayer(prev => {
            const updated = { ...prev, foto_url: data.publicUrl };
            setJsonInput(JSON.stringify(updated, null, 2));
            return updated;
          });
          
          setShowCropper(false);
          setCropImageSrc(null);
          setLivePreviewUrl(null);
          
        } catch (err) {
          alert("Error subiendo foto: " + err.message);
        } finally {
          setUploading(false);
        }
      }, 'image/jpeg', 0.9);
    }
  };

  const handleSavePlayer = async () => {
    if (!previewPlayer) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    let error;
    
    // Auto-calculate and store OVR in DB for sorting purposes
    const calculatedOvr = calculateOVR({
      ritmo: previewPlayer.pace,
      tiro: previewPlayer.shooting,
      pase: previewPlayer.passing,
      regate: previewPlayer.dribbling,
      defensa: previewPlayer.defending,
      fisico: previewPlayer.physical
    }, previewPlayer.posicion);
    
    const { team_ids, player_teams, team_id, ...restPlayerToSave } = { ...previewPlayer, overall_rating: calculatedOvr };

    if (typeof restPlayerToSave.cualidades_tecnicas === 'string') {
      restPlayerToSave.cualidades_tecnicas = restPlayerToSave.cualidades_tecnicas.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (typeof restPlayerToSave.fortalezas === 'string') {
      restPlayerToSave.fortalezas = restPlayerToSave.fortalezas.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (typeof restPlayerToSave.debilidades === 'string') {
      restPlayerToSave.debilidades = restPlayerToSave.debilidades.split(',').map(s => s.trim()).filter(Boolean);
    }

    let newPlayerId = restPlayerToSave.id;

    if (newPlayerId) {
      const res = await supabase.from('players').update(restPlayerToSave).eq('id', newPlayerId);
      error = res.error;
    } else {
      const res = await supabase.from('players').insert([restPlayerToSave]).select().single();
      error = res.error;
      if (res.data) newPlayerId = res.data.id;
    }

    if (!error && newPlayerId && Array.isArray(team_ids)) {
       await supabase.from('player_teams').delete().eq('player_id', newPlayerId);
       if (team_ids.length > 0) {
         const inserts = team_ids.map(tid => ({ player_id: newPlayerId, team_id: tid }));
         await supabase.from('player_teams').insert(inserts);
       }
    }
    
    if (error) {
      setErrorMsg("Error al guardar jugador: " + error.message);
    } else {
      setSuccessMsg(previewPlayer.id ? "¡Jugador actualizado exitosamente!" : "¡Jugador creado exitosamente!");
      setJsonInput('');
      setPreviewPlayer(null);
      fetchPlayers();
    }
    setLoading(false);
  };

  const handleSaveTeam = async () => {
    if (!previewTeam?.name) return setErrorMsg("El nombre del equipo es requerido");
    setLoading(true);
    let error = null;
    let savedTeamId = previewTeam.id;

    if (previewTeam.id) {
      const res = await supabase.from('teams').update({ name: previewTeam.name, logo_url: previewTeam.logo_url }).eq('id', previewTeam.id);
      error = res.error;
    } else {
      const res = await supabase.from('teams').insert([{ name: previewTeam.name, logo_url: previewTeam.logo_url }]).select('id').single();
      error = res.error;
      if (res.data) {
        savedTeamId = res.data.id;
      }
    }

    if (error) {
      setErrorMsg("Error al guardar equipo: " + error.message);
    } else {
      if (savedTeamId) {
        // 1. Remove all players from this team in player_teams
        await supabase.from('player_teams').delete().eq('team_id', savedTeamId);
        
        // 2. Add selected players to this team in player_teams
        if (selectedPlayersForTeam.length > 0) {
          const inserts = selectedPlayersForTeam.map(pid => ({ player_id: pid, team_id: savedTeamId }));
          await supabase.from('player_teams').insert(inserts);
        }
      }

      setSuccessMsg(previewTeam.id ? "¡Equipo actualizado exitosamente!" : "¡Equipo creado exitosamente!");
      setPreviewTeam(null);
      setSelectedPlayersForTeam([]);
      fetchTeams();
      fetchPlayers(); // refresh players table
    }
    setLoading(false);
  };

  const handleEditTeam = (team) => {
    setPreviewTeam(team);
    const playersInTeam = players.filter(p => p.player_teams?.some(pt => pt.team_id === team.id)).map(p => p.id);
    setSelectedPlayersForTeam(playersInTeam);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditPlayer = (player) => {
    // Map player_teams to team_ids for the editor
    const mappedPlayer = { ...player, team_ids: player.player_teams?.map(pt => pt.team_id) || [] };
    setPreviewPlayer(mappedPlayer);
    setJsonInput(JSON.stringify(mappedPlayer, null, 2));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteTeam = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este equipo?')) return;
    const { error } = await supabase.from('teams').delete().eq('id', id);
    if (error) {
      alert('Error: ' + error.message);
    } else {
      fetchTeams();
    }
  };

  if (!session) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <form onSubmit={handleLogin} className="glass-panel p-8 rounded-2xl w-full max-w-md">
          <h1 className="text-3xl font-bold font-outfit text-white mb-6 text-center">Admin Login</h1>
          {errorMsg && <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded mb-4 text-sm">{errorMsg}</div>}
          <div className="mb-4">
            <label className="block text-slate-400 mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white outline-none focus:border-green-500" required />
          </div>
          <div className="mb-6">
            <label className="block text-slate-400 mb-2">Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white outline-none focus:border-green-500" required />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded transition-colors disabled:opacity-50">
            {loading ? 'Iniciando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl relative">
      {/* Live Preview Cropper Modal */}
      {showCropper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 overflow-y-auto">
          <div className="bg-slate-900 p-6 rounded-2xl w-full max-w-5xl border border-slate-700 shadow-2xl flex flex-col my-auto">
            <h2 className="text-2xl font-bold font-outfit text-white mb-6 text-center">Editor de Carta en Vivo</h2>
            
            <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
              {/* Cropper Section */}
              <div className="flex-1 w-full bg-black rounded-lg overflow-hidden h-[400px] border border-slate-700">
                <Cropper
                  src={cropImageSrc}
                  style={{ height: "100%", width: "100%" }}
                  aspectRatio={1}
                  guides={true}
                  ref={cropperRef}
                  viewMode={1}
                  background={false}
                  responsive={true}
                  autoCropArea={0.8}
                  checkOrientation={false}
                  crop={onCrop} // Triggers on every crop box movement
                />
              </div>

              {/* Live Preview Section */}
              <div className="flex-none flex flex-col items-center">
                <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">Así se verá</h3>
                <div className="pointer-events-none">
                  {previewPlayer && (
                    <FC26Card player={previewPlayer} asPreview={true} livePhotoUrl={livePreviewUrl} />
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-center gap-4 mt-8">
              <button 
                onClick={() => { setShowCropper(false); setCropImageSrc(null); setLivePreviewUrl(null); }}
                className="px-8 py-3 rounded-lg text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-800 transition font-bold"
                disabled={uploading}
              >
                Cancelar
              </button>
              <button 
                onClick={handleCropAndUpload}
                disabled={uploading}
                className="px-8 py-3 rounded-lg bg-gradient-to-r from-green-600 to-green-700 text-white font-bold hover:from-green-500 hover:to-green-600 transition disabled:opacity-50 shadow-xl"
              >
                {uploading ? 'Guardando...' : 'Confirmar Recorte Perfecto'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-outfit text-white">Panel de Administración</h1>
        <button onClick={handleLogout} className="px-4 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition">
          Cerrar Sesión
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700 mb-8">
        <button 
          onClick={() => { setActiveTab('jugadores'); setErrorMsg(''); setSuccessMsg(''); }}
          className={`px-6 py-3 font-bold transition ${activeTab === 'jugadores' ? 'border-b-2 border-green-500 text-green-400' : 'text-slate-400 hover:text-slate-300'}`}
        >
          Jugadores
        </button>
        <button 
          onClick={() => { setActiveTab('equipos'); setErrorMsg(''); setSuccessMsg(''); }}
          className={`px-6 py-3 font-bold transition ${activeTab === 'equipos' ? 'border-b-2 border-green-500 text-green-400' : 'text-slate-400 hover:text-slate-300'}`}
        >
          Equipos
        </button>
      </div>

      {errorMsg && <div className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded-lg mb-6">{errorMsg}</div>}
      {successMsg && <div className="bg-green-500/20 border border-green-500 text-green-400 p-4 rounded-lg mb-6">{successMsg}</div>}

      {activeTab === 'jugadores' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Import JSON Section */}
        <div className="glass-panel p-6 rounded-xl flex flex-col">
          <h2 className="text-2xl font-bold font-outfit text-yellow-400 mb-4">Importar JSON Bruto</h2>
          <p className="text-sm text-slate-400 mb-4">
            Pega aquí el código que te mandó un amigo y haz clic en revisar. También puedes iniciar una carta vacía: 
            <button onClick={() => setJsonInput('{"nombre":"","edad":20,"posicion":"DEL","overall_rating":70,"pace":70,"shooting":70,"passing":70,"dribbling":70,"defending":70,"physical":70}')} className="text-yellow-400 underline ml-2 hover:text-yellow-300">Plantilla en Blanco</button>
          </p>
          <textarea 
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="w-full flex-1 bg-slate-900 border border-slate-700 rounded-lg p-3 text-green-400 font-mono text-xs mb-4 outline-none focus:border-yellow-500 min-h-[150px]"
            placeholder='{"nombre": "Jugador", "overall_rating": 80...}'
          />
          <button onClick={handleParseJSON} className="w-full py-2 bg-slate-800 text-white rounded hover:bg-slate-700 transition border border-slate-600 font-bold">
            Cargar al Panel de Edición
          </button>
        </div>

        {/* Intuitive Edit Section */}
        <div className="glass-panel p-6 rounded-xl flex flex-col">
          <h2 className="text-2xl font-bold font-outfit text-green-400 mb-4">Editor Intuitivo</h2>
          {!previewPlayer ? (
            <div className="flex-1 min-h-[250px] flex items-center justify-center text-slate-500 border border-dashed border-slate-700 rounded-lg bg-black/20">
              Carga un JSON o dale "Editar" a un jugador para empezar
            </div>
          ) : (
            <div className="bg-slate-900 p-4 rounded-lg border border-green-500/30 flex-1 flex flex-col overflow-y-auto max-h-[600px] custom-scrollbar pr-2 relative">
              <div className="flex items-center justify-between mb-6">
                <span className={`text-xs font-bold px-3 py-1 rounded-full shadow-inner ${previewPlayer.id ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>
                  {previewPlayer.id ? '✏️ MODO EDICIÓN' : '✨ CREACIÓN NUEVA'}
                </span>
                {previewPlayer.id && (
                  <button onClick={() => { setPreviewPlayer(null); setJsonInput(''); }} className="text-xs text-red-400 hover:text-red-300 underline font-bold">
                    Cancelar Edición
                  </button>
                )}
              </div>
              
              <div className="flex gap-4 mb-6 bg-black/40 p-4 rounded-xl border border-slate-800">
                <div className="relative group cursor-pointer w-24 h-24 flex-shrink-0">
                   {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewPlayer.foto_url || `https://placehold.co/100x100/111827/22c55e?text=${previewPlayer.nombre.charAt(0)}`} alt="Preview" className="w-24 h-24 rounded-full object-cover border-2 border-slate-600 group-hover:border-green-500 transition shadow-lg" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition pointer-events-none rounded-full bg-black/60 backdrop-blur-sm">
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">Cambiar Foto</span>
                  </div>
                  <input type="file" accept="image/*" onChange={onFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                
                <div className="flex-1 space-y-3">
                  <input type="text" name="nombre" value={previewPlayer.nombre || ''} onChange={handleInputChange} placeholder="Nombre del Jugador" className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white font-bold placeholder:text-slate-500 focus:border-green-500 outline-none transition" />
                  <div className="flex gap-2">
                    <select name="posicion" value={previewPlayer.posicion || 'DEL'} onChange={handleInputChange} className="w-1/2 bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm font-bold focus:border-green-500 outline-none transition cursor-pointer">
                      <option value="POR">Portero (POR)</option>
                      <option value="DEF">Defensa (DEF)</option>
                      <option value="MED">Medio (MED)</option>
                      <option value="DEL">Delantero (DEL)</option>
                    </select>
                    <input type="number" name="edad" value={previewPlayer.edad || 0} onChange={handleInputChange} placeholder="Edad" className="w-1/2 bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm font-bold text-center focus:border-green-500 outline-none transition" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-400">Equipos:</label>
                    <div className="grid grid-cols-2 gap-2 bg-slate-800 p-3 rounded border border-slate-700">
                      {teams.map(team => (
                        <label key={team.id} className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
                          <input 
                            type="checkbox" 
                            checked={(previewPlayer.team_ids || []).includes(team.id)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setPreviewPlayer(prev => {
                                const currentIds = prev.team_ids || [];
                                const newIds = checked ? [...currentIds, team.id] : currentIds.filter(id => id !== team.id);
                                return { ...prev, team_ids: newIds };
                              });
                            }}
                            className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-green-500 focus:ring-green-500 focus:ring-offset-slate-800"
                          />
                          <span className="truncate">{team.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6 bg-yellow-900/10 border border-yellow-500/20 p-4 rounded-xl flex flex-col items-center">
                <label className="block text-xs text-yellow-500 font-bold mb-2 uppercase tracking-widest text-center">Media General (OVR) Calculada</label>
                <div className="w-full bg-black/40 border border-yellow-500/50 rounded-lg p-3 text-yellow-400 font-black text-center text-3xl shadow-inner cursor-not-allowed opacity-80">
                  {calculateOVR({
                    ritmo: previewPlayer.pace,
                    tiro: previewPlayer.shooting,
                    pase: previewPlayer.passing,
                    regate: previewPlayer.dribbling,
                    defensa: previewPlayer.defending,
                    fisico: previewPlayer.physical
                  }, previewPlayer.posicion)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-8">
                {['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'].map(stat => {
                  let label = stat;
                  const isGK = previewPlayer.posicion === 'Portero (POR)';
                  if (isGK) {
                    if (stat === 'pace') label = 'DIV (Estirada)';
                    if (stat === 'shooting') label = 'HAN (Manejo)';
                    if (stat === 'passing') label = 'KIC (Saque)';
                    if (stat === 'dribbling') label = 'REF (Reflejos)';
                    if (stat === 'defending') label = 'SPD (Velocidad)';
                    if (stat === 'physical') label = 'POS (Colocación)';
                  }
                  
                  return (
                    <div key={stat} className="flex flex-col bg-slate-800/50 p-2 rounded-lg border border-slate-700/50 focus-within:border-green-500/50 transition">
                      <label className="text-[10px] text-slate-400 uppercase font-bold text-center mb-1">{label}</label>
                      <input type="number" name={stat} value={previewPlayer[stat] || 0} onChange={handleInputChange} className="w-full bg-transparent text-center text-green-400 font-bold text-lg outline-none" />
                    </div>
                  );
                })}
              </div>

              <div className="mb-6 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                <h3 className="text-sm font-bold text-green-400 mb-3 uppercase tracking-wider">Análisis y Perfil</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Perfil Físico</label>
                    <textarea name="perfil_fisico" value={previewPlayer.perfil_fisico || ''} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm outline-none focus:border-green-500 transition" rows="2"></textarea>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Rol Táctico</label>
                    <input type="text" name="rol_tactico" value={previewPlayer.rol_tactico || ''} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm outline-none focus:border-green-500 transition" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Cualidades Técnicas (separadas por coma)</label>
                    <input type="text" name="cualidades_tecnicas" value={previewPlayer.cualidades_tecnicas || ''} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm outline-none focus:border-green-500 transition" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Fortalezas (separadas por coma)</label>
                    <input type="text" name="fortalezas" value={previewPlayer.fortalezas || ''} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm outline-none focus:border-green-500 transition" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Debilidades (separadas por coma)</label>
                    <input type="text" name="debilidades" value={previewPlayer.debilidades || ''} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm outline-none focus:border-green-500 transition" />
                  </div>
                </div>
              </div>

              <div className="mt-auto border-t border-slate-800 pt-6">
                <button 
                  onClick={handleSavePlayer} 
                  disabled={loading || uploading}
                  className={`w-full py-4 font-black text-lg uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] disabled:opacity-50 disabled:shadow-none hover:scale-[1.02] ${
                    previewPlayer.id 
                    ? 'btn-fifa btn-fifa-cyan w-full' 
                    : 'btn-fifa w-full'
                  }`}
                >
                  {loading ? 'Guardando en Base de Datos...' : (previewPlayer.id ? 'Actualizar Jugador' : 'Crear Nuevo Jugador')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Existing Players Table */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <h2 className="text-2xl font-bold font-outfit text-white p-6 border-b border-white/10">Jugadores Existentes</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="p-4 text-slate-400 font-medium">Nombre</th>
                <th className="p-4 text-slate-400 font-medium">Equipo</th>
                <th className="p-4 text-slate-400 font-medium">Posición</th>
                <th className="p-4 text-slate-400 font-medium">Media (OVR)</th>
                <th className="p-4 text-slate-400 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {players.map(player => (
                <tr key={player.id} className="border-t border-white/5 hover:bg-white/5 transition">
                  <td className="p-4 font-bold text-white flex items-center gap-3">
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={player.foto_url || `https://placehold.co/30x30/111827/22c55e?text=${player.nombre.charAt(0)}`} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-700" />
                    {player.nombre}
                  </td>
                  <td className="p-4 text-slate-300">
                    <span className="text-sm">
                      {player.player_teams?.length > 0 
                        ? player.player_teams.map(pt => teams.find(t => t.id === pt.team_id)?.name).filter(Boolean).join(', ')
                        : <span className="text-slate-500 italic">Agente Libre</span>
                      }
                    </span>
                  </td>
                  <td className="p-4 text-slate-300">
                    <span className="bg-slate-800 px-2 py-1 rounded text-xs font-bold text-slate-300">{player.posicion}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-yellow-400 font-black text-lg bg-yellow-400/10 px-3 py-1 rounded-lg border border-yellow-400/20">{calculateOVR({
                      ritmo: player.pace,
                      tiro: player.shooting,
                      pase: player.passing,
                      regate: player.dribbling,
                      defensa: player.defending,
                      fisico: player.physical
                    }, player.posicion)}</span>
                  </td>
                  <td className="p-4 flex gap-3">
                    <button 
                      onClick={() => handleEdit(player)}
                      className="text-blue-400 hover:text-white hover:bg-blue-500 text-sm font-bold bg-blue-500/10 px-4 py-2 rounded-lg transition"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(player.id)}
                      className="text-red-400 hover:text-white hover:bg-red-500 text-sm font-bold bg-red-500/10 px-4 py-2 rounded-lg transition"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {players.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-12 text-center text-slate-500 text-lg">La base de datos está vacía. ¡Empieza creando un jugador!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {activeTab === 'equipos' && (
        <div className="flex flex-col gap-8">
          <div className="glass-panel p-6 rounded-xl">
            <h2 className="text-2xl font-bold font-outfit text-white mb-6">
              {previewTeam?.id ? '✏️ Editar Equipo' : '✨ Crear Nuevo Equipo'}
            </h2>
            <div className="flex gap-4 mb-4">
              <input type="text" value={previewTeam?.name || ''} onChange={(e) => setPreviewTeam({ ...previewTeam, name: e.target.value })} placeholder="Nombre del Equipo" className="flex-1 bg-slate-800 border border-slate-700 rounded p-3 text-white outline-none focus:border-green-500" />
              <input type="text" value={previewTeam?.logo_url || ''} onChange={(e) => setPreviewTeam({ ...previewTeam, logo_url: e.target.value })} placeholder="URL del Logo (Opcional)" className="flex-1 bg-slate-800 border border-slate-700 rounded p-3 text-white outline-none focus:border-green-500" />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              {previewTeam?.id && (
                <button onClick={() => { setPreviewTeam(null); setSelectedPlayersForTeam([]); }} className="px-6 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 font-bold transition">Cancelar</button>
              )}
              <button onClick={handleSaveTeam} disabled={loading} className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-500 font-bold transition shadow-lg">
                {loading ? 'Guardando...' : (previewTeam?.id ? 'Actualizar Equipo' : 'Crear Equipo')}
              </button>
            </div>
            
            {previewTeam?.id && (
              <div className="mt-6 border-t border-slate-700 pt-6">
                <h3 className="text-lg font-bold text-white mb-4">Plantilla del Equipo</h3>
                <p className="text-sm text-slate-400 mb-4">Selecciona los jugadores que pertenecen a este equipo:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto custom-scrollbar bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                  {players.map(player => (
                    <label key={player.id} className={`flex items-center gap-3 p-2 rounded cursor-pointer transition ${selectedPlayersForTeam.includes(player.id) ? 'bg-green-500/10 border border-green-500/30' : 'hover:bg-slate-800 border border-transparent'}`}>
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 accent-green-500"
                        checked={selectedPlayersForTeam.includes(player.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPlayersForTeam([...selectedPlayersForTeam, player.id]);
                          } else {
                            setSelectedPlayersForTeam(selectedPlayersForTeam.filter(id => id !== player.id));
                          }
                        }}
                      />
                      <span className="text-sm font-bold text-white">{player.nombre} <span className="text-slate-500 font-normal">({player.overall_rating})</span></span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="glass-panel rounded-xl overflow-hidden shadow-2xl">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900 text-slate-400 font-outfit">
                <tr>
                  <th className="p-4">EQUIPO</th>
                  <th className="p-4">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {teams.map(team => (
                  <tr key={team.id} className="hover:bg-slate-800/50 transition">
                    <td className="p-4 font-bold text-white text-lg">{team.name}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleEditTeam(team)} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 font-bold transition text-xs">Editar</button>
                        <button onClick={() => handleDeleteTeam(team.id)} className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 font-bold transition text-xs">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {teams.length === 0 && (
                  <tr>
                    <td colSpan="2" className="p-12 text-center text-slate-500 text-lg">No hay equipos registrados.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
