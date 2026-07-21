'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

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
  const [uploading, setUploading] = useState(false);

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
  }, []);

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
    // Remove created_at if it exists to avoid update conflicts
    const { created_at, ...playerToEdit } = player;
    const jsonStr = JSON.stringify(playerToEdit, null, 2);
    setJsonInput(jsonStr);
    setPreviewPlayer(playerToEdit);
    setSuccessMsg('Jugador cargado para edición. Revisa el panel de arriba.');
    
    // Scroll to top
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

  const handleAdminFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !previewPlayer) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `admin_uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('photos').getPublicUrl(filePath);
      
      setPreviewPlayer(prev => ({ ...prev, foto_url: data.publicUrl }));
      
      // Update JSON input as well so it reflects the new photo URL
      setJsonInput(JSON.stringify({ ...previewPlayer, foto_url: data.publicUrl }, null, 2));

    } catch (err) {
      alert("Error subiendo foto: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSavePlayer = async () => {
    if (!previewPlayer) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    let error;

    // Si tiene ID, es una actualización
    if (previewPlayer.id) {
      const res = await supabase.from('players').update(previewPlayer).eq('id', previewPlayer.id);
      error = res.error;
    } else {
      // Si no, es una creación nueva
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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-outfit text-white">Panel de Administración</h1>
        <button onClick={handleLogout} className="px-4 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition">
          Cerrar Sesión
        </button>
      </div>

      {errorMsg && <div className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded-lg mb-6">{errorMsg}</div>}
      {successMsg && <div className="bg-green-500/20 border border-green-500 text-green-400 p-4 rounded-lg mb-6">{successMsg}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Import / Edit JSON Section */}
        <div className="glass-panel p-6 rounded-xl">
          <h2 className="text-2xl font-bold font-outfit text-yellow-400 mb-4">Crear / Editar Jugador (JSON)</h2>
          <p className="text-sm text-slate-400 mb-4">
            Pega el código JSON generado o haz clic en "Editar" en un jugador de la tabla para cargarlo aquí. 
            Modifica los valores directamente y pulsa Revisar.
          </p>
          
          <textarea 
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-green-400 font-mono text-xs h-64 mb-4 outline-none focus:border-yellow-500"
            placeholder='{"nombre": "Jugador", "overall_rating": 80...}'
          />
          <button onClick={handleParseJSON} className="w-full py-2 bg-slate-800 text-white rounded hover:bg-slate-700 transition border border-slate-600">
            Revisar JSON y Previsualizar
          </button>
        </div>

        {/* Preview Section */}
        <div className="glass-panel p-6 rounded-xl flex flex-col">
          <h2 className="text-2xl font-bold font-outfit text-green-400 mb-4">Vista Previa</h2>
          {!previewPlayer ? (
            <div className="flex-1 min-h-[150px] flex items-center justify-center text-slate-500 border border-dashed border-slate-700 rounded-lg">
              Carga un JSON para ver la previsualización
            </div>
          ) : (
            <div className="bg-slate-900 p-4 rounded-lg border border-green-500/30 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold px-2 py-1 rounded ${previewPlayer.id ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                  {previewPlayer.id ? 'MODO EDICIÓN' : 'MODO CREACIÓN NUEVA'}
                </span>
                {previewPlayer.id && (
                  <button onClick={() => { setPreviewPlayer(null); setJsonInput(''); }} className="text-xs text-red-400 hover:underline">
                    Cancelar Edición
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-4 mb-4 mt-2">
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewPlayer.foto_url || `https://placehold.co/100x100/111827/22c55e?text=${previewPlayer.nombre.charAt(0)}`} alt="Preview" className="w-16 h-16 rounded-full object-cover" />
                <div>
                  <h3 className="text-xl font-bold text-white">{previewPlayer.nombre}</h3>
                  <p className="text-slate-400">{previewPlayer.posicion} • {previewPlayer.edad} años</p>
                </div>
                <div className="ml-auto text-3xl font-black text-yellow-400">{previewPlayer.overall_rating}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                <div className="text-slate-300">Físico: <span className="text-green-400">{previewPlayer.physical}</span></div>
                <div className="text-slate-300">Pase: <span className="text-green-400">{previewPlayer.passing}</span></div>
                <div className="text-slate-300">Tiro: <span className="text-green-400">{previewPlayer.shooting}</span></div>
                <div className="text-slate-300">Ritmo: <span className="text-green-400">{previewPlayer.pace}</span></div>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-800">
                <label className="block text-xs font-bold text-slate-400 mb-2">Cambiar Foto Oficial</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAdminFileUpload} 
                  disabled={uploading}
                  className="w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-white hover:file:bg-slate-700 transition cursor-pointer mb-4"
                />
                
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
