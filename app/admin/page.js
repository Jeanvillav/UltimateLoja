'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [players, setPlayers] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchPlayers();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchPlayers();
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchPlayers = async () => {
    const { data } = await supabase.from('players').select('*').order('nombre');
    if (data) setPlayers(data);
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

  if (!session) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <form onSubmit={handleLogin} className="glass-panel p-8 rounded-2xl w-full max-w-md">
          <h1 className="text-3xl font-bold font-outfit text-white mb-6 text-center">Admin Login</h1>
          
          {errorMsg && <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded mb-4 text-sm">{errorMsg}</div>}
          
          <div className="mb-4">
            <label className="block text-slate-400 mb-2">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white outline-none focus:border-green-500"
              required 
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-slate-400 mb-2">Contraseña</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white outline-none focus:border-green-500"
              required 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded transition-colors disabled:opacity-50"
          >
            {loading ? 'Iniciando...' : 'Ingresar'}
          </button>
          
          <p className="text-xs text-slate-500 text-center mt-4">
            Debes crear un usuario en el panel de Supabase (Authentication) para poder ingresar.
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-outfit text-white">Panel de Administración</h1>
        <button onClick={handleLogout} className="px-4 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition">
          Cerrar Sesión
        </button>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden">
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
              <tr key={player.id} className="border-t border-white/5">
                <td className="p-4 font-bold text-white">{player.nombre}</td>
                <td className="p-4 text-slate-300">{player.posicion}</td>
                <td className="p-4 text-yellow-400 font-bold">{player.overall_rating}</td>
                <td className="p-4">
                  <button 
                    onClick={() => handleDelete(player.id)}
                    className="text-red-400 hover:text-red-300 text-sm font-bold"
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
  );
}
