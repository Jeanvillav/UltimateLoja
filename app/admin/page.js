'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';

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
  
  // Cropper State
  const [uploading, setUploading] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState(null); 
  const [showCropper, setShowCropper] = useState(false); 
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
    const { data } = await supabase.from('players').select('*').order('nombre');
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
      setShowCropper(true);
    };
    if (files && files.length > 0) {
      reader.readAsDataURL(files[0]);
    }
    e.target.value = '';
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
          const fileName = `admin_uploads/cropped_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.jpeg`;
          
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
    if (previewPlayer.id) {
      const res = await supabase.from('players').update(previewPlayer).eq('id', previewPlayer.id);
      error = res.error;
    } else {
      const res = await supabase.from('players').insert([previewPlayer]);
      error = res.error;
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
      {/* Cropper Modal */}
      {showCropper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="bg-slate-900 p-6 rounded-2xl w-full max-w-3xl border border-slate-700 shadow-2xl flex flex-col max-h-[90vh]">
            <h2 className="text-2xl font-bold font-outfit text-white mb-4">Recortar Foto</h2>
            
            <div className="flex-1 bg-black rounded-lg overflow-hidden min-h-[300px]">
              <Cropper
                src={cropImageSrc}
                style={{ height: "100%", width: "100%" }}
                initialAspectRatio={1}
                guides={true}
                ref={cropperRef}
                viewMode={1}
                background={false}
                responsive={true}
                autoCropArea={0.8}
                checkOrientation={false}
              />
            </div>
            
            <div className="flex justify-end gap-4 mt-6">
              <button 
                onClick={() => { setShowCropper(false); setCropImageSrc(null); }}
                className="px-6 py-2 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition"
                disabled={uploading}
              >
                Cancelar
              </button>
              <button 
                onClick={handleCropAndUpload}
                disabled={uploading}
                className="px-6 py-2 rounded bg-gradient-to-r from-green-600 to-green-700 text-white font-bold hover:from-green-500 hover:to-green-600 transition disabled:opacity-50 shadow-lg"
              >
                {uploading ? 'Recortando y Subiendo...' : 'Confirmar Recorte'}
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

      {errorMsg && <div className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded-lg mb-6">{errorMsg}</div>}
      {successMsg && <div className="bg-green-500/20 border border-green-500 text-green-400 p-4 rounded-lg mb-6">{successMsg}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Import JSON Section */}
        <div className="glass-panel p-6 rounded-xl flex flex-col">
          <h2 className="text-2xl font-bold font-outfit text-yellow-400 mb-4">Importar JSON Bruto</h2>
          <p className="text-sm text-slate-400 mb-4">
            Pega aquí el código que te mandó un amigo y haz clic en revisar. También puedes iniciar una carta vacía: 
            <button onClick={() => setJsonInput('{"nombre":"","edad":20,"posicion":"DEL","overall_rating":70,"pace":70,"shooting":70,"passing":70,"dribbling":70,"defending":70,"physical":70}')} className="text-yellow-400 underline ml-2">Plantilla en Blanco</button>
          </p>
          <textarea 
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="w-full flex-1 bg-slate-900 border border-slate-700 rounded-lg p-3 text-green-400 font-mono text-xs mb-4 outline-none focus:border-yellow-500 min-h-[150px]"
            placeholder='{"nombre": "Jugador", "overall_rating": 80...}'
          />
          <button onClick={handleParseJSON} className="w-full py-2 bg-slate-800 text-white rounded hover:bg-slate-700 transition border border-slate-600">
            Cargar al Panel de Edición
          </button>
        </div>

        {/* Intuitive Edit Section */}
        <div className="glass-panel p-6 rounded-xl flex flex-col">
          <h2 className="text-2xl font-bold font-outfit text-green-400 mb-4">Editor Intuitivo</h2>
          {!previewPlayer ? (
            <div className="flex-1 min-h-[250px] flex items-center justify-center text-slate-500 border border-dashed border-slate-700 rounded-lg">
              Carga un JSON o dale "Editar" a un jugador para empezar
            </div>
          ) : (
            <div className="bg-slate-900 p-4 rounded-lg border border-green-500/30 flex-1 flex flex-col overflow-y-auto max-h-[600px] custom-scrollbar pr-2">
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs font-bold px-2 py-1 rounded ${previewPlayer.id ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                  {previewPlayer.id ? 'MODO EDICIÓN' : 'MODO CREACIÓN NUEVA'}
                </span>
                {previewPlayer.id && (
                  <button onClick={() => { setPreviewPlayer(null); setJsonInput(''); }} className="text-xs text-red-400 hover:underline">
                    Cancelar
                  </button>
                )}
              </div>
              
              <div className="flex gap-4 mb-4">
                <div className="relative group cursor-pointer w-24 h-24 flex-shrink-0">
                   {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewPlayer.foto_url || `https://placehold.co/100x100/111827/22c55e?text=${previewPlayer.nombre.charAt(0)}`} alt="Preview" className="w-24 h-24 rounded-full object-cover border-2 border-slate-700 group-hover:opacity-50 transition" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition pointer-events-none">
                    <span className="text-xs font-bold text-white bg-black/50 px-2 rounded">Cambiar</span>
                  </div>
                  <input type="file" accept="image/*" onChange={onFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                
                <div className="flex-1 space-y-2">
                  <input type="text" name="nombre" value={previewPlayer.nombre || ''} onChange={handleInputChange} placeholder="Nombre" className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white font-bold" />
                  <div className="flex gap-2">
                    <select name="posicion" value={previewPlayer.posicion || 'DEL'} onChange={handleInputChange} className="w-1/2 bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm">
                      <option value="POR">POR</option>
                      <option value="DEF">DEF</option>
                      <option value="MED">MED</option>
                      <option value="DEL">DEL</option>
                    </select>
                    <input type="number" name="edad" value={previewPlayer.edad || 0} onChange={handleInputChange} placeholder="Edad" className="w-1/2 bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm" />
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-xs text-yellow-500 font-bold mb-1">Media General (OVR)</label>
                <input type="number" name="overall_rating" value={previewPlayer.overall_rating || 0} onChange={handleInputChange} className="w-full bg-slate-800 border border-yellow-600/50 rounded p-2 text-yellow-400 font-black text-center text-xl" />
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                {['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'].map(stat => (
                  <div key={stat} className="flex flex-col">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">{stat}</label>
                    <input type="number" name={stat} value={previewPlayer[stat] || 0} onChange={handleInputChange} className="bg-slate-800 border border-slate-700 rounded p-2 text-green-400 font-bold" />
                  </div>
                ))}
              </div>

              <div className="mt-auto border-t border-slate-800 pt-4">
                <button 
                  onClick={handleSavePlayer} 
                  disabled={loading || uploading}
                  className={`w-full py-3 font-bold rounded transition shadow-lg disabled:opacity-50 ${
                    previewPlayer.id 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white' 
                    : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white'
                  }`}
                >
                  {loading ? 'Guardando...' : (previewPlayer.id ? 'Actualizar Jugador' : 'Crear Nuevo Jugador')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Existing Players Table (same as before) */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <h2 className="text-2xl font-bold font-outfit text-white p-6 border-b border-white/10">Jugadores Existentes</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="p-4 text-slate-400 font-medium">Nombre</th>
                <th className="p-4 text-slate-400 font-medium">Posición</th>
                <th className="p-4 text-slate-400 font-medium">Media (OVR)</th>
                <th className="p-4 text-slate-400 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {players.map(player => (
                <tr key={player.id} className="border-t border-white/5 hover:bg-white/5">
                  <td className="p-4 font-bold text-white flex items-center gap-3">
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={player.foto_url || `https://placehold.co/30x30/111827/22c55e?text=${player.nombre.charAt(0)}`} alt="" className="w-8 h-8 rounded-full object-cover" />
                    {player.nombre}
                  </td>
                  <td className="p-4 text-slate-300">{player.posicion}</td>
                  <td className="p-4 text-yellow-400 font-bold">{player.overall_rating}</td>
                  <td className="p-4 flex gap-2">
                    <button 
                      onClick={() => handleEdit(player)}
                      className="text-blue-400 hover:text-blue-300 text-sm font-bold bg-blue-400/10 px-3 py-1 rounded transition"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(player.id)}
                      className="text-red-400 hover:text-red-300 text-sm font-bold bg-red-400/10 px-3 py-1 rounded transition"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {players.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">No hay jugadores</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
